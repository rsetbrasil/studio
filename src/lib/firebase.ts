// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjgftyrnCTFVlqIQB7Jpc6IgrzIWRSu28",
  authDomain: "sipstream-ev33d.firebaseapp.com",
  projectId: "sipstream-ev33d",
  storageBucket: "sipstream-ev33d.appspot.com",
  messagingSenderId: "1010935066783",
  appId: "1:1010935066783:web:26305a990b4d6fb43c72aa"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
