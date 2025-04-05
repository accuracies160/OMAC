// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJaCVwxa2X9dlwztGjHSaf_U-UuTZRZ8U",
  authDomain: "andrewomac.firebaseapp.com",
  projectId: "andrewomac",
  storageBucket: "andrewomac.firebasestorage.app",
  messagingSenderId: "573777333673",
  appId: "1:573777333673:web:429b3b0001db2965f9c8b8",
  measurementId: "G-MDJRZZMRNF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
