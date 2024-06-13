import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { ChangePasswordDialog, DeleteAccountDialog, UpdateEmailDialog } from "../settings/SettingTools";
import { SettingsButton, SettingsNavigate } from "../settings/SettingsComponents";
import { useDispatch } from "react-redux";
import { deleteAllBibs } from "../../data/store/slices/bibsSlice";
import { resetAllSettings } from "../../data/store/slices/settingsSlice";

export default function Account() {
    const navigate = useNavigate();
    const { currentUser, logout, verifyEmail } = useAuth();
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [updateEmailDialogVisible, setUpdateEmailDialogVisible] = useState(false);
    const [changePasswordDialogVisible, setChangePasswordDialogVisible] = useState(false);
    const [deleteAccountDialogVisible, setDeleteAccountDialogVisible] = useState(false);
    const [isEmailVerificationDisabled, setEmailVerificationDisabled] = useState(() => {
        const disableTimestamp = localStorage.getItem("emailVerificationDisableTimestamp");
        if (disableTimestamp) return Number(disableTimestamp) > Date.now();
    });
    const dispatch = useDispatch();
    const [loggedOut, setLoggedOut] = useState(!currentUser);

    useEffect(() => {
        console.log(currentUser, loggedOut);
        // WATCH: This effect should execute only when there's a change in the 'currentUser' state.
        // If the 'loggedOut' state is true (which depends on the 'currentUser' state being falsy),
        // then it proceeds with its task. This is because the 'useAuth().signOut()' function
        // doesn't immediately set the 'currentUser' state to null upon resolving its promise;
        // it retains the 'currentUser' for a brief period, necessitating this useEffect.
        if (loggedOut) {
            navigate("/");
            dispatch(deleteAllBibs());
            dispatch(resetAllSettings());
            // TODO: show success taost message
        }
    }, [currentUser]);

    // TODO: Show confirm dialog first
    async function handleLogout() {
        try {
            setLogoutLoading(true);
            await logout();
            setLoggedOut(true);
        } catch (error) {
            // TODO: Show taost message for error
        }
        setLogoutLoading(false);
    }

    async function handleVerifyEmail() {
        try {
            setVerifyLoading(true);
            await verifyEmail();
            const disableUntil = Date.now() + 60000;
            localStorage.setItem("emailVerificationDisableTimestamp", disableUntil.toString());
            setEmailVerificationDisabled(disableUntil > Date.now());
            // TODO: show toast to notify user to check email
        } catch (error) {
            // TODO: show toast message for error
        }
        setVerifyLoading(false);
    }

    return (
        <div>
            <h1>Account</h1>
            <div>
                <p>{currentUser?.displayName}</p>
                <p>
                    {currentUser?.email}
                    <span>{currentUser?.emailVerified ? "Verified" : "Not verified"}</span>
                </p>
            </div>
            {!currentUser?.emailVerified && (
                <SettingsButton disabled={isEmailVerificationDisabled || verifyLoading} onClick={handleVerifyEmail}>
                    Verify email
                </SettingsButton>
            )}
            <SettingsNavigate onClick={() => setUpdateEmailDialogVisible(true)}>Update email</SettingsNavigate>
            <SettingsNavigate onClick={() => setChangePasswordDialogVisible(true)}>Change password</SettingsNavigate>
            <SettingsNavigate onClick={() => navigate("/login")}>Switch account</SettingsNavigate>
            <SettingsNavigate onClick={handleLogout} disabled={logoutLoading}>
                Log out
            </SettingsNavigate>
            <SettingsNavigate onClick={() => setDeleteAccountDialogVisible(true)}>Delete account</SettingsNavigate>

            {updateEmailDialogVisible && <UpdateEmailDialog setIsVisible={setUpdateEmailDialogVisible} />}
            {changePasswordDialogVisible && <ChangePasswordDialog setIsVisible={setChangePasswordDialogVisible} />}
            {deleteAccountDialogVisible && <DeleteAccountDialog setIsVisible={setDeleteAccountDialogVisible} />}
        </div>
    );
}
