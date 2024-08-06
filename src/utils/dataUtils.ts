import { doc, getDoc, DocumentData } from "firebase/firestore";
import { User } from "firebase/auth";
import firestoreDB from "../data/db/firebase/firebase";
import { Bibliography } from "../types/types.ts";

type UserData = {
    bibliographies?: Bibliography[];
    settings?: object;
};

/**
 * Retrieves user data from Firestore based on the provided user's credentials.
 *
 * @param {User} credentials - The user's credentials, typically obtained from Firebase Authentication.
 * @returns {Promise<UserData | null>} A promise that resolves to an object containing the user's bibliographies and settings, or null if the user does not exist.
 */
export async function retrieveUserData(credentials: User): Promise<UserData | null> {
    const userDocRef = doc(firestoreDB, "users", credentials.uid!);
    const userDocSnap = await getDoc(userDocRef);

    let bibliographies: Bibliography[] = [];
    let settings: object = {};

    if (userDocSnap.exists()) {
        const userData: DocumentData = userDocSnap.data();
        if (userData.bibliographies) {
            bibliographies = JSON.parse(userData.bibliographies);
        }
        if (userData.settings) {
            settings = JSON.parse(userData.settings);
        }
    }

    return { bibliographies, settings };
}

export const a = 0;
