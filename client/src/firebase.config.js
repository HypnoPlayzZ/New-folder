// Firebase v9 (modular) initialization for Phone Auth
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBPl4AwvZqeCtUp-0LWOOBXHv2i0-mRwv8",
  authDomain: "steamybiteso.firebaseapp.com",
  projectId: "steamybiteso",
  storageBucket: "steamybiteso.firebasestorage.app",
  messagingSenderId: "216088403948",
  appId: "1:216088403948:web:2bbb3603df8e747b156ac9",
  measurementId: "G-J5ZVRXM9LQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
