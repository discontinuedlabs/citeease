import { v4 as uuid4 } from "uuid";
import { useState } from "react";
import "./css/style.css";
import Bibliography from "./components/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import { useLocalStorage } from "./utils";

export default function App() {
    const [bibliographies, setBibliographies] = useState([]);

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
                        />
                    }
                />
            </Routes>
        </div>
    );
}
