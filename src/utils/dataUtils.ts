import { doc, getDoc, DocumentData } from "firebase/firestore";
import firestoreDB from "../data/db/firebase/firebase";
import { Bibliography } from "../types/types.ts";

type UserData = {
    bibliographies?: Bibliography[];
    settings?: object;
};

export async function retrieveUserData(credentials: Record<string, never>): Promise<UserData | null> {
    const userDocRef = doc(firestoreDB, "users", credentials.uid!);
    const userDocSnap = await getDoc(userDocRef);

    let bibliographies: Bibliography[] = [];
    let settings: object = {};

    if (userDocSnap.exists()) {
        const userData: DocumentData = userDocSnap.data() || {};
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
