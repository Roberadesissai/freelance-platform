// app/(auth)/sign-up/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Github, ArrowRight, Mail, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { authService } from '@/lib/auth'
import { useRouter } from 'next/navigation'

const signUpSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain uppercase, lowercase, number and special character"
    ),
  terms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
})

type SignUpFormData = z.infer<typeof signUpSchema>

const checkPasswordStrength = (password: string) => {
  let strength = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  strength = Object.values(checks).filter(Boolean).length * 20

  return {
    score: strength,
    checks,
  }
}

const PasswordStrengthIndicator = ({ password = "" }) => {
  const [strength, setStrength] = useState({ score: 0, checks: {} as any })

  useEffect(() => {
    setStrength(checkPasswordStrength(password))
  }, [password])

  const getStrengthText = () => {
    if (strength.score === 100) return "Strong"
    if (strength.score >= 60) return "Good"
    if (strength.score >= 40) return "Fair"
    if (strength.score >= 20) return "Weak"
    return "Very Weak"
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
        <span className={`font-medium ${strength.score === 100 ? 'text-green-500' : 
          strength.score >= 60 ? 'text-yellow-500' : 
          strength.score >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
          {getStrengthText()}
        </span>
      </div>
      <Progress value={strength.score} className={`h-1 ${strength.score === 100 ? 'bg-green-500' : 
        strength.score >= 60 ? 'bg-yellow-500' : 
        strength.score >= 40 ? 'bg-orange-500' : 'bg-red-500'}`} />
      <div className="grid grid-cols-2 gap-2 text-xs">
        {Object.entries(strength.checks).map(([key, passed]) => (
          <div key={key} className={`flex items-center gap-1 ${passed ? 'text-green-500' : 'text-gray-600 dark:text-gray-400'}`}>
            {passed ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            <span>{key === 'length' ? '8+ characters' :
                   key === 'lowercase' ? 'Lowercase letter' :
                   key === 'uppercase' ? 'Uppercase letter' :
                   key === 'number' ? 'Number' : 'Special character'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SignUpPage() {
  const [isEmailSignUp, setIsEmailSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      terms: true
    }
  })

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'password') {
        setPassword(value.password || "")
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsLoading(true)
      const result = await authService.signUpWithEmail({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })

      if (result.success) {
        toast.success("Account created successfully!", {
          description: "Welcome to Astroexture!",
        })
        router.push('/dashboard')
      } else {
        toast.error("Failed to create account", {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error("Something went wrong!", {
        description: "Please try again later or contact support if the problem persists.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignUp = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true)
      const result = await (provider === 'google' 
        ? authService.signUpWithGoogle()
        : authService.signUpWithGithub()
      )

      if (result.success) {
        toast.success("Account created successfully!", {
          description: "Welcome to Astroexture!",
        })
        router.push('/dashboard')
      } else {
        toast.error("Failed to create account", {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error("Something went wrong!", {
        description: "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const [isChecked, setIsChecked] = useState(false)

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/50 to-white dark:via-black/50 dark:to-black"></div>
      </div>
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 bg-blue-500/5 dark:bg-white/5 blur-[100px]"></div>

      <div className="container relative flex min-h-screen items-center justify-center">
        <Card className="relative w-full max-w-lg overflow-hidden border border-black/10 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
          {/* Decorative Elements */}
          <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl"></div>

          <div className="relative p-8">
            {isEmailSignUp && (
              <Button
                variant="ghost"
                className="absolute left-4 top-4 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                onClick={() => {
                  setIsEmailSignUp(false)
                  reset()
                }}
                disabled={isLoading}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}

            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-black dark:text-white">
                Create your account
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Join Astroexture and start building amazing projects
              </p>
            </div>

            {isEmailSignUp ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-black dark:text-white">First Name</Label>
                    <Input
                      {...register("firstName")}
                      placeholder="John"
                      className="border-black/10 bg-white/50 text-black placeholder:text-gray-500 focus-visible:ring-black/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-400 dark:focus-visible:ring-white/20"
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 dark:text-red-400">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-black dark:text-white">Last Name</Label>
                    <Input
                      {...register("lastName")}
                      placeholder="Doe"
                      className="border-black/10 bg-white/50 text-black placeholder:text-gray-500 focus-visible:ring-black/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-400 dark:focus-visible:ring-white/20"
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 dark:text-red-400">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-black dark:text-white">Email</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="name@example.com"
                    className="border-black/10 bg-white/50 text-black placeholder:text-gray-500 focus-visible:ring-black/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-400 dark:focus-visible:ring-white/20"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-black dark:text-white">Password</Label>
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="Create a strong password"
                    className="border-black/10 bg-white/50 text-black placeholder:text-gray-500 focus-visible:ring-black/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-400 dark:focus-visible:ring-white/20"
                    disabled={isLoading}
                  />
                  {errors.password ? (
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {errors.password.message}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Must contain uppercase, lowercase, number and special character
                    </p>
                  )}
                  <PasswordStrengthIndicator password={password} />
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={isChecked}
                    onCheckedChange={(checked: boolean) => {
                      setIsChecked(checked)
                      setValue('terms', checked as true)
                    }}
                    className="mt-1 border-black/20 data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white/20 dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black"
                    disabled={isLoading}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      Accept terms and conditions
                    </label>
                    {errors.terms && (
                      <p className="text-sm text-red-500 dark:text-red-400">
                        {errors.terms.message}
                      </p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="relative w-full overflow-hidden bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 disabled:opacity-50"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create Account
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Button
                  className="relative w-full overflow-hidden bg-white text-black transition-colors hover:bg-white/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  size="lg"
                  onClick={() => handleSocialSignUp('google')}
                  disabled={isLoading}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </span>
                </Button>

                <Button
                  className="relative w-full overflow-hidden border border-black/10 bg-white/50 text-black transition-colors hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  size="lg"
                  onClick={() => handleSocialSignUp('github')}
                  disabled={isLoading}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <Github className="h-5 w-5" />
                    Continue with GitHub
                  </span>
                </Button>

                <Button
                  className="relative w-full overflow-hidden border border-black/10 bg-white/50 text-black transition-colors hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  size="lg"
                  onClick={() => setIsEmailSignUp(true)}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <Mail className="h-5 w-5" />
                    Sign up with Email
                  </span>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full bg-black/10 dark:bg-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white/80 px-2 text-xs uppercase text-gray-600 dark:bg-black/40 dark:text-gray-400">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full text-black hover:bg-black/5 dark:text-white dark:hover:bg-white/5" 
                  asChild
                >
                  <Link href="/sign-in">Sign in instead</Link>
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}