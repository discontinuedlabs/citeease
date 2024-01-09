import React from "react";
// import "./Toast.css";

export default function Toast(props) {
    const { message, closeToast } = props;

    return (
        <div className="toast">
            <h3>{message.title}</h3>
            <button onClick={closeToast}>X</button>
            {message.body && <p>{message.body}</p>}
        </div>
    );
}
