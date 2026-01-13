
import React from 'react';
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, Tag, Edit, Trash, MoveRight, ChevronRight, Trash2, Plus } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
    ChapterNode,
    OrcamentoChapter,
    Article,
    OrcamentoItem,
    ArticleSpeciality
} from "@/types/orcamento";

interface RecursiveChapterRendererProps {
    node: ChapterNode;
    indentLevel?: number; // Visual indentation level (0 = root, 1 = first level, etc.)
    collapsedChapters: Set<string>;
    setCollapsedChapters: (newSet: Set<string>) => void;
    displayNumber: (num: string) => string;
    cleanChapterName: (name: string) => string;
    collapsedArticles: Set<string>;
    setCollapsedArticles: (newSet: Set<string>) => void;

    // Chapter Actions
    handleOpenChapterDialog: (chapterId: string) => void;
    setChapterDialog: (data: { open: boolean, mode: 'create' | 'edit', data?: OrcamentoChapter }) => void;
    deleteChapterMutation: { mutate: (id: string) => void };
    handleCloseChapterDialog: (open: boolean) => void;
    editingChapterId: string | null;
    pendingChapterSpecialities: string[];
    setPendingChapterSpecialities: (ids: string[]) => void;
    groupedSpecialityOptions: Record<string, { label: string, value: string }[]>;
    tabs?: { id: string, name: string }[];
    moveChapterMutation: { mutate: (data: { chapterId: string, newTabId: string }) => void };

    // Article Actions
    articlesFromDB: Article[] | undefined;
    articleSpecialities: ArticleSpeciality[] | undefined;
    setPendingItemSpecialities: (ids: string[]) => void;
    setEditingItemId: (id: string | null) => void;
    setArticleDialog: (data: { open: boolean, mode: 'create' | 'edit', data?: Article }) => void;
    deleteArticleMutation: { mutate: (id: string) => void };

    // Item/Article Specialities Dialogs
    editingItemId: string | null;
    updateArticleSpecialitiesMutation: { mutate: (data: { articleId: string, specialityIds: string[] }) => void };
    pendingItemSpecialities: string[];

    // Individual Item Specialities
    editingIndividualItemId: string | null;
    setEditingIndividualItemId: (id: string | null) => void;
    pendingIndividualItemSpecialities: string[];
    setPendingIndividualItemSpecialities: (ids: string[]) => void;
    updateItemSpecialitiesMutation: { mutate: (data: { itemId: string, specialityIds: string[] }) => void };

    // Editing logic
    editingTextLine: { articleId: string, lineIndex: number } | null;
    setEditingTextLine: (val: { articleId: string, lineIndex: number } | null) => void;
    editingTextValue: string;
    setEditingTextValue: (val: string) => void;
    handleUpdateArticleTextLine: (articleId: string, lineIndex: number, text: string) => void;

    editingItemCell: { articleId: string, itemIndex: number, field: string } | null;
    setEditingItemCell: (val: { articleId: string, itemIndex: number, field: string } | null) => void;
    editingItemValue: string;
    setEditingItemValue: (val: string) => void;
    handleUpdateItemColumn: (articleId: string, itemIndex: number, field: string, value: string | number) => void;

    aiAcceptedItems: Set<string>;
    getItemSpecialitiesInArticle: (artigo: string, chapterId: string, articleId?: string) => { id: string, name_en: string, name_pt: string }[];
    getItemOwnSpecialityIds: (itemId: string) => string[];
    handleDeleteItemFromArticle: (articleId: string, itemIndex: number) => void;
    handleAddItemToArticle: (articleId: string) => void;

    items: OrcamentoItem[] | undefined;
    language: string;
    t: (key: string) => string;
}

