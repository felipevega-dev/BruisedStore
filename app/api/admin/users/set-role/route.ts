import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { ServiceAccount } from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
    };

    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

export async function POST(request: Request) {
  try {
    const { uid, role, adminEmail, adminUid } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: "Se requiere el UID del usuario" },
        { status: 400 }
      );
    }

    // Prevent user from modifying their own role
    if (adminUid && uid === adminUid) {
      return NextResponse.json(
        { error: "No puedes modificar tu propio rol" },
        { status: 400 }
      );
    }

    const auth = getAuth();
    
    // Get target user info
    const targetUser = await auth.getUser(uid);

    // Set or remove admin role
    if (role === "admin") {
      await auth.setCustomUserClaims(uid, { role: "admin" });
    } else {
      await auth.setCustomUserClaims(uid, { role: null });
    }

    // Note: Logging is removed to avoid circular dependency issues
    // Admin logs can be viewed through Firebase console if needed

    return NextResponse.json({
      success: true,
      message: role === "admin"
        ? "Usuario promovido a administrador"
        : "Permisos de administrador revocados",
    });
  } catch (error) {
    console.error("Error setting user role:", error);
    return NextResponse.json(
      { error: "Error al actualizar el rol del usuario" },
      { status: 500 }
    );
  }
}
