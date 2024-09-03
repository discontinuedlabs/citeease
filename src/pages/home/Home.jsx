import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CitationStylesMenu } from "../bibliography/BibliographyTools";
import * as citationEngine from "../../utils/citationEngine";
import { addNewBib, createBibFromJson } from "../../data/store/slices/bibsSlice";
import { useAuth } from "../../context/AuthContext";
import { CoBibsSearchDialog } from "./HomeTools";
import { useEnhancedDispatch } from "../../hooks/hooks.tsx";
import { ChipSet, EmptyPage, Fab, Icon, List, TopBar } from "../../components/ui/MaterialComponents";
import { parseQueryString, timeAgo, uid } from "../../utils/utils.ts";
import { useDialog } from "../../context/DialogContext.tsx";
import { prioritizeAvailableStyles } from "../../utils/citationUtils.ts";

export default function Home() {
    const { data: bibliographies, loadedFromIndexedDB: bibsLoaded } = useSelector((state) => state.bibliographies);
    const [citationStyleMenuVisible, setCitationStyleMenuVisible] = useState(false);
    const [coBibsSearchDialogVisible, setCoBibsSearchDialogVisible] = useState(false);
    const [tryingToJoinBib, setTryingToJoinBib] = useState(undefined);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useEnhancedDispatch();
    const AddBibDialog = useDialog();
    const importDialog = useDialog();

    useEffect(() => {
        if (!bibsLoaded) return;

        const queryString = location.search;
        const queryParams = parseQueryString(queryString);

        navigate("/", { replace: true });

        if (queryParams?.q && !/^\s*$/.test(queryParams.q)) {
            if (bibliographies.some((bib) => bib?.collab?.id === queryParams.q)) {
                navigate(`/collab/${queryParams.q}`);
            } else {
                setTryingToJoinBib(queryParams.q);
                setCoBibsSearchDialogVisible(true);
            }
        }
    }, [bibsLoaded]);

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

    // FIXME: Fix the json function
    function handleImport() {
        const id = uid();

        function handleFileChange(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = (rEvent) => {
                try {
                    const fileName = file.name?.replace(".json", "");
                    const jsonContent = JSON.parse(rEvent.target.result);
                    const style = prioritizeAvailableStyles();
                    dispatch(createBibFromJson({ json: jsonContent, style, fileName }));
                    importDialog.close(id);
                } catch (error) {
                    console.error("Error parsing JSON", error);
                }
            };
        }

        importDialog.show({
            id,
            headline: "Import from",
            content: (
                <>
                    <input
                        className="hidden"
                        type="file"
                        accept=".json"
                        id="jsonFileInput"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                    <List
                        items={[
                            {
                                title: "JSON file",
                                onClick: () => {
                                    document.getElementById("jsonFileInput").click();
                                },
                            },
                        ]}
                    />
                </>
            ),
            actions: [["Cancel", () => importDialog.close()]],
        });
    }

    return (
        <div className="mx-auto min-h-screen max-w-[50rem]">
            <TopBar
                headline="Home"
                showBackButton={false}
                options={[
                    { headline: "Settings", onClick: () => navigate("/settings") },
                    ...(currentUser
                        ? [{ headline: "Account", onClick: () => navigate("/account") }]
                        : [{ headline: "Log in", onClick: () => navigate("/login") }]),
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
                <EmptyPage
                    icon="book_2"
                    message="No bibliographies added yet. Click the button to create one based on citation style or to import
                    from other softwares."
                />
            )}

            <Fab
                onClick={() => {
                    const id = uid();
                    AddBibDialog.show({
                        id,
                        headline: "Add bibliography",
                        content: (
                            <List
                                items={[
                                    {
                                        title: "Choose by citation style",
                                        onClick: () => {
                                            setCitationStyleMenuVisible(true);
                                            AddBibDialog.close(id);
                                        },
                                    },
                                    {
                                        title: "Import",
                                        onClick: () => {
                                            handleImport();
                                            AddBibDialog.close(id);
                                        },
                                    },
                                    {
                                        title: "Search for collaborative bibliograpies",
                                        onClick: () => {
                                            openCoBibsSearchDialog();
                                            AddBibDialog.close(id);
                                        },
                                    },
                                ]}
                            />
                        ),
                        actions: [["Cancel", () => AddBibDialog.close()]],
                    });
                }}
                label="Add bibliography"
                icon="add"
                variant="primary"
                className="fixed bottom-5 right-5"
            />

            {citationStyleMenuVisible && (
                <CitationStylesMenu {...{ setCitationStyleMenuVisible, onStyleSelected: addNewBibWithStyle }} />
            )}

            {coBibsSearchDialogVisible && (
                <CoBibsSearchDialog tryingToJoinBib={tryingToJoinBib} setIsVisible={setCoBibsSearchDialogVisible} />
            )}
        </div>
    );
}
