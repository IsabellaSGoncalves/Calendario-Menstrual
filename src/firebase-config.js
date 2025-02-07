import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBIC62PXy1LGIWRMKWdVzkiKKs3iNO1Qno",
    authDomain: "react-menstrual.firebaseapp.com",
    projectId: "react-menstrual",
    storageBucket: "react-menstrual.firebasestorage.app",
    messagingSenderId: "299550027671",
    appId: "1:299550027671:web:229165b2c6546ade6b5ed2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getFirestore(app);

export { auth };
export { database };