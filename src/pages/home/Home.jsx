import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CitationStylesMenu } from "../bibliography/BibliographyTools";
import * as citationEngine from "../../utils/citationEngine";
import { addNewBib } from "../../data/store/slices/bibsSlice";
import { useAuth } from "../../context/AuthContext";
import { CoBibsSearchDialog } from "./HomeTools";
import { useEnhancedDispatch } from "../../hooks/hooks.tsx";
import { ChipSet, Fab, Icon, List, TopBar } from "../../components/ui/MaterialComponents";
import { timeAgo } from "../../utils/utils.ts";

export default function Home() {
    const bibliographies = useSelector((state) => state.bibliographies.data);
    const settings = useSelector((state) => state.settings);
    const [citationStyleMenuVisible, setCitationStyleMenuVisible] = useState(false);
    const [addBibOptionsMenuVisible, setAddBibOptionsMenuVisible] = useState(false);
    const [coBibsSearchDialogVisible, setCoBibsSearchDialogVisible] = useState(false);
    const { tryingToJoinBib } = settings;
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const dispatch = useEnhancedDispatch();

    useEffect(() => {
        if (tryingToJoinBib) {
            setCoBibsSearchDialogVisible(true);
        }
    }, []);

    console.log("11111111");

    function addNewBibWithStyle(style) {
        setCitationStyleMenuVisible(false);
        dispatch(addNewBib({ bibliographyStyle: style }));
        citationEngine.updateCslFiles(style);
    }

    function openCoBibsSearchDialog() {
        setCoBibsSearchDialogVisible(true);
    }

    const sortedBibliographies = Array.from(bibliographies).sort((a, b) => {
        const dateA = new Date(a.dateModified);
        const dateB = new Date(b.dateModified);
        return dateB - dateA;
    });

    return (
        <div className="mx-auto max-w-[50rem]">
            <TopBar
                headline="Home"
                showBackButton={false}
                options={[
                    ["Settings", () => navigate("/settings")],
                    ...(currentUser
                        ? [["Account", () => navigate("/account")]]
                        : [["Log in", () => navigate("/login")]]),
                ]}
            />

            {sortedBibliographies.length > 0 ? (
                <List
                    items={sortedBibliographies.map((bib) => {
                        function renderCitationCount(citations) {
                            if (citations.length === 0) {
                                return "No sources added";
                            }
                            if (citations.length === 1) {
                                return "1 source";
                            }
                            return `${citations.length} sources`;
                        }

                        return {
                            start: <Icon name={bib?.icon} />,
                            title: bib?.collab?.open ? (
                                <>
                                    <Icon name="group" className="text-xl" /> {bib.title}
                                </>
                            ) : (
                                bib.title
                            ),
                            description: `${bib.style.name.short || bib.style.name.long.replace(/\((.*?)\)/g, "")} • ${renderCitationCount(bib.citations)} • ${timeAgo(bib.dateModified)}`,
                            content: (
                                <ChipSet
                                    chips={bib.tags.map(({ label, color }) => ({ label, color }))}
                                    style={{ marginTop: bib.tags.length === 0 ? "0" : "0.5rem" }}
                                />
                            ),
                            onClick: () => navigate(bib?.collab?.open ? `/collab/${bib.collab.id}` : `/bib/${bib.id}`),
                        };
                    })}
                />
            ) : (
                <p className="mx-4">
                    No bibliographies added yet. Click the button to create one based on citation style or to import
                    from other softwares.
                </p>
            )}

            <Fab
                label="Add bibliography"
                icon="add"
                variant="tertiary"
                className="fixed bottom-5 right-5"
                onClick={() => setAddBibOptionsMenuVisible(true)}
            />

            {addBibOptionsMenuVisible && (
                <div role="dialog" aria-modal="true">
                    <header>
                        <h3>Add bibliography</h3>
                        <button type="button" onClick={() => setAddBibOptionsMenuVisible(false)}>
                            X
                        </button>
                    </header>

                    <menu>
                        <button type="button" onClick={() => setCitationStyleMenuVisible(true)}>
                            Choose by citation style
                        </button>
                        <button type="button">Import</button>
                        <button type="button" onClick={openCoBibsSearchDialog}>
                            Search for collaborative bibliograpies
                        </button>
                    </menu>
                </div>
            )}

            {citationStyleMenuVisible && (
                <CitationStylesMenu {...{ setCitationStyleMenuVisible, onStyleSelected: addNewBibWithStyle }} />
            )}

            {coBibsSearchDialogVisible && (
                <CoBibsSearchDialog tryingToJoinBib={tryingToJoinBib} setIsVisible={setCoBibsSearchDialogVisible} />
            )}
        </div>
    );
}
