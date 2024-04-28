import "../../css/AcceptDialog.css";

export default function Toast(props) {
    const { message, closeDialog } = props;

    return (
        <div className="accept-dialog">
            <div className="accept-dialog-background" onClick={closeDialog}></div>
            <div className="accept-dialog-box">
                <h3>{message.title}</h3>
                <button onClick={closeDialog}>X</button>
                {message.body && <p>{message.body}</p>}
                <button onClick={closeDialog}>Accept</button>
            </div>
        </div>
    );
}
