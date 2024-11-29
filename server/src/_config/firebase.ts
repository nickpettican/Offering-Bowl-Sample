import admin from "firebase-admin";
import envVars from "../_config/env.vars";

const encryptedPrivateKey = envVars.FIREBASE_PRIVATE_KEY || "";
const privateKey = Buffer.from(encryptedPrivateKey, "base64").toString();

const firebaseConfig: admin.ServiceAccount = {
    projectId: envVars.FIREBASE_PROJECT_ID || "",
    clientEmail: envVars.FIREBASE_CLIENT_EMAIL || "",
    privateKey
};

if (
    !firebaseConfig.privateKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.clientEmail
) {
    throw new Error("Firebase configuration is incomplete.");
}

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
});

export default admin.auth();
