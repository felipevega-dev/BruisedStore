import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

function toIso(value: any): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value.toDate) {
    return value.toDate().toISOString();
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Token requerido" }, { status: 400 });
    }

    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ message: "Orden no encontrada" }, { status: 404 });
    }

    const data = orderSnap.data();

    if (!data?.publicAccessToken || data.publicAccessToken !== token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { publicAccessToken, ...rest } = data;
    const responsePayload = {
      id: orderSnap.id,
      ...rest,
      createdAt: toIso(data.createdAt),
      updatedAt: toIso(data.updatedAt),
      paymentInfo: rest.paymentInfo
        ? {
            ...rest.paymentInfo,
            paidAt: toIso(rest.paymentInfo.paidAt),
          }
        : null,
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Order lookup failed", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
