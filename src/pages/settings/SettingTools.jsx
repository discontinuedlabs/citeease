import { useDispatch, useSelector } from "react-redux";
import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addIcon, updateSettingsField, deleteIcon, resetAllSettings } from "../../data/store/slices/settingsSlice";
import { useAuth } from "../../context/AuthContext";
import { deleteAllBibs } from "../../data/store/slices/bibsSlice";
import { uid } from "../../utils/utils.ts";
import {
    ChipSet,
    Divider,
    FilledButton,
    IconButton,
    OutlinedButton,
    TextField,
} from "../../components/ui/MaterialComponents";
import { useToast } from "../../context/ToastContext.tsx";
import colorValues from "../../assets/json/colors.json";
import builtinTags from "../../assets/json/tags.json";

export function TagsManager() {
    const { data: settings } = useSelector((state) => state.settings);
    const [tagLabel, setTagLabel] = useState("");
    const [tagColor, setTagColor] = useState("yellow");
    const [errorMessage, setErrorMessage] = useState("");
    const dispatch = useDispatch();

    function addTag(event) {
        event.preventDefault();
        if (/^\s*$/.test(tagLabel)) {
            setErrorMessage("You can't add an empty tag.");
            return;
        }

        dispatch(
            updateSettingsField({
                key: "tags",
                value: [...settings.tags, { label: tagLabel, color: tagColor, id: uid() }],
            })
        );
        setTagLabel("");
        setErrorMessage("");
    }

    function deleteTag(id) {
        dispatch(
            updateSettingsField({
                key: "tags",
                value: settings.tags.filter((tag) => tag.id !== id),
            })
        );
    }

    function restoreDefaultTags() {
        dispatch(
            updateSettingsField({
                key: "tags",
                value: [
                    ...settings.tags,
                    ...builtinTags.filter((tag) => !settings.tags.some((sTag) => sTag.id === tag.id)),
                ],
            })
        );
    }

    return (
        <div className="grid gap-2 px-5">
            <ChipSet
                chips={settings.tags.map((tag) => {
                    return {
                        ...tag,
                        icon: "close",
                        selected: true,
                        onClick: () => deleteTag(tag.id),
                    };
                })}
            />

            <Divider className="my-2" />

            <form className="grid gap-2" onSubmit={addTag}>
                <div className="flex justify-between gap-2">
                    <TextField
                        className="w-full"
                        errorText={errorMessage}
                        style={{
                            "--md-filled-text-field-focus-active-indicator-color":
                                colorValues[settings.theme][tagColor],
                        }}
                        type="text"
                        label="Tag label"
                        placeholder="eg., Favorite"
                        value={tagLabel}
                        onChange={(event) => setTagLabel(event.target.value)}
                    />
                    <FilledButton type="submit" onClick={addTag}>
                        Add tag
                    </FilledButton>
                </div>

                <ChipSet
                    chips={Object.keys(colorValues[settings.theme]).map((color) => {
                        return {
                            label: color.charAt(0).toUpperCase() + color.slice(1).toLowerCase(),
                            color,
                            selected: tagColor === color,
                            onClick: () => setTagColor(color),
                        };
                    })}
                />

                <OutlinedButton onClick={restoreDefaultTags}>Restore default tags</OutlinedButton>
            </form>
        </div>
    );
}

export function IconsManager() {
    const settings = useSelector((state) => state.settings);
    console.log(settings);
    const { icons } = settings;
    const dispatch = useDispatch();
    const toast = useToast();
    const [iconName, setIconName] = useState("");

    function addIconToCollection(event) {
        event.preventDefault();
        if (/^\s*$/.test(iconName)) return;

        if (icons.includes(iconName.toLowerCase())) {
            toast.show({
                message: `You already have \`${iconName}\` icon`,
            });
        } else {
            dispatch(addIcon({ icon: iconName }));
            setIconName("");
        }
    }

    return (
        <div className="grid gap-2">
            <div className="flex flex-wrap gap-1">
                {icons?.map((icon) => {
                    return (
                        <IconButton
                            key={uid()}
                            name={icon}
                            onClick={() => {
                                dispatch(deleteIcon({ icon }));
                            }}
                        />
                    );
                })}
            </div>

            <form onSubmit={addIconToCollection}>
                <div className="flex grid-cols-2 gap-2">
                    <div className="rounded-md bg-white">
                        <input
                            type="text"
                            placeholder="Icon name"
                            value={iconName}
                            onChange={(event) => setIconName(event.target.value)}
                        />
                    </div>

                    <FilledButton type="submit">Add icon</FilledButton>
                </div>
            </form>
        </div>
    );
}

