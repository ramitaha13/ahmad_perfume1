// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeC-viStRpphIKAk9J3T_szBDirwokWfU",
  authDomain: "ahmadperfume-b5e70.firebaseapp.com",
  projectId: "ahmadperfume-b5e70",
  storageBucket: "ahmadperfume-b5e70.firebasestorage.app",
  messagingSenderId: "190252773053",
  appId: "1:190252773053:web:94c755b74555d88c6bd1d4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { app, firestore };
