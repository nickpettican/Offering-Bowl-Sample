import admin from "firebase-admin";

const privateKeyJson = JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON || "");

const firebaseConfig: admin.ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
    privateKey: privateKeyJson.privateKey?.replace(/\\n/g, "\n") || ""
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
