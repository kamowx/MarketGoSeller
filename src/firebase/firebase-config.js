// Firebase core
import { initializeApp } from "firebase/app";

// Auth
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Analytics (опционально)
import { getAnalytics } from "firebase/analytics";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAeFpfkms2DInZRiirSb31htSv3UWu2Zw0",
  authDomain: "marketgo-b805e.firebaseapp.com",
  projectId: "marketgo-b805e",
  storageBucket: "marketgo-b805e.firebasestorage.app",
  messagingSenderId: "226247830861",
  appId: "1:226247830861:web:95ddecd307d4c2367e9b04",
  measurementId: "G-JEM3SNT444",
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация сервисов
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics (можно удалить, если не нужен)
export const analytics = getAnalytics(app);
