import { v4 as uuid4 } from "uuid";
import { Link } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";

export default function Home(props) {
    const { bibliographies, setBibliographies } = props;
    const styles = ["APA", "MLA", "Chicago"];

    function handleAddBibliography(style) {
        const newBibliography = {
            title: "Bibliography",
            style: style,
            id: uuid4(),
            citations: [],
        };
        setBibliographies((prevBibliographies) => [...prevBibliographies, newBibliography]);
    }

    return (
        <div className="home">
            <div className="bibliography-cards-container">
                {bibliographies.length > 0 &&
                    bibliographies.map((b) => (
                        <Link key={b.id} to={`/bibliography/${b.id}`} className="bibliography-card">
                            <h3 className="bibliography-card-title">{b.title}</h3>
                            <p className="bibliography-card-style">{b.style}</p>
                        </Link>
                    ))}
            </div>

            <ContextMenu
                className="add-bibliography-button"
                label="Add bibliography"
                options={styles.map((s) => ({
                    label: s,
                    method: (event) => handleAddBibliography(event.target.textContent),
                }))}
                menuStyle={{ position: "fixed", bottom: "1rem", left: "50%", transform: "translateX(-50%)" }}
                buttonStyle={{ position: "fixed", bottom: "1rem", left: "50%", transform: "translateX(-50%)" }}
            />
        </div>
    );
}
