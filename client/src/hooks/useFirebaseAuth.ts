import { useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Create or update user document in Firestore
        await createUserDocument(user);
      }
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createUserDocument = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create basic user document
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        courses: [],
        profileComplete: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setNeedsProfileSetup(true);
    } else {
      // Check if existing user needs profile setup
      const userData = userSnap.data();
      if (!userData.profileComplete) {
        setNeedsProfileSetup(true);
      }
    }
  };

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user email ends with @scu.edu
      if (!result.user.email?.endsWith('@scu.edu')) {
        await firebaseSignOut(auth);
        throw new Error('Please use your @scu.edu email address');
      }
      
      return result.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setNeedsProfileSetup(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const completeProfileSetup = () => {
    setNeedsProfileSetup(false);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    needsProfileSetup,
    signIn,
    signOut,
    completeProfileSetup
  };
}