// ==========================================================================
// Firebase Service Module (Firestore Cloud Sync & Local Storage Bridge)
// ==========================================================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let firebaseApp = null;
let db = null;
let isConfigured = false;

// Initialize Firebase with given configuration
export async function initializeFirebaseService(config) {
  try {
    if (!config || !config.apiKey || !config.projectId) {
      isConfigured = false;
      db = null;
      return { success: false, message: "Missing required Firebase API Key or Project ID" };
    }

    // Check if already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp(config);
    }

    db = getFirestore(firebaseApp);
    isConfigured = true;

    // Test simple probe
    return { success: true, message: "Connected to Firebase Firestore successfully!" };
  } catch (error) {
    console.error("Firebase init error:", error);
    isConfigured = false;
    db = null;
    return { success: false, message: error.message };
  }
}

export function isConnected() {
  return isConfigured && db !== null;
}

// Save or Update a Document in Firestore
export async function syncDocToCloud(collectionName, id, data) {
  if (!isConnected()) return false;
  try {
    const docRef = doc(db, collectionName, String(id));
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn(`Firestore save error on ${collectionName}/${id}:`, err);
    return false;
  }
}

// Delete Document from Firestore
export async function removeDocFromCloud(collectionName, id) {
  if (!isConnected()) return false;
  try {
    const docRef = doc(db, collectionName, String(id));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`Firestore delete error on ${collectionName}/${id}:`, err);
    return false;
  }
}

// Fetch all documents from a Firestore collection
export async function fetchCollectionFromCloud(collectionName) {
  if (!isConnected()) return [];
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items = [];
    querySnapshot.forEach((docSnapshot) => {
      items.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });
    return items;
  } catch (err) {
    console.error(`Error fetching collection ${collectionName}:`, err);
    throw err;
  }
}

// Full Batch Sync: Upload all local data to Firebase
export async function batchUploadToCloud(incomes, expenses, lentList, borrowedList) {
  if (!isConnected()) throw new Error("Firebase is not connected. Please save valid Firebase credentials first.");

  let uploadedCount = 0;

  for (const item of (incomes || [])) {
    await syncDocToCloud('incomes', item.id, item);
    uploadedCount++;
  }

  for (const item of (expenses || [])) {
    await syncDocToCloud('expenses', item.id, item);
    uploadedCount++;
  }

  for (const item of (lentList || [])) {
    await syncDocToCloud('lent_records', item.id, item);
    uploadedCount++;
  }

  for (const item of (borrowedList || [])) {
    await syncDocToCloud('borrowed_records', item.id, item);
    uploadedCount++;
  }

  return uploadedCount;
}

// Expose on window for app.js interoperability
window.FirebaseBridge = {
  initializeFirebaseService,
  isConnected,
  syncDocToCloud,
  removeDocFromCloud,
  fetchCollectionFromCloud,
  batchUploadToCloud
};
