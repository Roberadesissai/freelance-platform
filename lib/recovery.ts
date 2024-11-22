// lib/recovery.ts
import { 
    auth, 
    db 
  } from './firebase'
  import { 
    sendPasswordResetEmail, 
    confirmPasswordReset,
    verifyPasswordResetCode,
    updatePassword
  } from 'firebase/auth'
  import { doc, updateDoc } from 'firebase/firestore'
  
  export const recoveryService = {
    // Send password reset email
    async sendResetEmail(email: string) {
      try {
        await sendPasswordResetEmail(auth, email, {
          url: `${window.location.origin}/sign-in`,
        })
        return { success: true }
      } catch (error: any) {
        throw new Error(
          error.code === 'auth/user-not-found'
            ? 'No account found with this email'
            : 'Failed to send reset email'
        )
      }
    },
  
    // Verify reset code
    async verifyResetCode(code: string) {
      try {
        await verifyPasswordResetCode(auth, code)
        return { success: true }
      } catch (error) {
        throw new Error('Invalid or expired reset code')
      }
    },
  
    // Complete password reset
    async resetPassword(code: string, newPassword: string) {
      try {
        await confirmPasswordReset(auth, code, newPassword)
        return { success: true }
      } catch (error) {
        throw new Error('Failed to reset password')
      }
    },
  
    // Change password (when signed in)
    async changePassword(currentPassword: string, newPassword: string) {
      try {
        const user = auth.currentUser
        if (!user) throw new Error('No user signed in')
  
        // Reauthenticate user if needed
        await updatePassword(user, newPassword)
        
        // Update password change timestamp in Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          passwordUpdatedAt: new Date(),
        })
  
        return { success: true }
      } catch (error) {
        throw new Error('Failed to change password')
      }
    }
  }