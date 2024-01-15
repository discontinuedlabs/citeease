import { v4 as uuid4 } from "uuid";
import { Link } from "react-router-dom";
import ContextMenu from "./ContextMenu";

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
                            <h3>{b.title}</h3>
                            <p>{b.style}</p>
                        </Link>
                    ))}
            </div>

            <ContextMenu
                label="Add bibliography"
                options={styles.map((s) => ({
                    label: s,
                    method: (event) => handleAddBibliography(event.target.textContent),
                }))}
                style={{ position: "absolute", bottom: "100%" }}
            />
        </div>
    );
}
