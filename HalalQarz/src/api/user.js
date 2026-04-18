import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "./firebase";

/**
 * Fetches the user profile from Firestore.
 * @param {string} uid - The user's UID.
 * @returns {Promise<Object|null>} - The user data or null.
 */
export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Subscribes to user profile changes in Firestore.
 * @param {string} uid - The user's UID.
 * @param {function} callback - Function called with updated data.
 */
export const subscribeToUserProfile = (uid, callback) => {
  const docRef = doc(db, "users", uid);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error subscribing to user profile:", error);
  });
};
