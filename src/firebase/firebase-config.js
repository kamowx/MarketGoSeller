import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAeFpfkms2DInZRiirSb31htSv3UWu2Zw0",
  authDomain: "marketgo-b805e.firebaseapp.com",
  projectId: "marketgo-b805e",
  storageBucket: "marketgo-b805e.firebasestorage.app",
  messagingSenderId: "226247830861",
  appId: "1:226247830861:web:95ddecd307d4c2367e9b04",
  measurementId: "G-JEM3SNT444",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const analytics = getAnalytics(app);
