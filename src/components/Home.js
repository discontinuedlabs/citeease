import { Link } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";
import { useNavigate } from "react-router-dom";
import BibliographyCard from "./ui/BibliographyCard";
import { useDocumentTitle } from "../utils";
import "../css/Home.css";
import { useState } from "react";
import { CitationStylesMenu } from "./BibliographyTools";

export default function Home(props) {
    const { bibliographies, dispatch, ACTIONS } = props;
    const [citationStyleMenuVisible, setCitationStyleMenuVisible] = useState(false);
    const navigate = useNavigate();
    useDocumentTitle("Home");

    function handleAddBibliography(style) {
        dispatch({ type: ACTIONS.ADD_NEW_BIBLIOGRAPHY, payload: { bibliographyStyle: style } });
    }

    return (
        <div className="home">
            <h1>Home</h1>
            <ContextMenu
                icon="more_vert"
                menuStyle={{}}
                buttonType={"Small Button"}
                options={[{ label: "Settings", method: () => navigate("/settings") }]}
            />
            <div className="bibliography-cards-container">
                {bibliographies && bibliographies.length > 0 ? (
                    bibliographies.map((bib) => (
                        <Link key={bib.id} to={`/${bib.id}`} className="bibliography-link">
                            <BibliographyCard bibliography={bib} />
                        </Link>
                    ))
                ) : (
                    <p>
                        No bibliographies added yet. Click the button to create one based on citation style or to import
                        from other softwares.
                    </p>
                )}
            </div>

            {citationStyleMenuVisible && <CitationStylesMenu />}
            <button className="add-bibliography-button" onClick={() => setCitationStyleMenuVisible(true)}>
                Add bibliography
            </button>
        </div>
    );
}
