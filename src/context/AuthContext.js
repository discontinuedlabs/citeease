import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../data/db/firebase/firebase";
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
    verifyBeforeUpdateEmail,
} from "firebase/auth";

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

    async function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    async function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function logout() {
        return await signOut(auth);
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
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
        return deleteUser(currentUser);
    }

    const value = {
        currentUser,
        signup,
        login,
        logout,
        verifyEmail,
        resetPassword,
        updateEmail,
        changePassword,
        deleteAccount,
    };

    return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
}
