// lib/auth.ts
import { 
    auth, 
    db, 
    googleProvider, 
    githubProvider 
  } from './firebase';
  import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    onAuthStateChanged,
    User
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
  
  // Add AuthError class
  class AuthError extends Error {
    code?: string;
    constructor(message: string, code?: string) {
      super(message);
      this.name = 'AuthError';
      this.code = code;
    }
  }
  
  interface SignUpData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
  
  export const authService = {
    // Email & Password Sign Up
    async signUpWithEmail({ email, password, firstName, lastName }: SignUpData) {
      try {
        // Create user in Firebase Auth
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with display name
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`
        });
  
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email,
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
  
        return { success: true, user };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to create account'
        };
      }
    },
  
    // Google Sign Up
    async signUpWithGoogle() {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check if user document exists, if not create one
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true }); // merge: true will only update fields that don't exist
  
        return { success: true, user };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to sign in with Google'
        };
      }
    },
  
    // GitHub Sign Up
    async signUpWithGithub() {
      try {
        const result = await signInWithPopup(auth, githubProvider);
        const user = result.user;
        
        // Create/update user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
  
        return { success: true, user };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to sign in with GitHub'
        };
      }
    },
  
    // Email Sign In
    async signInWithEmail({ email, password, remember }: { 
      email: string
      password: string
      remember?: boolean 
    }) {
      try {
        const persistence = remember 
          ? browserLocalPersistence 
          : browserSessionPersistence
        
        await setPersistence(auth, persistence)
        const result = await signInWithEmailAndPassword(auth, email, password)
        
        return {
          success: true,
          user: result.user
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.message
        }
      }
    },
  
    // Google Sign In
    async signInWithGoogle() {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Update last login in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp(),
        }, { merge: true });

        return { success: true, user };
      } catch (error: any) {
        throw new AuthError(error.message || 'Failed to sign in with Google', error.code);
      }
    },
  
    // GitHub Sign In
    async signInWithGithub() {
      try {
        const result = await signInWithPopup(auth, githubProvider);
        const user = result.user;

        // Update last login in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          lastLogin: serverTimestamp(),
        }, { merge: true });

        return { success: true, user };
      } catch (error: any) {
        throw new AuthError(error.message || 'Failed to sign in with GitHub', error.code);
      }
    },
  
    // Sign Out
    async signOut() {
      try {
        await signOut(auth);
        return { success: true };
      } catch (error) {
        throw new AuthError('Failed to sign out');
      }
    },
  
    // Get Current User
    getCurrentUser(): Promise<User | null> {
      return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            unsubscribe();
            resolve(user);
          },
          reject
        );
      });
    }
  };