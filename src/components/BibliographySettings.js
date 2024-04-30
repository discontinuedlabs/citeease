import { useParams } from "react-router-dom";

export default function BibliographySettings(props) {
    const { bibId: bibliographyId } = useParams();
    const { bibliographies } = props;
    const bibliography = bibliographies.find((bib) => bib.id === bibliographyId);
    return <div className="bibliography-settings-page"></div>;
}
