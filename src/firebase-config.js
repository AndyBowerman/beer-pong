import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyASjKE_csVsPti3dRFZkUa-FkofjFBu6kI",
    authDomain: "beer-pong-e6a2c.firebaseapp.com",
    projectId: "beer-pong-e6a2c",
    storageBucket: "beer-pong-e6a2c.appspot.com",
    messagingSenderId: "949824909223",
    appId: "1:949824909223:web:8c81a5fb0a2e40f4d99082",
    measurementId: "G-T0JZSBX9PV"
  };

  const app = initializeApp(firebaseConfig);

  export const db = getFirestore(app)