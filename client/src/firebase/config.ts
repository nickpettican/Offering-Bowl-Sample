import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAxfCXmXSXz19CSvqnqysmJ66lem22cu00",
    authDomain: "offering-bowl.firebaseapp.com",
    projectId: "offering-bowl",
    storageBucket: "offering-bowl.firebasestorage.app",
    messagingSenderId: "139788902806",
    appId: "1:139788902806:web:06c4c595f9be28dd097db7",
    measurementId: "G-PV76JK6CEC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
