import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Log in a user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign up a new user
export const signUpUser = async (email, password, fullName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save additional user info to Firestore
    await setDoc(doc(db, "users", user.uid), {
      fullName,
      email,
      createdAt: new Date().toISOString(),
      mastery: 0, // Initial state for your dashboard
    });

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Log out
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Listen for Auth changes
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};