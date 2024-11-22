// app/(auth)/forgot-password/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { auth } from "@/lib/firebase"
import { sendPasswordResetEmail } from "firebase/auth"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address")
})

type ResetFormData = z.infer<typeof resetSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema)
  })

  const onSubmit = async (data: ResetFormData) => {
    try {
      setIsLoading(true)
      await sendPasswordResetEmail(auth, data.email)
      toast.success("Reset email sent!", {
        description: "Please check your email for further instructions."
      })
    } catch (error: any) {
      toast.error("Failed to send reset email", {
        description: error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Background effects remain the same */}
      
      <div className="container relative flex min-h-screen items-center justify-center">
        <Card className="relative w-full max-w-lg overflow-hidden border border-black/10 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
          <div className="relative p-8">
            <Button
              variant="ghost"
              className="absolute left-4 top-4"
              asChild
            >
              <Link href="/sign-in">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </Button>

            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-black dark:text-white">
                Reset password
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your email address and we&apos;ll send you a link to reset your password
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Email address</Label>
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

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}