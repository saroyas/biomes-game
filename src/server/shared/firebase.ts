import admin from "firebase-admin";

export function getFirebaseAdminApp(): admin.app.App {
  if (!(global as any).firebaseAdminApp) {
    const appInstance =
      admin.apps.length === 0
        ? admin.initializeApp({
            serviceAccountId:
              process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL || undefined,
            projectId: process.env.FIREBASE_PROJECT_ID || undefined,
          })
        : admin.apps[0];
    (global as any).firebaseAdminApp = appInstance;
  }
  return (global as any).firebaseAdminApp as admin.app.App;
}
