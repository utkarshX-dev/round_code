import fs from 'node:fs';
import path from 'node:path';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const requiredFirebaseEnv = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

const getCredentialConfig = () => {
  const hasEnvironmentCredentials = requiredFirebaseEnv.every(
    (name) => process.env[name]
  );

  if (hasEnvironmentCredentials) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  const localKeyPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
  if (process.env.NODE_ENV !== 'production' && fs.existsSync(localKeyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));

    if (
      !serviceAccount.project_id ||
      !serviceAccount.client_email ||
      !serviceAccount.private_key
    ) {
      throw new Error(
        `Invalid Firebase service account file: ${localKeyPath}`
      );
    }

    return {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    };
  }

  const missing = requiredFirebaseEnv.filter((name) => !process.env[name]);
  throw new Error(
    `Missing Firebase Admin environment variables: ${missing.join(', ')}`
  );
};

const getFirebaseApp = () => {
  if (getApps().length) return getApps()[0];

  return initializeApp({ credential: cert(getCredentialConfig()) });
};

export const firebaseAuth = () => getAuth(getFirebaseApp());
