import { Link } from "react-router-dom";
import ContextMenu from "../../components/ui/ContextMenu";
import { useNavigate } from "react-router-dom";
import BibliographyCard from "../../components/ui/BibliographyCard";
import { useState } from "react";
import { CitationStylesMenu } from "../bibliography/BibliographyTools";
import { useDispatch, useSelector } from "react-redux";
import * as citationEngine from "../../utils/citationEngine";
import { addNewBib } from "../../data/store/slices/bibsSlice";
import Logo from "../../components/ui/Logo";
import { useAuth } from "../../context/AuthContext";
import { CoBibsSearchDialog } from "./HomeTools";

export default function Home() {
    const bibliographies = useSelector((state) => state.bibliographies);
    const [citationStyleMenuVisible, setCitationStyleMenuVisible] = useState(false);
    const [addBibOptionsMenuVisible, setAddBibOptionsMenuVisible] = useState(false);
    const [coBibsSearchDialogVisible, setCoBibsSearchDialogVisible] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    function addNewBibWithStyle(style) {
        setCitationStyleMenuVisible(false);
        dispatch(addNewBib({ bibliographyStyle: style }));
        citationEngine.updateCslFiles(style);
    }

    return (
        <div className="mx-auto max-w-[50rem]">
            <div className="flex justify-between mb-5">
                <h1 className="hidden">Home</h1> {/* For the screen readers and tab title */}
                <Logo />
                <ContextMenu
                    icon="more_vert"
                    menuStyle={{}}
                    buttonType={"Small Button"}
                    options={[
                        { label: "Settings", method: () => navigate("/settings") },
                        ...(currentUser
                            ? [{ label: "Account", method: () => navigate("/account") }]
                            : [{ label: "Log in", method: () => navigate("/login") }]),
                    ]}
                />
            </div>

            <div className="grid place-items-start gap-y-2">
                {bibliographies && bibliographies.length > 0 ? (
                    bibliographies.map((bib) => (
                        <Link
                            key={bib.id}
                            to={`/${bib?.collab?.open ? bib.collab.id : bib.id}`}
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

            <button
                className="border-2 border-neutral-black fixed p-3 bottom-5 right-5 bg-primary-500"
                onClick={() => setAddBibOptionsMenuVisible(true)}
            >
                Add bibliography
            </button>

            {addBibOptionsMenuVisible && (
                <div>
                    <h3>Add bibliography</h3>
                    <button onClick={() => setAddBibOptionsMenuVisible(false)}>X</button>
                    <div>
                        <button onClick={() => setCitationStyleMenuVisible(true)}>Choose by citation style</button>
                        <button>Import</button>
                        <button onClick={() => setCoBibsSearchDialogVisible(true)}>
                            Search for collaborative bibliograpies
                        </button>
                    </div>
                </div>
            )}

            {citationStyleMenuVisible && (
                <CitationStylesMenu {...{ setCitationStyleMenuVisible, onStyleSelected: addNewBibWithStyle }} />
            )}

            {coBibsSearchDialogVisible && <CoBibsSearchDialog setIsVisible={setCoBibsSearchDialogVisible} />}
        </div>
    );
}
