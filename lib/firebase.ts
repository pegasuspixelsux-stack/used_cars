"use client";

/**
 * Firebase client SDK — used from Client Components only (the login page,
 * and the public contact form which writes leads directly to Firestore).
 * All server-side reads for the admin dashboard go through
 * lib/firebase-admin.ts instead, which bypasses security rules.
 *
 * Initialization is lazy: Next.js executes "use client" module top-level
 * code during server-side prerendering too (not just in the browser), so
 * calling initializeApp()/getAuth() eagerly here would crash `next build`
 * whenever real Firebase env vars aren't set yet. Deferring past module
 * load means only an actual sign-in/write attempt needs them.
 */
import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  // Fast Refresh re-evaluates this module on every edit; guard against
  // re-initializing an already-running app.
  app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  return app;
}

let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storageInstance) storageInstance = getStorage(getFirebaseApp());
  return storageInstance;
}
