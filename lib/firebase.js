import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy initialization - only when actually needed
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;

const initializeFirebase = () => {
  if (typeof window === "undefined") {
    return { app: null, auth: null, db: null };
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
  }

  return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
};

// Export getters that initialize on demand
export const getFirebaseAuth = () => {
  const { auth: authInstance } = initializeFirebase();
  return authInstance;
};

export const getFirebaseDb = () => {
  const { db: dbInstance } = initializeFirebase();
  return dbInstance;
};

export const getFirebaseApp = () => {
  const { app: appInstance } = initializeFirebase();
  return appInstance;
};

// For backward compatibility - only export when on client side
export const auth = typeof window !== "undefined" ? getFirebaseAuth() : null;
export const db = typeof window !== "undefined" ? getFirebaseDb() : null;
export default typeof window !== "undefined" ? getFirebaseApp() : null;
