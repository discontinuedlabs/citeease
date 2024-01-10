import "./css/style.css";
import { useState } from "react";
import Bibliography from "./components/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import { useLocalStorage } from "./utils";
import Toast from "./components/Toast";

export default function App() {
    const [bibliographies, setBibliographies] = useLocalStorage("bibliographies", []);
    const [toastMessage, setToastMessage] = useState({});

    function showToast(title, body = "") {
        setToastMessage({ title, body });
        setTimeout(() => setToastMessage(""), 3000);
    }

    return (
        <div className="app">
            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            bibliographies={bibliographies}
                            setBibliographies={setBibliographies}
                        />
                    }
                />
                <Route
                    path="/bibliography/:id"
                    element={
                        <Bibliography
                            bibliographies={bibliographies}
                            setBibliographies={setBibliographies}
                            showToast={showToast}
                        />
                    }
                />
            </Routes>
            {toastMessage && (
                <Toast message={toastMessage} closeToast={() => setToastMessage("")} />
            )}
        </div>
    );
}
