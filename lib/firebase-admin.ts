import "server-only";

/**
 * Firebase Admin SDK — server-only. Used by the dashboard's Server
 * Components/Actions and by proxy.ts to verify session cookies and read
 * Firestore with full access, bypassing security rules.
 *
 * Initialization is lazy (deferred past module load) so importing this file
 * during `next build` never throws just because env vars aren't set yet —
 * only an actual request that needs Firebase fails, with a clear error.
 */
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import type { Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

function readEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Set the Firebase Admin env vars — see .env.local.example.`,
    );
  }
  return value;
}

let app: App | null = null;

function getAdminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }

  const projectId = readEnv("FIREBASE_ADMIN_PROJECT_ID");
  const clientEmail = readEnv("FIREBASE_ADMIN_CLIENT_EMAIL");
  // Service-account JSON escapes newlines as literal "\n" once dropped into
  // a single-line env var — restore them before handing the key to the SDK.
  const privateKey = readEnv("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n");

  app = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return app;
}

/**
 * Dynamically imported: firebase-admin/auth transitively pulls in
 * jwks-rsa -> jose, whose ESM build fails to load under Vercel's
 * serverless runtime ("ERR_REQUIRE_ESM") the moment the module is merely
 * imported — regardless of whether any Auth method actually gets called.
 * A static top-level import would take down every route that uses this
 * file just for Firestore/Storage (the car detail page, the homepage,
 * /inventory). Deferring it here means only routes that actually need
 * Auth (session cookies, user management) pay that cost.
 */
export async function getAdminAuth(): Promise<Auth> {
  const { getAuth } = await import("firebase-admin/auth");
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(getAdminApp());
}
