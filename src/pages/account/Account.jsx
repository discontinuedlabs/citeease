import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import { ChangePasswordDialog, DeleteAccountDialog, UpdateEmailDialog } from "../settings/SettingTools";
import { deleteAllBibs } from "../../data/store/slices/bibsSlice";
import { resetAllSettings } from "../../data/store/slices/settingsSlice";
import { FilledButton, List, TopBar } from "../../components/ui/MaterialComponents";
import defaults from "../../assets/json/defaults.json";

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
        return false;
    });
    const dispatch = useDispatch();
    // const [loggedOut, setLoggedOut] = useState(!currentUser);

    // useEffect(() => {
    //     // WATCH: This effect should execute only when there's a change in the 'currentUser' state.
    //     // If the 'loggedOut' state is true (which depends on the 'currentUser' state being falsy),
    //     // then it proceeds with its task. This is because the 'useAuth().signOut()' function
    //     // doesn't immediately set the 'currentUser' state to null upon resolving its promise;
    //     // it retains the 'currentUser' for a brief period, necessitating this useEffect.
    //     if (loggedOut) {
    //         navigate("/");
    //         dispatch(deleteAllBibs());
    //         dispatch(resetAllSettings());
    //         // TODO: show success taost message
    //     }
    // }, [currentUser]);

    // TODO: Show confirm dialog first
    async function handleLogout() {
        setLogoutLoading(true);
        const credentials = await logout();
        if (!credentials) {
            navigate("/");
            dispatch(deleteAllBibs());
            dispatch(resetAllSettings());
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
                    { title: "Update email", onClick: () => setUpdateEmailDialogVisible(true) },
                    { title: "Change password", onClick: () => setChangePasswordDialogVisible(true) },
                    { title: "Switch account", onClick: () => navigate("/login") },
                    { title: "Log out", onClick: () => handleLogout() },
                    {
                        title: "Delete account",
                        onClick: () => setDeleteAccountDialogVisible(true),
                        disabled: logoutLoading, // TODO..
                    },
                ]}
            />

            {updateEmailDialogVisible && <UpdateEmailDialog setIsVisible={setUpdateEmailDialogVisible} />}
            {changePasswordDialogVisible && <ChangePasswordDialog setIsVisible={setChangePasswordDialogVisible} />}
            {deleteAccountDialogVisible && <DeleteAccountDialog setIsVisible={setDeleteAccountDialogVisible} />}
        </div>
    );
}
