import "../../css/Dialogs.css";

export function ConfirmDialog(props) {
    const { message, onConfirmMethod, yesLabel, noLabel, closeDialog } = props;

    function handleConfirm() {
        onConfirmMethod();
        closeDialog();
    }

    return (
        <div className="dialog">
            <div className="dialog-background" onClick={closeDialog}></div>
            <div className="dialog-box">
                <h3>{message.title}</h3>
                <p>{message.body}</p>
                <button onClick={handleConfirm}>{yesLabel || "Yes"}</button>
                <button onClick={closeDialog}>{noLabel || "No"}</button>
            </div>
        </div>
    );
}

export function AcceptDialog(props) {
    const { message, closeDialog } = props;

    return (
        <div className="dialog">
            <div className="dialog-background" onClick={closeDialog}></div>
            <div className="dialog-box">
                <h3>{message.title}</h3>
                <button onClick={closeDialog}>X</button>
                {message.body && <p>{message.body}</p>}
                <button onClick={closeDialog}>Accept</button>
            </div>
        </div>
    );
}
