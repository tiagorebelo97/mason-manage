import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, FileSpreadsheet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrcamentoFile = {
  id: string;
  orcamento_id: string;
  file_name: string;
  file_url: string;
  analyzed: boolean;
};

type OrcamentoChapter = {
  id: string;
  orcamento_id: string;
  sheet_name: string;
  chapter_number: string;
  chapter_name: string;
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

  const { data: chapters } = useQuery({
    queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamento_chapters")
        .select("*")
        .eq("orcamento_id", id)
        .order("sheet_name")
        .order("chapter_number");
      if (error) throw error;
      return data as OrcamentoChapter[];
    },
    enabled: !!id && files && files.length > 0 && files[0]?.analyzed,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // In a real application, you would upload the file to storage
      // For now, we'll just store the file name and a placeholder URL
      const { data, error } = await supabase
        .from("orcamento_files")
        .insert([
          {
            orcamento_id: id,
            file_name: file.name,
            file_url: `placeholder_url_${file.name}`, // This should be replaced with actual storage URL
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
    mutationFn: async (file: File) => {
      setIsAnalyzing(true);
      
      // Read the Excel file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const chaptersToInsert: Array<{
        orcamento_id: string;
        sheet_name: string;
        chapter_number: string;
        chapter_name: string;
      }> = [];

      // Process each sheet
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        // Find chapters (rows where first column has a number without a dot)
        jsonData.forEach((row: any[]) => {
          if (row && row[0]) {
            const firstCell = String(row[0]).trim();
            // Check if it's a number without a dot (chapter identifier)
            if (/^\d+$/.test(firstCell) && row[1]) {
              chaptersToInsert.push({
                orcamento_id: id!,
                sheet_name: sheetName,
                chapter_number: firstCell,
                chapter_name: String(row[1]),
              });
            }
          }
        });
      });

      // Insert chapters into database
      if (chaptersToInsert.length > 0) {
        const { error: chapterError } = await supabase
          .from("orcamento_chapters")
          .insert(chaptersToInsert);
        if (chapterError) throw chapterError;
      }

      // Mark file as analyzed
      const { error: fileError } = await supabase
        .from("orcamento_files")
        .update({ analyzed: true })
        .eq("orcamento_id", id)
        .eq("file_name", file.name);
      if (fileError) throw fileError;
    },
    onSuccess: () => {
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ["orcamento_files", id, import.meta.env.VITE_SUPABASE_URL] });
      queryClient.invalidateQueries({ queryKey: ["orcamento_chapters", id, import.meta.env.VITE_SUPABASE_URL] });
      toast.success(t('orcamento.analyzeSuccess'));
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error(t('orcamento.analyzeError'));
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleAnalyze = () => {
    if (fileInputRef.current?.files?.[0]) {
      analyzeMutation.mutate(fileInputRef.current.files[0]);
    }
  };

  const currentFile = files && files.length > 0 ? files[0] : null;
  const hasFile = !!currentFile;
  const isAnalyzed = currentFile?.analyzed || false;

  // Group chapters by sheet
  const chaptersBySheet = chapters?.reduce((acc, chapter) => {
    if (!acc[chapter.sheet_name]) {
      acc[chapter.sheet_name] = [];
    }
    acc[chapter.sheet_name].push(chapter);
    return acc;
  }, {} as Record<string, OrcamentoChapter[]>) || {};

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
          {t('orcamento.mapaQuantidades')}
        </h1>
        <p className="text-muted-foreground">{orcamento?.name}</p>
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
            {!isAnalyzed && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? t('orcamento.analyzing') : t('orcamento.analyze')}
              </Button>
            )}
          </div>

          {isAnalyzed && chapters && chapters.length > 0 && (
            <Tabs defaultValue={Object.keys(chaptersBySheet)[0]} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto">
                {Object.keys(chaptersBySheet).map((sheetName) => (
                  <TabsTrigger key={sheetName} value={sheetName}>
                    {sheetName}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(chaptersBySheet).map(([sheetName, sheetChapters]) => (
                <TabsContent key={sheetName} value={sheetName} className="space-y-6">
                  {sheetChapters.map((chapter) => (
                    <div key={chapter.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted p-4">
                        <h3 className="text-lg font-semibold">
                          {chapter.chapter_number}. {chapter.chapter_name}
                        </h3>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              No items yet
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
};

export default MapaQuantidades;
