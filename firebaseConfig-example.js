// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {

  apiKey: "SUA_API_KEY",

  authDomain: "SEU_DOMINIO.firebaseapp.com",

  projectId: "SEU_PROJECT_ID",

  storageBucket: "SEU_BUCKET.appspot.com",

  messagingSenderId: "SEU_SENDER_ID",

  appId: "SUA_APP_ID"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);