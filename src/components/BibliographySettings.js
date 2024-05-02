import { useParams } from "react-router-dom";
import { useDocumentTitle } from "../utils";

export default function BibliographySettings(props) {
    const { bibId: bibliographyId } = useParams();
    const { bibliographies } = props;
    const bibliography = bibliographies.find((bib) => bib.id === bibliographyId);
    useDocumentTitle(`${bibliography.title} settings`);

    return <div className="bibliography-settings-page"></div>;
}
