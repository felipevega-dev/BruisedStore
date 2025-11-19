// Script de prueba para crear logs de ejemplo
// Ejecutar con: node test-logs.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createTestLogs() {
  try {
    // Log de prueba 1
    await db.collection('adminLogs').add({
      action: 'order_status_updated',
      adminEmail: 'admin@test.com',
      adminUid: 'test-uid-123',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        orderId: 'test-order-1',
        orderNumber: 'ORD-001',
        oldStatus: 'pending',
        newStatus: 'confirmed',
        description: 'Estado cambiado de "pending" a "confirmed"'
      }
    });

    // Log de prueba 2
    await db.collection('adminLogs').add({
      action: 'painting_created',
      adminEmail: 'admin@test.com',
      adminUid: 'test-uid-123',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        paintingId: 'test-painting-1',
        paintingTitle: 'Obra de Prueba',
        description: 'Obra "Obra de Prueba" agregada al catálogo'
      }
    });

    // Log de prueba 3
    await db.collection('adminLogs').add({
      action: 'review_approved',
      adminEmail: 'admin@test.com',
      adminUid: 'test-uid-123',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        reviewId: 'test-review-1',
        reviewerName: 'Cliente Test',
        description: 'Reseña de "Cliente Test" aprobada'
      }
    });

    console.log('✅ 3 logs de prueba creados exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando logs:', error);
    process.exit(1);
  }
}

createTestLogs();
