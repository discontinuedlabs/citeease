import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CitationStylesMenu } from "../bibliography/BibliographyTools";
import * as citationEngine from "../../utils/citationEngine";
import { addNewBib, createBibFromJson, updateBibField } from "../../data/store/slices/bibsSlice";
import { useAuth } from "../../context/AuthContext";
import { CoBibsSearchDialog } from "./HomeTools";
import { useEnhancedDispatch, useTheme } from "../../hooks/hooks.tsx";
import { ChipSet, EmptyPage, Fab, Icon, List, TopBar } from "../../components/ui/MaterialComponents";
import { parseQueryString, timeAgo, uid } from "../../utils/utils.ts";
import { useDialog } from "../../context/DialogContext.tsx";
import { prioritizeAvailableStyles } from "../../utils/citationUtils.ts";
import { hslToHsla } from "../../utils/conversionUtils.tsx";
import colorValues from "../../assets/json/colors.json";
import defaults from "../../assets/json/defaults.json";
import { EmptyStar, FilledStar } from "../../components/ui/Star";

export default function Home() {
    const { data: bibliographies, loadedFromIndexedDB: bibsLoaded } = useSelector((state) => state.bibliographies);
    const { data: settings } = useSelector((state) => state.settings);
    const [citationStyleMenuVisible, setCitationStyleMenuVisible] = useState(false);
    const [coBibsSearchDialogVisible, setCoBibsSearchDialogVisible] = useState(false);
    const [tryingToJoinBib, setTryingToJoinBib] = useState(undefined);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useEnhancedDispatch();
    const AddBibDialog = useDialog();
    const importDialog = useDialog();
    const [theme] = useTheme();

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

    function addBibToFavorite(id) {
        const targetBib = bibliographies.find((bib) => bib.id === id);
        dispatch(
            updateBibField({
                bibId: id,
                key: "favorite",
                value: !targetBib?.favorite,
                options: {
                    updateDateModified: false,
                },
            })
        );
    }

    // function openCoBibsSearchDialog() {
    //     setCoBibsSearchDialogVisible(true);
    // }

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

    // TODO: Combine the Hpme list with the one used in MoveDialog.
    return (
        // mb-20 needed in pages with a Fab component
        <div className={defaults.classes.pageWithFab}>
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
                        const bibTags = settings?.tags.filter((tag) => bib.tags.includes(tag.id));
                        const defaultIcon = defaults.bibliography.icon;
                        return {
                            start: (
                                <Icon
                                    style={{
                                        background: hslToHsla(
                                            colorValues[theme][bib?.icon?.color || defaultIcon.color],
                                            0.25
                                        ),
                                    }}
                                    className="rounded-full p-5"
                                    name={bib?.icon?.name || defaultIcon.name}
                                />
                            ),
                            title: (
                                <div className="flex items-baseline justify-between">
                                    <div className="flex items-baseline gap-1 font-semibold">
                                        {bib.title}
                                        <small className="font-normal">{bib.citations.length}</small>
                                    </div>
                                    <small>{timeAgo(bib.dateModified)}</small>
                                </div>
                            ),
                            description: (
                                <div className="flex items-center justify-between">
                                    <div>{bib.style.name.short || bib.style.name.long.replace(/\((.*?)\)/g, "")}</div>
                                    <button
                                        type="button"
                                        className="h-6 w-6 cursor-pointer border-none bg-transparent p-0"
                                        onClick={() => addBibToFavorite(bib.id)}
                                    >
                                        {bib?.favorite ? <FilledStar /> : <EmptyStar />}
                                    </button>
                                </div>
                            ),
                            content: bibTags && bibTags.length !== 0 && (
                                <ChipSet
                                    chips={bibTags.map((tag) => {
                                        return {
                                            ...tag,
                                            selected: true,
                                        };
                                    })}
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
                                        title: "Create bibliography by citation style",
                                        onClick: () => {
                                            setCitationStyleMenuVisible(true);
                                            AddBibDialog.close(id);
                                        },
                                    },
                                    // {
                                    //     title: "Join collaborative bibliography",
                                    //     onClick: () => {
                                    //         openCoBibsSearchDialog();
                                    //         AddBibDialog.close(id);
                                    //     },
                                    // },
                                    {
                                        title: "Import from file",
                                        onClick: () => {
                                            handleImport();
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
                <CitationStylesMenu
                    setCitationStyleMenuVisible={setCitationStyleMenuVisible}
                    onStyleSelected={addNewBibWithStyle}
                />
            )}

            {coBibsSearchDialogVisible && (
                <CoBibsSearchDialog tryingToJoinBib={tryingToJoinBib} setIsVisible={setCoBibsSearchDialogVisible} />
            )}
        </div>
    );
}
