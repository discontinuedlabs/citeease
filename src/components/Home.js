import { Link } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";
import { useNavigate } from "react-router-dom";

export default function Home(props) {
    const { bibliographies, dispatch, ACTIONS } = props;
    const navigate = useNavigate();
    const styles = [
        { name: "APA", code: "apa", builtIn: true },
        { name: "MLA", code: "modern-language-association" },
        { name: "Chicago", code: "chicago" },
        { name: "Harvard", code: "harvard-cite-them-right", builtIn: true },
        { name: "Vancouver", code: "vancouver" },
    ];

    const dateOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    function handleAddBibliography(style) {
        dispatch({ type: ACTIONS.ADD_NEW_BIBLIOGRAPHY, payload: { bibliographyStyle: style } });
    }

    return (
        <div className="home">
            <h1>Home</h1>
            <ContextMenu
                icon="more_vert"
                menuStyle={{}}
                buttonType={"smallButton"}
                options={[{ label: "Settings", method: () => navigate("/settings") }]}
            />
            <div className="bibliography-cards-container">
                {bibliographies && bibliographies.length > 0 ? (
                    bibliographies.map((bib) => (
                        <Link key={bib.id} to={`/${bib.id}`} className="bibliography-card">
                            <h3 className="bibliography-card-title">{bib.title}</h3>
                            <p className="bibliography-card-style">{bib.style.name}</p>
                            <p>{new Date(bib.dateCreated).toLocaleDateString(undefined, dateOptions)}</p>
                            {new Date(bib.dateCreated) !== new Date(bib.dateModified) && (
                                <p>{new Date(bib.dateModified).toLocaleDateString(undefined, dateOptions)}</p>
                            )}
                            <p>
                                {bib.citations.length === 0
                                    ? "No sources added"
                                    : bib.citations.length === 1
                                    ? "1 source"
                                    : `${bib.citations.length} sources`}
                            </p>
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
                    options={styles.map((style) => ({
                        label: style.name,
                        method: () => handleAddBibliography(style),
                    }))}
                    menuStyle={{ position: "fixed", bottom: "100%", left: "50%", transform: "translateX(-50%)" }}
                />
            </div>
        </div>
    );
}