export const RecursiveChapterRenderer = ({
    node,
    indentLevel = 0, // Default to 0 if not provided
    collapsedChapters,
    setCollapsedChapters,
    displayNumber,
    cleanChapterName,
    collapsedArticles,
    setCollapsedArticles,
    handleOpenChapterDialog,
    setChapterDialog,
    deleteChapterMutation,
    handleCloseChapterDialog,
    editingChapterId,
    pendingChapterSpecialities,
    setPendingChapterSpecialities,
    groupedSpecialityOptions,
    tabs,
    moveChapterMutation,
    articlesFromDB,
    articleSpecialities,
    setPendingItemSpecialities,
    setEditingItemId,
    setArticleDialog,
    deleteArticleMutation,
    editingItemId,
    updateArticleSpecialitiesMutation,
    pendingItemSpecialities,
    editingIndividualItemId,
    setEditingIndividualItemId,
    pendingIndividualItemSpecialities,
    setPendingIndividualItemSpecialities,
    updateItemSpecialitiesMutation,
    editingTextLine,
    setEditingTextLine,
    editingTextValue,
    setEditingTextValue,
    handleUpdateArticleTextLine,
    editingItemCell,
    setEditingItemCell,
    editingItemValue,
    setEditingItemValue,
    handleUpdateItemColumn,
    aiAcceptedItems,
    getItemSpecialitiesInArticle,
    getItemOwnSpecialityIds,
    handleDeleteItemFromArticle,
    handleAddItemToArticle,
    items,
    language,
    t
}: RecursiveChapterRendererProps) => {
    const chapterWithArticles = node.item; // Alias for compatibility
    const isChapterCollapsed = collapsedChapters.has(chapterWithArticles.chapter.id);

    return (
        <Collapsible
            key={chapterWithArticles.chapter.id}
            open={!isChapterCollapsed}
            onOpenChange={(open) => {
                const newCollapsed = new Set(collapsedChapters);
                if (open) {
                    newCollapsed.delete(chapterWithArticles.chapter.id);
                } else {
                    newCollapsed.add(chapterWithArticles.chapter.id);
                }
                setCollapsedChapters(newCollapsed);
            }}
            className="border rounded-lg overflow-hidden mb-6"
        >
            <div className="bg-muted">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-transparent p-0 h-auto">
                                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isChapterCollapsed ? '-rotate-90' : ''}`} />
                                <h3 className="text-lg font-semibold">
                                    {displayNumber(chapterWithArticles.chapter.chapter_number)}. {cleanChapterName(chapterWithArticles.chapter.chapter_name)}
                                </h3>
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Speciality button for chapter */}
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenChapterDialog(chapterWithArticles.chapter.id)}
                                    >
                                        <Tag className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Manage Specialities</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        {/* Edit chapter button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setChapterDialog({ open: true, mode: 'edit', data: chapterWithArticles.chapter })}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>

                        {/* Delete chapter button */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this chapter? This will also delete all articles and items within it.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => deleteChapterMutation.mutate(chapterWithArticles.chapter.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* Move chapter button */}
                        {tabs && tabs.length > 1 && (
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <MoveRight className="h-4 w-4" />
                                        Move to tab
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Move Chapter</SheetTitle>
                                        <SheetDescription>
                                            Select a tab to move this chapter to
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-6 space-y-2">
                                        {tabs.filter(t => t.id !== chapterWithArticles.chapter.tab_id).map((targetTab) => (
                                            <Button
                                                key={targetTab.id}
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => {
                                                    moveChapterMutation.mutate({
                                                        chapterId: chapterWithArticles.chapter.id,
                                                        newTabId: targetTab.id
                                                    });
                                                }}
                                            >
                                                <ChevronRight className="mr-2 h-4 w-4" />
                                                {targetTab.name}
                                            </Button>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        )}
                    </div>
                </div>
            </div>

            {/* Chapter Speciality Dialog */}
            {editingChapterId === chapterWithArticles.chapter.id && (
                <Dialog open={true} onOpenChange={(open) => handleCloseChapterDialog(open)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Manage Specialities for Chapter</DialogTitle>
                            <DialogDescription>
                                Select specialities to apply to all items in this chapter
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <MultiSelect
                                options={Object.entries(groupedSpecialityOptions).flatMap(([group, options]) =>
                                    options.map(opt => ({ ...opt, group }))
                                )}
                                selected={pendingChapterSpecialities}
                                onChange={setPendingChapterSpecialities}
                                placeholder="Select specialities..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleCloseChapterDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleCloseChapterDialog(false)}
                            >
                                Apply
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            <CollapsibleContent>
                {/* Articles displayed inline with collapsible feature */}
                <div className="p-4 space-y-4">
                    {chapterWithArticles.articles.map((article) => {
                        const isCollapsed = collapsedArticles.has(article.id);

                        // Check if the article title matches the first item's description
                        // Check if the article title matches the first item's description
                        // If it matches, we might want to simplify the display, but "Single Article" is confusing.
                        // We will just use the article title as is, or the description if title is empty.
                        const displayTitle = article.title || "Article";

                        return (
                            <Collapsible
                                key={article.id}
                                open={!isCollapsed}
                                onOpenChange={(open) => {
                                    const newCollapsed = new Set(collapsedArticles);
                                    if (open) {
                                        newCollapsed.delete(article.id);
                                    } else {
                                        newCollapsed.add(article.id);
                                    }
                                    setCollapsedArticles(newCollapsed);
                                }}
                                className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 mb-4"
                            >
                                {/* Article header with toggle */}
                                <div className="flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex items-center gap-2 flex-1">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-transparent p-0 h-auto">
                                                <ChevronDown
                                                    className={`h-5 w-5 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                                                />
                                                <h4 className="text-base font-semibold text-primary text-left break-words whitespace-normal">
                                                    {displayNumber(article.artigo)} - {displayTitle}
                                                </h4>
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>

                                    {/* Article action buttons */}
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        {/* Speciality button for article */}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const articleFromDB = articlesFromDB?.find(a =>
                                                                a.chapter_id === article.chapter_id &&
                                                                a.artigo === article.artigo
                                                            );
                                                            if (articleFromDB) {
                                                                const articleSpecIds = articleSpecialities?.filter(as => as.article_id === articleFromDB.id).map(as => as.speciality_id) || [];
                                                                setEditingItemId(articleFromDB.id); // Reuse item editing state
                                                                setPendingItemSpecialities(articleSpecIds);
                                                            }
                                                        }}
                                                    >
                                                        <Tag className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Manage Specialities</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        {/* Edit article button - only enabled for non-single articles */}
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setArticleDialog({ open: true, mode: 'edit', data: article })}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                            </Tooltip>
                                        </TooltipProvider>

                                        {/* Delete article button */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <Trash className="h-3 w-3" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Article</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete this article?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => {
                                                            const articleFromDB = articlesFromDB?.find(a =>
                                                                a.chapter_id === article.chapter_id &&
                                                                a.artigo === article.artigo
                                                            );
                                                            if (articleFromDB) {
                                                                deleteArticleMutation.mutate(articleFromDB.id);
                                                            }
                                                        }}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                {/* Article Speciality Dialog */}
                                {(() => {
                                    const articleFromDB = articlesFromDB?.find(a =>
                                        a.chapter_id === article.chapter_id &&
                                        a.artigo === article.artigo
                                    );
                                    return articleFromDB && editingItemId === articleFromDB.id && (
                                        <Dialog open={true} onOpenChange={(open) => {
                                            if (!open) {
                                                updateArticleSpecialitiesMutation.mutate({
                                                    articleId: articleFromDB.id,
                                                    specialityIds: pendingItemSpecialities,
                                                });
                                                setEditingItemId(null);
                                                setPendingItemSpecialities([]);
                                            }
                                        }}>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Manage Specialities for Article</DialogTitle>
                                                    <DialogDescription>
                                                        Select specialities to apply to all items in this article
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <MultiSelect
                                                        options={Object.entries(groupedSpecialityOptions).flatMap(([group, options]) =>
                                                            options.map(opt => ({ ...opt, group }))
                                                        )}
                                                        selected={pendingItemSpecialities}
                                                        onChange={setPendingItemSpecialities}
                                                        placeholder="Select specialities..."
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingItemId(null);
                                                            setPendingItemSpecialities([]);
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            updateArticleSpecialitiesMutation.mutate({
                                                                articleId: articleFromDB.id,
                                                                specialityIds: pendingItemSpecialities,
                                                            });
                                                            setEditingItemId(null);
                                                            setPendingItemSpecialities([]);
                                                        }}
                                                    >
                                                        Apply
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    );
                                })()}

                                {/* Individual Item Speciality Dialog */}
                                {editingIndividualItemId && (
                                    <Dialog open={true} onOpenChange={(open) => {
                                        if (!open) {
                                            updateItemSpecialitiesMutation.mutate({
                                                itemId: editingIndividualItemId,
                                                specialityIds: pendingIndividualItemSpecialities,
                                            });
                                            setEditingIndividualItemId(null);
                                            setPendingIndividualItemSpecialities([]);
                                        }
                                    }}>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Manage Specialities for Item</DialogTitle>
                                                <DialogDescription>
                                                    Select specialities for this specific item
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <MultiSelect
                                                    options={Object.entries(groupedSpecialityOptions).flatMap(([group, options]) =>
                                                        options.map(opt => ({ ...opt, group }))
                                                    )}
                                                    selected={pendingIndividualItemSpecialities}
                                                    onChange={setPendingIndividualItemSpecialities}
                                                    placeholder="Select specialities..."
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingIndividualItemId(null);
                                                        setPendingIndividualItemSpecialities([]);
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        updateItemSpecialitiesMutation.mutate({
                                                            itemId: editingIndividualItemId,
                                                            specialityIds: pendingIndividualItemSpecialities,
                                                        });
                                                        setEditingIndividualItemId(null);
                                                        setPendingIndividualItemSpecialities([]);
                                                    }}
                                                >
                                                    Apply
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}

                                {/* Article content */}
                                {/* Article content */}
                                <CollapsibleContent className="p-4 pt-0 space-y-4">
                                    {(() => {
                                        const groupedContent: Array<{ type: 'text', data: string } | {
                                            type: 'items', items: Array<{
                                                artigo: string;
                                                descricao: string;
                                                un: string;
                                                qt: number;
                                                observacoes_empreiteiro?: string;
                                            }>
                                        }> = [];

                                        // Group consecutive items into a single table
                                        let currentItemGroup: Array<{
                                            artigo: string;
                                            descricao: string;
                                            un: string;
                                            qt: number;
                                            observacoes_empreiteiro?: string;
                                        }> = [];

                                        article.contents.forEach((content, index) => {
                                            if (content.type === 'text') {
                                                // If we have accumulated items, push them as a group first
                                                if (currentItemGroup.length > 0) {
                                                    groupedContent.push({ type: 'items', items: [...currentItemGroup] });
                                                    currentItemGroup = [];
                                                }
                                                // Add text content
                                                groupedContent.push({ type: 'text', data: content.data as string });
                                            } else {
                                                // Accumulate items
                                                const itemData = content.data as {
                                                    artigo: string;
                                                    descricao: string;
                                                    un: string;
                                                    qt: number;
                                                    observacoes_empreiteiro?: string;
                                                };
                                                currentItemGroup.push(itemData);
                                            }
                                        });

                                        // Don't forget the last group
                                        if (currentItemGroup.length > 0) {
                                            groupedContent.push({ type: 'items', items: currentItemGroup });
                                        }

                                        // Get the article ID from the database
                                        const articleFromDB = articlesFromDB?.find(a =>
                                            a.chapter_id === article.chapter_id &&
                                            a.artigo === article.artigo
                                        );

                                        return groupedContent.map((group, groupIndex) => {
                                            // Track text line indices separately
                                            let textLineIndex = 0;
                                            if (group.type === 'text') {
                                                // Count how many text lines we've seen before this one
                                                for (let i = 0; i < groupIndex; i++) {
                                                    if (groupedContent[i].type === 'text') {
                                                        textLineIndex++;
                                                    }
                                                }
                                            }

                                            return (
                                                <div key={groupIndex}>
                                                    {group.type === 'text' ? (
                                                        <div className="flex items-start gap-2 group">
                                                            {editingTextLine !== null && editingTextLine.articleId === articleFromDB?.id && editingTextLine.lineIndex === textLineIndex ? (
                                                                <div className="flex-1 flex gap-2">
                                                                    <Textarea
                                                                        value={editingTextValue}
                                                                        onChange={(e) => setEditingTextValue(e.target.value)}
                                                                        className="flex-1 text-sm"
                                                                        rows={3}
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex flex-col gap-1">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="default"
                                                                            onClick={() => {
                                                                                if (articleFromDB) {
                                                                                    handleUpdateArticleTextLine(articleFromDB.id, textLineIndex, editingTextValue);
                                                                                }
                                                                            }}
                                                                        >
                                                                            Save
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                setEditingTextLine(null);
                                                                                setEditingTextValue('');
                                                                            }}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex-1 flex flex-wrap gap-2 items-center">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 py-1 px-3"
                                                                            onClick={() => {
                                                                                if (articleFromDB) {
                                                                                    setEditingTextLine({ articleId: articleFromDB.id, lineIndex: textLineIndex });
                                                                                    setEditingTextValue(group.data);
                                                                                }
                                                                            }}
                                                                        >
                                                                            {group.data}
                                                                        </Badge>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="opacity-0 group-hover:opacity-100"
                                                                        onClick={() => {
                                                                            if (articleFromDB) {
                                                                                setEditingTextLine({ articleId: articleFromDB.id, lineIndex: textLineIndex });
                                                                                setEditingTextValue(group.data);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Edit className="h-3 w-3" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Table className="border">
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>{t('orcamento.artigo')}</TableHead>
                                                                    <TableHead>{t('orcamento.descricao')}</TableHead>
                                                                    <TableHead>{t('orcamento.unit')}</TableHead>
                                                                    <TableHead className="text-right">{t('orcamento.quantity')}</TableHead>
                                                                    <TableHead>{t('orcamento.observacoesEmpreiteiro')}</TableHead>
                                                                    <TableHead>Specialities</TableHead>
                                                                    <TableHead className="w-[50px]"></TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {group.items.map((item, itemIndex) => {
                                                                    // Get specialities for this item
                                                                    const itemSpecialities = getItemSpecialitiesInArticle(
                                                                        item.artigo,
                                                                        chapterWithArticles.chapter.id,
                                                                        articleFromDB?.id
                                                                    );

                                                                    // Helper function to render editable cell
                                                                    const renderEditableCell = (field: string, value: string | number, type: 'text' | 'number' = 'text') => {
                                                                        const isEditing = editingItemCell !== null &&
                                                                            editingItemCell.articleId === articleFromDB?.id &&
                                                                            editingItemCell.itemIndex === itemIndex &&
                                                                            editingItemCell.field === field;

                                                                        if (isEditing) {
                                                                            // Use Textarea for descricao field
                                                                            const isDescricao = field === 'descricao';

                                                                            return (
                                                                                <div className="flex gap-2 items-start">
                                                                                    {isDescricao ? (
                                                                                        <Textarea
                                                                                            value={editingItemValue}
                                                                                            onChange={(e) => setEditingItemValue(e.target.value)}
                                                                                            className="w-full text-sm min-h-[100px]"
                                                                                            rows={4}
                                                                                            autoFocus
                                                                                            onKeyDown={(e) => {
                                                                                                // Allow Enter in textarea, only save on Ctrl+Enter
                                                                                                if (e.key === 'Enter' && e.ctrlKey && articleFromDB) {
                                                                                                    handleUpdateItemColumn(articleFromDB.id, itemIndex, field, editingItemValue);
                                                                                                } else if (e.key === 'Escape') {
                                                                                                    setEditingItemCell(null);
                                                                                                    setEditingItemValue('');
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    ) : (
                                                                                        <Input
                                                                                            type={type}
                                                                                            value={editingItemValue}
                                                                                            onChange={(e) => setEditingItemValue(e.target.value)}
                                                                                            className="w-full text-sm"
                                                                                            autoFocus
                                                                                            onKeyDown={(e) => {
                                                                                                if (e.key === 'Enter' && articleFromDB) {
                                                                                                    handleUpdateItemColumn(articleFromDB.id, itemIndex, field, editingItemValue);
                                                                                                } else if (e.key === 'Escape') {
                                                                                                    setEditingItemCell(null);
                                                                                                    setEditingItemValue('');
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                    )}
                                                                                    <div className="flex flex-col gap-1">
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="ghost"
                                                                                            onClick={() => {
                                                                                                if (articleFromDB) {
                                                                                                    handleUpdateItemColumn(articleFromDB.id, itemIndex, field, editingItemValue);
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            ✓
                                                                                        </Button>
                                                                                        <Button
                                                                                            size="sm"
                                                                                            variant="ghost"
                                                                                            onClick={() => {
                                                                                                setEditingItemCell(null);
                                                                                                setEditingItemValue('');
                                                                                            }}
                                                                                        >
                                                                                            ✕
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <div
                                                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded"
                                                                                onClick={() => {
                                                                                    if (articleFromDB) {
                                                                                        setEditingItemCell({ articleId: articleFromDB.id, itemIndex, field });
                                                                                        setEditingItemValue(String(value));
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {type === 'number' && field === 'qt' ? Number(value).toFixed(2) : value || '-'}
                                                                            </div>
                                                                        );
                                                                    };

                                                                    // Check if this item was accepted from AI suggestions
                                                                    const isAiAccepted = aiAcceptedItems.has(item.artigo);

                                                                    return (
                                                                        <TableRow
                                                                            key={itemIndex}
                                                                            className={isAiAccepted ? 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' : ''}
                                                                        >
                                                                            <TableCell>
                                                                                <div className="flex items-center gap-2">
                                                                                    {renderEditableCell('artigo', displayNumber(item.artigo))}
                                                                                    {isAiAccepted && (
                                                                                        <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                                                                            AI
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {item.descricao === article.title && item.descricao.length > 50 ? (
                                                                                    <div
                                                                                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded text-muted-foreground italic text-xs"
                                                                                        onClick={() => {
                                                                                            if (articleFromDB) {
                                                                                                setEditingItemCell({ articleId: articleFromDB.id, itemIndex, field: 'descricao' });
                                                                                                setEditingItemValue(item.descricao);
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        {/* Content hidden */}
                                                                                    </div>
                                                                                ) : (
                                                                                    renderEditableCell('descricao', item.descricao)
                                                                                )}
                                                                            </TableCell>
                                                                            <TableCell>{renderEditableCell('un', item.un)}</TableCell>
                                                                            <TableCell className="text-right">
                                                                                {renderEditableCell('qt', item.qt, 'number')}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {renderEditableCell('observacoes_empreiteiro', item.observacoes_empreiteiro || '')}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="flex flex-wrap gap-1 flex-1">
                                                                                        {itemSpecialities.length > 0 ? (
                                                                                            itemSpecialities.map((spec) => (
                                                                                                <Badge
                                                                                                    key={spec.id}
                                                                                                    variant="secondary"
                                                                                                    className="text-xs"
                                                                                                >
                                                                                                    {language === 'pt' ? spec.name_pt : spec.name_en}
                                                                                                </Badge>
                                                                                            ))
                                                                                        ) : (
                                                                                            <span className="text-muted-foreground text-sm">-</span>
                                                                                        )}
                                                                                    </div>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() => {
                                                                                            // Find the database item for this artigo
                                                                                            const dbItem = items?.find(i =>
                                                                                                i.chapter_id === chapterWithArticles.chapter.id &&
                                                                                                i.artigo === item.artigo
                                                                                            );
                                                                                            if (dbItem) {
                                                                                                const itemSpecIds = getItemOwnSpecialityIds(dbItem.id);
                                                                                                setEditingIndividualItemId(dbItem.id);
                                                                                                setPendingIndividualItemSpecialities(itemSpecIds);
                                                                                            }
                                                                                        }}
                                                                                        className="h-8 w-8 p-0"
                                                                                    >
                                                                                        <Tag className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => {
                                                                                        if (articleFromDB) {
                                                                                            handleDeleteItemFromArticle(articleFromDB.id, itemIndex);
                                                                                        }
                                                                                    }}
                                                                                    className="h-8 w-8 p-0"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                                </Button>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )
                                                                })}
                                                                {/* Add row button as a table row */}
                                                                <TableRow>
                                                                    <TableCell colSpan={7} className="text-center">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                if (articleFromDB) {
                                                                                    handleAddItemToArticle(articleFromDB.id);
                                                                                }
                                                                            }}
                                                                            className="gap-2"
                                                                        >
                                                                            <Plus className="h-4 w-4" />
                                                                            Add Row
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    )}
                                                </div>
                                            )
                                        });
                                    })()}
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </div>

                {/* Recursive Children (nested hierarchy) - INSIDE CollapsibleContent */}
                {node.children.length > 0 && (
                    <div className="pl-6 border-l-2 border-muted mt-4">
                        {node.children.map(child => (
                            <RecursiveChapterRenderer
                                key={child.item.chapter.id}
                                node={child}
                                collapsedChapters={collapsedChapters}
                                setCollapsedChapters={setCollapsedChapters}
                                displayNumber={displayNumber}
                                cleanChapterName={cleanChapterName}
                                collapsedArticles={collapsedArticles}
                                setCollapsedArticles={setCollapsedArticles}
                                handleOpenChapterDialog={handleOpenChapterDialog}
                                setChapterDialog={setChapterDialog}
                                deleteChapterMutation={deleteChapterMutation}
                                handleCloseChapterDialog={handleCloseChapterDialog}
                                editingChapterId={editingChapterId}
                                pendingChapterSpecialities={pendingChapterSpecialities}
                                setPendingChapterSpecialities={setPendingChapterSpecialities}
                                groupedSpecialityOptions={groupedSpecialityOptions}
                                tabs={tabs}
                                moveChapterMutation={moveChapterMutation}
                                articlesFromDB={articlesFromDB}
                                articleSpecialities={articleSpecialities}
                                setPendingItemSpecialities={setPendingItemSpecialities}
                                setEditingItemId={setEditingItemId}
                                setArticleDialog={setArticleDialog}
                                deleteArticleMutation={deleteArticleMutation}
                                editingItemId={editingItemId}
                                updateArticleSpecialitiesMutation={updateArticleSpecialitiesMutation}
                                pendingItemSpecialities={pendingItemSpecialities}
                                editingIndividualItemId={editingIndividualItemId}
                                setEditingIndividualItemId={setEditingIndividualItemId}
                                pendingIndividualItemSpecialities={pendingIndividualItemSpecialities}
                                setPendingIndividualItemSpecialities={setPendingIndividualItemSpecialities}
                                updateItemSpecialitiesMutation={updateItemSpecialitiesMutation}
                                editingTextLine={editingTextLine}
                                setEditingTextLine={setEditingTextLine}
                                editingTextValue={editingTextValue}
                                setEditingTextValue={setEditingTextValue}
                                handleUpdateArticleTextLine={handleUpdateArticleTextLine}
                                editingItemCell={editingItemCell}
                                setEditingItemCell={setEditingItemCell}
                                editingItemValue={editingItemValue}
                                setEditingItemValue={setEditingItemValue}
                                handleUpdateItemColumn={handleUpdateItemColumn}
                                aiAcceptedItems={aiAcceptedItems}
                                getItemSpecialitiesInArticle={getItemSpecialitiesInArticle}
                                getItemOwnSpecialityIds={getItemOwnSpecialityIds}
                                handleDeleteItemFromArticle={handleDeleteItemFromArticle}
                                handleAddItemToArticle={handleAddItemToArticle}
                                items={items}
                                language={language}
                                t={t}
                            />
                        ))}
                    </div>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
};
