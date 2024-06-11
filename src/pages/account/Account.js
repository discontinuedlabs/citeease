import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { ChangePasswordDialog, DeleteAccountDialog, UpdateEmailDialog } from "../settings/SettingTools";
import { SettingsButton, SettingsNavigate } from "../settings/SettingsComponents";

export default function Account() {
    const navigate = useNavigate();
    const { currentUser, logout, verifyEmail } = useAuth();
    const [updateEmailDialogVisible, setUpdateEmailDialogVisible] = useState(false);
    const [changePasswordDialogVisible, setChangePasswordDialogVisible] = useState(false);
    const [deleteAccountDialogVisible, setDeleteAccountDialogVisible] = useState(false);
    const [isEmailVerificationDisabled, setEmailVerificationDisabled] = useState(() => {
        const disableTimestamp = localStorage.getItem("emailVerificationDisableTimestamp");
        if (disableTimestamp) return Number(disableTimestamp) > Date.now();
    });

    useEffect(() => {
        if (!currentUser) navigate("/login");
    }, [currentUser, navigate]);

    // TODO: Show confirm dialog first
    async function handleLogout() {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            // TODO: Show taost message for error
        }
    }

    async function handleVerifyEmail() {
        try {
            await verifyEmail();
            const disableUntil = Date.now() + 60000;
            localStorage.setItem("emailVerificationDisableTimestamp", disableUntil.toString());
            setEmailVerificationDisabled(disableUntil > Date.now());
            // TODO: show toast to notify user to check email
        } catch (error) {
            // TODO: show toast message for error
        }
    }

    return (
        <div>
            <h1>Account</h1>
            <div>
                <p>{currentUser?.displayName}</p>
                <p>
                    {currentUser?.email}
                    <span>{currentUser.emailVerified ? "Verified" : "Not verified"}</span>
                </p>
            </div>
            {!currentUser.emailVerified && (
                <SettingsButton disabled={isEmailVerificationDisabled} onClick={handleVerifyEmail}>
                    Verify email
                </SettingsButton>
            )}
            <SettingsNavigate onClick={() => setUpdateEmailDialogVisible(true)}>Update email</SettingsNavigate>
            <SettingsNavigate onClick={() => setChangePasswordDialogVisible(true)}>Change password</SettingsNavigate>
            <SettingsNavigate onClick={() => navigate("/login")}>Switch account</SettingsNavigate>
            <SettingsNavigate onClick={handleLogout}>Log out</SettingsNavigate>
            <SettingsNavigate onClick={() => setDeleteAccountDialogVisible(true)}>Delete account</SettingsNavigate>

            {updateEmailDialogVisible && <UpdateEmailDialog setIsVisible={setUpdateEmailDialogVisible} />}
            {changePasswordDialogVisible && <ChangePasswordDialog setIsVisible={setChangePasswordDialogVisible} />}
            {deleteAccountDialogVisible && <DeleteAccountDialog setIsVisible={setDeleteAccountDialogVisible} />}
        </div>
    );
}
