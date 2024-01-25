import { getApps, initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5hw-AeOr-6BkWNoAXZUq5tle_gJBEMTI",
  authDomain: "biomes43.firebaseapp.com",
  projectId: "biomes43",
  storageBucket: "biomes43.appspot.com",
  messagingSenderId: "646396540903",
  appId: "1:646396540903:web:0bf7f827579a373d3faf42",
};

export function initializeFirebaseIfNeeded() {
  if (getApps().length > 0) {
    return;
  }
  initializeApp(firebaseConfig);
}
