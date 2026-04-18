import { db } from './firebase'; 
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export const saveUserData = async (userId, data) => {
  try {
    const docRef = await addDoc(collection(db, "user_activity"), {
      userId,
      ...data,
      timestamp: new Date()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const getUserData = async (userId) => {
    const q = query(collection(db, "user_activity"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};