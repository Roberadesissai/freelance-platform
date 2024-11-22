// app/profile/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Loader2, Camera, Shield, Activity, Key, 
  Smartphone, Mail, Globe, Building, User 
} from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { updateProfile, multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier } from "firebase/auth"
import { doc, updateDoc, collection, addDoc, getDocs, getDoc, query, orderBy, limit } from "firebase/firestore"
import { db, auth, storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  timezone: z.string().optional(),
  language: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const securitySchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function ProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [isMfaEnabled, setIsMfaEnabled] = useState(false)
  const [isActivityLoading, setIsActivityLoading] = useState(false)
  const [activityLogs, setActivityLogs] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: async () => {
      if (!user) return { displayName: '' }
      const userDoc = await doc(db, 'users', user.uid)
      const userSnapshot = await getDoc(userDoc)
      return userSnapshot.data() as ProfileFormData
    }
  })

  // Fetch activity logs
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (!user) return
      setIsActivityLoading(true)
      try {
        const logsRef = collection(db, `users/${user.uid}/activity`)
        const querySnapshot = await getDocs(
          query(logsRef, orderBy('timestamp', 'desc'), limit(10))
        )
        
        setActivityLogs(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })))
      } catch (error) {
        console.error('Error fetching activity logs:', error)
      } finally {
        setIsActivityLoading(false)
      }
    }

    fetchActivityLogs()
  }, [user])

  // Log activity
  const logActivity = async (action: string, details: any = {}) => {
    if (!user) return
    try {
      await addDoc(collection(db, `users/${user.uid}/activity`), {
        action,
        details,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        ipAddress: await fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip)
      })
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }

  // Enable MFA
  const enableMfa = async () => {
    if (!user) return
    try {
      setIsLoading(true)
      const multiFactorUser = multiFactor(user)
      const phoneInfoOptions = {
        phoneNumber: user.phoneNumber || '',
        session: await multiFactorUser.getSession()
      }
      
      const phoneAuthProvider = new PhoneAuthProvider(auth)
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        window.recaptchaVerifier
      )

      // Handle verification code input
      const verificationCode = prompt('Please enter the verification code:')
      if (!verificationCode) return

      const phoneAuthCredential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      )
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential)
      await multiFactorUser.enroll(multiFactorAssertion, 'Phone Number')
      
      setIsMfaEnabled(true)
      toast.success('Multi-factor authentication enabled')
      await logActivity('mfa_enabled')
    } catch (error: any) {
      toast.error('Failed to enable MFA', {
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    try {
      setIsLoading(true)
      await updateDoc(doc(db, "users", user.uid), {
        ...data,
        updatedAt: new Date(),
      })

      await updateProfile(user, {
        displayName: data.displayName,
      })

      await logActivity('profile_updated', {
        updatedFields: Object.keys(data)
      })

      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  // Move the reCAPTCHA useEffect inside the component
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      })
    }
  }, [])

  return (
    <div className="flex min-h-screen justify-center px-4">
      <div className="w-full max-w-4xl pt-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input {...register("displayName")} />
                        {errors.displayName && (
                          <p className="text-sm text-red-500">
                            {errors.displayName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input {...register("jobTitle")} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input {...register("company")} />
                    </div>

                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <textarea
                        {...register("bio")}
                        className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2"
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input {...register("email")} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input {...register("phoneNumber")} />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Additional Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input {...register("website")} />
                        {errors.website && (
                          <p className="text-sm text-red-500">
                            {errors.website.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input {...register("location")} />
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <Select defaultValue="UTC">
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">EST</SelectItem>
                            <SelectItem value="PST">PST</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => reset()}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* MFA Section */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={isMfaEnabled}
                    onCheckedChange={enableMfa}
                    disabled={isLoading}
                  />
                </div>

                {/* Password Change Section */}
                <div className="space-y-4">
                  <h3 className="font-medium">Change Password</h3>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm New Password</Label>
                      <Input type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </form>
                </div>

                {/* Connected Accounts */}
                <div className="space-y-4">
                  <h3 className="font-medium">Connected Accounts</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center space-x-4">
                        <Mail className="h-5 w-5" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" disabled>
                        Primary
                      </Button>
                    </div>
                    {/* Add more connected accounts here */}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  Review your recent account activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isActivityLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start space-x-4 rounded-lg border p-4"
                      >
                        <Activity className="h-5 w-5 text-muted-foreground" />
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.timestamp.toDate()).toLocaleString()}
                          </p>
                          <div className="mt-2 rounded bg-muted/50 p-2 text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Globe className="h-4 w-4" />
                                <span>IP: {log.details?.ipAddress}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Smartphone className="h-4 w-4" />
                                <span>Device: {log.details?.userAgent}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activityLogs.length === 0 && !isActivityLoading && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-4 font-medium">No activity yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Your recent account activity will appear here
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Implement download activity log
                      const logs = activityLogs.map(log => ({
                        action: log.action,
                        timestamp: new Date(log.timestamp.toDate()).toISOString(),
                        ipAddress: log.details?.ipAddress,
                        userAgent: log.details?.userAgent
                      }))
                      
                      const blob = new Blob([JSON.stringify(logs, null, 2)], {
                        type: 'application/json'
                      })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'activity-log.json'
                      a.click()
                      window.URL.revokeObjectURL(url)
                    }}
                  >
                    Download Activity Log
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Account Section */}
        <Card className="mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive"
              onClick={() => {
                const confirm = window.confirm(
                  "Are you sure you want to delete your account? This action cannot be undone."
                )
                if (confirm) {
                  // Implement account deletion
                  toast.promise(
                    async () => {
                      if (!user) throw new Error("No user found")
                      
                      // Log the deletion attempt
                      await logActivity('account_deletion_initiated')
                      
                      // Delete user data from Firestore
                      await updateDoc(doc(db, "users", user.uid), {
                        deletedAt: new Date(),
                        status: 'deleted'
                      })
                      
                      // Delete user authentication
                      await user.delete()
                      
                      // Redirect to home
                      router.push('/')
                    },
                    {
                      loading: 'Deleting account...',
                      success: 'Account deleted successfully',
                      error: 'Failed to delete account'
                    }
                  )
                }
              }}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>

        <div id="recaptcha-container" className="fixed bottom-0 left-1/2 -translate-x-1/2">
          {/* reCAPTCHA will render here */}
        </div>
      </div>
    </div>
  )
}