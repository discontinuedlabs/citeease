import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { ChangePasswordDialog, DeleteAccountDialog } from "../settings/SettingTools";
import { deleteAllBibs } from "../../data/store/slices/bibsSlice";
import { resetAllSettings } from "../../data/store/slices/settingsSlice";
import { FilledButton, List, TextField, TopBar } from "../../components/ui/MaterialComponents";
import defaults from "../../assets/json/defaults.json";
import { useDialog } from "../../context/DialogContext.tsx";
import { useToast } from "../../context/ToastContext.tsx";

export default function Account() {
    const navigate = useNavigate();
    const { currentUser, logout, verifyEmail, updateEmail } = useAuth();
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [changePasswordDialogVisible, setChangePasswordDialogVisible] = useState(false);
    const [deleteAccountDialogVisible, setDeleteAccountDialogVisible] = useState(false);
    const [isEmailVerificationDisabled, setEmailVerificationDisabled] = useState(() => {
        const disableTimestamp = localStorage.getItem("emailVerificationDisableTimestamp");
        if (disableTimestamp) return Number(disableTimestamp) > Date.now();
        return false;
    });
    const dispatch = useDispatch();
    const dialog = useDialog();
    const newEmailRef = useRef();
    const toast = useToast();

    function showUpdateEmailDialog() {
        async function update() {
            try {
                await updateEmail(newEmailRef.current.value);
                toast.show({
                    message: "You successfuly updated your email",
                    color: "green",
                    icon: "check",
                });
            } catch (error) {
                console.error("Failed to update email: ", error);
                toast.show({
                    message: "Failed to update email",
                    color: "red",
                    icon: "error",
                });
            }
        }

        dialog.show({
            headline: "Update email",
            content: (
                <div className="p-5">
                    <TextField
                        className="w-full"
                        label="New email"
                        placeholder="Type your new email"
                        type="email"
                        ref={newEmailRef}
                        required
                    />
                </div>
            ),
            actions: [
                ["Cancel", () => dialog.close()],
                ["Update", update],
            ],
        });
    }

    async function handleLogout() {
        dialog.show({
            icon: "logout",
            headline: "Log out?",
            content: "Are you sure you want to log out?",
            actions: [
                [
                    "Yes",
                    async () => {
                        setLogoutLoading(true);
                        const credentials = await logout();
                        if (!credentials) {
                            navigate("/");
                            dispatch(deleteAllBibs());
                            dispatch(resetAllSettings());
                        }
                        setLogoutLoading(false);
                    },
                ],
                ["No", () => dialog.close(), { type: "filled" }],
            ],
        });
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
            console.error(error);
            // TODO: show toast message for error
        }
        setVerifyLoading(false);
    }

    return (
        <div className={defaults.classes.page}>
            <TopBar headline="Account" />
            <div style={{ background: "var(--md-sys-color-secondary-container)" }} className="rounded-3xl p-5">
                <h2 className="mt-0">{currentUser?.displayName}</h2>
                <p className="mb-0 flex items-baseline gap-2">
                    {currentUser?.email}
                    <small
                        style={{
                            background: currentUser?.emailVerified
                                ? "var(--md-sys-color-tertiary)"
                                : "var(--md-sys-color-error)",
                            color: currentUser?.emailVerified
                                ? "var(--md-sys-color-on-tertiary)"
                                : "var(--md-sys-color-on-error)",
                        }}
                        className="rounded-lg px-2 py-1"
                    >
                        {currentUser?.emailVerified ? "Verified" : "Not verified"}
                    </small>
                </p>
                {!currentUser?.emailVerified && (
                    <FilledButton
                        className="mt-4"
                        disabled={isEmailVerificationDisabled || verifyLoading}
                        onClick={() => handleVerifyEmail()}
                    >
                        Verify email
                    </FilledButton>
                )}
            </div>

            <List
                items={[
                    { title: "Update email", onClick: showUpdateEmailDialog },
                    { title: "Change password", onClick: () => setChangePasswordDialogVisible(true) },
                    { title: "Switch account", onClick: () => navigate("/login") },
                    { title: "Log out", onClick: () => handleLogout() },
                    {
                        title: "Delete account",
                        onClick: () => setDeleteAccountDialogVisible(true),
                        disabled: logoutLoading,
                    },
                ]}
            />

            {changePasswordDialogVisible && <ChangePasswordDialog setIsVisible={setChangePasswordDialogVisible} />}
            {deleteAccountDialogVisible && <DeleteAccountDialog setIsVisible={setDeleteAccountDialogVisible} />}
        </div>
    );
}
