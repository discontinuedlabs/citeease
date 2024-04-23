import "./css/App.css";
import { useState } from "react";
import Bibliography from "./components/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import { useLocalStorage } from "./utils";
import AcceptDialog from "./components/ui/AcceptDialog";

export default function App() {
    const [bibliographies, setBibliographies] = useLocalStorage("bibliographies", []);
    const [font, setFont] = useLocalStorage("font", { name: "Georgia", family: "Georgia" });
    const [acceptDialog, setAcceptDialog] = useState({});

    const fonts = [
        { name: "Default", family: "unset" },
        { name: "Arial", family: "Arial" },
        { name: "Calibri", family: "Calibri" },
        { name: "Georgia", family: "Georgia" },
        { name: "Helvetica", family: "Helvetica" },
        { name: "Lucida Sans Unicode", family: "Lucida Sans Unicode" },
        {
            name: "System UI",
            family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        },
        { name: "Tahoma", family: "Tahoma" },
        { name: "Times New Roman", family: "Times New Roman" },
        { name: "Verdana", family: "Verdana" },
    ];

    function showAcceptDialog(title, body = "") {
        setAcceptDialog({ title, body });
    }

    return (
        <div className="app">
            {/* <ContextMenu
                label={font.name}
                options={fonts.map((f) => ({
                    label: f.name,
                    method: () => setFont(f),
                    style: { fontFamily: f.family },
                }))}
            /> */}

            <Routes>
                <Route
                    path="/"
                    element={<Home bibliographies={bibliographies} setBibliographies={setBibliographies} />}
                />
                <Route
                    path="/:id"
                    element={
                        <Bibliography
                            bibliographies={bibliographies}
                            setBibliographies={setBibliographies}
                            font={font}
                            showAcceptDialog={showAcceptDialog}
                        />
                    }
                />
            </Routes>
            {acceptDialog.title && <AcceptDialog message={acceptDialog} closeToast={() => setAcceptDialog("")} />}
        </div>
    );
}