export function UpdateEmailDialog(props) {
    const { setIsVisible } = props;
    const { updateEmail } = useAuth();
    const id = useId();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const newEmailRef = useRef();
    const navigate = useNavigate();

    async function handleSUbmit(event) {
        event.preventDefault();

        try {
            setError("");
            setIsLoading(true);
            await updateEmail(newEmailRef.current.value);
            navigate("/");
            // TODO: Show success toast message
        } catch (tError) {
            setError(`Failed to update email: ${tError}`);
        }

        setIsLoading(false);
    }

    return (
        <div>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            <h3>Update email</h3>
            <pre>{error}</pre>
            <form onSubmit={handleSUbmit}>
                <label htmlFor={`${id}-newEmail`}>
                    Type your new email.
                    <input id={`${id}-newEmail`} type="email" ref={newEmailRef} required />
                </label>
                <button type="submit" disabled={isLoading}>
                    Update email
                </button>
            </form>
        </div>
    );
}

export function ChangePasswordDialog(props) {
    const { setIsVisible } = props;
    const { changePassword } = useAuth();
    const id = useId();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const prevPasswordRef = useRef();
    const newPasswordRef = useRef();
    const confirmPasswordRef = useRef();

    async function handleSUbmit(event) {
        event.preventDefault();

        if (newPasswordRef.current.value !== confirmPasswordRef.current.value) {
            setError("Passwords do not match.");
        } else {
            try {
                setError("");
                setIsLoading(true);
                await changePassword(prevPasswordRef.current.value, newPasswordRef.current.value);
                setIsVisible(false);
                // TODO: Show success toast message
            } catch (tError) {
                setError(`Failed to update password: ${tError}`);
            }

            setIsLoading(false);
        }
    }

    return (
        <div>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            <h3>Change password</h3>
            <pre>{error}</pre>
            <form onSubmit={handleSUbmit}>
                <label htmlFor={`${id}-prevPassword`}>
                    Previous password
                    <input type="password" id={`${id}-prevPassword`} ref={prevPasswordRef} required />
                </label>
                <label htmlFor={`${id}-newPassword`}>
                    New password
                    <input type="password" id={`${id}-newPassword`} ref={newPasswordRef} required />
                </label>
                <label htmlFor={`${id}-confirmPassword`}>
                    Confirm password
                    <input type="password" id={`${id}-confirmPassword`} ref={confirmPasswordRef} required />
                </label>
                <button type="submit" disabled={isLoading}>
                    Update password
                </button>
            </form>
        </div>
    );
}

export function DeleteAccountDialog(props) {
    const { setIsVisible } = props;
    const { deleteAccount } = useAuth();
    const id = useId();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const passwordRef = useRef();
    const checkboxRef = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    async function handleSUbmit(event) {
        event.preventDefault();

        try {
            setError("");
            setIsLoading(true);
            await deleteAccount(passwordRef.current.value);
            if (!checkboxRef.current.checked) {
                dispatch(deleteAllBibs());
                dispatch(resetAllSettings());
            }
            navigate("/");
            // TODO: Show success toast message
        } catch (tError) {
            setError(`Failed to delete account: ${tError}`);
        }

        setIsLoading(false);
    }

    return (
        <div>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            <h3>Delete account?</h3>
            <pre>{error}</pre>
            <form onSubmit={handleSUbmit}>
                <label htmlFor={`${id}-password`}>
                    Type your password to delete your account.
                    <input id={`${id}-password`} type="password" ref={passwordRef} required />
                </label>

                <label htmlFor={`${id}-checkbox`}>
                    <input id={`${id}-checkbox`} type="checkbox" ref={checkboxRef} />
                    Keep a copy of the associated data locally
                </label>
                <strong>Warning: This action can&apos;t be undone</strong>
                <button type="submit" disabled={isLoading}>
                    Delete account
                </button>
            </form>
        </div>
    );
}
