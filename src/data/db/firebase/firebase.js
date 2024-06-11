import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAmpwgQXKfM8Kloob5k4Wgxi6cFslML4cM",
    authDomain: "citeease-c1b63.firebaseapp.com",
    projectId: "citeease-c1b63",
    storageBucket: "citeease-c1b63.appspot.com",
    messagingSenderId: "77600030297",
    appId: "1:77600030297:web:ddb919005ff9bf6dbebb48",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
