// app/(auth)/sign-in/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Github, ArrowRight, Mail } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { authService } from "@/lib/auth"
import { Loader2 } from "lucide-react"

const signInSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required"),
  remember: z.boolean().default(false)
})

type SignInFormData = z.infer<typeof signInSchema>

export default function SignInPage() {
  const [isEmailSignIn, setIsEmailSignIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema)
  })

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true)
      const result = await (provider === 'google' 
        ? authService.signInWithGoogle()
        : authService.signInWithGithub()
      )

      if (result.success) {
        toast.success("Signed in successfully!")
        router.push('/dashboard')
        return
      }
      
      toast.error("Failed to sign in", {
        description: "Authentication failed"
      })
    } catch (error: any) {
      if (!error.message.includes('cancelled')) {
        toast.error("Something went wrong!", {
          description: error.message || "Please try again later."
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true)
      const result = await authService.signInWithEmail({
        email: data.email,
        password: data.password,
        remember: data.remember
      })

      if (result.success) {
        toast.success("Signed in successfully!")
        router.push('/dashboard')
      } else {
        toast.error("Failed to sign in", {
          description: result.error
        })
      }
    } catch (error: any) {
      const errorMessage = error?.message?.toLowerCase() || ''
      if (errorMessage.includes('user-not-found')) {
        toast.error("Account not found", {
          description: "Please check your email or create a new account"
        })
      } else if (errorMessage.includes('wrong-password')) {
        toast.error("Incorrect password", {
          description: "Please check your password and try again"
        })
      } else {
        toast.error("Something went wrong!", {
          description: error.message || "Please try again later."
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Effects - Keep grid but adjust colors */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]">
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/50 to-white dark:via-black/50 dark:to-black"></div>
      </div>

      {/* Center glow effect - Adjust for themes */}
      <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 bg-blue-500/5 dark:bg-white/5 blur-[100px]"></div>

      <div className="container relative flex min-h-screen items-center justify-center">
        {/* Main Card - Maintain glassmorphism but adjust for theme */}
        <Card className="relative w-full max-w-lg overflow-hidden border border-black/10 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
          {/* Decorative Elements - Keep but adjust opacity */}
          <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl"></div>

          <div className="relative p-8">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-black dark:text-white">
                Welcome back
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to continue to Astroexture
              </p>
            </div>

            {isEmailSignIn ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
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
                      placeholder="••••••••"
                      className="border-black/10 bg-white/50 text-black placeholder:text-gray-500 focus-visible:ring-black/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-400 dark:focus-visible:ring-white/20"
                      disabled={isLoading}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500 dark:text-red-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      className="border-black/20 data-[state=checked]:bg-black data-[state=checked]:text-white dark:border-white/20 dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black" 
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                    >
                      Remember me
                    </label>
                  </div>
                  <Button 
                    variant="link" 
                    className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="relative w-full overflow-hidden bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign in
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
                  onClick={() => handleSocialSignIn('google')}
                  disabled={isLoading}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                    >
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
                  onClick={() => handleSocialSignIn('github')}
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
                  onClick={() => setIsEmailSignIn(true)}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    <Mail className="h-5 w-5" />
                    Continue with Email
                  </span>
                </Button>
              </div>
            )}

            <div className="mt-8">
              <Separator className="mb-4 bg-black/10 dark:bg-white/10" />
              <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  New to Astroexture?{" "}
                </span>
                <Button 
                  variant="link" 
                  className="text-black hover:text-black/90 dark:text-white dark:hover:text-white/90" 
                  asChild
                >
                  <Link href="/sign-up">Create an account</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}