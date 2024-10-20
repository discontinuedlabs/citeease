import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useFindBib } from "../../hooks/hooks.tsx";
import { List, TopBar } from "../../components/ui/MaterialComponents";
import { CollaboratorsManager } from "./BibliographySettingsTools";
import defaults from "../../assets/json/defaults.json";

export default function BibliographySettings() {
    const { bibId } = useParams();
    const bibliography = useFindBib();
    const location = useLocation();
    const navigate = useNavigate();

    const [collaboratorsManagerVisible, setCollaboratorsManagerVisible] = useState(false);

    useEffect(() => {
        // Prioritizes showing collab.id in the URL instead of the regular id
        if (!bibliography) return;
        if (bibliography?.collab?.open && bibId !== bibliography?.collab?.id) {
            navigate(`/collab/${bibliography.collab.id}/settings`, { replace: true });
        } else if (!bibliography?.collab?.open && bibId !== bibliography.id) {
            navigate(`/bib/${bibliography.id}/settings`, { replace: true });
        }
    }, [bibId, bibliography?.collab?.open, location.pathname]);

    return (
        <div className={defaults.classes.page}>
            <TopBar headline="Bibliography settings" />
            <List items={[{ title: "Manage collaborators", onClick: () => setCollaboratorsManagerVisible(true) }]} />

            {collaboratorsManagerVisible && <CollaboratorsManager setIsVisible={setCollaboratorsManagerVisible} />}
        </div>
    );
}
