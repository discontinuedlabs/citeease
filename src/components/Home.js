import { Link } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";
import { useNavigate } from "react-router-dom";
import BibliographyCard from "./ui/BibliographyCard";

export default function Home(props) {
    const { bibliographies, CITATION_STYLES, dispatch, ACTIONS } = props;
    const navigate = useNavigate();

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
                        <Link key={bib.id} to={`/${bib.id}`}>
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

            <div style={{ position: "fixed", bottom: "1rem", left: "50%", transform: "translateX(-50%)" }}>
                <ContextMenu
                    className="add-bibliography-button"
                    label="Add bibliography"
                    options={CITATION_STYLES.map((style) => ({
                        label: style.name,
                        method: () => handleAddBibliography(style),
                    }))}
                    menuStyle={{ position: "fixed", bottom: "100%", left: "50%", transform: "translateX(-50%)" }}
                />
            </div>
        </div>
    );
}
