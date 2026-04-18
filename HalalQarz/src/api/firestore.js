import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  setDoc, 
  getDoc,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";

// --- USER PROFILE ---
export const saveUserProfile = async (userId, userData) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...userData,
      createdAt: serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error saving user profile:", error);
    return { error };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { data: docSnap.data() };
    }
    return { data: null };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { error };
  }
};

// --- EXPENSES ---
export const addExpense = async (userId, expenseData) => {
  try {
    const docRef = await addDoc(collection(db, "expenses", userId, "entries"), {
      ...expenseData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error adding expense:", error);
    return { error };
  }
};

export const getExpenses = async (userId) => {
  try {
    const q = query(
      collection(db, "expenses", userId, "entries"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return { 
      data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) 
    };
  } catch (error) {
    console.error("Error getting expenses:", error);
    return { error };
  }
};

// --- ELIGIBILITY CHECKS ---
export const saveEligibilityCheck = async (userId, checkData) => {
  try {
    const docRef = await addDoc(collection(db, "eligibilityChecks", userId, "checks"), {
      ...checkData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error saving eligibility check:", error);
    return { error };
  }
};

export const getEligibilityHistory = async (userId) => {
  try {
    const q = query(
      collection(db, "eligibilityChecks", userId, "checks"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return { 
      data: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) 
    };
  } catch (error) {
    console.error("Error getting eligibility history:", error);
    return { error };
  }
};
