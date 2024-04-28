export default function ConfirmDialog(props) {
    console.log(props);
    const { message, onConfirmMethod, yesLabel, noLabel, closeDialog } = props;

    function handleConfirm() {
        onConfirmMethod();
        closeDialog();
    }

    return (
        <div className="confirm-dialog">
            <h3>{message.title}</h3>
            <p>{message.body}</p>
            <button onClick={handleConfirm}>{yesLabel || "Yes"}</button>
            <button onClick={closeDialog}>{noLabel || "No"}</button>
        </div>
    );
}
