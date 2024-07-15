import "../../css/Dialogs.css";

export function ConfirmDialog(props) {
    const { message, onConfirmMethod, yesLabel, noLabel, closeDialog } = props;

    function handleConfirm() {
        onConfirmMethod();
        closeDialog();
    }

    return (
        <div className="dialog">
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div className="dialog-background" onClick={closeDialog} />
            <div className="dialog-box">
                <h3>{message.title}</h3>
                <p>{message.body}</p>
                <button type="button" onClick={handleConfirm}>
                    {yesLabel || "Yes"}
                </button>
                <button type="button" onClick={closeDialog}>
                    {noLabel || "No"}
                </button>
            </div>
        </div>
    );
}

export function AcceptDialog(props) {
    const { message, closeDialog } = props;

    return (
        <div className="dialog">
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div className="dialog-background" onClick={closeDialog} />
            <div className="dialog-box">
                <h3>{message.title}</h3>
                <button type="button" onClick={closeDialog}>
                    X
                </button>
                {message.body && <p>{message.body}</p>}
                <button type="button" onClick={closeDialog}>
                    Accept
                </button>
            </div>
        </div>
    );
}
