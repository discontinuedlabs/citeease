import { useDispatch, useSelector } from "react-redux";
import { useId, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { useNavigate } from "react-router-dom";
import {
    TAG_COLORS,
    TAG_COLOR_VALUES,
    addTag,
    deleteTag,
    resetAllSettings,
    restoreDefaultTags,
} from "../../data/store/slices/settingsSlice";
import Tag from "../../components/ui/Tag";
import { useTagBgColor } from "../../hooks/hooks.ts";
import { useAuth } from "../../context/AuthContext";
import { deleteAllBibs } from "../../data/store/slices/bibsSlice";

export function TagsManager(props) {
    const { setTagsManagerVisible: setIsVisible } = props;
    const settings = useSelector((state) => state.settings);
    const [tagLabel, setTagLabel] = useState("");
    const [tagColor, setTagColor] = useState(TAG_COLORS.YELLOW);
    const dispatch = useDispatch();
    const [tagIdleColor] = useTagBgColor(tagColor);

    function addTagToBib(event) {
        event.preventDefault();
        if (!/^\s*$/.test(tagLabel)) {
            dispatch(addTag({ tag: { label: tagLabel, color: tagColor, id: nanoid() } }));
            setTagLabel("");
        }
    }

    return (
        <div>
            <button type="button" onClick={() => setIsVisible(false)}>
                X
            </button>
            <div className="flex gap-1 flex-wrap">
                {settings.tags?.map((tag) => (
                    <Tag key={nanoid} tagProps={tag} showX onClick={() => dispatch(deleteTag({ tagId: tag.id }))} />
                ))}
            </div>
            <form onSubmit={addTagToBib}>
                <input
                    className="rounded-md p-2"
                    style={{
                        border: `solid 0.1rem ${TAG_COLOR_VALUES[tagColor]}`,
                        backgroundColor: tagIdleColor,
                        color: TAG_COLOR_VALUES[tagColor],
                    }}
                    type="text"
                    placeholder="Tag label"
                    value={tagLabel}
                    onChange={(event) => setTagLabel(event.target.value)}
                />
                <button type="submit">Add tag</button>
                <div className="flex gap-1 flex-wrap">
                    {Object.values(TAG_COLORS)?.map((color) => (
                        <button
                            className="rounded-full w-5 h-5"
                            type="button"
                            key={nanoid}
                            style={{ backgroundColor: TAG_COLOR_VALUES[color] }}
                            onClick={() => setTagColor(color)}
                        />
                    ))}
                </div>
            </form>
            <button type="button" onClick={() => dispatch(restoreDefaultTags())}>
                Restore default tags
            </button>
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
                <label htmlFor={`${id}-newEmail`}>Type your new email.</label>
                <input id={`${id}-newEmail`} type="email" ref={newEmailRef} required />
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
                <label htmlFor={`${id}-prevPassword`}>Previous password</label>
                <input type="password" id={`${id}-prevPassword`} ref={prevPasswordRef} required />
                <label htmlFor={`${id}-newPassword`}>New password</label>
                <input type="password" id={`${id}-newPassword`} ref={newPasswordRef} required />
                <label htmlFor={`${id}-confirmPassword`}>Confirm password</label>
                <input type="password" id={`${id}-confirmPassword`} ref={confirmPasswordRef} required />
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
                <label htmlFor={`${id}-password`}>Type your password to delete your account.</label>
                <input id={`${id}-password`} type="password" ref={passwordRef} required />
                <input id={`${id}-checkbox`} type="checkbox" ref={checkboxRef} />
                <label htmlFor={`${id}-checkbox`}>Keep a copy of the associated data locally</label>
                <strong>Warning: This action can&apos;t be undone</strong>
                <button type="submit" disabled={isLoading}>
                    Delete account
                </button>
            </form>
        </div>
    );
}
