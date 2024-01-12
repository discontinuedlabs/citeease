import { useEffect, useState } from "react";

export default function FontSelect(props) {
    const { font, setFont } = props;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (visible) setVisible(false);
    }, [font]);

    function handleChangeVisibility() {
        setVisible((prevVisible) => !prevVisible);
    }

    return (
        <>
            <button onClick={handleChangeVisibility}>{font}</button>
            {visible && (
                <div className="context-menu">
                    <button className="option-button" onClick={() => setFont("Arial")} style={{ fontFamily: "Arial" }}>
                        Arial
                    </button>
                    <button
                        className="option-button"
                        onClick={() => setFont("Calibri")}
                        style={{ fontFamily: "Calibri" }}
                    >
                        Calibri
                    </button>
                    <button
                        className="option-button"
                        onClick={() => setFont("Georgia")}
                        style={{ fontFamily: "Georgia" }}
                    >
                        Georgia
                    </button>
                    <button
                        className="option-button"
                        onClick={() => setFont("Helvetica")}
                        style={{ fontFamily: "Helvetica" }}
                    >
                        Helvetica
                    </button>
                    <button
                        className="option-button"
                        onClick={() => setFont("Lucida Sans Unicode")}
                        style={{ fontFamily: "Lucida Sans Unicode" }}
                    >
                        Lucida Sans Unicode
                    </button>
                    <button
                        className="option-button"
                        onClick={() => setFont("System UI")}
                        style={{
                            fontFamily:
                                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                        }}
                    >
                        System UI
                    </button>
                    <button
                        className="option-button"
                        onClick={() => setFont("Tahoma")}
                        style={{ fontFamily: "Tahoma" }}
                    >
                        Tahoma
                    </button>
                    <button
                        className="option-button"
                        onClick={() => setFont("Times New Roman")}
                        style={{ fontFamily: "Times New Roman" }}
                    >
                        Times New Roman
                    </button>
                    <button
                        className="option-button"
                        onClick={() => setFont("Verdana")}
                        style={{ fontFamily: "Verdana" }}
                    >
                        Verdana
                    </button>
                </div>
            )}
        </>
    );
}
