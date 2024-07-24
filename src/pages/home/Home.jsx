import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import ContextMenu from "../../components/ui/ContextMenu";
import BibliographyCard from "../../components/ui/BibliographyCard";
import { CitationStylesMenu } from "../bibliography/BibliographyTools";
import * as citationEngine from "../../utils/citationEngine";
import { addNewBib } from "../../data/store/slices/bibsSlice";
import Logo from "../../components/ui/Logo";
import { useAuth } from "../../context/AuthContext";
import { CoBibsSearchDialog } from "./HomeTools";
import { useModal } from "../../context/ModalContext.tsx";
import Icon from "../../components/ui/Icon";
import { useEnhancedDispatch } from "../../hooks/hooks.tsx";
import { Fab } from "../../components/ui/MaterialComponents";

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
            <header className="mb-5 flex justify-between">
                <h1 className="hidden">Home</h1> {/* For screen readers and tab title */}
                <a href="/citeease" className="no-underline">
                    <Logo />
                </a>
                <ContextMenu
                    options={[
                        ["Settings", () => navigate("/settings")],
                        ...(currentUser
                            ? [["Account", () => navigate("/account")]]
                            : [["Log in", () => navigate("/login")]]),
                    ]}
                >
                    <Icon name="more_vert" />
                </ContextMenu>
            </header>

            <div className="grid place-items-start gap-y-2">
                {bibliographies && bibliographies.length > 0 ? (
                    bibliographies.map((bib) => (
                        <Link
                            key={bib.id}
                            to={bib?.collab?.open ? `/collab/${bib.collab.id}` : `/bib/${bib.id}`}
                            className="w-full"
                            style={{ textDecoration: "none" }}
                        >
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

            <Fab
                label="Add bibliography"
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
