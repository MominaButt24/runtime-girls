import { db, auth } from './firebase';
import { 
  collection, addDoc, getDocs, doc, setDoc, getDoc, deleteDoc, orderBy, query, serverTimestamp 
} from "firebase/firestore";

const getUid = () => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  return auth.currentUser.uid;
};

// --- USER ---
export const getUserProfile = async () => {
  try {
    const uid = getUid();
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return { data: docSnap.data() };
    }
    return { data: null };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { error };
  }
};

export const updateUserProfile = async (data) => {
  try {
    const uid = getUid();
    await setDoc(doc(db, "users", uid), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { error };
  }
};

// --- EXPENSES ---
export const addExpense = async (category, amount, description) => {
  try {
    const uid = getUid();
    const docRef = await addDoc(collection(db, "expenses", uid, "entries"), {
      category,
      amount: Number(amount),
      description,
      date: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error adding expense:", error);
    return { error };
  }
};

export const getExpenses = async () => {
  try {
    const uid = getUid();
    const q = query(
      collection(db, "expenses", uid, "entries"),
      orderBy("date", "desc")
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

export const deleteExpense = async (expenseId) => {
  try {
    const uid = getUid();
    await deleteDoc(doc(db, "expenses", uid, "entries", expenseId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { error };
  }
};

// --- ELIGIBILITY ---
export const saveEligibilityCheck = async (checkData) => {
  try {
    const uid = getUid();
    const docRef = await addDoc(collection(db, "eligibilityChecks", uid, "checks"), {
      ...checkData,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id };
  } catch (error) {
    console.error("Error saving eligibility check:", error);
    return { error };
  }
};

export const getEligibilityHistory = async () => {
  try {
    const uid = getUid();
    const q = query(
      collection(db, "eligibilityChecks", uid, "checks"),
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
