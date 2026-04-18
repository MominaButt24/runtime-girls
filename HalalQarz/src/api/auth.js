import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export const signUp = async (name, email, password, phone) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const profileData = {
      name,
      fullName: name,
      email,
      createdAt: new Date().toISOString()
    };

    // Avoid sending undefined to Firestore when phone is not provided.
    if (phone) {
      profileData.phone = phone;
    }

    await setDoc(doc(db, "users", user.uid), profileData);

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Backward-compatible aliases used by app screens.
export const signUpUser = async (email, password, fullName, phone) => {
  return signUp(fullName, email, password, phone);
};

export const loginUser = async (email, password) => {
  return logIn(email, password);
};

export const logoutUser = async () => {
  return logOut();
};