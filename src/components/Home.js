import { v4 as uuid4 } from "uuid";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Home(props) {
    const { bibliographies, setBibliographies } = props;
    const [styleOptionsHidden, setStyleOptionsHidden] = useState(true);

    const styles = ["APA", "MLA", "Chicago"];

    function handleAddBibliography(style) {
        toggleStyleOptions();
        const newBibliography = {
            title: "Bibliography",
            style: style,
            id: uuid4(),
            citations: [],
        };
        setBibliographies((prevBibliographies) => [...prevBibliographies, newBibliography]);
    }

    function toggleStyleOptions() {
        setStyleOptionsHidden((prevStyleOptionsHidden) => !prevStyleOptionsHidden);
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

            <button onClick={toggleStyleOptions}>Add bibliography</button>

            <div className={`style-options ${styleOptionsHidden && "hidden"}`}>
                {styles.map((s) => (
                    <button
                        onClick={(event) => handleAddBibliography(event.target.textContent)}
                        key={s}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}
