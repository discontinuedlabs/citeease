import { v4 as uuid4 } from "uuid";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Home(props) {
    const { bibliographies, setBibliographies } = props;
    const [styleOptionsHidden, setStyleOptionsHidden] = useState(true);

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

    function toggleStyleOptions() {
        setStyleOptionsHidden((prevStyleOptionsHidden) => !prevStyleOptionsHidden);
    }

    return (
        <div className="home">
            <div className="bibliographies-container">
                {bibliographies.map((bibliography) => (
                    <Link key={bibliography.id} to={`/bibliography/${bibliography.id}`}>
                        <h3>{bibliography.title}</h3>
                        <p>{bibliography.style}</p>
                    </Link>
                ))}
            </div>

            <button onClick={toggleStyleOptions}>Add Bibliography</button>

            <div className={`style-options ${styleOptionsHidden && "hidden"}`}>
                {styles.map((style) => (
                    <button
                        onClick={(event) => handleAddBibliography(event.target.textContent)}
                        key={style}
                    >
                        {style}
                    </button>
                ))}
            </div>
        </div>
    );
}
