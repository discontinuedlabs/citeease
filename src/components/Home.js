import { Link } from "react-router-dom";
import ContextMenu from "./ui/ContextMenu";
import { useNavigate } from "react-router-dom";
import BibliographyCard from "./ui/BibliographyCard";
import { useDocumentTitle } from "../utils";
import { useEffect } from "react";
import axios from "axios";
import * as cheerio from "cheerio";

export default function Home(props) {
    const { bibliographies, CITATION_STYLES, dispatch, ACTIONS } = props;
    const navigate = useNavigate();
    useDocumentTitle("Home");

    useEffect(() => {
        const getStyleList = async () => {
            // Introduce a delay to wait for the page to load
            setTimeout(async () => {
                try {
                    const response = await axios.get(`https://corsproxy.io/?https://www.zotero.org/styles`);
                    const $ = cheerio.load(response.data);
                    console.log($(".style-list").children());
                } catch (error) {
                    console.error("Error fetching style list:", error);
                }
            }, 5000); // Adjust the delay as needed
        };

        getStyleList();
    }, [bibliographies]);

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
