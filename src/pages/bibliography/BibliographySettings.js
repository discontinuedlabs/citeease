import { useParams } from "react-router-dom";
import { useFindBib } from "../../hooks/hooks";

export default function BibliographySettings(props) {
    const { bibId: bibliographyId } = useParams();
    const { bibliographies } = props;
    const bibliography = useFindBib();

    return <div></div>;
}
