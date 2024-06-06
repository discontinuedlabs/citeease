export interface DateObject {
    date_parts: Array<Array<number>>;
    raw: string;
    date_time: string;
    timestamp: number;
}

export interface Author {
    family: string;
    given: string;
    id: string;
}

export interface Content {
    id: string;
    type: string;
    title: string;
    author: Author[];
    "container-title": string;
    publisher: string;
    accessed: DateObject;
    issued: DateObject;
    URL: string;
    DOI: string;
    ISBN: Number;
    ISSN: Number;
    PMID: string;
    PMCID: string;
    issue: Number;
    page: string;
    "publisher-place": string;
    source: string;
    volume: Number;
    online: boolean;
    "number-of-pages": Number;
}

export interface Citation {
    id: string;
    content: Content;
    isChecked: boolean;
}

export interface Bibliography {
    title: string;
    style: Object;
    dateCreated: string;
    dateModified: string;
    id: string;
    citations: Citation[];
    tags: Array<Object>;
}
