export type DateObject = {
    "date-parts"?: Array<Array<number>>;
    raw?: string;
    "date-time"?: string;
    timestamp?: number;
};

export type Author = {
    family?: string;
    given?: string;
    id?: string;
};

export type CslJson = {
    id?: string;
    type?: string;
    title?: string;
    subtitle?: string;
    author?: Author[];
    editor?: Author[];
    translator?: Author[];
    keyword?: string[];
    abstract?: string;
    language?: string;
    "container-title"?: string;
    publisher?: string;
    accessed?: DateObject;
    issued?: DateObject;
    URL?: string;
    DOI?: string;
    ISBN?: number | string;
    ISSN?: number | string;
    PMID?: number | string;
    PMCID?: number | string;
    issue?: number | string;
    page?: string | number;
    "publisher-place"?: string;
    source?: string;
    volume?: string | number;
    online?: boolean | string;
    "number-of-pages"?: number;
};

export type Citation = {
    id: string;
    content: CslJson;
    isChecked?: boolean;
};

export type CitationStyle = {
    name: {
        long: string;
        short: string;
    };
    code: string;
    license: {
        text: string;
        url: string;
    };
};

export type Bibliography = {
    title: string;
    style: CitationStyle;
    dateCreated: string;
    dateModified: string;
    id: string;
    citations: Citation[];
    tags?: object[];
    collab?: {
        open: boolean;
        id: string;
        adminId: string;
        collaborators: { name: string; id: string }[];
        preferences: object;
        changelog: [];
        password: string;
    };
};

export type BibJson = {
    title?: string;
    subtitle?: string;
    author?: { name: string }[];
    editor?: { name: string }[];
    translator?: { name: string }[];
    year?: string;
    accessed?: string;
    publisher?: string;
    pubplace?: string;
    journal?: string;
    volume?: number | string;
    issue?: number | string;
    pages?: number | string;
    identifier?: {
        type: string;
        id: string;
    }[];
    link?: { url: string }[];
    type?: string;
    keywords?: string;
    abstract?: string;
    language?: string;
};
