import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZ6rghRHw_oeTBKVryin-hJV_PGDph1lw",
  authDomain: "mycircle-8916a.firebaseapp.com",
  projectId: "mycircle-8916a",
  storageBucket: "mycircle-8916a.firebasestorage.app",
  messagingSenderId: "536765420042",
  appId: "1:536765420042:web:8a1004ac6b4eaaf57a85f3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
