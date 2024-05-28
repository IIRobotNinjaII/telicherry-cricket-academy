// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2ajDNYFdICcjADX5eY2pZ_VmHgrDXMgM",
  authDomain: "tellicherry-cricket-academy.firebaseapp.com",
  projectId: "tellicherry-cricket-academy",
  storageBucket: "tellicherry-cricket-academy.appspot.com",
  messagingSenderId: "686572371447",
  appId: "1:686572371447:web:2a8d5bba5398dbf7f042f2",
  measurementId: "G-PZP9J7Q6S9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app)

export { app, auth };