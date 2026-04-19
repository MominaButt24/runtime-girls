import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  reload
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
    let message = "Failed to create account. Please try again.";
    if (error.code === 'auth/email-already-in-use') {
      message = "This email is already registered. Please log in instead.";
    } else if (error.code === 'auth/invalid-email') {
      message = "The email address is invalid.";
    } else if (error.code === 'auth/network-request-failed') {
      message = "Network error. Please check your connection.";
    } else if (error.code === 'auth/weak-password') {
      message = "Password is too weak. Please use a stronger password.";
    }
    return { user: null, error: message };
  }
};

export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    let message = "Wrong email or password.";
    if (error.code === 'auth/too-many-requests') {
       message = "Too many failed attempts. Try again later.";
    } else if (error.code === 'auth/network-request-failed') {
       message = "Network error. Please check your connection.";
    }
    return { user: null, error: message };
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

export const sendVerificationEmail = async () => {
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      return { error: null };
    }
    return { error: "No user logged in." };
  } catch (error) {
    return { error: error.message };
  }
};

export const checkEmailVerified = async () => {
  try {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      return auth.currentUser.emailVerified;
    }
    return false;
  } catch (error) {
    console.error("Error reloading user:", error);
    return false;
  }
};