import { nanoid } from "nanoid";
import { Link } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";

export default function Home(props) {
    const { bibliographies, setBibliographies } = props;
    const styles = [
        { name: "APA", code: "apa" },
        { name: "MLA", code: "mla" },
        { name: "Chicago", code: "chicago" },
        { name: "Harvard", code: "harvard-cite-them-right" },
    ];

    function handleAddBibliography(style) {
        const newBibliography = {
            title: "Untitled Bibliography", // Default title
            style: style,
            id: "bib=" + nanoid(10), // nanoid offers shorter UUIDs than uuid4. Useful for bibId because they are used in URl params
            citations: [],
        };
        setBibliographies((prevBibliographies) => [...prevBibliographies, newBibliography]);
    }

    return (
        <div className="home">
            <div className="bibliography-cards-container">
                {bibliographies.length > 0 &&
                    bibliographies.map((bib) => (
                        <Link key={bib.id} to={`/${bib.id}`} className="bibliography-card">
                            <h3 className="bibliography-card-title">{bib.title}</h3>
                            <p className="bibliography-card-style">{bib.style.name}</p>
                        </Link>
                    ))}
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
