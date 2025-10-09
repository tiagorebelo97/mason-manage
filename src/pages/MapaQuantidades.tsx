import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, FileSpreadsheet, Loader2, Trash2, MessageSquare, ChevronDown, ImagePlus, ImageIcon, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
};

const MapaQuantidades = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const { data: files } = useQuery({
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

  const { data: tabs } = useQuery({
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

  const { data: chapters } = useQuery({
    queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_chapters")
        .select("*")
        .order("chapter_number");
      if (error) throw error;
      return data as OrcamentoChapter[];
    },
    enabled: !!id && tabs && tabs.length > 0,
  });

  const { data: items } = useQuery({
    queryKey: ["orcamento_items", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_items")
        .select("*")
        .order("artigo");
      if (error) throw error;
      return data as OrcamentoItem[];
    },
    enabled: !!id && chapters && chapters.length > 0,
  });

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
    mutationFn: async (fileId: string) => {
      // Get file info from database
      const { data: fileData, error: fileQueryError } = await supabase
        .from("orcamento_files")
        .select("*")
        .eq("id", fileId)
        .single();
      
      if (fileQueryError) throw fileQueryError;
      
      // Download file from storage
      const urlParts = fileData.file_url.split('/orcamento-files/');
      if (urlParts.length < 2) throw new Error("Invalid file URL");
      
      const filePath = urlParts[1];
      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from('orcamento-files')
        .download(filePath);
      
      if (downloadError) throw downloadError;
      
      // Read the Excel file from the downloaded blob
      const arrayBuffer = await fileBlob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Also load with ExcelJS for image extraction
      const excelJSWorkbook = new ExcelJS.Workbook();
      await excelJSWorkbook.xlsx.load(arrayBuffer);
      
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

      // Process each sheet and create tabs
      workbook.SheetNames.forEach((sheetName, index) => {
        tabsToInsert.push({
          orcamento_id: id!,
          name: sheetName,
          display_order: index,
        });
        
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
        // Items are rows where ARTIGO contains a number with a dot
        // Comments are handled as follows:
        // - Chapter comments: rows without ARTIGO but with DESCRIÇÃO (accumulated after a chapter is found)
        // - Item comments: rows with ARTIGO like "1.2" but without QT and UN (parent for items like "1.2.1")
        if (artigoColumnIndex !== -1 && descricaoColumnIndex !== -1) {
          let currentChapterNumber: string | null = null;
          let chapterComments: string[] = [];
          const parentCommentsMap = new Map<string, string>();
          
          jsonData.forEach((row: unknown, rowIndex: number) => {
            if (!Array.isArray(row)) return;
            
            const artigoCell = row[artigoColumnIndex] ? String(row[artigoColumnIndex]).trim() : "";
            const descricaoCell = row[descricaoColumnIndex] ? String(row[descricaoColumnIndex]).trim() : "";
            
            // Skip empty rows
            if (!artigoCell && !descricaoCell) return;
            
            // Case 1: Chapter (pure number in ARTIGO column)
            if (/^\d+$/.test(artigoCell) && descricaoCell) {
              // Save previous chapter with its comments
              if (currentChapterNumber && chapterComments.length > 0) {
                const lastChapter = chaptersToInsert[chaptersToInsert.length - 1];
                if (lastChapter && lastChapter.chapter_number === currentChapterNumber) {
                  lastChapter.chapter_comments = chapterComments.join('\n');
                }
              }
              
              chaptersToInsert.push({
                sheet_name: sheetName,
                chapter_number: artigoCell,
                chapter_name: descricaoCell,
                chapter_comments: undefined,
              });
              currentChapterNumber = artigoCell;
              chapterComments = [];
            }
            // Case 2: Chapter comment (no ARTIGO but has DESCRIÇÃO)
            else if (!artigoCell && descricaoCell && currentChapterNumber) {
              chapterComments.push(descricaoCell);
            }
            // Case 3: Item with full data (has ARTIGO with dot pattern)
            else if (/^\d+\./.test(artigoCell) && descricaoCell) {
              const chapterNumber = artigoCell.split('.')[0];
              
              // Check if this row has QT or UN to determine if it's a full item or just a parent comment
              // Enhanced to handle numeric values (including 0), text values, and various cell formats
              const hasQT = qtColumnIndex !== -1 && 
                typeof row[qtColumnIndex] !== 'undefined' && 
                row[qtColumnIndex] !== null && 
                (typeof row[qtColumnIndex] === 'number' || String(row[qtColumnIndex]).trim() !== "");
              const hasUN = unColumnIndex !== -1 && 
                typeof row[unColumnIndex] !== 'undefined' && 
                row[unColumnIndex] !== null && 
                String(row[unColumnIndex]).trim() !== "";
              
              // If it has QT or UN, it's an actual item
              // Otherwise, it's a parent comment (e.g., "1.2" for items like "1.2.1")
              if (hasQT || hasUN) {
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
                const parsedQt = qtValue ? parseFloat(qtValue.replace(',', '.')) : null;
                
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
                const parts = artigoCell.split('.');
                if (parts.length > 2) {
                  // For items like "1.2.1", check for parent "1.2"
                  const parentArtigo = parts.slice(0, -1).join('.');
                  itemComment = parentCommentsMap.get(parentArtigo) || null;
                }
                
                itemsToInsert.push({
                  sheet_name: sheetName,
                  chapter_number: chapterNumber,
                  artigo: artigoCell,
                  descricao: descricaoCell,
                  un: unValue || null,
                  qt: (parsedQt !== null && !isNaN(parsedQt)) ? parsedQt : null,
                  preco_unitario: (parsedPreco !== null && !isNaN(parsedPreco)) ? parsedPreco : null,
                  item_comments: itemComment,
                  observacoes_empreiteiro: observacoesValue || null,
                  observacoes_image_url: null, // Future enhancement: extract images from Excel
                  excel_row_index: rowIndex, // Store the Excel row index for image matching
                });
              }
              // If it has ARTIGO but no QT/UN, it's a comment for child items (e.g., "1.2" for "1.2.1")
              else {
                // This is a parent item comment - store it for future child items
                parentCommentsMap.set(artigoCell, descricaoCell);
              }
            }
          });
          
          // Save comments for the last chapter
          if (currentChapterNumber && chapterComments.length > 0) {
            const lastChapter = chaptersToInsert[chaptersToInsert.length - 1];
            if (lastChapter && lastChapter.chapter_number === currentChapterNumber) {
              lastChapter.chapter_comments = chapterComments.join('\n');
            }
          }
        }
      });

      // Insert tabs into database
      const { data: insertedTabs, error: tabError } = await supabase
        .from("orcamento_tabs")
        .insert(tabsToInsert)
        .select();
      
      if (tabError) throw tabError;
      
      // Create a map of sheet names to tab IDs
      const sheetNameToTabId = new Map<string, string>();
      insertedTabs.forEach(tab => {
        sheetNameToTabId.set(tab.name, tab.id);
      });
      
      // Update chapters with tab IDs
      const chaptersWithTabIds = chaptersToInsert.map(chapter => ({
        tab_id: sheetNameToTabId.get(chapter.sheet_name!),
        chapter_number: chapter.chapter_number,
        chapter_name: chapter.chapter_name,
        chapter_comments: chapter.chapter_comments || null,
      }));

      // Insert chapters into database
      if (chaptersWithTabIds.length > 0) {
        const { data: insertedChapters, error: chapterError } = await supabase
          .from("orcamento_chapters")
          .insert(chaptersWithTabIds)
          .select();
        if (chapterError) throw chapterError;
        
        // Create a map of (sheet_name + chapter_number) to chapter IDs
        const chapterMap = new Map<string, string>();
        insertedChapters.forEach(chapter => {
          // Find the corresponding tab to get sheet name
          const tab = insertedTabs.find(t => t.id === chapter.tab_id);
          if (tab) {
            const key = `${tab.name}_${chapter.chapter_number}`;
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
        
        // Insert items into database
        if (itemsWithChapterIds.length > 0) {
          const { data: insertedItems, error: itemError } = await supabase
            .from("orcamento_items")
            .insert(itemsWithChapterIds)
            .select();
          if (itemError) throw itemError;
          
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
      const { error: fileError } = await supabase
        .from("orcamento_files")
        .update({ analyzed: true })
        .eq("id", fileId);
      if (fileError) throw fileError;
    },
    onSuccess: () => {
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ["orcamento_files", id, import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["orcamento_tabs", id, import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["orcamento_items", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('orcamento.analyzeSuccess'));
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error(t('orcamento.analyzeError'));
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

      // Delete associated tabs (which will cascade delete chapters)
      const { error: tabsError } = await supabase
        .from("orcamento_tabs")
        .delete()
        .eq("orcamento_id", id);
      if (tabsError) throw tabsError;

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleAnalyze = () => {
    if (currentFile) {
      setIsAnalyzing(true);
      analyzeMutation.mutate(currentFile.id);
    }
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

  const handleExportToExcel = () => {
    if (!tabs || tabs.length === 0 || !chapters || !items) {
      toast.error(t('orcamento.exportError') || 'No data to export');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // Export each tab as a separate sheet
    tabs.forEach((tab) => {
      const tabChapters = chaptersByTab[tab.id] || [];
      
      // Build worksheet data
      const worksheetData: any[][] = [];
      
      // Add headers
      worksheetData.push([
        t('orcamento.artigo') || 'ARTIGO',
        t('orcamento.descricao') || 'DESCRIÇÃO',
        t('orcamento.unit') || 'UN',
        t('orcamento.quantity') || 'TOTAIS',
        t('orcamento.observacoesEmpreiteiro') || 'OBSERVAÇÕES EMPREITEIRO'
      ]);

      // Add chapter and item data
      tabChapters.forEach((chapter) => {
        // Add chapter row
        worksheetData.push([
          chapter.chapter_number,
          cleanChapterName(chapter.chapter_name),
          '',
          '',
          chapter.chapter_comments || ''
        ]);

        // Add items for this chapter
        const chapterItems = itemsByChapter[chapter.id] || [];
        chapterItems.forEach((item) => {
          worksheetData.push([
            item.artigo,
            item.descricao,
            item.un || '',
            item.qt !== null ? item.qt : '',
            item.observacoes_empreiteiro || ''
          ]);
        });
      });

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 10 },  // ARTIGO
        { wch: 50 },  // DESCRIÇÃO
        { wch: 8 },   // UN
        { wch: 12 },  // TOTAIS
        { wch: 30 },  // OBSERVAÇÕES
      ];

      // Add sheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, tab.name);
    });

    // Generate filename with orcamento name and current date
    const fileName = `${orcamento?.name || 'mapa_quantidades'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Write file
    XLSX.writeFile(workbook, fileName);
    toast.success(t('orcamento.exportSuccess') || 'File exported successfully');
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
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {orcamento?.name}
        </h1>
        <p className="text-muted-foreground">{t('orcamento.mapaQuantidades')}</p>
      </div>

      {!hasFile ? (
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
      ) : (
        <div className="space-y-6">
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
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isAnalyzing ? t('orcamento.analyzing') : t('orcamento.analyze')}
                </Button>
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

          {isAnalyzed && tabs && tabs.length > 0 && (
            <>
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  onClick={handleExportToExcel}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t('orcamento.exportExcel') || 'Export to Excel'}
                </Button>
              </div>
              <Tabs defaultValue={tabs[0]?.id} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                  {chaptersByTab[tab.id]?.map((chapter) => (
                    <Collapsible key={chapter.id} defaultOpen={false} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted">
                        <div className="flex items-center gap-2 p-4">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-transparent p-0 h-auto">
                              <ChevronDown className="h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180" />
                              <h3 className="text-lg font-semibold">
                                {chapter.chapter_number}. {cleanChapterName(chapter.chapter_name)}
                              </h3>
                            </Button>
                          </CollapsibleTrigger>
                          {chapter.chapter_comments && (
                            <>
                              <Dialog>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MessageSquare className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                        </Button>
                                      </DialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      <div className="space-y-1">
                                        <p className="text-xs font-semibold">Chapter Comments</p>
                                        <p className="text-xs whitespace-pre-line line-clamp-3">{chapter.chapter_comments}</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Chapter Comments</DialogTitle>
                                    <DialogDescription className="whitespace-pre-line text-left">
                                      {chapter.chapter_comments}
                                    </DialogDescription>
                                  </DialogHeader>
                                </DialogContent>
                              </Dialog>
                            </>
                          )}
                        </div>
                      </div>
                      <CollapsibleContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('orcamento.artigo')}</TableHead>
                              <TableHead>{t('orcamento.descricao')}</TableHead>
                              <TableHead>{t('orcamento.unit')}</TableHead>
                              <TableHead className="text-right">{t('orcamento.quantity')}</TableHead>
                              <TableHead>{t('orcamento.observacoesEmpreiteiro')}</TableHead>
                              <TableHead className="w-12"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {itemsByChapter[chapter.id] && itemsByChapter[chapter.id].length > 0 ? (
                              itemsByChapter[chapter.id].map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>{item.artigo}</TableCell>
                                  <TableCell>{item.descricao}</TableCell>
                                  <TableCell>{item.un || '-'}</TableCell>
                                  <TableCell className="text-right">{item.qt !== null ? item.qt : '-'}</TableCell>
                                  <TableCell className="text-sm">
                                    <div className="space-y-2">
                                      {item.observacoes_empreiteiro && (
                                        <p>{item.observacoes_empreiteiro}</p>
                                      )}
                                      {item.observacoes_image_url && (
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <img 
                                              src={item.observacoes_image_url} 
                                              alt="Observação"
                                              className="max-w-[100px] max-h-[100px] object-contain cursor-pointer hover:opacity-80 transition-opacity rounded border"
                                            />
                                          </DialogTrigger>
                                          <DialogContent className="max-w-3xl">
                                            <DialogHeader>
                                              <DialogTitle>Observação - Imagem</DialogTitle>
                                            </DialogHeader>
                                            <div className="flex justify-center">
                                              <img 
                                                src={item.observacoes_image_url} 
                                                alt="Observação"
                                                className="max-w-full max-h-[70vh] object-contain"
                                              />
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      )}
                                      {!item.observacoes_image_url && (
                                        <div className="inline-flex">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleImageUpload(item.id)}
                                            disabled={uploadImageMutation.isPending}
                                            className="h-auto py-2 px-3 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                          >
                                            <ImageIcon className="h-5 w-5" />
                                            <span className="text-sm">{t('orcamento.uploadImage') || 'Upload Image'}</span>
                                          </Button>
                                        </div>
                                      )}
                                      {!item.observacoes_empreiteiro && !item.observacoes_image_url && (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {item.item_comments && (
                                      <Dialog>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                  <MessageSquare className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </Button>
                                              </DialogTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-xs">
                                              <div className="space-y-1">
                                                <p className="text-xs font-semibold">Item Comments</p>
                                                <p className="text-xs whitespace-pre-line line-clamp-3">{item.item_comments}</p>
                                              </div>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Item Comments</DialogTitle>
                                            <DialogDescription className="whitespace-pre-line text-left">
                                              {item.item_comments}
                                            </DialogDescription>
                                          </DialogHeader>
                                        </DialogContent>
                                      </Dialog>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                  No items yet
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MapaQuantidades;
