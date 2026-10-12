import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

let app: App;
let auth: Auth;

export function getFirebaseAdmin(): { app: App; auth: Auth } {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || "vyom-shops-delhi";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (clientEmail && privateKey) {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      app = initializeApp({
        projectId,
      });
    }
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  return { app, auth };
}
