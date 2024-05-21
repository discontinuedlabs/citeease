import { Link } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";
import { useNavigate } from "react-router-dom";
import BibliographyCard from "./ui/BibliographyCard";
import { useDocumentTitle } from "../utils";
import { useState } from "react";
import { CitationStylesMenu } from "./BibliographyTools";

export default function Home(props) {
    const { bibliographies, dispatch, ACTIONS } = props;
    const [citationStyleMenuVisible, setCitationStyleMenuVisible] = useState(false);
    const navigate = useNavigate();
    useDocumentTitle("Home");

    return (
        <div className="mx-auto max-w-[50rem]">
            <h1>Home</h1>
            <ContextMenu
                icon="more_vert"
                menuStyle={{}}
                buttonType={"Small Button"}
                options={[{ label: "Settings", method: () => navigate("/settings") }]}
            />

            <div className="grid place-items-start gap-y-2">
                {bibliographies && bibliographies.length > 0 ? (
                    bibliographies.map((bib) => (
                        <Link key={bib.id} to={`/${bib.id}`} style={{ textDecoration: "none" }}>
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

            {citationStyleMenuVisible && (
                <CitationStylesMenu
                    dispatch={dispatch}
                    action={ACTIONS.ADD_NEW_BIBLIOGRAPHY}
                    setCitationStyleMenuVisible={setCitationStyleMenuVisible}
                />
            )}
            <button
                className="border-2 border-neutral-black fixed p-3 bottom-5 right-5 bg-primary-500"
                onClick={() => setCitationStyleMenuVisible(true)}
            >
                Add bibliography
            </button>
        </div>
    );
}
