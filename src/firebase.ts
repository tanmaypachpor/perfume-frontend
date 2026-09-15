import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA1i12DR4P5008-DpPH8mihfwGYh3NMljY",
  authDomain: "lumiere-perfume-store.firebaseapp.com",
  projectId: "lumiere-perfume-store",
  storageBucket: "lumiere-perfume-store.firebasestorage.app",
  messagingSenderId: "723136881350",
  appId: "1:723136881350:web:b84673c21541383f092dc7",
  measurementId: "G-CBH3JDKTR2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;
