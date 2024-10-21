import { doc, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import firestoreDB from "../data/db/firebase/firebase";
import { Bibliography, Settings } from "../types/types.ts";

type UserData = {
    bibliographies?: Bibliography[];
    settings?: Settings;
};

/**
 * Retrieves user data from Firestore based on the provided user's credentials.
 *
 * @param {User} credentials - The user's credentials, typically obtained from Firebase Authentication.
 * @returns {Promise<UserData | null>} A promise that resolves to an object containing the user's bibliographies and settings, or null if the user does not exist.
 */
export default async function retrieveUserData(credentials: User): Promise<UserData> {
    const userDocRef = doc(firestoreDB, "users", credentials.uid!);
    const userDocSnap = await getDoc(userDocRef);
    let [b, s] = [[], {}];

    if (userDocSnap.exists()) {
        const { bibliographies, settings }: UserData = userDocSnap.data();
        if (bibliographies) {
            b = JSON.parse(bibliographies.toString());
        }
        if (settings) {
            s = JSON.parse(settings.toString());
        }
    }

    return { bibliographies: b, settings: s };
}
