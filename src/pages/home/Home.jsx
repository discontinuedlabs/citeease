import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { CitationStylesMenu } from "../bibliography/BibliographyTools";
import * as citationEngine from "../../utils/citationEngine";
import { addNewBib } from "../../data/store/slices/bibsSlice";
import { useAuth } from "../../context/AuthContext";
import { CoBibsSearchDialog } from "./HomeTools";
import { useModal } from "../../context/ModalContext.tsx";
import { useEnhancedDispatch } from "../../hooks/hooks.tsx";
import { ChipSet, Fab, List, TopBar } from "../../components/ui/MaterialComponents";
import { timeAgo } from "../../utils/utils.ts";

export default function Home() {
    const bibliographies = useSelector((state) => state.bibliographies);
    const [citationStyleMenuVisible, setCitationStyleMenuVisible] = useState(false);
    const [addBibOptionsMenuVisible, setAddBibOptionsMenuVisible] = useState(false);
    const [coBibsSearchDialogVisible, setCoBibsSearchDialogVisible] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const dispatch = useEnhancedDispatch();
    const modal = useModal();

    function addNewBibWithStyle(style) {
        setCitationStyleMenuVisible(false);
        dispatch(addNewBib({ bibliographyStyle: style }));
        citationEngine.updateCslFiles(style);
    }

    function openCoBibsSearchDialog() {
        if (currentUser) setCoBibsSearchDialogVisible(true);
        else {
            modal.open({
                title: "Login required",
                message: "You need to log in first to use this feature.",
                actions: [
                    ["Log in", () => navigate("/login"), { autoFocus: true }],
                    ["Cancel", () => modal.close()],
                ],
            });
        }
    }

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

            {bibliographies.length > 0 ? (
                <List
                    items={bibliographies.map((bib) => {
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
                            title: bib.title,
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
                <p>
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

            {coBibsSearchDialogVisible && <CoBibsSearchDialog setIsVisible={setCoBibsSearchDialogVisible} />}
        </div>
    );
}
