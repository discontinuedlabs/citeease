import "./css/App.css";
import { useEffect, useState } from "react";
import Bibliography from "./components/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import { useLocalStorage } from "./utils";
import Toast from "./components/Toast";
import FontSelect from "./components/FontSelect";

export default function App() {
    const [bibliographies, setBibliographies] = useLocalStorage("bibliographies", []);
    const [font, setFont] = useLocalStorage("font", "Georgia");
    const [toastMessage, setToastMessage] = useState({});

    useEffect(() => {
        const elements = document.querySelectorAll(".yourClassName");
        elements.forEach((element) => {
            element.style.fontFamily = font;
        });
    }, [font]);

    function showToast(title, body = "") {
        setToastMessage({ title, body });
        setTimeout(() => setToastMessage(""), 3000);
    }

    return (
        <div className="app">
            <FontSelect font={font} setFont={setFont} />

            <Routes>
                <Route
                    path="/"
                    element={<Home bibliographies={bibliographies} setBibliographies={setBibliographies} />}
                />
                <Route
                    path="/bibliography/:id"
                    element={
                        <Bibliography
                            bibliographies={bibliographies}
                            setBibliographies={setBibliographies}
                            font={font}
                            showToast={showToast}
                        />
                    }
                />
            </Routes>
            {toastMessage.title && <Toast message={toastMessage} closeToast={() => setToastMessage("")} />}
        </div>
    );
}
