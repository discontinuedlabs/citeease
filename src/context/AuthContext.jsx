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
        return auth.currentUser;
    }

    async function login(email, password) {
        await signInWithEmailAndPassword(auth, email, password);
        return auth.currentUser;
    }

    async function logout() {
        await signOut(auth);
        return auth.currentUser;
    }

    async function verifyEmail() {
        await sendEmailVerification(currentUser);
        return auth.currentUser;
    }

    async function resetPassword(email) {
        await sendPasswordResetEmail(auth, email);
        return auth.currentUser;
    }

    async function updateEmail(email) {
        await verifyBeforeUpdateEmail(currentUser, email);
        return auth.currentUser;
    }

    async function changePassword(prevPassword, newPassword) {
        const credential = EmailAuthProvider.credential(currentUser.email, prevPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(currentUser, newPassword);
        return auth.currentUser;
    }

    async function deleteAccount(password) {
        const userDocRef = doc(db, "users", currentUser.uid);
        await deleteDoc(userDocRef);
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await deleteUser(currentUser);
        return auth.currentUser;
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
