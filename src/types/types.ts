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

export type Content = {
    id?: string;
    type?: string;
    title?: string;
    author?: Author[];
    "container-title"?: string;
    publisher?: string;
    accessed?: DateObject;
    issued?: DateObject;
    URL?: string;
    DOI?: string;
    ISBN?: number;
    ISSN?: number;
    PMID?: number;
    PMCID?: number;
    issue?: number;
    page?: string | number;
    "publisher-place"?: string;
    source?: string;
    volume?: string | number;
    online?: boolean;
    "number-of-pages"?: number;
};

export type Citation = {
    id: string;
    content: Content;
    isChecked?: boolean;
};

export type Bibliography = {
    title: string;
    style: Object;
    dateCreated: string;
    dateModified: string;
    id: string;
    citations: Citation[];
    tags?: Object[];
};
