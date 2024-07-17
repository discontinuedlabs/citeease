import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useFindBib } from "../../hooks/hooks.tsx";

export default function BibliographySettings() {
    const { bibId } = useParams();
    const bibliography = useFindBib();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Prioritizes showing collab.id in the URL instead of the regular id
        if (!bibliography) return;
        if (bibliography?.collab?.open && bibId !== bibliography?.collab?.id) {
            navigate(`/collab/${bibliography.collab.id}/settings`, { replace: true });
        } else if (!bibliography?.collab?.open && bibId !== bibliography.id) {
            navigate(`/bib/${bibliography.id}/settings`, { replace: true });
        }
    }, [bibId, bibliography?.collab?.open, location.pathname]);

    return <div />;
}
