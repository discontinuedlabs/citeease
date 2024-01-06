import "./css/style.css";
import Bibliography from "./components/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import { useLocalStorage } from "./utils";

export default function App() {
    const [bibliographies, setBibliographies] = useLocalStorage("bibliographies", []);

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
