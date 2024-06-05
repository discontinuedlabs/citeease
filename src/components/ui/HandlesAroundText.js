// HandlesAroundText component
const HandlesAroundText = (props) => {
    const { children } = props;
    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <div
                style={{
                    position: "absolute",
                    top: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#ccc",
                    padding: "5px",
                    borderRadius: "50%",
                }}
            >
                |
            </div>
            {children}
            <div
                style={{
                    position: "absolute",
                    bottom: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#ccc",
                    padding: "5px",
                    borderRadius: "50%",
                }}
            >
                |
            </div>
        </div>
    );
};

export default HandlesAroundText;
