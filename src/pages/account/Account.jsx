import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { deleteAllBibs } from "../../data/store/slices/bibsSlice";
import { resetAllSettings } from "../../data/store/slices/settingsSlice";
import { Checkbox, FilledButton, List, TextField, TopBar } from "../../components/ui/MaterialComponents";
import defaults from "../../assets/json/defaults.json";
import { useDialog } from "../../context/DialogContext.tsx";
import { useToast } from "../../context/ToastContext.tsx";

export default function Account() {
    const navigate = useNavigate();
    const { currentUser, logout, verifyEmail, updateEmail, changePassword, deleteAccount } = useAuth();
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [isEmailVerificationDisabled, setEmailVerificationDisabled] = useState(() => {
        const disableTimestamp = localStorage.getItem("emailVerificationDisableTimestamp");
        if (disableTimestamp) return Number(disableTimestamp) > Date.now();
        return false;
    });
    const dispatch = useDispatch();
    const dialog = useDialog();
    const toast = useToast();

    const newEmailRef = useRef();
    const confirmPasswordRef = useRef();
    const oldPasswordRef = useRef();
    const newPasswordRef = useRef();
    const confirmNewPasswordRef = useRef();
    const checkboxRef = useRef();

    useEffect(() => {
        if (!currentUser) {
            navigate("/login", { replace: true });
        }
    }, []);

    // FIXME: This doesn't change the email.
    function showUpdateEmailDialog() {
        async function update() {
            try {
                await updateEmail(newEmailRef.current.value, confirmPasswordRef.current.value);
                dialog.close("updateEmailDialog");
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
            id: "updateEmailDialog",
            headline: "Update email",
            content: (
                <div className="grid gap-2 px-5">
                    <TextField
                        className="w-full"
                        label="New email"
                        placeholder="Type your new email"
                        type="email"
                        ref={newEmailRef}
                        required
                    />
                    <TextField
                        className="w-full"
                        label="Confirm password"
                        placeholder="Type your password"
                        type="password"
                        ref={confirmPasswordRef}
                        required
                    />
                </div>
            ),
            actions: [
                ["Cancel", () => dialog.close()],
                ["Update", update, { closeOnClick: false }],
            ],
        });
    }

    function showChangePasswordDialog() {
        async function update() {
            if (newPasswordRef.current.value !== confirmNewPasswordRef.current.value) {
                toast.show({ message: "Passwords do not match", color: "red", icon: "error" });
            } else {
                try {
                    await changePassword(oldPasswordRef.current.value, newPasswordRef.current.value);
                    dialog.close("updatePasswordDialog");
                    toast.show({ message: "Password updated successfully", color: "green", icon: "check" });
                } catch (error) {
                    console.error(error);
                    toast.show({ message: "Failed to update password", color: "red", icon: "error" });
                }
            }
        }

        dialog.show({
            id: "updatePasswordDialog",
            headline: "Update password",
            content: (
                <div className="grid gap-2 px-5">
                    <TextField
                        className="w-full"
                        label="Old password"
                        placeholder="Type your old password"
                        type="password"
                        ref={oldPasswordRef}
                        required
                    />
                    <TextField
                        className="w-full"
                        label="New password"
                        placeholder="Type your new password"
                        type="password"
                        ref={newPasswordRef}
                        required
                    />
                    <TextField
                        className="w-full"
                        label="Confirm new password"
                        placeholder="Confirm your new password"
                        type="password"
                        ref={confirmNewPasswordRef}
                        required
                    />
                </div>
            ),
            actions: [
                ["Cancel", () => dialog.close()],
                ["Update", update, { closeOnClick: false }],
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
            toast.show({
                message: "Check you email to verify it",
                icon: "mail",
                color: "yellow",
            });
        } catch (error) {
            console.error(error);
            toast.show({
                message: "Failed to verify email",
                icon: "error",
                color: "red",
            });
        }
        setVerifyLoading(false);
    }

    function showDeleteAccountDialog() {
        async function deleteAcc() {
            try {
                await deleteAccount(confirmPasswordRef.current.value);
                if (!checkboxRef.current.checked) {
                    dispatch(deleteAllBibs());
                    dispatch(resetAllSettings());
                }
                navigate("/");
                dialog.close("deleteAccountDialog");
                toast.show({ message: "Account deleted successfully", color: "green", icon: "check" });
            } catch (error) {
                console.error(error);
                toast.show({
                    message: "Failed to delete account",
                    icon: "error",
                    color: "red",
                });
            }
        }

        dialog.show({
            id: "deleteAccountDialog",
            icon: "delete_forever",
            headline: "Delete account?",
            content: (
                <div className="grid gap-2 px-5">
                    <TextField
                        className="w-full"
                        label="Confirm password"
                        placeholder="Type your password to delete your account"
                        type="password"
                        ref={confirmPasswordRef}
                        required
                    />
                    <div className="flex justify-start gap-2">
                        <Checkbox ref={checkboxRef} />
                        Keep a copy of the associated data locally
                    </div>

                    <strong>Warning: This action can&apos;t be undone.</strong>
                </div>
            ),
            actions: [
                ["Delete account", deleteAcc, { closeOnClick: false }],
                ["Cancel", () => dialog.close(), { type: "filled" }],
            ],
        });
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
                    { title: "Change password", onClick: showChangePasswordDialog },
                    { title: "Switch account", onClick: () => navigate("/login") },
                    { title: "Log out", onClick: handleLogout },
                    {
                        title: "Delete account",
                        onClick: showDeleteAccountDialog,
                        disabled: logoutLoading,
                    },
                ]}
            />
        </div>
    );
}
