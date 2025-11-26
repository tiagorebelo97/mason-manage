import { useState, useRef } from "react";
import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, FileSpreadsheet, Loader2, Trash2, MessageSquare, ChevronDown, ImagePlus, ImageIcon, Tag, X, ChevronRight, MoveRight, Plus, Edit, Trash, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { analyzeWithAI, extractExcelContext, type AIAnalysisResult, type UncertainRow } from "@/services/aiAnalysisService";
import { AIInsightsDisplay } from "@/components/analysis/AIInsightsDisplay";
import { AISuggestionCard } from "@/components/analysis/AISuggestionCard";
import { UncertainRowsPanel } from "@/components/analysis/UncertainRowsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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

type OrcamentoFile = {
  id: string;
  orcamento_id: string;
  file_name: string;
  file_url: string;
  analyzed: boolean;
};

type OrcamentoTab = {
  id: string;
  orcamento_id: string;
  name: string;
  display_order: number;
};

type OrcamentoChapter = {
  id: string;
  tab_id: string;
  chapter_number: string;
  chapter_name: string;
  chapter_comments: string | null;
};

type OrcamentoItem = {
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

type Speciality = {
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

type ChapterSpeciality = {
  chapter_id: string;
  speciality_id: string;
};

type ItemSpeciality = {
  item_id: string;
  speciality_id: string;
};

type ArticleContent = {
  type: 'text' | 'item';
  data: string | {
    artigo: string;
    descricao: string;
    un: string;
    qt: number;
    observacoes_empreiteiro?: string;
  };
};

type Article = {
  id: string;
  chapter_id: string;
  artigo: string;
  title: string;
  contents: ArticleContent[];
  sheet_name?: string; // Track original sheet name
};

type ChapterWithArticles = {
  chapter: OrcamentoChapter;
  articles: Article[];
  sheet_name?: string; // Track original sheet name
};

const MapaQuantidades = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAIAnalysis, setIsAIAnalysis] = useState(false); // Track if using AI analysis
  const [aiInsights, setAiInsights] = useState<AIAnalysisResult | null>(null); // Store AI analysis results
  const [uncertainRows, setUncertainRows] = useState<UncertainRow[]>([]); // Track uncertain rows
  const [acceptedRows, setAcceptedRows] = useState<Set<string>>(new Set()); // Track accepted rows by key
  const [rejectedRows, setRejectedRows] = useState<Set<string>>(new Set()); // Track rejected rows by key
  const [aiAcceptedItems, setAiAcceptedItems] = useState<Set<string>>(new Set()); // Track items accepted from AI suggestions (for highlighting)
  const [chaptersWithArticles, setChaptersWithArticles] = useState<ChapterWithArticles[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [pendingChapterSpecialities, setPendingChapterSpecialities] = useState<string[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [pendingItemSpecialities, setPendingItemSpecialities] = useState<string[]>([]);
  const [editingIndividualItemId, setEditingIndividualItemId] = useState<string | null>(null);
  const [pendingIndividualItemSpecialities, setPendingIndividualItemSpecialities] = useState<string[]>([]);
  const [collapsedArticles, setCollapsedArticles] = useState<Set<string>>(new Set());
  
  // Inline editing state
  const [editingTextLine, setEditingTextLine] = useState<{articleId: string; lineIndex: number} | null>(null);
  const [editingTextValue, setEditingTextValue] = useState<string>('');
  const [editingItemCell, setEditingItemCell] = useState<{articleId: string; itemIndex: number; field: string} | null>(null);
  const [editingItemValue, setEditingItemValue] = useState<string>('');
  
  // Dialog states for CRUD operations
  const [chapterDialog, setChapterDialog] = useState<{open: boolean; mode: 'create' | 'edit'; data?: OrcamentoChapter}>({open: false, mode: 'create'});
  const [separatorDialog, setSeparatorDialog] = useState<{open: boolean; mode: 'create' | 'edit'; data?: OrcamentoTab}>({open: false, mode: 'create'});
  const [articleDialog, setArticleDialog] = useState<{open: boolean; mode: 'create' | 'edit'; data?: Article}>({open: false, mode: 'create'});
  const [itemDialog, setItemDialog] = useState<{open: boolean; mode: 'create' | 'edit'; data?: OrcamentoItem}>({open: false, mode: 'create'});
  
  // Track collapsed state for chapters
  const [collapsedChapters, setCollapsedChapters] = useState<Set<string>>(new Set());
  
  const [collapsedSheets, setCollapsedSheets] = useState<Set<string>>(() => {
    // Load collapsed sheets state from localStorage
    if (id) {
      const stored = localStorage.getItem(`collapsedSheets_${id}`);
      if (stored) {
        try {
          return new Set(JSON.parse(stored));
        } catch (e) {
          console.error('Error loading collapsed sheets state:', e);
        }
      }
    }
    // Default to all sheets collapsed
    return new Set(['__INITIAL__']); // Special marker to indicate default collapsed state
  });

  const { data: orcamento } = useQuery({
    queryKey: ["orcamento", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: files, isLoading: isLoadingFiles, isFetching: isFetchingFiles } = useQuery({
    queryKey: ["orcamento_files", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_files")
        .select("*")
        .eq("orcamento_id", id);
      if (error) throw error;
      return data as OrcamentoFile[];
    },
    enabled: !!id,
  });

  const { data: tabs, isLoading: isLoadingTabs, isFetching: isFetchingTabs } = useQuery({
    queryKey: ["orcamento_tabs", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_tabs")
        .select("*")
        .eq("orcamento_id", id)
        .order("display_order");
      if (error) throw error;
      return data as OrcamentoTab[];
    },
    enabled: !!id && files && files.length > 0 && files[0]?.analyzed,
  });

  const { data: chapters, isLoading: isLoadingChapters, isFetching: isFetchingChapters } = useQuery({
    queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_chapters")
        .select(`
          *,
          orcamento_tabs!inner(orcamento_id)
        `)
        .eq("orcamento_tabs.orcamento_id", id)
        .order("chapter_number");
      if (error) throw error;
      return data as OrcamentoChapter[];
    },
    enabled: !!id && tabs && tabs.length > 0,
  });

  const { data: items, isLoading: isLoadingItems } = useQuery({
    queryKey: ["orcamento_items", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_items")
        .select(`
          *,
          orcamento_chapters!inner(
            tab_id,
            orcamento_tabs!inner(orcamento_id)
          )
        `)
        .eq("orcamento_chapters.orcamento_tabs.orcamento_id", id)
        .order("artigo");
      if (error) throw error;
      return data as OrcamentoItem[];
    },
    enabled: !!id && chapters && chapters.length > 0,
  });

  const { data: specialities } = useQuery({
    queryKey: ["specialities", import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialities")
        .select(`
          *,
          main_specialties(id, main_specialty_en, main_specialty_pt)
        `);
      if (error) throw error;
      return data as Speciality[];
    },
  });

  const { data: chapterSpecialities } = useQuery({
    queryKey: ["chapter_specialities", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_specialities")
        .select(`
          *,
          orcamento_chapters!inner(
            tab_id,
            orcamento_tabs!inner(orcamento_id)
          )
        `)
        .eq("orcamento_chapters.orcamento_tabs.orcamento_id", id);
      if (error) throw error;
      return data as ChapterSpeciality[];
    },
    enabled: !!id && chapters && chapters.length > 0,
  });

  const { data: itemSpecialities } = useQuery({
    queryKey: ["item_specialities", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("item_specialities")
        .select(`
          *,
          orcamento_items!inner(
            chapter_id,
            orcamento_chapters!inner(
              tab_id,
              orcamento_tabs!inner(orcamento_id)
            )
          )
        `)
        .eq("orcamento_items.orcamento_chapters.orcamento_tabs.orcamento_id", id);
      if (error) throw error;
      return data as ItemSpeciality[];
    },
    enabled: !!id && items && items.length > 0,
  });

  // Query for tab specialities
  const { data: tabSpecialities } = useQuery({
    queryKey: ["tab_specialities", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tab_specialities")
        .select(`
          *,
          orcamento_tabs!inner(orcamento_id)
        `)
        .eq("orcamento_tabs.orcamento_id", id);
      if (error) throw error;
      return data as { tab_id: string; speciality_id: string }[];
    },
    enabled: !!id && tabs && tabs.length > 0,
  });

  // Query for articles from database
  const { data: articlesFromDB } = useQuery({
    queryKey: ["orcamento_articles", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_articles")
        .select(`
          *,
          orcamento_chapters!inner(
            tab_id,
            orcamento_tabs!inner(orcamento_id)
          )
        `)
        .eq("orcamento_chapters.orcamento_tabs.orcamento_id", id)
        .order("artigo");
      if (error) throw error;
      return data;
    },
    enabled: !!id && chapters && chapters.length > 0,
  });

  // Query for article specialities
  const { data: articleSpecialities } = useQuery({
    queryKey: ["article_specialities", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("article_specialities")
        .select(`
          *,
          orcamento_articles!inner(
            chapter_id,
            orcamento_chapters!inner(
              tab_id,
              orcamento_tabs!inner(orcamento_id)
            )
          )
        `)
        .eq("orcamento_articles.orcamento_chapters.orcamento_tabs.orcamento_id", id);
      if (error) throw error;
      return data as { article_id: string; speciality_id: string }[];
    },
    enabled: !!id && articlesFromDB && articlesFromDB.length > 0,
  });
  
  // Initialize collapsed sheets with all sheet names on first load
  React.useEffect(() => {
    if (chaptersWithArticles.length > 0 && collapsedSheets.has('__INITIAL__')) {
      const allSheetNames = new Set(
        chaptersWithArticles
          .filter(cwa => cwa.sheet_name)
          .map(cwa => cwa.sheet_name!)
      );
      setCollapsedSheets(allSheetNames);
    }
  }, [chaptersWithArticles, collapsedSheets]);

  // Load articles data from database or sessionStorage when chapters are loaded
  React.useEffect(() => {
    if (chapters && chapters.length > 0 && id) {
      // First, try to load from database
      if (articlesFromDB && articlesFromDB.length > 0) {
        try {
          // Group articles by chapter
          const groupedByChapter = new Map<string, typeof articlesFromDB>();
          articlesFromDB.forEach((article) => {
            const chapterNumber = chapters.find(c => c.id === article.chapter_id)?.chapter_number;
            if (chapterNumber) {
              if (!groupedByChapter.has(chapterNumber)) {
                groupedByChapter.set(chapterNumber, []);
              }
              groupedByChapter.get(chapterNumber)!.push(article);
            }
          });
          
          // Create ChapterWithArticles structure
          const chaptersWithArticlesData: ChapterWithArticles[] = [];
          chapters.forEach((chapter) => {
            const articlesForChapter = groupedByChapter.get(chapter.chapter_number) || [];
            if (articlesForChapter.length > 0) {
              chaptersWithArticlesData.push({
                chapter,
                articles: articlesForChapter.map((articleData) => ({
                  id: `${chapter.id}_${articleData.artigo}`,
                  chapter_id: chapter.id,
                  artigo: articleData.artigo,
                  title: articleData.title,
                  contents: articleData.contents,
                  sheet_name: articleData.sheet_name
                })),
                sheet_name: articlesForChapter[0]?.sheet_name
              });
            }
          });
          
          setChaptersWithArticles(chaptersWithArticlesData);
        } catch (error) {
          console.error('Error loading articles data from database:', error);
        }
      } else {
        // Fallback to sessionStorage for backward compatibility
        const storedArticles = sessionStorage.getItem(`articles_${id}`);
        if (storedArticles) {
          try {
            const articlesData = JSON.parse(storedArticles);
            
            // Group articles by chapter
            const groupedByChapter = new Map<string, typeof articlesData>();
            articlesData.forEach((article: typeof articlesData[0]) => {
              if (!groupedByChapter.has(article.chapter_number)) {
                groupedByChapter.set(article.chapter_number, []);
              }
              groupedByChapter.get(article.chapter_number)!.push(article);
            });
            
            // Create ChapterWithArticles structure
            const chaptersWithArticlesData: ChapterWithArticles[] = [];
            chapters.forEach((chapter) => {
              const articlesForChapter = groupedByChapter.get(chapter.chapter_number) || [];
              if (articlesForChapter.length > 0) {
                chaptersWithArticlesData.push({
                  chapter,
                  articles: articlesForChapter.map((articleData: typeof articlesData[0]) => ({
                    id: `${chapter.id}_${articleData.artigo}`,
                    chapter_id: chapter.id,
                    artigo: articleData.artigo,
                    title: articleData.title,
                    contents: articleData.contents,
                    sheet_name: articleData.sheet_name
                  })),
                  sheet_name: articlesForChapter[0]?.sheet_name
                });
              }
            });
            
            setChaptersWithArticles(chaptersWithArticlesData);
          } catch (error) {
            console.error('Error loading articles data from sessionStorage:', error);
          }
        }
      }
    }
  }, [chapters, id, articlesFromDB]);

  // Save collapsed sheets state to localStorage whenever it changes
  React.useEffect(() => {
    if (id && collapsedSheets) {
      try {
        localStorage.setItem(`collapsedSheets_${id}`, JSON.stringify(Array.from(collapsedSheets)));
      } catch (e) {
        console.error('Error saving collapsed sheets state:', e);
      }
    }
  }, [collapsedSheets, id]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('orcamento-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('orcamento-files')
        .getPublicUrl(fileName);

      // Store file metadata in database
      const { data, error } = await supabase
        .from("orcamento_files")
        .insert([
          {
            orcamento_id: id,
            file_name: file.name,
            file_url: publicUrl,
            analyzed: false,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_files", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('orcamento.uploadSuccess'));
    },
    onError: () => {
      toast.error(t('orcamento.uploadError'));
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async ({ fileId, isAIAnalysis = false }: { fileId: string; isAIAnalysis?: boolean }) => {
      // Article-based view is always enabled
      const articleBasedView = true;
      try {
        // Get file info from database
        const { data: fileData, error: fileQueryError } = await supabase
          .from("orcamento_files")
          .select("*")
          .eq("id", fileId)
          .single();
        
        if (fileQueryError) {
          console.error("Error fetching file data:", fileQueryError);
          throw new Error(`Failed to fetch file data: ${fileQueryError.message}`);
        }
        
        if (!fileData) {
          console.error("No file data found for fileId:", fileId);
          throw new Error("File not found in database");
        }
        
        if (!fileData.file_url) {
          console.error("File URL is missing for file:", fileData);
          throw new Error("File URL is missing");
        }
        
        // Download file from storage
        console.log("Attempting to download file from URL:", fileData.file_url);
        
        // Extract file path from public URL
        // Supabase public URL format: https://[domain]/storage/v1/object/public/orcamento-files/[path]
        // We need to extract just the [path] part
        let filePath: string;
        
        // Try multiple parsing strategies
        if (fileData.file_url.includes('/orcamento-files/')) {
          const urlParts = fileData.file_url.split('/orcamento-files/');
          filePath = urlParts[1];
        } else if (fileData.file_url.includes('/object/public/orcamento-files/')) {
          // Alternative format
          const urlParts = fileData.file_url.split('/object/public/orcamento-files/');
          filePath = urlParts[1];
        } else {
          // If we can't parse the URL, try using the entire URL as-is
          console.error("Could not parse file URL format:", fileData.file_url);
          console.log("Attempting to extract filename from URL");
          
          // Try to extract just the filename if URL doesn't match expected format
          const urlObj = new URL(fileData.file_url);
          const pathParts = urlObj.pathname.split('/');
          // Get the last two parts (should be {orcamento_id}/{filename})
          if (pathParts.length >= 2) {
            filePath = `${pathParts[pathParts.length - 2]}/${pathParts[pathParts.length - 1]}`;
            console.log("Extracted path:", filePath);
          } else {
            throw new Error(`Invalid file URL format. Expected URL to contain '/orcamento-files/' but got: ${fileData.file_url}`);
          }
        }
        
        console.log("Downloading file from path:", filePath);
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from('orcamento-files')
          .download(filePath);
        
        if (downloadError) {
          console.error("Error downloading file from storage:", downloadError);
          throw new Error(`Failed to download file: ${downloadError.message}`);
        }
        
        if (!fileBlob) {
          console.error("No file blob received from storage");
          throw new Error("Failed to download file: No data received");
        }
        
        // Read the Excel file from the downloaded blob
        console.log("Reading Excel file...");
        const arrayBuffer = await fileBlob.arrayBuffer();
        
        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          console.error("Empty or invalid file content");
          throw new Error("File is empty or corrupted");
        }
        
        console.log("File size:", arrayBuffer.byteLength, "bytes");
        
        let workbook;
        try {
          workbook = XLSX.read(arrayBuffer, { type: 'array' });
          console.log("Excel file read successfully. Sheets:", workbook.SheetNames);
        } catch (xlsxError) {
          console.error("Error reading Excel file with XLSX:", xlsxError);
          throw new Error(`Failed to read Excel file: ${xlsxError instanceof Error ? xlsxError.message : 'Unknown error'}`);
        }
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          console.error("Excel file has no sheets");
          throw new Error("Excel file has no sheets");
        }
        
        // Perform AI analysis if enabled (passed as parameter)
        let aiAnalysisResult: AIAnalysisResult | null = null;
        if (isAIAnalysis) {
          console.log("Performing AI analysis...");
          try {
            const excelContext = extractExcelContext(workbook);
            aiAnalysisResult = await analyzeWithAI(excelContext);
            console.log("AI analysis completed:", aiAnalysisResult);
          } catch (aiError) {
            console.error("AI analysis error (continuing with normal analysis):", aiError);
            // Don't fail the entire analysis if AI fails
          }
        }
        
        // Also load with ExcelJS for image extraction
        const excelJSWorkbook = new ExcelJS.Workbook();
        try {
          await excelJSWorkbook.xlsx.load(arrayBuffer);
          console.log("ExcelJS workbook loaded successfully");
        } catch (excelJSError) {
          console.error("Error loading file with ExcelJS (images won't be extracted):", excelJSError);
          // Don't throw here - images are optional
        }
      
      // Extract images from all worksheets
      const extractedImages: Array<{
        sheetName: string;
        imageId: string;
        extension: string;
        buffer: Buffer;
        row?: number;
        col?: number;
      }> = [];
      
      excelJSWorkbook.eachSheet((worksheet) => {
        const images = worksheet.getImages();
        images.forEach((image) => {
          const img = excelJSWorkbook.getImage(image.imageId);
          extractedImages.push({
            sheetName: worksheet.name,
            imageId: image.imageId,
            extension: img.extension,
            buffer: img.buffer as Buffer,
            row: image.range?.tl?.nativeRow,
            col: image.range?.tl?.nativeCol,
          });
        });
      });
      
      const tabsToInsert: Array<{
        orcamento_id: string;
        name: string;
        display_order: number;
      }> = [];
      
      const chaptersToInsert: Array<{
        tab_id?: string;
        sheet_name?: string;
        chapter_number: string;
        chapter_name: string;
        chapter_comments?: string;
      }> = [];

      const itemsToInsert: Array<{
        sheet_name?: string;
        chapter_number?: string;
        artigo: string;
        descricao: string;
        un: string | null;
        qt: number | null;
        preco_unitario: number | null;
        item_comments?: string | null;
        observacoes_empreiteiro: string | null;
        observacoes_image_url: string | null;
        excel_row_index?: number; // Track the Excel row for image matching
      }> = [];
      
      // Article-based view data structure
      const articlesData: Array<{
        sheet_name: string;
        chapter_number: string;
        artigo: string;
        title: string;
        contents: Array<{
          type: 'text' | 'item';
          data: string | {
            artigo: string;
            descricao: string;
            un: string;
            qt: number;
            observacoes_empreiteiro?: string;
          };
        }>;
      }> = [];

      // Process each sheet and create tabs
      // For article-based view (always enabled), always create 3 tabs regardless of sheet count
      const hasMultipleSheets = false;
      
      // Track if we need to prefix chapter/article numbers with sheet name for uniqueness
      // This is needed when article-based view is enabled with multiple sheets
      const needsSheetPrefix = articleBasedView && workbook.SheetNames.length > 1;
      
      if (!hasMultipleSheets) {
        // Create 3 default tabs for single-sheet files
        tabsToInsert.push(
          {
            orcamento_id: id!,
            name: "Principal",
            display_order: 0,
          },
          {
            orcamento_id: id!,
            name: "Arquitetura",
            display_order: 1,
          },
          {
            orcamento_id: id!,
            name: "Instalações Especiais",
            display_order: 2,
          }
        );
      }
      
      workbook.SheetNames.forEach((sheetName, index) => {
        if (hasMultipleSheets) {
          tabsToInsert.push({
            orcamento_id: id!,
            name: sheetName,
            display_order: index,
          });
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
        
        // Find the header row with "ARTIGO" and "DESCRIÇÃO" columns
        // This searches dynamically for these columns regardless of their position in the Excel sheet
        let artigoColumnIndex = -1;
        let descricaoColumnIndex = -1;
        let unColumnIndex = -1;
        let qtColumnIndex = -1;
        const qtColumnCandidates: number[] = []; // Track all potential QT columns
        const totaisColumnCandidates: number[] = []; // Track TOTAIS columns as fallback
        let precoUnitarioColumnIndex = -1;
        let observacoesColumnIndex = -1;
        let headerRowIndex = -1;
        
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (Array.isArray(row)) {
            for (let j = 0; j < row.length; j++) {
              const cellValue = String(row[j] || "").trim().toUpperCase();
              if (cellValue === "ARTIGO" || cellValue.includes("ARTIGO")) {
                artigoColumnIndex = j;
              }
              if (cellValue === "DESCRIÇÃO" || cellValue.includes("DESCRIÇÃO") || 
                  cellValue === "DESCRICAO" || cellValue.includes("DESCRICAO")) {
                descricaoColumnIndex = j;
              }
              if (cellValue === "UN" || cellValue === "UNIDADE" || cellValue === "UNI") {
                unColumnIndex = j;
              }
              // Prioritize TOTAIS columns for quantity
              if (cellValue === "TOTAIS" || cellValue.includes("TOTAIS") || cellValue === "TOTAL") {
                totaisColumnCandidates.push(j);
              }
              // Also track QT columns as backup
              if (cellValue === "QT" || cellValue === "QUANTIDADE" || 
                  (cellValue.includes("QUANT") && !cellValue.includes("MAPA"))) {
                qtColumnCandidates.push(j); // Track all QT column candidates
              }
              // Look for price column - could be "PREÇO UNITÁRIO", "PRECO UNITARIO", "PU", etc.
              if (cellValue.includes("PRECO") || cellValue.includes("PREÇO") || 
                  cellValue === "PU" || cellValue.includes("UNITARIO") || cellValue.includes("UNITÁRIO")) {
                precoUnitarioColumnIndex = j;
              }
              // Look for observacoes column - be more flexible
              if ((cellValue.includes("OBSERVA") || cellValue.includes("OBS")) && 
                  (cellValue.includes("EMPREITEIRO") || cellValue.includes("EMPREIT"))) {
                observacoesColumnIndex = j;
              }
            }
            // If we found both required columns, stop searching
            if (artigoColumnIndex !== -1 && descricaoColumnIndex !== -1) {
              headerRowIndex = i;
              break;
            }
          }
        }
        
        // Prioritize TOTAIS column over QT column
        // If TOTAIS columns exist, use them first
        if (totaisColumnCandidates.length > 0) {
          qtColumnIndex = totaisColumnCandidates[0];
        } else if (qtColumnCandidates.length > 1 && headerRowIndex !== -1) {
          // If multiple QT columns were found, choose the one with the most non-empty values
          let maxValueCount = -1;
          let bestQtColumn = qtColumnCandidates[0];
          
          for (const colIndex of qtColumnCandidates) {
            let valueCount = 0;
            // Check the next 50 rows after the header to find which column has more values
            for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 51, jsonData.length); i++) {
              const row = jsonData[i];
              if (Array.isArray(row) && row[colIndex]) {
                const cellValue = String(row[colIndex]).trim();
                if (cellValue !== "" && cellValue !== "0" && cellValue !== "-") {
                  valueCount++;
                }
              }
            }
            
            if (valueCount > maxValueCount) {
              maxValueCount = valueCount;
              bestQtColumn = colIndex;
            }
          }
          
          qtColumnIndex = bestQtColumn;
        } else if (qtColumnCandidates.length === 1) {
          qtColumnIndex = qtColumnCandidates[0];
        }
        
        // Find chapters (rows where ARTIGO column has a number without a dot)
        // A chapter is identified by a pure number (e.g., "1", "2") in the ARTIGO column
        // Sub-items with dots (e.g., "1.1", "2.3") are NOT considered chapters
        // Items are rows that have UN value (QT is optional and defaults to 0 if missing)
        // Comments are handled as follows:
        // - Chapter comments: rows without ARTIGO, UN, and QT but with DESCRIÇÃO (accumulated between chapter and first item)
        //                     OR rows with non-numeric ARTIGO (e.g., "Note", "A") before first item
        // - Item comments: rows with ARTIGO but without UN (parent for child items)
        // - Multi-line comments: rows without ARTIGO, UN, QT after a comment row are part of that comment
        // - Post-item comments: rows with non-numeric ARTIGO after items are appended to the previous item's comments
        // - Duplicate chapter numbers: In single-sheet files, if a chapter number appears again, treat it as a comment for the next item
        //
        // ARTICLE-BASED VIEW MODE:
        // When articleBasedView is true, we extract articles (rows with exactly one dot in ARTIGO)
        // and capture ALL content between articles (both text rows and item rows)
        if (artigoColumnIndex !== -1 && descricaoColumnIndex !== -1) {
          let currentChapterNumber: string | null = null;
          let chapterComments: string[] = [];
          const parentCommentsMap = new Map<string, string[]>();
          let lastCommentArtigo: string | null = null;
          let firstItemFoundInChapter = false;
          const seenChapterNumbers = new Set<string>(); // Track seen chapter numbers to detect duplicates
          
          // Article-based view tracking
          let currentArticleArtigo: string | null = null;
          let currentArticleTitle: string = "";
          let currentArticleContents: Array<{
            type: 'text' | 'item';
            data: string | {
              artigo: string;
              descricao: string;
              un: string;
              qt: number;
              observacoes_empreiteiro?: string;
            };
          }> = [];
          
          jsonData.forEach((row: unknown, rowIndex: number) => {
            if (!Array.isArray(row)) return;
            
            const artigoCell = row[artigoColumnIndex] !== null && row[artigoColumnIndex] !== undefined ? String(row[artigoColumnIndex]).trim() : "";
            const descricaoCell = row[descricaoColumnIndex] !== null && row[descricaoColumnIndex] !== undefined ? String(row[descricaoColumnIndex]).trim() : "";
            
            // Check if this row has QT or UN to determine if it's an item
            const hasQT = qtColumnIndex !== -1 && 
              typeof row[qtColumnIndex] !== 'undefined' && 
              row[qtColumnIndex] !== null && 
              (typeof row[qtColumnIndex] === 'number' || String(row[qtColumnIndex]).trim() !== "");
            const hasUN = unColumnIndex !== -1 && 
              typeof row[unColumnIndex] !== 'undefined' && 
              row[unColumnIndex] !== null && 
              String(row[unColumnIndex]).trim() !== "";
            
            // Skip completely empty rows
            if (!artigoCell && !descricaoCell) return;
            
            // Case 1: Chapter (pure number in ARTIGO column)
            if (/^\d+$/.test(artigoCell) && descricaoCell) {
              // Check if this chapter number was already seen (duplicate chapter)
              // In single-sheet files, treat duplicate chapter numbers as item comments
              if (seenChapterNumbers.has(artigoCell)) {
                // This is a duplicate chapter number - treat it as a comment for the next item
                // Use the ARTIGO as the key for the comment (will be looked up by items)
                if (!parentCommentsMap.has(artigoCell)) {
                  parentCommentsMap.set(artigoCell, []);
                }
                parentCommentsMap.get(artigoCell)!.push(descricaoCell);
                lastCommentArtigo = artigoCell;
                
                // Article-based view: add to current article contents as text
                if (articleBasedView && currentArticleArtigo) {
                  currentArticleContents.push({
                    type: 'text',
                    data: descricaoCell
                  });
                }
              } else {
                // This is a new chapter - process normally
                // Article-based view: save previous article if exists
                if (articleBasedView && currentArticleArtigo && currentChapterNumber) {
                  const chapterNumberToStore = needsSheetPrefix ? `${sheetName}_${currentChapterNumber}` : currentChapterNumber;
                  const artigoToStore = needsSheetPrefix ? `${sheetName}_${currentArticleArtigo}` : currentArticleArtigo;
                  articlesData.push({
                    sheet_name: sheetName,
                    chapter_number: chapterNumberToStore,
                    artigo: artigoToStore,
                    title: currentArticleTitle,
                    contents: [...currentArticleContents]
                  });
                  currentArticleArtigo = null;
                  currentArticleTitle = "";
                  currentArticleContents = [];
                }
                
                // Save previous chapter with its comments
                if (currentChapterNumber && chapterComments.length > 0) {
                  const lastChapter = chaptersToInsert[chaptersToInsert.length - 1];
                  if (lastChapter && lastChapter.chapter_number === currentChapterNumber) {
                    lastChapter.chapter_comments = chapterComments.join('\n');
                  }
                }
                
                // Prefix chapter_number with sheet name if needed for uniqueness
                const chapterNumberToStore = needsSheetPrefix ? `${sheetName}_${artigoCell}` : artigoCell;
                
                chaptersToInsert.push({
                  sheet_name: sheetName,
                  chapter_number: chapterNumberToStore,
                  chapter_name: descricaoCell,
                  chapter_comments: undefined,
                });
                currentChapterNumber = artigoCell;
                seenChapterNumbers.add(artigoCell); // Mark this chapter number as seen
                chapterComments = [];
                firstItemFoundInChapter = false;
                lastCommentArtigo = null;
              }
            }
            // Case 1.5: Article detection (for article-based view)
            // Article is a row with ARTIGO containing exactly ONE dot (e.g., "1.1", "2.3", NOT "1.2.3")
            else if (articleBasedView && artigoCell && /^\d+\.\d+$/.test(artigoCell) && descricaoCell) {
              // Save previous article if exists
              if (currentArticleArtigo && currentChapterNumber) {
                const chapterNumberToStore = needsSheetPrefix ? `${sheetName}_${currentChapterNumber}` : currentChapterNumber;
                const artigoToStore = needsSheetPrefix ? `${sheetName}_${currentArticleArtigo}` : currentArticleArtigo;
                articlesData.push({
                  sheet_name: sheetName,
                  chapter_number: chapterNumberToStore,
                  artigo: artigoToStore,
                  title: currentArticleTitle,
                  contents: [...currentArticleContents]
                });
              }
              
              // Start new article
              currentArticleArtigo = artigoCell;
              currentArticleTitle = descricaoCell;
              currentArticleContents = [];
              
              // Check if the article row itself has UN value
              // If so, add it to the article contents as an item
              if (hasUN) {
                const unValue = unColumnIndex !== -1 && 
                  typeof row[unColumnIndex] !== 'undefined' && 
                  row[unColumnIndex] !== null
                  ? String(row[unColumnIndex]).trim() 
                  : null;
                
                const qtValue = qtColumnIndex !== -1 && 
                  typeof row[qtColumnIndex] !== 'undefined' && 
                  row[qtColumnIndex] !== null
                  ? (typeof row[qtColumnIndex] === 'number' 
                      ? row[qtColumnIndex].toString() 
                      : String(row[qtColumnIndex]).trim())
                  : null;
                const parsedQt = qtValue ? Math.round(parseFloat(qtValue.replace(',', '.')) * 100) / 100 : null;
                
                // Get observacoes_empreiteiro if present
                let observacoesValue: string | null = null;
                if (observacoesColumnIndex !== -1 && 
                    typeof row[observacoesColumnIndex] !== 'undefined' && 
                    row[observacoesColumnIndex] !== null) {
                  const cellValue = row[observacoesColumnIndex];
                  if (typeof cellValue === 'string') {
                    observacoesValue = cellValue.trim() || null;
                  } else if (typeof cellValue === 'number') {
                    observacoesValue = String(cellValue);
                  }
                }
                
                if (unValue) {
                  currentArticleContents.push({
                    type: 'item',
                    data: {
                      artigo: artigoCell,
                      descricao: descricaoCell,
                      un: unValue,
                      qt: parsedQt !== null && !isNaN(parsedQt) ? parsedQt : 0,
                      observacoes_empreiteiro: observacoesValue || undefined
                    }
                  });
                }
              }
            }
            // Case 2: Row with ARTIGO but no UN or QT (comment parent)
            else if (artigoCell && /^\d+\./.test(artigoCell) && !hasUN && !hasQT && descricaoCell) {
              // Check if this ARTIGO is a child of the current lastCommentArtigo
              // If so, treat it as a multi-line comment instead of a new parent
              const isChildOfLastComment = lastCommentArtigo && artigoCell.startsWith(lastCommentArtigo + '.');
              
              // In article-based view, check if this is a child of the current article
              // If so, treat it as article text, not a comment parent
              const isChildOfArticle = articleBasedView && currentArticleArtigo && artigoCell.startsWith(currentArticleArtigo + '.');
              
              if (isChildOfArticle) {
                // Article-based view: this is article text (e.g., "1.2.1" under article "1.2")
                // Don't add to parentCommentsMap, only to article contents
                if (articleBasedView && currentArticleArtigo) {
                  currentArticleContents.push({
                    type: 'text',
                    data: descricaoCell
                  });
                }
              } else if (isChildOfLastComment) {
                // This is a continuation of the previous comment (child ARTIGO)
                // In non-article-based view, add to parentCommentsMap
                if (!articleBasedView) {
                  if (!parentCommentsMap.has(lastCommentArtigo)) {
                    parentCommentsMap.set(lastCommentArtigo, []);
                  }
                  parentCommentsMap.get(lastCommentArtigo)!.push(descricaoCell);
                }
                
                // Article-based view: add to current article contents as text
                if (articleBasedView && currentArticleArtigo) {
                  currentArticleContents.push({
                    type: 'text',
                    data: descricaoCell
                  });
                }
              } else {
                // This is a parent item comment - store it with DESCRIÇÃO
                // In non-article-based view, add to parentCommentsMap
                if (!articleBasedView) {
                  if (!parentCommentsMap.has(artigoCell)) {
                    parentCommentsMap.set(artigoCell, []);
                  }
                  parentCommentsMap.get(artigoCell)!.push(descricaoCell);
                  lastCommentArtigo = artigoCell;
                }
                
                // Article-based view: add to current article contents as text
                if (articleBasedView && currentArticleArtigo) {
                  currentArticleContents.push({
                    type: 'text',
                    data: descricaoCell
                  });
                }
              }
            }
            // Case 3: Multi-line comment (no ARTIGO, UN, QT after a comment row)
            else if (!artigoCell && !hasUN && !hasQT && descricaoCell && (lastCommentArtigo || (articleBasedView && currentArticleArtigo))) {
              // This is part of the previous comment
              // In non-article-based view, add to parentCommentsMap for item inheritance
              if (!articleBasedView && lastCommentArtigo) {
                if (!parentCommentsMap.has(lastCommentArtigo)) {
                  parentCommentsMap.set(lastCommentArtigo, []);
                }
                parentCommentsMap.get(lastCommentArtigo)!.push(descricaoCell);
              }
              
              // Article-based view: add to current article contents as text
              if (articleBasedView && currentArticleArtigo) {
                currentArticleContents.push({
                  type: 'text',
                  data: descricaoCell
                });
              }
            }
            // Case 4: Non-numeric ARTIGO (text, not a number or number.number pattern)
            else if (artigoCell && !/^\d+$/.test(artigoCell) && !/^\d+\./.test(artigoCell) && !hasUN && !hasQT && descricaoCell) {
              // This is a row with non-numeric ARTIGO (e.g., "Note", "A", "Special")
              
              // In article-based view, treat as article text
              if (articleBasedView && currentArticleArtigo) {
                currentArticleContents.push({
                  type: 'text',
                  data: descricaoCell
                });
              }
              // In non-article-based view, handle as before
              else if (currentChapterNumber && !firstItemFoundInChapter) {
                // Before first item → add to chapter comments
                chapterComments.push(descricaoCell);
                lastCommentArtigo = null;
              } else if (firstItemFoundInChapter && itemsToInsert.length > 0) {
                // After first item → add to the last inserted item's comments
                const lastItem = itemsToInsert[itemsToInsert.length - 1];
                if (lastItem.item_comments) {
                  lastItem.item_comments += '\n' + descricaoCell;
                } else {
                  lastItem.item_comments = descricaoCell;
                }
              }
            }
            // Case 5: Chapter comment (no ARTIGO, UN, QT but has DESCRIÇÃO - only before first item)
            else if (!artigoCell && !hasUN && !hasQT && descricaoCell && currentChapterNumber && !firstItemFoundInChapter) {
              chapterComments.push(descricaoCell);
              lastCommentArtigo = null;
              
              // Article-based view: add to current article contents as text
              if (articleBasedView && currentArticleArtigo) {
                currentArticleContents.push({
                  type: 'text',
                  data: descricaoCell
                });
              }
            }
            // Case 6: Item (has UN - QT is optional)
            else if (hasUN) {
              // Mark that we found the first item in this chapter
              if (currentChapterNumber && !firstItemFoundInChapter) {
                firstItemFoundInChapter = true;
                // Save chapter comments now that we've reached the first item
                if (chapterComments.length > 0) {
                  const lastChapter = chaptersToInsert[chaptersToInsert.length - 1];
                  if (lastChapter && lastChapter.chapter_number === currentChapterNumber) {
                    lastChapter.chapter_comments = chapterComments.join('\n');
                  }
                  chapterComments = [];
                }
              }
              
              // Determine ARTIGO for this item
              let itemArtigo = artigoCell;
              if (!artigoCell && lastCommentArtigo) {
                // Item without ARTIGO assumes the previous comment ARTIGO
                itemArtigo = lastCommentArtigo;
              }
              
              // Prefix item artigo with sheet name if needed
              const itemArtigoToStore = (needsSheetPrefix && itemArtigo) ? `${sheetName}_${itemArtigo}` : itemArtigo;
              
              // Use the current chapter context
              const chapterNumber = needsSheetPrefix ? `${sheetName}_${currentChapterNumber}` : currentChapterNumber;
              
              // Get all values - extract even if empty to ensure proper data flow
              const unValue = unColumnIndex !== -1 && 
                typeof row[unColumnIndex] !== 'undefined' && 
                row[unColumnIndex] !== null
                ? String(row[unColumnIndex]).trim() 
                : null;
              
              // Enhanced QT value extraction to handle numeric and general formats
              const qtValue = qtColumnIndex !== -1 && 
                typeof row[qtColumnIndex] !== 'undefined' && 
                row[qtColumnIndex] !== null
                ? (typeof row[qtColumnIndex] === 'number' 
                    ? row[qtColumnIndex].toString() 
                    : String(row[qtColumnIndex]).trim())
                : null;
              const parsedQt = qtValue ? Math.round(parseFloat(qtValue.replace(',', '.')) * 100) / 100 : null;
              
              const precoValue = precoUnitarioColumnIndex !== -1 && 
                typeof row[precoUnitarioColumnIndex] !== 'undefined' && 
                row[precoUnitarioColumnIndex] !== null
                ? String(row[precoUnitarioColumnIndex]).trim()
                : null;
              const parsedPreco = precoValue ? parseFloat(precoValue.replace(',', '.')) : null;
              
              // Handle observacoes_empreiteiro - can be text or potentially an image reference
              let observacoesValue: string | null = null;
              if (observacoesColumnIndex !== -1 && 
                  typeof row[observacoesColumnIndex] !== 'undefined' && 
                  row[observacoesColumnIndex] !== null) {
                const cellValue = row[observacoesColumnIndex];
                // Handle different types of cell values
                if (typeof cellValue === 'string') {
                  observacoesValue = cellValue.trim() || null;
                } else if (typeof cellValue === 'number') {
                  observacoesValue = String(cellValue);
                } else if (cellValue && typeof cellValue === 'object') {
                  // Handle potential image or complex cell content
                  // For now, convert to string representation
                  observacoesValue = JSON.stringify(cellValue);
                }
              }
              
              // Look for parent comments (e.g., for "1.2.1", look for "1.2")
              let itemComment: string | null = null;
              if (itemArtigo) {
                // First check if this ARTIGO itself has comments (for inherited ARTIGO case)
                let parentComments = parentCommentsMap.get(itemArtigo);
                
                // If not found, look for the parent ARTIGO
                if (!parentComments || parentComments.length === 0) {
                  const parts = itemArtigo.split('.');
                  if (parts.length > 1) {
                    // For items like "1.2.1", check for parent "1.2"
                    const parentArtigo = parts.slice(0, -1).join('.');
                    parentComments = parentCommentsMap.get(parentArtigo);
                  }
                }
                
                if (parentComments && parentComments.length > 0) {
                  itemComment = parentComments.join('\n');
                }
              }
              
              // Enhance description with AI if available
              let enhancedDescricao = descricaoCell;
              if (aiAnalysisResult && itemArtigoToStore && aiAnalysisResult.enhancedDescriptions[itemArtigoToStore]) {
                enhancedDescricao = aiAnalysisResult.enhancedDescriptions[itemArtigoToStore];
                console.log(`AI enhanced description for ${itemArtigoToStore}: ${enhancedDescricao}`);
              }
              
              itemsToInsert.push({
                sheet_name: sheetName,
                chapter_number: chapterNumber,
                artigo: itemArtigoToStore,
                descricao: enhancedDescricao,
                un: unValue || null,
                qt: (parsedQt !== null && !isNaN(parsedQt)) ? parsedQt : null,
                preco_unitario: (parsedPreco !== null && !isNaN(parsedPreco)) ? parsedPreco : null,
                item_comments: itemComment,
                observacoes_empreiteiro: observacoesValue || null,
                observacoes_image_url: null, // Future enhancement: extract images from Excel
                excel_row_index: rowIndex, // Store the Excel row index for image matching
              });
              
              // Article-based view: add to current article contents as item
              if (articleBasedView && currentArticleArtigo && unValue) {
                currentArticleContents.push({
                  type: 'item',
                  data: {
                    artigo: itemArtigoToStore,
                    descricao: enhancedDescricao,
                    un: unValue,
                    qt: parsedQt !== null && !isNaN(parsedQt) ? parsedQt : 0,
                    observacoes_empreiteiro: observacoesValue || undefined
                  }
                });
              }
            }
          });
          
          // Article-based view: save the last article if exists
          if (articleBasedView && currentArticleArtigo && currentChapterNumber) {
            const chapterNumberToStore = needsSheetPrefix ? `${sheetName}_${currentChapterNumber}` : currentChapterNumber;
            const artigoToStore = needsSheetPrefix ? `${sheetName}_${currentArticleArtigo}` : currentArticleArtigo;
            articlesData.push({
              sheet_name: sheetName,
              chapter_number: chapterNumberToStore,
              artigo: artigoToStore,
              title: currentArticleTitle,
              contents: [...currentArticleContents]
            });
          }
          
          // Save comments for the last chapter
          if (currentChapterNumber && chapterComments.length > 0) {
            const lastChapter = chaptersToInsert[chaptersToInsert.length - 1];
            if (lastChapter && lastChapter.chapter_number === currentChapterNumber) {
              lastChapter.chapter_comments = chapterComments.join('\n');
            }
          }
        }
      });
      
      // Log extracted data for debugging
      console.log("Excel analysis summary:");
      console.log("- Tabs to insert:", tabsToInsert.length);
      console.log("- Chapters to insert:", chaptersToInsert.length);
      console.log("- Items to insert:", itemsToInsert.length);
      console.log("- Articles extracted:", articlesData.length);
      if (articlesData.length === 0) {
        console.warn("⚠️ No articles were extracted from Excel. Article-based view may not work.");
        console.warn("This could be due to:");
        console.warn("  1. Excel structure doesn't match expected format (no items with one dot in ARTIGO column)");
        console.warn("  2. No items with format like '1.1', '2.3' etc. were found");
        console.warn("  3. All extracted content was classified as items or text, not articles");
      }

      // Insert tabs into database
      let insertedTabs: OrcamentoTab[] = [];
      const sheetNameToTabId = new Map<string, string>();
      
      if (tabsToInsert.length > 0) {
        console.log("Inserting", tabsToInsert.length, "tabs into database:", tabsToInsert.map(t => t.name));
        const { data, error: tabError } = await supabase
          .from("orcamento_tabs")
          .insert(tabsToInsert)
          .select();
        
        if (tabError) {
          console.error("Error inserting tabs:", tabError);
          throw new Error(`Failed to create tabs: ${tabError.message}`);
        }
        insertedTabs = data || [];
        console.log("Successfully inserted", insertedTabs.length, "tabs");
        
        // Create a map of sheet names to tab IDs
        // For single-sheet files, map the single sheet to "Principal" tab
        // For multi-sheet files, map each sheet to its corresponding tab
        // For article-based view, map ALL sheets to "Principal" tab
        if (hasMultipleSheets) {
          insertedTabs.forEach(tab => {
            sheetNameToTabId.set(tab.name, tab.id);
          });
        } else {
          // Map all sheets to the "Principal" tab
          const principalTab = insertedTabs.find(tab => tab.name === "Principal");
          if (principalTab) {
            workbook.SheetNames.forEach(sheetName => {
              sheetNameToTabId.set(sheetName, principalTab.id);
            });
          }
        }
      }
      
      // Update chapters with tab IDs
      const chaptersWithTabIds = chaptersToInsert.map(chapter => ({
        tab_id: sheetNameToTabId.get(chapter.sheet_name!) || null,
        chapter_number: chapter.chapter_number,
        chapter_name: chapter.chapter_name,
        chapter_comments: chapter.chapter_comments || null,
      }));

      // Insert chapters into database
      if (chaptersWithTabIds.length > 0) {
        console.log("Inserting", chaptersWithTabIds.length, "chapters into database");
        const { data: insertedChapters, error: chapterError } = await supabase
          .from("orcamento_chapters")
          .insert(chaptersWithTabIds)
          .select();
        if (chapterError) {
          console.error("Error inserting chapters:", chapterError);
          throw new Error(`Failed to create chapters: ${chapterError.message}`);
        }
        console.log("Successfully inserted", insertedChapters?.length || 0, "chapters");
        
        // Create a map of (sheet_name + chapter_number) to chapter IDs
        // We need to use the original sheet_name from chaptersToInsert since it's not in the database
        const chapterMap = new Map<string, string>();
        insertedChapters.forEach((chapter, index) => {
          // The insertedChapters array should be in the same order as chaptersToInsert
          const originalChapter = chaptersToInsert[index];
          if (originalChapter && originalChapter.sheet_name) {
            const key = `${originalChapter.sheet_name}_${chapter.chapter_number}`;
            chapterMap.set(key, chapter.id);
          }
        });
        
        // Update items with chapter IDs
        const itemsWithChapterIds = itemsToInsert.map(item => {
          const key = `${item.sheet_name}_${item.chapter_number}`;
          const chapterId = chapterMap.get(key);
          return {
            chapter_id: chapterId,
            artigo: item.artigo,
            descricao: item.descricao,
            un: item.un,
            qt: item.qt,
            preco_unitario: item.preco_unitario,
            item_comments: item.item_comments,
            observacoes_empreiteiro: item.observacoes_empreiteiro,
            observacoes_image_url: item.observacoes_image_url,
          };
        }).filter(item => item.chapter_id); // Only include items with valid chapter_id
        
        console.log("Processing", itemsToInsert.length, "items,", itemsWithChapterIds.length, "have valid chapter IDs");
        
        // Insert items into database
        if (itemsWithChapterIds.length > 0) {
          console.log("Inserting", itemsWithChapterIds.length, "items into database");
          const { data: insertedItems, error: itemError } = await supabase
            .from("orcamento_items")
            .insert(itemsWithChapterIds)
            .select();
          if (itemError) {
            console.error("Error inserting items:", itemError);
            throw new Error(`Failed to create items: ${itemError.message}`);
          }
          console.log("Successfully inserted", insertedItems?.length || 0, "items");
          
          // Upload extracted images and match them to items
          if (extractedImages.length > 0 && insertedItems) {
            for (const image of extractedImages) {
              try {
                // Find the corresponding item by matching sheet name and row position
                // Images in Excel are positioned by row, so we match based on proximity
                const matchingItems = insertedItems.filter(item => {
                  const itemData = itemsToInsert.find(i => 
                    i.artigo === item.artigo && 
                    i.sheet_name === image.sheetName
                  );
                  return !!itemData;
                });
                
                if (matchingItems.length > 0) {
                  // If we have row info from the image, use it to find the best match
                  let targetItem = matchingItems[0];
                  
                  if (image.row !== undefined && image.row !== null) {
                    // Find the item with the closest row index to the image row
                    let minDistance = Infinity;
                    for (const item of matchingItems) {
                      const itemData = itemsToInsert.find(i => 
                        i.artigo === item.artigo && 
                        i.sheet_name === image.sheetName
                      );
                      if (itemData?.excel_row_index !== undefined) {
                        const distance = Math.abs(itemData.excel_row_index - image.row);
                        if (distance < minDistance) {
                          minDistance = distance;
                          targetItem = item;
                        }
                      }
                    }
                  }
                  
                  // Upload image to Supabase storage
                  const fileName = `${id}/${Date.now()}_${image.imageId}.${image.extension}`;
                  const { error: uploadError } = await supabase.storage
                    .from('orcamento-observacoes')
                    .upload(fileName, image.buffer, {
                      contentType: `image/${image.extension}`,
                      upsert: false
                    });
                  
                  if (!uploadError) {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                      .from('orcamento-observacoes')
                      .getPublicUrl(fileName);
                    
                    // Update item with image URL
                    await supabase
                      .from('orcamento_items')
                      .update({ observacoes_image_url: publicUrl })
                      .eq('id', targetItem.id);
                  }
                }
              } catch (error) {
                console.error('Error uploading image:', error);
                // Continue with other images even if one fails
              }
            }
          }
        }
      }

      // Mark file as analyzed
      console.log("Marking file as analyzed");
      const { error: fileError } = await supabase
        .from("orcamento_files")
        .update({ analyzed: true })
        .eq("id", fileId);
      if (fileError) {
        console.error("Error marking file as analyzed:", fileError);
        throw new Error(`Failed to mark file as analyzed: ${fileError.message}`);
      }
      
      console.log("File analysis completed successfully");
        
        // Store articles data in database for persistence
        if (articleBasedView && articlesData.length > 0) {
          // Create a map of chapter_number to chapter_id
          // Get all inserted chapters (not just for first tab)
          const tabIds = insertedTabs.map(t => t.id);
          const { data: insertedChapters } = await supabase
            .from("orcamento_chapters")
            .select("id, chapter_number")
            .in("tab_id", tabIds);
          
          if (insertedChapters) {
            const chapterMap = new Map<string, string>();
            insertedChapters.forEach(chapter => {
              chapterMap.set(chapter.chapter_number, chapter.id);
            });
            
            // Prepare articles for insertion
            const articlesToInsert = articlesData.map(article => {
              const chapterId = chapterMap.get(article.chapter_number);
              if (!chapterId) {
                console.warn(`No chapter_id found for chapter_number: ${article.chapter_number}`);
                return null;
              }
              return {
                chapter_id: chapterId,
                artigo: article.artigo,
                title: article.title,
                sheet_name: article.sheet_name,
                contents: article.contents
              };
            }).filter(a => a !== null);
            
            // Insert articles into database
            if (articlesToInsert.length > 0) {
              console.log("Attempting to insert", articlesToInsert.length, "articles into database");
              const { error: articlesError } = await supabase
                .from("orcamento_articles")
                .insert(articlesToInsert);
              
              if (articlesError) {
                console.error("Error inserting articles:", articlesError);
                console.error("Article insertion failed. Details:", articlesError.message);
                // Don't throw - articles in sessionStorage can still work as fallback
              } else {
                console.log("✅ Successfully inserted", articlesToInsert.length, "articles into database");
              }
            } else {
              console.warn("⚠️ No valid articles to insert (all articles may be missing chapter IDs)");
            }
          }
        }
        
        // Return articlesData for article-based view processing and AI insights
        return { articlesData, articleBasedView, aiAnalysisResult };
      } catch (error) {
        console.error("Error in analyzeMutation:", error);
        // Re-throw to let the onError handler display the toast
        throw error;
      }
    },
    onSuccess: async (data) => {
      setIsAnalyzing(false);
      
      // Store AI insights if available
      if (data && data.aiAnalysisResult) {
        setAiInsights(data.aiAnalysisResult);
        // Store uncertain rows if available
        if (data.aiAnalysisResult.uncertainRows && data.aiAnalysisResult.uncertainRows.length > 0) {
          setUncertainRows(data.aiAnalysisResult.uncertainRows);
        }
      }
      
      // Invalidate and refetch queries in sequence to ensure data loads properly
      await queryClient.invalidateQueries({ queryKey: ["orcamento_files", id, import.meta.env.VITE_SUPABASE_URL] });
      await queryClient.refetchQueries({ queryKey: ["orcamento_files", id, import.meta.env.VITE_SUPABASE_URL] });
      
      await queryClient.invalidateQueries({ queryKey: ["orcamento_tabs", id, import.meta.env.VITE_SUPABASE_URL] });
      await queryClient.refetchQueries({ queryKey: ["orcamento_tabs", id, import.meta.env.VITE_SUPABASE_URL] });
      
      await queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
      await queryClient.refetchQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
      
      await queryClient.invalidateQueries({ queryKey: ["orcamento_items", id, import.meta.env.VITE_SUPABASE_URL] });
      await queryClient.refetchQueries({ queryKey: ["orcamento_items", id, import.meta.env.VITE_SUPABASE_URL] });
      
      await queryClient.invalidateQueries({ queryKey: ["orcamento_articles", id, import.meta.env.VITE_SUPABASE_URL] });
      await queryClient.refetchQueries({ queryKey: ["orcamento_articles", id, import.meta.env.VITE_SUPABASE_URL] });
      
      // Keep sessionStorage as fallback for backward compatibility
      if (data && data.articleBasedView && data.articlesData) {
        sessionStorage.setItem(`articles_${id}`, JSON.stringify(data.articlesData));
      }
      
      // Show success message based on analysis type
      if (isAIAnalysis) {
        toast.success(t('orcamento.aiAnalyzeSuccess'));
      } else {
        toast.success(t('orcamento.analyzeSuccess'));
      }
      
      // Reset AI analysis flag
      setIsAIAnalysis(false);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      setIsAIAnalysis(false);
      console.error("Analysis mutation error:", error);
      
      // Try to extract a meaningful error message
      let errorMessage = t('orcamento.analyzeError');
      if (error instanceof Error) {
        // Append the specific error message for debugging
        console.error("Detailed error:", error.message);
        if (error.message.includes("Invalid file URL")) {
          errorMessage += " - Invalid file URL format";
        } else if (error.message.includes("Failed to download")) {
          errorMessage += " - Failed to download file from storage";
        } else if (error.message.includes("Failed to read Excel")) {
          errorMessage += " - Invalid Excel file format";
        } else if (error.message.includes("no sheets")) {
          errorMessage += " - Excel file has no sheets";
        }
      }
      
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      // Get file info first to delete from storage
      const { data: fileData, error: fileQueryError } = await supabase
        .from("orcamento_files")
        .select("file_url")
        .eq("id", fileId)
        .single();
      if (fileQueryError) throw fileQueryError;

      // Extract file path from URL if it's not a placeholder
      if (fileData.file_url && !fileData.file_url.startsWith('placeholder_')) {
        try {
          // Extract the path from the public URL
          const urlParts = fileData.file_url.split('/orcamento-files/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];
            const { error: storageError } = await supabase.storage
              .from('orcamento-files')
              .remove([filePath]);
            // Don't throw on storage error, just log it
            if (storageError) console.error('Storage deletion error:', storageError);
          }
        } catch (e) {
          console.error('Error deleting from storage:', e);
        }
      }

      // Delete all observacoes images associated with items in this orcamento
      // First, get all chapters for this orcamento through tabs
      const { data: tabs } = await supabase
        .from("orcamento_tabs")
        .select("id")
        .eq("orcamento_id", id);
      
      if (tabs && tabs.length > 0) {
        const tabIds = tabs.map(t => t.id);
        
        // Get all chapters for these tabs
        const { data: chapters } = await supabase
          .from("orcamento_chapters")
          .select("id")
          .in("tab_id", tabIds);
        
        if (chapters && chapters.length > 0) {
          const chapterIds = chapters.map(c => c.id);
          
          // Get all items with image URLs for these chapters
          const { data: itemsWithImages } = await supabase
            .from("orcamento_items")
            .select("observacoes_image_url")
            .in("chapter_id", chapterIds)
            .not("observacoes_image_url", "is", null);
          
          // Delete each image from storage
          if (itemsWithImages && itemsWithImages.length > 0) {
            for (const item of itemsWithImages) {
              if (item.observacoes_image_url) {
                try {
                  // Extract the path from the public URL
                  const urlParts = item.observacoes_image_url.split('/orcamento-observacoes/');
                  if (urlParts.length > 1) {
                    const imagePath = urlParts[1];
                    await supabase.storage
                      .from('orcamento-observacoes')
                      .remove([imagePath]);
                  }
                } catch (e) {
                  console.error('Error deleting observacoes image:', e);
                }
              }
            }
          }
        }
      }

      // Delete associated tabs (which will cascade delete chapters and items)
      const { error: tabsError } = await supabase
        .from("orcamento_tabs")
        .delete()
        .eq("orcamento_id", id);
      if (tabsError) throw tabsError;

      // Clean up sessionStorage
      if (id) {
        sessionStorage.removeItem(`articles_${id}`);
      }

      // Delete the file record
      const { error: fileError } = await supabase
        .from("orcamento_files")
        .delete()
        .eq("id", fileId);
      if (fileError) throw fileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_files", id, import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["orcamento_tabs", id, import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["orcamento_items", id, import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["orcamento_articles", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('orcamento.deleteSuccess') || 'File deleted successfully');
    },
    onError: () => {
      toast.error(t('orcamento.deleteError') || 'Failed to delete file');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ itemId, imageFile }: { itemId: string; imageFile: File }) => {
      // Upload image to Supabase storage
      const fileName = `${id}/${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('orcamento-observacoes')
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('orcamento-observacoes')
        .getPublicUrl(fileName);
      
      // Update item with image URL
      const { error: updateError } = await supabase
        .from('orcamento_items')
        .update({ observacoes_image_url: publicUrl })
        .eq('id', itemId);
      
      if (updateError) throw updateError;
      
      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_items", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('orcamento.imageUploadSuccess') || 'Image uploaded successfully');
    },
    onError: () => {
      toast.error(t('orcamento.imageUploadError') || 'Failed to upload image');
    },
  });

  const updateChapterSpecialitiesMutation = useMutation({
    mutationFn: async ({ chapterId, specialityIds }: { chapterId: string; specialityIds: string[] }) => {
      // Delete existing chapter specialities
      const { error: deleteError } = await supabase
        .from('chapter_specialities')
        .delete()
        .eq('chapter_id', chapterId);
      
      if (deleteError) throw deleteError;
      
      // Insert new chapter specialities
      if (specialityIds.length > 0) {
        const { error: insertError } = await supabase
          .from('chapter_specialities')
          .insert(
            specialityIds.map(specialityId => ({
              chapter_id: chapterId,
              speciality_id: specialityId,
            }))
          );
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter_specialities", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Chapter specialities updated successfully');
      // Clean up state after successful mutation
      setEditingChapterId(null);
      setPendingChapterSpecialities([]);
    },
    onError: () => {
      toast.error('Failed to update chapter specialities');
      // Clean up state even on error
      setEditingChapterId(null);
      setPendingChapterSpecialities([]);
    },
  });

  const updateItemSpecialitiesMutation = useMutation({
    mutationFn: async ({ itemId, specialityIds }: { itemId: string; specialityIds: string[] }) => {
      // Delete existing item specialities
      const { error: deleteError } = await supabase
        .from('item_specialities')
        .delete()
        .eq('item_id', itemId);
      
      if (deleteError) throw deleteError;
      
      // Insert new item specialities
      if (specialityIds.length > 0) {
        const { error: insertError } = await supabase
          .from('item_specialities')
          .insert(
            specialityIds.map(specialityId => ({
              item_id: itemId,
              speciality_id: specialityId,
            }))
          );
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item_specialities", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Item specialities updated successfully');
      // Clean up state after successful mutation
      setEditingItemId(null);
      setPendingItemSpecialities([]);
    },
    onError: () => {
      toast.error('Failed to update item specialities');
      // Clean up state even on error
      setEditingItemId(null);
      setPendingItemSpecialities([]);
    },
  });

  const moveChapterMutation = useMutation({
    mutationFn: async ({ chapterId, newTabId }: { chapterId: string; newTabId: string }) => {
      const { error } = await supabase
        .from('orcamento_chapters')
        .update({ tab_id: newTabId })
        .eq('id', chapterId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Chapter moved successfully');
    },
    onError: () => {
      toast.error('Failed to move chapter');
    },
  });

  const moveSheetMutation = useMutation({
    mutationFn: async ({ chapterIds, newTabId }: { chapterIds: string[]; newTabId: string }) => {
      const { error } = await supabase
        .from('orcamento_chapters')
        .update({ tab_id: newTabId })
        .in('id', chapterIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Sheet moved successfully');
    },
    onError: () => {
      toast.error('Failed to move sheet');
    },
  });

  // CRUD Mutations for Separators (Tabs)
  const createSeparatorMutation = useMutation({
    mutationFn: async ({ name, displayOrder }: { name: string; displayOrder: number }) => {
      const { error } = await supabase
        .from('orcamento_tabs')
        .insert([{ orcamento_id: id, name, display_order: displayOrder }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_tabs", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Separator created successfully');
      setSeparatorDialog({ open: false, mode: 'create' });
    },
    onError: () => {
      toast.error('Failed to create separator');
    },
  });

  const updateSeparatorMutation = useMutation({
    mutationFn: async ({ tabId, name }: { tabId: string; name: string }) => {
      const { error } = await supabase
        .from('orcamento_tabs')
        .update({ name })
        .eq('id', tabId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_tabs", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Separator updated successfully');
      setSeparatorDialog({ open: false, mode: 'create' });
    },
    onError: () => {
      toast.error('Failed to update separator');
    },
  });

  const deleteSeparatorMutation = useMutation({
    mutationFn: async (tabId: string) => {
      const { error } = await supabase
        .from('orcamento_tabs')
        .delete()
        .eq('id', tabId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_tabs", id, import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Separator deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete separator');
    },
  });

  // CRUD Mutations for Chapters
  const createChapterMutation = useMutation({
    mutationFn: async ({ tabId, chapterNumber, chapterName, chapterComments }: { tabId: string; chapterNumber: string; chapterName: string; chapterComments?: string }) => {
      const { error } = await supabase
        .from('orcamento_chapters')
        .insert([{ tab_id: tabId, chapter_number: chapterNumber, chapter_name: chapterName, chapter_comments: chapterComments }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Chapter created successfully');
      setChapterDialog({ open: false, mode: 'create' });
    },
    onError: () => {
      toast.error('Failed to create chapter');
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: async ({ chapterId, chapterName, chapterComments }: { chapterId: string; chapterName: string; chapterComments?: string }) => {
      const { error } = await supabase
        .from('orcamento_chapters')
        .update({ chapter_name: chapterName, chapter_comments: chapterComments })
        .eq('id', chapterId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Chapter updated successfully');
      setChapterDialog({ open: false, mode: 'create' });
    },
    onError: () => {
      toast.error('Failed to update chapter');
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: async (chapterId: string) => {
      const { error } = await supabase
        .from('orcamento_chapters')
        .delete()
        .eq('id', chapterId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["orcamento_items", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Chapter deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete chapter');
    },
  });

  // CRUD Mutations for Articles
  const createArticleMutation = useMutation({
    mutationFn: async ({ chapterId, artigo, title, contents }: { chapterId: string; artigo: string; title: string; contents: ArticleContent[] }) => {
      const { error } = await supabase
        .from('orcamento_articles')
        .insert([{ chapter_id: chapterId, artigo, title, contents }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_articles", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Article created successfully');
      setArticleDialog({ open: false, mode: 'create' });
    },
    onError: () => {
      toast.error('Failed to create article');
    },
  });

  const updateArticleMutation = useMutation({
    mutationFn: async ({ articleId, title, contents }: { articleId: string; title: string; contents: ArticleContent[] }) => {
      const { error } = await supabase
        .from('orcamento_articles')
        .update({ title, contents })
        .eq('id', articleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_articles", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Article updated successfully');
      setArticleDialog({ open: false, mode: 'create' });
    },
    onError: (error) => {
      console.error('Failed to update article:', error);
      toast.error('Failed to update article');
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase
        .from('orcamento_articles')
        .delete()
        .eq('id', articleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_articles", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Article deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete article');
    },
  });

  // CRUD Mutations for Items
  const createItemMutation = useMutation({
    mutationFn: async ({ chapterId, artigo, descricao, un, qt, precoUnitario, itemComments }: { 
      chapterId: string; 
      artigo: string; 
      descricao: string; 
      un: string | null; 
      qt: number | null; 
      precoUnitario: number | null;
      itemComments?: string | null;
    }) => {
      const { error } = await supabase
        .from('orcamento_items')
        .insert([{ chapter_id: chapterId, artigo, descricao, un, qt, preco_unitario: precoUnitario, item_comments: itemComments, observacoes_empreiteiro: null, observacoes_image_url: null }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_items", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Item created successfully');
      setItemDialog({ open: false, mode: 'create' });
    },
    onError: () => {
      toast.error('Failed to create item');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, artigo, descricao, un, qt, precoUnitario, itemComments }: { 
      itemId: string; 
      artigo: string; 
      descricao: string; 
      un: string | null; 
      qt: number | null; 
      precoUnitario: number | null;
      itemComments?: string | null;
    }) => {
      const { error } = await supabase
        .from('orcamento_items')
        .update({ artigo, descricao, un, qt, preco_unitario: precoUnitario, item_comments: itemComments })
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_items", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Item updated successfully');
      setItemDialog({ open: false, mode: 'create' });
    },
    onError: () => {
      toast.error('Failed to update item');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('orcamento_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento_items", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Item deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete item');
    },
  });

  // Speciality Mutations for Tabs/Separators
  const updateTabSpecialitiesMutation = useMutation({
    mutationFn: async ({ tabId, specialityIds }: { tabId: string; specialityIds: string[] }) => {
      // Delete existing tab specialities
      const { error: deleteError } = await supabase
        .from('tab_specialities')
        .delete()
        .eq('tab_id', tabId);
      
      if (deleteError) throw deleteError;
      
      // Insert new tab specialities
      if (specialityIds.length > 0) {
        const { error: insertError } = await supabase
          .from('tab_specialities')
          .insert(
            specialityIds.map(specialityId => ({
              tab_id: tabId,
              speciality_id: specialityId,
            }))
          );
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tab_specialities", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Separator specialities updated successfully');
    },
    onError: () => {
      toast.error('Failed to update separator specialities');
    },
  });

  // Speciality Mutations for Articles
  const updateArticleSpecialitiesMutation = useMutation({
    mutationFn: async ({ articleId, specialityIds }: { articleId: string; specialityIds: string[] }) => {
      // Delete existing article specialities
      const { error: deleteError } = await supabase
        .from('article_specialities')
        .delete()
        .eq('article_id', articleId);
      
      if (deleteError) throw deleteError;
      
      // Insert new article specialities
      if (specialityIds.length > 0) {
        const { error: insertError } = await supabase
          .from('article_specialities')
          .insert(
            specialityIds.map(specialityId => ({
              article_id: articleId,
              speciality_id: specialityId,
            }))
          );
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article_specialities", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success('Article specialities updated successfully');
    },
    onError: () => {
      toast.error('Failed to update article specialities');
    },
  });



  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleAnalyze = () => {
    if (currentFile) {
      console.log("Starting analysis for file:", currentFile.id, currentFile.file_name);
      console.log("File URL:", currentFile.file_url);
      console.log("Settings - articleBasedView: always enabled");
      setIsAnalyzing(true);
      setIsAIAnalysis(false);
      analyzeMutation.mutate({ fileId: currentFile.id, isAIAnalysis: false });
    } else {
      console.error("handleAnalyze called but currentFile is null");
      toast.error("No file selected for analysis");
    }
  };
  
  const handleAIAnalyze = () => {
    if (currentFile) {
      console.log("Starting AI analysis for file:", currentFile.id, currentFile.file_name);
      console.log("File URL:", currentFile.file_url);
      console.log("Settings - articleBasedView: always enabled, AI analysis: enabled");
      setIsAnalyzing(true);
      setIsAIAnalysis(true);
      analyzeMutation.mutate({ fileId: currentFile.id, isAIAnalysis: true });
    } else {
      console.error("handleAIAnalyze called but currentFile is null");
      toast.error("No file selected for analysis");
    }
  };

  // Handler for accepting an uncertain row
  const handleAcceptUncertainRow = (row: UncertainRow, modifiedData?: UncertainRow['suggestedData']) => {
    const rowKey = `${row.sheetName}-${row.rowIndex}`;
    setAcceptedRows(prev => new Set(prev).add(rowKey));
    setRejectedRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(rowKey);
      return newSet;
    });
    setUncertainRows(prev => prev.filter(r => `${r.sheetName}-${r.rowIndex}` !== rowKey));
    
    // Mark this item as AI-accepted for visual highlighting
    // Use artigo as the key if available, otherwise use the row key
    const itemKey = row.artigo || rowKey;
    setAiAcceptedItems(prev => new Set(prev).add(itemKey));
    
    // Show success message
    toast.success(
      language === 'en' 
        ? 'Row accepted and will be included in the analysis' 
        : 'Linha aceite e será incluída na análise'
    );
    
    // TODO: Here we could add the row to the database or trigger a re-analysis
    console.log('Accepted row:', row, 'with modified data:', modifiedData);
  };

  // Handler for rejecting an uncertain row
  const handleRejectUncertainRow = (row: UncertainRow) => {
    const rowKey = `${row.sheetName}-${row.rowIndex}`;
    setRejectedRows(prev => new Set(prev).add(rowKey));
    setAcceptedRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(rowKey);
      return newSet;
    });
    setUncertainRows(prev => prev.filter(r => `${r.sheetName}-${r.rowIndex}` !== rowKey));
    
    // Show success message
    toast.success(
      language === 'en' 
        ? 'Row rejected and will be excluded from the analysis' 
        : 'Linha rejeitada e será excluída da análise'
    );
    
    console.log('Rejected row:', row);
  };

  const handleDeleteFile = () => {
    if (currentFile) {
      deleteMutation.mutate(currentFile.id);
    }
  };

  const handleImageUpload = (itemId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        uploadImageMutation.mutate({ itemId, imageFile: file });
      }
    };
    input.click();
  };

  const currentFile = files && files.length > 0 ? files[0] : null;
  const hasFile = !!currentFile;
  const isAnalyzed = currentFile?.analyzed || false;

  // Helper function to clean chapter name - remove leading numbers and underscores
  const cleanChapterName = (name: string): string => {
    // Remove leading numbers followed by dots, spaces, underscores, and hyphens
    return name
      .replace(/^[\d._\-\s]+/, '') // Remove leading numbers, dots, underscores, hyphens, and spaces
      .replace(/_/g, ' ') // Replace remaining underscores with spaces
      .trim();
  };

  // Get specialities for a chapter
  const getChapterSpecialityIds = (chapterId: string): string[] => {
    if (!chapterSpecialities) return [];
    return chapterSpecialities
      .filter(cs => cs.chapter_id === chapterId)
      .map(cs => cs.speciality_id);
  };

  // Get specialities explicitly set for an item
  const getItemOwnSpecialityIds = (itemId: string): string[] => {
    if (!itemSpecialities) return [];
    return itemSpecialities
      .filter(is => is.item_id === itemId)
      .map(is => is.speciality_id);
  };

  // Get all specialities for an item (own + inherited from chapter)
  const getItemSpecialityIds = (itemId: string, chapterId: string): string[] => {
    const ownSpecialities = getItemOwnSpecialityIds(itemId);
    // If item has its own specialities set, return only those
    if (ownSpecialities.length > 0) {
      return ownSpecialities;
    }
    // Otherwise, inherit from chapter
    return getChapterSpecialityIds(chapterId);
  };

  // Get speciality objects by IDs
  const getSpecialitiesByIds = (ids: string[]): Speciality[] => {
    if (!specialities) return [];
    return specialities.filter(s => ids.includes(s.id));
  };

  // Get specialities for an article
  const getArticleSpecialityIds = (articleId: string): string[] => {
    if (!articleSpecialities) return [];
    return articleSpecialities
      .filter(as => as.article_id === articleId)
      .map(as => as.speciality_id);
  };

  // Get specialities for an item in an article context (with full inheritance chain)
  const getItemSpecialitiesInArticle = (
    itemArtigo: string, 
    chapterId: string, 
    articleId?: string
  ): Speciality[] => {
    // Find the actual item from the database by artigo and chapter_id
    const dbItem = items?.find(item => 
      item.artigo === itemArtigo && item.chapter_id === chapterId
    );

    if (!dbItem) {
      // If item not found in DB, try to inherit from article or chapter
      if (articleId) {
        const articleSpecIds = getArticleSpecialityIds(articleId);
        if (articleSpecIds.length > 0) {
          return getSpecialitiesByIds(articleSpecIds);
        }
      }
      // Fall back to chapter specialities
      return getSpecialitiesByIds(getChapterSpecialityIds(chapterId));
    }

    // Check if item has its own specialities
    const itemSpecIds = getItemOwnSpecialityIds(dbItem.id);
    if (itemSpecIds.length > 0) {
      return getSpecialitiesByIds(itemSpecIds);
    }

    // Inherit from article if available
    if (articleId) {
      const articleSpecIds = getArticleSpecialityIds(articleId);
      if (articleSpecIds.length > 0) {
        return getSpecialitiesByIds(articleSpecIds);
      }
    }

    // Fall back to chapter specialities
    return getSpecialitiesByIds(getChapterSpecialityIds(chapterId));
  };

  // Group specialities by main specialty for dropdown
  const groupedSpecialityOptions = React.useMemo(() => {
    if (!specialities) return {};
    
    const grouped: Record<string, { label: string; value: string; group?: string }[]> = {};
    
    specialities.forEach(s => {
      const mainSpecialtyName = s.main_specialties 
        ? (language === 'pt' ? s.main_specialties.main_specialty_pt : s.main_specialties.main_specialty_en)
        : 'Other';
      
      if (!grouped[mainSpecialtyName]) {
        grouped[mainSpecialtyName] = [];
      }
      
      grouped[mainSpecialtyName].push({
        label: language === 'pt' ? s.name_pt : s.name_en,
        value: s.id,
        group: mainSpecialtyName,
      });
    });
    
    // Sort groups alphabetically, but put "Other" at the end
    const sortedGrouped: Record<string, { label: string; value: string; group?: string }[]> = {};
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === 'Other') return 1;
      if (b === 'Other') return -1;
      return a.localeCompare(b);
    });
    
    sortedKeys.forEach(key => {
      // Sort specialities within each group alphabetically
      sortedGrouped[key] = grouped[key].sort((a, b) => a.label.localeCompare(b.label));
    });
    
    return sortedGrouped;
  }, [specialities, language]);





  // Handlers for chapter specialities dialog
  const handleOpenChapterDialog = (chapterId: string) => {
    setEditingChapterId(chapterId);
    setPendingChapterSpecialities(getChapterSpecialityIds(chapterId));
  };

  const handleCloseChapterDialog = (open: boolean) => {
    if (!open && editingChapterId) {
      // Save changes when closing
      updateChapterSpecialitiesMutation.mutate({
        chapterId: editingChapterId,
        specialityIds: pendingChapterSpecialities,
      });
      // Note: State cleanup moved to mutation onSuccess for better UX
    }
  };

  // Handlers for item specialities dialog
  const handleOpenItemDialog = (itemId: string, chapterId: string) => {
    setEditingItemId(itemId);
    // Initialize with item's own specialities or empty array
    setPendingItemSpecialities(getItemOwnSpecialityIds(itemId));
  };

  const handleCloseItemDialog = (open: boolean) => {
    if (!open && editingItemId) {
      // Save changes when closing
      updateItemSpecialitiesMutation.mutate({
        itemId: editingItemId,
        specialityIds: pendingItemSpecialities,
      });
      // Note: State cleanup moved to mutation onSuccess for better UX
    }
  };

  const handleApplyItemSpecialities = () => {
    if (editingItemId) {
      updateItemSpecialitiesMutation.mutate({
        itemId: editingItemId,
        specialityIds: pendingItemSpecialities,
      });
    }
  };

  // Helper function to update article text line
  const handleUpdateArticleTextLine = (articleId: string, lineIndex: number, newText: string) => {
    const articleFromDB = articlesFromDB?.find(a => a.id === articleId);
    if (!articleFromDB) return;
    
    const updatedContents = [...articleFromDB.contents];
    // Find the text content at lineIndex
    let textLineCount = 0;
    for (let i = 0; i < updatedContents.length; i++) {
      if (updatedContents[i].type === 'text') {
        if (textLineCount === lineIndex) {
          updatedContents[i] = { type: 'text', data: newText };
          break;
        }
        textLineCount++;
      }
    }
    
    updateArticleMutation.mutate({
      articleId,
      title: articleFromDB.title,
      contents: updatedContents
    });
    setEditingTextLine(null);
    setEditingTextValue('');
  };

  // Helper function to update item column
  const handleUpdateItemColumn = (articleId: string, itemIndex: number, field: string, newValue: string) => {
    const articleFromDB = articlesFromDB?.find(a => a.id === articleId);
    if (!articleFromDB) return;
    
    const updatedContents = [...articleFromDB.contents];
    // Find the item at itemIndex
    let itemCount = 0;
    for (let i = 0; i < updatedContents.length; i++) {
      if (updatedContents[i].type === 'item') {
        if (itemCount === itemIndex) {
          const itemData = updatedContents[i].data as {
            artigo: string;
            descricao: string;
            un: string;
            qt: number;
            observacoes_empreiteiro?: string;
          };
          
          if (field === 'artigo') {
            itemData.artigo = newValue;
          } else if (field === 'descricao') {
            itemData.descricao = newValue;
          } else if (field === 'un') {
            itemData.un = newValue;
          } else if (field === 'observacoes_empreiteiro') {
            itemData.observacoes_empreiteiro = newValue;
          } else if (field === 'qt') {
            itemData.qt = parseFloat(newValue) || 0;
          }
          
          updatedContents[i] = { type: 'item', data: itemData };
          break;
        }
        itemCount++;
      }
    }
    
    updateArticleMutation.mutate({
      articleId,
      title: articleFromDB.title,
      contents: updatedContents
    });
    setEditingItemCell(null);
    setEditingItemValue('');
  };

  // Helper function to add a new row to an items table
  const handleAddItemToArticle = (articleId: string) => {
    const articleFromDB = articlesFromDB?.find(a => a.id === articleId);
    if (!articleFromDB) return;
    
    const updatedContents = [...articleFromDB.contents];
    
    // Add a new item at the end with default values
    updatedContents.push({
      type: 'item',
      data: {
        artigo: '',
        descricao: '',
        un: '',
        qt: 0,
        observacoes_empreiteiro: ''
      }
    });
    
    updateArticleMutation.mutate({
      articleId,
      title: articleFromDB.title,
      contents: updatedContents
    });
  };

  // Helper function to delete a row from an items table
  const handleDeleteItemFromArticle = (articleId: string, itemIndex: number) => {
    const articleFromDB = articlesFromDB?.find(a => a.id === articleId);
    if (!articleFromDB) return;
    
    const updatedContents = [...articleFromDB.contents];
    
    // Find and remove the item at itemIndex
    let currentItemIndex = 0;
    const indexToRemove = updatedContents.findIndex((content) => {
      if (content.type === 'item') {
        if (currentItemIndex === itemIndex) {
          return true;
        }
        currentItemIndex++;
      }
      return false;
    });
    
    if (indexToRemove !== -1) {
      updatedContents.splice(indexToRemove, 1);
      
      updateArticleMutation.mutate({
        articleId,
        title: articleFromDB.title,
        contents: updatedContents
      });
    }
  };;



  // Check if article-based view is active
  // Changed: Use tabs and chapters instead of chaptersWithArticles to avoid stuck loading state
  // Even if no articles exist, we should show the structure (tabs/chapters/items)
  const isArticleBasedViewActive = (tabs && tabs.length > 0) || chaptersWithArticles.length > 0;
  
  // Group chapters by tab
  const chaptersByTab = chapters?.reduce((acc, chapter) => {
    if (!acc[chapter.tab_id]) {
      acc[chapter.tab_id] = [];
    }
    acc[chapter.tab_id].push(chapter);
    return acc;
  }, {} as Record<string, OrcamentoChapter[]>) || {};

  // Group items by chapter
  const itemsByChapter = items?.reduce((acc, item) => {
    if (!acc[item.chapter_id]) {
      acc[item.chapter_id] = [];
    }
    acc[item.chapter_id].push(item);
    return acc;
  }, {} as Record<string, OrcamentoItem[]>) || {};

  // Helper function to display chapter/article numbers without sheet prefix
  const displayNumber = (fullNumber: string | null | undefined): string => {
    // Handle null/undefined values
    if (!fullNumber) return '';
    // If number contains underscore (e.g., "Sheet1_1"), extract the part after underscore
    if (fullNumber.includes('_')) {
      const parts = fullNumber.split('_');
      return parts[parts.length - 1]; // Return the last part after underscore
    }
    return fullNumber; // Return as-is if no prefix
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/orcamentos")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('orcamento.backToOrcamentos')}
        </Button>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          {orcamento?.name}
        </h1>
        <p className="text-base text-muted-foreground">{t('orcamento.mapaQuantidades')}</p>
      </div>

      {!hasFile ? (
        <div className="space-y-6">
          {/* AI Suggestion - Before Upload */}
          <AISuggestionCard
            title={language === 'en' ? "💡 Pro Tip" : "💡 Dica Profissional"}
            description={
              language === 'en' 
                ? "After uploading your Excel file, use the 'AI Analyze' button (✨) to get smart insights about your budget, including quality scores, data validation, and AI-powered suggestions for improvement."
                : "Após carregar o ficheiro Excel, use o botão 'Análise IA' (✨) para obter insights inteligentes sobre o seu orçamento, incluindo pontuações de qualidade, validação de dados e sugestões de melhoria com IA."
            }
          />
          
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 min-h-[400px]">
          <Upload className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('orcamento.noFile')}</h3>
          <p className="text-muted-foreground mb-4">{t('orcamento.uploadFile')}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload className="mr-2 h-5 w-5" />
            {t('orcamento.uploadFile')}
          </Button>
        </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Suggestion - After Upload, Before Analysis */}
          {!isAnalyzed && (
            <AISuggestionCard
              variant="compact"
              description={
                language === 'en'
                  ? "Try the AI Analysis for intelligent insights! It will check data quality, identify missing information, and provide improvement suggestions."
                  : "Experimente a Análise IA para insights inteligentes! Verificará a qualidade dos dados, identificará informação em falta e fornecerá sugestões de melhoria."
              }
              action={{
                label: language === 'en' ? "Use AI Analyze" : "Usar Análise IA",
                onClick: handleAIAnalyze
              }}
            />
          )}
          
          <div className="flex items-center justify-between p-6 border rounded-lg bg-card">
            <div className="flex items-center gap-4">
              <FileSpreadsheet className="h-10 w-10 text-green-600" />
              <div>
                <h3 className="font-semibold">{currentFile.file_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {isAnalyzed ? t('orcamento.analyzeSuccess') : t('orcamento.noFile')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isAnalyzed && (
                <>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing && !isAIAnalysis && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isAnalyzing && !isAIAnalysis ? t('orcamento.analyzing') : t('orcamento.analyze')}
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleAIAnalyze}
                          disabled={isAnalyzing}
                          variant="secondary"
                          className="gap-2"
                        >
                          {isAnalyzing && isAIAnalysis && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Sparkles className="h-4 w-4" />
                          {isAnalyzing && isAIAnalysis ? t('orcamento.aiAnalyzing') : t('orcamento.aiAnalyze')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t('orcamento.aiAnalyzeDescription')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('orcamento.deleteFileTitle')}</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>{t('orcamento.deleteFileDescription')}</p>
                      <ul className="space-y-1 text-left">
                        <li>{t('orcamento.deleteFileImpact1')}</li>
                        <li>{t('orcamento.deleteFileImpact2')}</li>
                        <li>{t('orcamento.deleteFileImpact3')}</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('orcamento.deleteFileCancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteFile}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t('orcamento.deleteFileConfirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* AI Insights Display - show after analysis if insights are available */}
          {aiInsights && isAnalyzed && (
            <div className="mt-6">
              <AIInsightsDisplay insights={aiInsights} language={language} />
            </div>
          )}
          
          {/* Uncertain Rows Panel - show rows that AI is uncertain about */}
          {uncertainRows.length > 0 && isAnalyzed && (
            <div className="mt-6">
              <UncertainRowsPanel 
                uncertainRows={uncertainRows}
                language={language}
                onAccept={handleAcceptUncertainRow}
                onReject={handleRejectUncertainRow}
              />
            </div>
          )}
          
          {/* Loading state after analysis - show loading while queries are fetching */}
          {isAnalyzed && (isLoadingFiles || isFetchingFiles || isLoadingTabs || isFetchingTabs || isLoadingChapters || isFetchingChapters || isLoadingItems) && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 min-h-[400px]">
              <Loader2 className="h-16 w-16 text-muted-foreground mb-4 animate-spin" />
              <h3 className="text-xl font-semibold mb-2">{t('orcamento.loadingData')}</h3>
              <p className="text-muted-foreground">{t('orcamento.pleaseWait')}</p>
            </div>
          )}

          {/* Loading state - legacy check for backward compatibility */}
          {isAnalyzed && !isArticleBasedViewActive && !isLoadingFiles && !isFetchingFiles && !isLoadingTabs && !isFetchingTabs && !isLoadingChapters && !isFetchingChapters && !isLoadingItems && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 min-h-[400px]">
              <Loader2 className="h-16 w-16 text-muted-foreground mb-4 animate-spin" />
              <h3 className="text-xl font-semibold mb-2">{t('orcamento.loadingData')}</h3>
              <p className="text-muted-foreground">{t('orcamento.pleaseWait')}</p>
            </div>
          )}

          {/* No data found after analysis */}
          {isAnalyzed && isArticleBasedViewActive && (!tabs || tabs.length === 0) && !isLoadingTabs && !isFetchingTabs && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 min-h-[400px]">
              <FileSpreadsheet className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('orcamento.noDataFound')}</h3>
              <p className="text-muted-foreground">{t('orcamento.analyzeAgain')}</p>
            </div>
          )}

          {/* Display articles grouped by chapters 
               NOTE: TABS are the top-level navigation items like "Principal", "Arquitetura", "Instalações Especiais"
               SEPARATORS are the Excel sheet names that organize chapters within tabs
          */}
          {isAnalyzed && isArticleBasedViewActive && tabs && tabs.length > 0 && !isLoadingTabs && !isFetchingTabs && !isLoadingChapters && !isFetchingChapters && (
            <div className="space-y-8">
              {/* TABS: Top-level navigation (Principal, Arquitetura, Instalações Especiais) */}
              <Tabs defaultValue={tabs[0]?.id} className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="overflow-x-auto flex-wrap h-auto">
                    {tabs.map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id}>
                        {tab.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                {tabs.map((tab) => {
                  // Calculate total unique sheets across all chapters (not just current tab)
                  const totalUniqueSheets = new Set(
                    chaptersWithArticles
                      .filter(cwa => cwa.sheet_name)
                      .map(cwa => cwa.sheet_name)
                  ).size;
                  
                  return (
                  <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                    {/* TAB Actions (NOT Separator - this is a top-level tab like "Principal", "Arquitetura", etc.) */}
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Tab: {tab.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const tabSpecIds = tabSpecialities?.filter(ts => ts.tab_id === tab.id).map(ts => ts.speciality_id) || [];
                                  setEditingChapterId(tab.id); // Reuse chapter editing state
                                  setPendingChapterSpecialities(tabSpecIds);
                                }}
                              >
                                <Tag className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Manage Specialities for this Tab</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSeparatorDialog({ open: true, mode: 'edit', data: tab })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Tab</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this tab? This will also delete all chapters, articles, and items within it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSeparatorMutation.mutate(tab.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    {/* Speciality Dialog for Separator */}
                    {editingChapterId === tab.id && (
                      <Dialog open={true} onOpenChange={(open) => {
                        if (!open) {
                          updateTabSpecialitiesMutation.mutate({
                            tabId: tab.id,
                            specialityIds: pendingChapterSpecialities,
                          });
                          setEditingChapterId(null);
                          setPendingChapterSpecialities([]);
                        }
                      }}>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Manage Specialities for Tab</DialogTitle>
                            <DialogDescription>
                              Select specialities to apply to all items in this tab
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
                              onClick={() => {
                                setEditingChapterId(null);
                                setPendingChapterSpecialities([]);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                updateTabSpecialitiesMutation.mutate({
                                  tabId: tab.id,
                                  specialityIds: pendingChapterSpecialities,
                                });
                                setEditingChapterId(null);
                                setPendingChapterSpecialities([]);
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {(() => {
                      const chaptersForTab = chaptersWithArticles.filter((cwa) => cwa.chapter.tab_id === tab.id);
                      
                      // Fallback: If no articles exist, use regular chapters
                      if (chaptersForTab.length === 0 && chapters) {
                        const regularChaptersForTab = chapters.filter(c => c.tab_id === tab.id);
                        if (regularChaptersForTab.length > 0) {
                          return (
                            <div className="p-4 border rounded-lg bg-card">
                              <div className="mb-4 text-sm text-muted-foreground">
                                <p>No articles found in this tab. Showing chapters and items in traditional view.</p>
                              </div>
                              {regularChaptersForTab.map((chapter) => {
                                const chapterItems = itemsByChapter[chapter.id] || [];
                                const isChapterCollapsed = collapsedChapters.has(chapter.id);
                                
                                return (
                                  <Collapsible 
                                    key={chapter.id} 
                                    open={!isChapterCollapsed}
                                    onOpenChange={(open) => {
                                      const newCollapsed = new Set(collapsedChapters);
                                      if (open) {
                                        newCollapsed.delete(chapter.id);
                                      } else {
                                        newCollapsed.add(chapter.id);
                                      }
                                      setCollapsedChapters(newCollapsed);
                                    }}
                                    className="border rounded-lg overflow-hidden mb-6"
                                  >
                                    <div className="bg-muted p-4">
                                      <div className="flex items-center justify-between">
                                        <CollapsibleTrigger asChild>
                                          <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-transparent p-0 h-auto">
                                            <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isChapterCollapsed ? '-rotate-90' : ''}`} />
                                            <h3 className="text-lg font-semibold">
                                              {displayNumber(chapter.chapter_number)}. {cleanChapterName(chapter.chapter_name)}
                                            </h3>
                                          </Button>
                                        </CollapsibleTrigger>
                                      </div>
                                    </div>
                                    
                                    <CollapsibleContent>
                                      <div className="p-4">
                                        {chapterItems.length > 0 ? (
                                          <Table className="border">
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead>{t('orcamento.artigo')}</TableHead>
                                                <TableHead>{t('orcamento.descricao')}</TableHead>
                                                <TableHead>{t('orcamento.unit')}</TableHead>
                                                <TableHead className="text-right">{t('orcamento.quantity')}</TableHead>
                                                <TableHead>{t('orcamento.observacoesEmpreiteiro')}</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {chapterItems.map((item) => (
                                                <TableRow key={item.id}>
                                                  <TableCell>{displayNumber(item.artigo)}</TableCell>
                                                  <TableCell>{item.descricao}</TableCell>
                                                  <TableCell>{item.un || '-'}</TableCell>
                                                  <TableCell className="text-right">
                                                    {item.qt !== null ? Number(item.qt).toFixed(2) : '-'}
                                                  </TableCell>
                                                  <TableCell>{item.observacoes_empreiteiro || '-'}</TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        ) : (
                                          <div className="text-sm text-muted-foreground">No items in this chapter.</div>
                                        )}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                );
                              })}
                            </div>
                          );
                        }
                      }
                      
                      // Group chapters by sheet name for multi-sheet separators
                      const chaptersBySheet = new Map<string, typeof chaptersForTab>();
                      chaptersForTab.forEach((cwa) => {
                        const sheetName = cwa.sheet_name || 'Unknown';
                        if (!chaptersBySheet.has(sheetName)) {
                          chaptersBySheet.set(sheetName, []);
                        }
                        chaptersBySheet.get(sheetName)!.push(cwa);
                      });
                      
                      // Display chapters grouped by sheet (article-based view)
                      return Array.from(chaptersBySheet.entries()).map(([sheetName, chaptersInSheet]) => {
                        const isSheetCollapsed = collapsedSheets.has(sheetName);
                        const sheetChapterIds = chaptersInSheet.map(cwa => cwa.chapter.id);
                        
                        return (
                        <div key={sheetName}>
                          {/* SEPARATOR (Excel sheet name) - only show if there are multiple sheets in the original file */}
                          {totalUniqueSheets > 1 && (
                            <Collapsible open={!isSheetCollapsed} onOpenChange={(open) => {
                              const newCollapsed = new Set(collapsedSheets);
                              if (open) {
                                newCollapsed.delete(sheetName);
                              } else {
                                newCollapsed.add(sheetName);
                              }
                              setCollapsedSheets(newCollapsed);
                            }}>
                              <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 rounded-r-lg mb-6 overflow-hidden">
                                <div className="flex items-center justify-between p-4">
                                  <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-transparent p-0 h-auto">
                                      <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isSheetCollapsed ? '-rotate-90' : ''}`} />
                                      <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                        📄 Separator: {sheetName}
                                      </h2>
                                    </Button>
                                  </CollapsibleTrigger>
                                  
                                  <div className="flex items-center gap-2">
                                    {/* Move sheet button */}
                                    {tabs && tabs.length > 1 && (
                                      <Sheet>
                                        <SheetTrigger asChild>
                                          <Button variant="ghost" size="sm" className="gap-2 text-blue-900 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900">
                                            <MoveRight className="h-4 w-4" />
                                            Move to tab
                                          </Button>
                                        </SheetTrigger>
                                        <SheetContent>
                                          <SheetHeader>
                                            <SheetTitle>Move Sheet</SheetTitle>
                                            <SheetDescription>
                                              Select a tab to move all chapters from "{sheetName}" to
                                            </SheetDescription>
                                          </SheetHeader>
                                          <div className="mt-6 space-y-2">
                                            {tabs.filter(t => t.id !== tab.id).map((targetTab) => (
                                              <Button
                                                key={targetTab.id}
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => {
                                                  moveSheetMutation.mutate({
                                                    chapterIds: sheetChapterIds,
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
                            </Collapsible>
                          )}
                          
                          {/* Chapters in this sheet */}
                          {(!isSheetCollapsed || totalUniqueSheets === 1) && chaptersInSheet.map((chapterWithArticles) => {
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
                                    const firstItem = article.contents.find(c => c.type === 'item');
                                    const firstItemData = firstItem?.data as {artigo: string; descricao: string; un: string; qt: number} | undefined;
                                    const shouldShowSingleArticle = firstItemData && article.title === firstItemData.descricao;
                                    const displayTitle = shouldShowSingleArticle ? "Single Article" : article.title;
                                    
                                    return (
                                      <div key={article.id} className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                                        {/* Article header with toggle */}
                                        <div className="flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                          <div 
                                            className="flex items-center gap-2 flex-1 cursor-pointer"
                                            onClick={() => {
                                              const newCollapsed = new Set(collapsedArticles);
                                              if (isCollapsed) {
                                                newCollapsed.delete(article.id);
                                              } else {
                                                newCollapsed.add(article.id);
                                              }
                                              setCollapsedArticles(newCollapsed);
                                            }}
                                          >
                                            <ChevronDown 
                                              className={`h-5 w-5 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                                            />
                                            <h4 className="text-base font-semibold text-primary">
                                              {displayNumber(article.artigo)} - {displayTitle}
                                            </h4>
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
                                                      disabled={shouldShowSingleArticle}
                                                    >
                                                      <Edit className="h-3 w-3" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  {shouldShowSingleArticle && (
                                                    <TooltipContent>
                                                      <p>Cannot edit name for single articles</p>
                                                    </TooltipContent>
                                                  )}
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
                                        {!isCollapsed && (
                                          <div className="p-4 pt-0 space-y-4">
                                            {(() => {
                                              const groupedContent: Array<{type: 'text', data: string} | {type: 'items', items: Array<{
                                                artigo: string;
                                                descricao: string;
                                                un: string;
                                                qt: number;
                                                observacoes_empreiteiro?: string;
                                              }>}> = [];
                                              
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
                                                      {editingTextLine?.articleId === articleFromDB?.id && editingTextLine.lineIndex === textLineIndex ? (
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
                                                            const isEditing = editingItemCell?.articleId === articleFromDB?.id && 
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
                                                            <TableCell>{renderEditableCell('descricao', item.descricao)}</TableCell>
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
                                                        )})}
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
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                          })}
                        </div>
                      );
                      });
                    })()}
                  </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          )}
        </div>
      )}
      
      {/* Article Edit Dialog */}
      {articleDialog.open && articleDialog.data && (
        <Dialog open={articleDialog.open} onOpenChange={(open) => {
          if (!open) {
            setArticleDialog({ open: false, mode: 'create' });
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Article Name</DialogTitle>
              <DialogDescription>
                Change the name/title of this article
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={articleDialog.data.title}
                onChange={(e) => {
                  setArticleDialog({
                    ...articleDialog,
                    data: {
                      ...articleDialog.data!,
                      title: e.target.value
                    }
                  });
                }}
                placeholder="Article name..."
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setArticleDialog({ open: false, mode: 'create' });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const articleFromDB = articlesFromDB?.find(a => 
                    a.chapter_id === articleDialog.data?.chapter_id && 
                    a.artigo === articleDialog.data?.artigo
                  );
                  if (articleFromDB && articleDialog.data) {
                    updateArticleMutation.mutate({
                      articleId: articleFromDB.id,
                      title: articleDialog.data.title,
                      contents: articleDialog.data.contents
                    });
                  }
                }}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MapaQuantidades;
