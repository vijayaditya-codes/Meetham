import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

let isFirebaseInitialized = false;

if (projectId && clientEmail && privateKey && privateKey !== 'mock-private-key') {
  try {
    (admin as any).initializeApp({
      credential: (admin as any).credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    isFirebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
} else {
  console.log('Firebase Admin SDK: Running in mock mode (using mock tokens).');
}

export async function verifyFirebaseToken(idToken: string): Promise<{ email: string; name: string; uid: string }> {
  if (isFirebaseInitialized) {
    const decodedToken = await (admin as any).auth().verifyIdToken(idToken);
    return {
      email: decodedToken.email || '',
      name: decodedToken.name || 'Firebase User',
      uid: decodedToken.uid,
    };
  } else {
    // Mock Mode: Accept custom format e.g. "mock-token-email@example.com"
    if (idToken.startsWith('mock-token-')) {
      const email = idToken.replace('mock-token-', '');
      const name = email.split('@')[0];
      return {
        email,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        uid: `firebase-mock-${name}`,
      };
    }
    throw new Error('Invalid or missing Firebase mock token in development. Mock tokens must start with "mock-token-".');
  }
}
