// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user, success: true };
    } catch (firebaseError) {
      const message = (firebaseError as { message?: string })?.message || 'Sign in failed';
      return { success: false, message };
    }
  };

  const signInWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      return { user: result.user, success: true };
    } catch (firebaseError) {
      const message = (firebaseError as { message?: string })?.message || 'Sign in failed';
      return { success: false, message };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (firebaseError) {
      const message = (firebaseError as { message?: string })?.message || 'Sign out failed';
      return { success: false, message };
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithGithub,
    signOut
  };
};