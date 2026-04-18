import firebase from "./firebase";

export const testFirebaseConnection = async () => {
  try {
    // Attempt to read a test document from Firestore
    const docRef = firebase.db.collection("test").doc("connectionTest");
    await docRef.set({ timestamp: new Date() }); // Write a test document
    const docSnapshot = await docRef.get(); // Read the test document
    return docSnapshot.exists ? docSnapshot.data() : null;
  } catch (error) {
    console.error("Error testing Firebase connection:", error);
    throw error;
  }
}; 
  

import { getApps, initializeApp, getApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";

