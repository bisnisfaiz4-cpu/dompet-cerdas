// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// PASTE KODE DARI FIREBASE DI BAWAH INI:
const firebaseConfig = {
  apiKey: "AIzaSyBQML4Fz8ILvxIXloiCJqmvBMeII6N2wB8",
  authDomain: "dompet-cerdas-74c2a.firebaseapp.com",
  projectId: "dompet-cerdas-74c2a",
  storageBucket: "dompet-cerdas-74c2a.firebasestorage.app",
  messagingSenderId: "857621954233",
  appId: "1:857621954233:web:be960d422525a2be976568"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);