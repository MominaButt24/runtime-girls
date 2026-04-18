// src/api/firestore.js
import { db } from './firebase'; // You'll set this up in firebase.js
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Example: Save a user's learning progress or chat history
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

// Example: Fetch data for the dashboard
export const getUserData = async (userId) => {
    const q = query(collection(db, "user_activity"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};