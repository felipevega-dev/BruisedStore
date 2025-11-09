const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  // Función para asignar rol de admin
  async function setAdminRole(userEmail) {
    try {
      // Obtener el usuario por email
      const user = await admin.auth().getUserByEmail(userEmail);
      
      // Asignar el custom claim de rol "admin"
      await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
      
      console.log(`✅ Rol de admin asignado a: ${userEmail}`);
      console.log(`   UID: ${user.uid}`);
      console.log('\n⚠️ IMPORTANTE: El usuario debe cerrar sesión y volver a iniciar sesión para que los cambios surtan efecto.');
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  }
  
  // Obtener email del usuario desde argumentos de línea de comandos
  const userEmail = process.argv[2];
  
  if (!userEmail) {
    console.error('❌ Por favor proporciona el email del usuario:');
    console.log('   node set-admin-role.js admin@bruisedart.com');
    process.exit(1);
  }
  
  setAdminRole(userEmail).then(() => process.exit(0));