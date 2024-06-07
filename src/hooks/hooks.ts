import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { TAG_COLOR_VALUES } from "../data/store/slices/settingsSlice";
import { Bibliography, Citation } from "../types/types";
import { RootState } from "../data/store/store";

interface RouteParams {
    bibId?: string;
}

export function useFindBib(): Bibliography | undefined {
    const params: RouteParams = useParams<{ bibId?: string }>();
    const bibliographies = useSelector((state: RootState) => state.bibliographies);
    const bibliography = bibliographies?.find((bib) => bib.id === params.bibId);
    return bibliography;
}

export function useFindCheckedCitations(): Citation[] | undefined {
    const bibliography = useFindBib();
    return bibliography?.citations.filter((cit: Citation) => cit.isChecked);
}

export function useTagBgColor(color: string): [string, string, string] {
    const TAG_BG_IDLE_TRANSPARENCY = 0.2;
    const TAG_BG_HOVER_TRANSPARENCY = 0.3;
    const TAG_BG_CLICK_TRANSPARENCY = 0.4;

    const idle = `rgba(${TAG_COLOR_VALUES[color]?.slice(4, -1)}, ${TAG_BG_IDLE_TRANSPARENCY})`;
    const hover = `rgba(${TAG_COLOR_VALUES[color]?.slice(4, -1)}, ${TAG_BG_HOVER_TRANSPARENCY})`;
    const click = `rgba(${TAG_COLOR_VALUES[color]?.slice(4, -1)}, ${TAG_BG_CLICK_TRANSPARENCY})`;

    return [idle, hover, click];
}
