import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBb9rsdcs3brPLMmr89OowdrVu6aBVmNp8",
  authDomain: "devnews-2969c.firebaseapp.com",
  projectId: "devnews-2969c",
  storageBucket: "devnews-2969c.firebasestorage.app",
  messagingSenderId: "56932032877",
  appId: "1:56932032877:web:feb07c1ded0366aa083a64",
  measurementId: "G-7MTWQ7P2KP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
};
export type { FirebaseUser };
