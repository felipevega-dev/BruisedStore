"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function TestLogsButton() {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);

  const createTestLog = async () => {
    if (!user?.email) {
      alert("Debes estar logueado como admin");
      return;
    }

    setCreating(true);
    try {
      await addDoc(collection(db, "adminLogs"), {
        action: "order_status_updated",
        adminEmail: user.email,
        adminUid: user.uid,
        timestamp: serverTimestamp(),
        metadata: {
          orderId: `test-${Date.now()}`,
          orderNumber: `TEST-${Math.floor(Math.random() * 1000)}`,
          oldStatus: "pending",
          newStatus: "confirmed",
          description: "Log de prueba creado manualmente",
        },
      });

      alert("✅ Log de prueba creado! Ve a /admin/activity-logs");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <button
      onClick={createTestLog}
      disabled={creating}
      className="rounded-lg border-2 border-primary-500 bg-primary-500 px-4 py-2 font-bold text-white hover:bg-primary-600 disabled:opacity-50"
    >
      {creating ? "Creando..." : "🧪 Crear Log de Prueba"}
    </button>
  );
}
