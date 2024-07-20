import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    createUserWithEmailAndPassword,
    deleteUser,
    EmailAuthProvider,
    onAuthStateChanged,
    reauthenticateWithCredential,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    updateProfile,
    verifyBeforeUpdateEmail,
} from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import db, { auth } from "../data/db/firebase/firebase";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);
    // const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setIsLoading(false);
        });
        return unsubscribe;
    }, []);

    async function signup(email, password, displayName) {
        await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(auth.currentUser, { displayName });
    }

    async function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function logout() {
        await signOut(auth);
        console.log(auth.currentUser);
        return auth.currentUser;
    }

    async function verifyEmail() {
        return sendEmailVerification(currentUser);
    }

    async function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    async function updateEmail(email) {
        return verifyBeforeUpdateEmail(currentUser, email);
    }

    async function changePassword(prevPassword, newPassword) {
        const credential = EmailAuthProvider.credential(currentUser.email, prevPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        return updatePassword(currentUser, newPassword);
    }

    async function deleteAccount(password) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await deleteDoc(userDocRef);
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
        return deleteUser(currentUser);
    }

    const value = useMemo(
        () => ({
            currentUser,
            signup,
            login,
            logout,
            verifyEmail,
            resetPassword,
            updateEmail,
            changePassword,
            deleteAccount,
        }),
        [currentUser, signup, login, logout, verifyEmail, resetPassword, updateEmail, changePassword, deleteAccount]
    );

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
}
