import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const isLoggedIn = () => {
  return !!auth.currentUser;
};

export const getUserProfile = async (uid) => {
  try {
    const targetUid = uid || auth.currentUser?.uid;
    if (!targetUid) return null;

    const snapshot = await getDoc(doc(db, "users", targetUid));
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const subscribeToUserProfile = (uid, callback) => {
  if (!uid) {
    callback?.(null);
    return () => {};
  }

  return onSnapshot(
    doc(db, "users", uid),
    (snapshot) => {
      callback?.(snapshot.exists() ? snapshot.data() : null);
    },
    (error) => {
      console.error("Error subscribing to user profile:", error);
      callback?.(null);
    }
  );
};
