import { cert, applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ServiceAccount } from "firebase-admin";

// Safe initialization that won't break during build
let adminDb: ReturnType<typeof getFirestore> | null = null;

try {
  const serviceAccount: Partial<ServiceAccount> = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  if (!getApps().length) {
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
      initializeApp({
        credential: cert(serviceAccount as ServiceAccount),
      });
      adminDb = getFirestore();
    } else if (process.env.NODE_ENV !== 'production') {
      // During development or build, create a mock if credentials are missing
      console.warn('Firebase Admin credentials not found. Some features may not work.');
    }
  } else {
    adminDb = getFirestore();
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  // Don't throw during build - just log the error
}

export { adminDb };

