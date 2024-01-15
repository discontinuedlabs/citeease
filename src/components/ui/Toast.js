import React from "react";

export default function Toast(props) {
    const { message, closeToast } = props;

    return (
        <div className="accept-dialog">
            <div className="accept-dialog-background" onClick={closeToast}></div>
            <div className="accept-dialog-box">
                <h3>{message.title}</h3>
                <button onClick={closeToast}>X</button>
                {message.body && <p>{message.body}</p>}
                <button onClick={closeToast}>Accept</button>
            </div>
        </div>
    );
}
