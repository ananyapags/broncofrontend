import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBE9qMhqM_MXnzecNGFvnHuweUOQQOsOEE",
  authDomain: "broncobuddies-8d238.firebaseapp.com",
  projectId: "broncobuddies-8d238",
  storageBucket: "broncobuddies-8d238.firebasestorage.app",
  messagingSenderId: "809866556719",
  appId: "1:809866556719:web:d0b92c43ec09b311ccddda"
};

// Initialize Firebase only if no apps exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: "scu.edu", // Restrict to SCU domain
});

export default app;
