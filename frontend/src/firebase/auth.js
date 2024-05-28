import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  getIdToken
} from "firebase/auth";

export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doGetIdToken = () => {
  if (auth.currentUser) {
    return getIdToken(auth.currentUser);
  } else {
    return Promise.reject("User not logged in");
  }
};