export type OrcamentoFile = {
    id: string;
    orcamento_id: string;
    file_name: string;
    file_url: string;
    analyzed: boolean;
};

export type OrcamentoTab = {
    id: string;
    orcamento_id: string;
    name: string;
    display_order: number;
};

export type OrcamentoChapter = {
    id: string;
    tab_id: string;
    chapter_number: string;
    chapter_name: string;
    chapter_comments: string | null;
};

export type OrcamentoItem = {
    id: string;
    chapter_id: string;
    artigo: string;
    descricao: string;
    un: string | null;
    qt: number | null;
    preco_unitario: number | null;
    item_comments: string | null;
    observacoes_empreiteiro: string | null;
    observacoes_image_url: string | null;
    specialities_explicitly_set?: boolean;
};

export type Speciality = {
    id: string;
    name_en: string;
    name_pt: string;
    main_specialty_id: string | null;
    main_specialties?: {
        id: string;
        main_specialty_en: string;
        main_specialty_pt: string;
    } | null;
};

export type ChapterSpeciality = {
    chapter_id: string;
    speciality_id: string;
};

export type ItemSpeciality = {
    item_id: string;
    speciality_id: string;
};

export type ArticleSpeciality = {
    article_id: string;
    speciality_id: string;
};

export type ArticleContent = {
    type: 'text' | 'item';
    data: string | {
        artigo: string;
        descricao: string;
        un: string;
        qt: number;
        observacoes_empreiteiro?: string;
    };
};

export type Article = {
    id: string;
    chapter_id: string;
    artigo: string;
    title: string;
    contents: ArticleContent[];
    sheet_name?: string; // Track original sheet name
};

export type ChapterWithArticles = {
    chapter: OrcamentoChapter;
    articles: Article[];
    sheet_name?: string; // Track original sheet name
};

export interface ChapterNode {
    item: ChapterWithArticles;
    children: ChapterNode[];
}
