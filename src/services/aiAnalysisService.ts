/**
 * AI Analysis Service for Excel Files
 * Uses OpenAI to enhance Excel file understanding and analysis
 */

import OpenAI from 'openai';
import * as XLSX from 'xlsx';

// Initialize OpenAI client
let openai: OpenAI | null = null;

// Check if API key is configured before initializing
function getOpenAIClient(): OpenAI | null {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    return null;
  }
  
  if (!openai) {
    openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  }
  
  return openai;
}

export interface ExcelAnalysisContext {
  sheetNames: string[];
  sampleData: {
    sheetName: string;
    headers: string[];
    sampleRows: string[][];
  }[];
  totalRows: number;
}

export interface DataValidationMetrics {
  missingUnits: number;
  missingQuantities: number;
  missingPrices: number;
  totalItems: number;
  completenessPercentage: number;
}

export interface UncertainRow {
  sheetName: string;
  rowIndex: number;
  artigo?: string;
  descricao: string;
  reason: string; // Why the AI is uncertain about this row
  suggestedAction: 'include' | 'exclude' | 'modify'; // What the AI suggests
  suggestedData?: {
    artigo?: string;
    descricao?: string;
    un?: string;
    qt?: number;
    preco_unitario?: number;
  };
  aiSuggestion?: string; // AI's interpretation and suggestion for what to do with this row
}

export interface AIAnalysisResult {
  enhancedDescriptions: Record<string, string>; // artigo -> enhanced description
  suggestedSpecialities: Record<string, string[]>; // artigo -> speciality suggestions
  structureInsights: {
    sheetPurpose: Record<string, string>; // sheet name -> purpose
    chapterSummaries: Record<string, string>; // chapter number -> summary
  };
  qualityScore: number; // 0-100 score based on data completeness and structure
  summary: string; // AI-generated summary of the file
  suggestions: string[]; // List of AI suggestions for improvement
  validationMetrics: DataValidationMetrics;
  uncertainRows: UncertainRow[]; // Rows that AI is uncertain about
}

/**
 * Calculate data validation metrics from Excel context
 */
const REQUIRED_FIELDS_PER_ITEM = 3; // UN, QT, PRECO

// Common header patterns to search for
const HEADER_PATTERNS = {
  UN: ['UN', 'UNIDADE', 'UNI'],
  QT: ['QT', 'QUANTIDADE', 'QUANT'],
  PRECO: ['PRECO', 'PREÇO', 'PU', 'UNITARIO', 'UNITÁRIO'],
  ARTIGO: ['ARTIGO']
};

function calculateValidationMetrics(context: ExcelAnalysisContext): DataValidationMetrics {
  let missingUnits = 0;
  let missingQuantities = 0;
  let missingPrices = 0;
  let totalItems = 0;

  context.sampleData.forEach(sheet => {
    const unIndex = sheet.headers.findIndex(h => 
      HEADER_PATTERNS.UN.some(pattern => h.toUpperCase().includes(pattern))
    );
    const qtIndex = sheet.headers.findIndex(h => 
      HEADER_PATTERNS.QT.some(pattern => h.toUpperCase().includes(pattern) && !h.toUpperCase().includes('MAPA'))
    );
    const precoIndex = sheet.headers.findIndex(h => 
      HEADER_PATTERNS.PRECO.some(pattern => h.toUpperCase().includes(pattern))
    );
    const artigoIndex = sheet.headers.findIndex(h =>
      HEADER_PATTERNS.ARTIGO.some(pattern => h.toUpperCase().includes(pattern))
    );

    sheet.sampleRows.forEach(row => {
      // Check if this is a data row by checking artigo column (more efficient)
      const hasData = artigoIndex >= 0 && row[artigoIndex] && String(row[artigoIndex]).trim() !== '';
      if (hasData) {
        totalItems++;
        if (unIndex >= 0 && (!row[unIndex] || row[unIndex].trim() === '')) missingUnits++;
        if (qtIndex >= 0 && (!row[qtIndex] || row[qtIndex].trim() === '')) missingQuantities++;
        if (precoIndex >= 0 && (!row[precoIndex] || row[precoIndex].trim() === '')) missingPrices++;
      }
    });
  });

  const completenessPercentage = totalItems > 0 
    ? Math.round(((totalItems * REQUIRED_FIELDS_PER_ITEM - missingUnits - missingQuantities - missingPrices) / (totalItems * REQUIRED_FIELDS_PER_ITEM)) * 100)
    : 0;

  return {
    missingUnits,
    missingQuantities,
    missingPrices,
    totalItems,
    completenessPercentage
  };
}

/**
 * Analyze Excel file context with AI to better understand structure and content
 */
export async function analyzeWithAI(
  context: ExcelAnalysisContext
): Promise<AIAnalysisResult> {
  try {
    // Calculate validation metrics first (doesn't require AI)
    const validationMetrics = calculateValidationMetrics(context);
    
    // Check if API key is configured
    const client = getOpenAIClient();
    if (!client) {
      console.warn('OpenAI API key not configured, skipping AI analysis');
      return {
        enhancedDescriptions: {},
        suggestedSpecialities: {},
        structureInsights: {
          sheetPurpose: {},
          chapterSummaries: {}
        },
        qualityScore: validationMetrics.completenessPercentage,
        summary: 'AI analysis skipped - OpenAI API key not configured',
        suggestions: [
          'Configure OpenAI API key to enable AI-powered insights',
          'Review items with missing units, quantities, or prices',
          'Ensure all data fields are properly filled'
        ],
        validationMetrics,
        uncertainRows: []
      };
    }

    const prompt = buildAnalysisPrompt(context);
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Use the more affordable mini model
      messages: [
        {
          role: 'system',
          content: `You are an expert construction budget analyst. Your task is to analyze Excel budget files (orçamentos) from Portuguese construction projects and provide insights about the structure, categorization, and descriptions of items.

You should:
1. Identify the purpose of each sheet (e.g., main budget, architecture, special installations)
2. Understand chapter structures and provide summaries
3. Enhance item descriptions to be clearer and more comprehensive
4. Suggest relevant construction specialities for each item (e.g., Electrical, Plumbing, HVAC, Masonry, Carpentry, etc.)
5. Calculate a quality score (0-100) based on data completeness, organization, and clarity
6. Provide a summary of the overall file
7. Give practical suggestions for improvement
8. **Identify rows/items that are uncertain or ambiguous** - rows where you're not sure how to classify them, rows with unclear descriptions, rows missing critical data, or rows that don't fit the expected pattern. For each uncertain row, provide:
   - The sheet name and row index
   - The reason for uncertainty
   - A suggested action (include, exclude, or modify)
   - If modifying, suggest the corrected data
   - **An aiSuggestion field with your interpretation and specific recommendation for what to do with this row** - explain in detail what you think this row represents and how it should be handled

Respond in JSON format with the following structure:
{
  "enhancedDescriptions": { "artigo_number": "enhanced_description" },
  "suggestedSpecialities": { "artigo_number": ["speciality1", "speciality2"] },
  "structureInsights": {
    "sheetPurpose": { "sheet_name": "purpose_description" },
    "chapterSummaries": { "chapter_number": "chapter_summary" }
  },
  "qualityScore": 85,
  "summary": "Overall file summary",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "uncertainRows": [
    {
      "sheetName": "Sheet1",
      "rowIndex": 5,
      "artigo": "1.2.3",
      "descricao": "Unclear item description",
      "reason": "Description is too vague to determine the proper category",
      "suggestedAction": "modify",
      "suggestedData": {
        "descricao": "Clearer description suggestion"
      },
      "aiSuggestion": "This appears to be a header or section title rather than a budget item. I recommend either excluding it or treating it as a text comment under the previous chapter."
    }
  ]
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent results
      // Token limit set to 3000 to balance response detail with cost efficiency
      // This allows AI to provide:
      // - Enhanced descriptions and speciality suggestions
      // - Structure insights and summaries  
      // - Up to ~8-10 uncertain rows with detailed aiSuggestion field
      // Note: GPT-4o-mini is cost-effective (~$0.15/1M input, ~$0.60/1M output tokens)
      max_tokens: 3000
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      console.error('AI response was empty or missing. Completion:', completion);
      throw new Error('No response from AI: empty or missing content in completion');
    }

    // Parse JSON response with error handling
    let result: AIAnalysisResult;
    try {
      const parsedResult = JSON.parse(responseContent);
      
      // Merge with validation metrics
      result = {
        ...parsedResult,
        validationMetrics,
        // Ensure we have all required fields with defaults
        qualityScore: parsedResult.qualityScore || validationMetrics.completenessPercentage,
        summary: parsedResult.summary || 'AI analysis completed',
        suggestions: parsedResult.suggestions || [],
        enhancedDescriptions: parsedResult.enhancedDescriptions || {},
        suggestedSpecialities: parsedResult.suggestedSpecialities || {},
        structureInsights: parsedResult.structureInsights || {
          sheetPurpose: {},
          chapterSummaries: {}
        },
        uncertainRows: parsedResult.uncertainRows || []
      };
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Response content:', responseContent);
      throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }
    
    return result;
  } catch (error) {
    console.error('AI analysis error:', error);
    // Calculate fallback metrics
    const validationMetrics = calculateValidationMetrics(context);
    // Return result with metrics but no AI enhancements on error
    return {
      enhancedDescriptions: {},
      suggestedSpecialities: {},
      structureInsights: {
        sheetPurpose: {},
        chapterSummaries: {}
      },
      qualityScore: validationMetrics.completenessPercentage,
      summary: 'AI analysis encountered an error. Basic metrics calculated.',
      suggestions: [
        'Review items with missing data',
        'Ensure all required fields are filled',
        'Check data consistency across sheets'
      ],
      validationMetrics,
      uncertainRows: []
    };
  }
}

/**
 * Build a prompt for AI analysis based on Excel context
 */
function buildAnalysisPrompt(context: ExcelAnalysisContext): string {
  let prompt = `Analyze this Portuguese construction budget Excel file:\n\n`;
  
  prompt += `Total rows across all sheets: ${context.totalRows}\n`;
  prompt += `Number of sheets: ${context.sheetNames.length}\n`;
  prompt += `Sheet names: ${context.sheetNames.join(', ')}\n\n`;
  
  // Add sample data from each sheet
  context.sampleData.forEach((sheet) => {
    prompt += `\n--- Sheet: ${sheet.sheetName} ---\n`;
    prompt += `Headers: ${sheet.headers.join(' | ')}\n`;
    prompt += `Sample rows (first 5):\n`;
    sheet.sampleRows.slice(0, 5).forEach((row, idx) => {
      prompt += `  ${idx + 1}. ${row.join(' | ')}\n`;
    });
  });
  
  prompt += `\n\nPlease analyze this data and provide:
1. Enhanced descriptions for items to make them clearer
2. Suggested construction specialities for categorization
3. Purpose of each sheet in the workbook
4. Summaries of chapter content
5. A quality score (0-100) based on completeness, organization, and clarity
6. An overall summary of the file
7. Practical suggestions for improvement

Focus on the most important items and provide practical insights that will help with budget organization and speciality assignment.

Note: Initial data validation shows:
- Total items: ${context.totalRows}
- Some items may be missing units, quantities, or prices which should be noted in your suggestions.`;
  
  return prompt;
}

/**
 * Extract sample context from Excel workbook for AI analysis
 */
export function extractExcelContext(
  workbook: XLSX.WorkBook, // XLSX workbook type
  maxSampleRows: number = 10
): ExcelAnalysisContext {
  const context: ExcelAnalysisContext = {
    sheetNames: workbook.SheetNames,
    sampleData: [],
    totalRows: 0
  };

  workbook.SheetNames.forEach((sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
    
    if (jsonData.length === 0) return;
    
    context.totalRows += jsonData.length;
    
    // Extract headers (first non-empty row)
    const headers: string[] = [];
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const row = jsonData[i];
      if (Array.isArray(row) && row.some(cell => cell && String(cell).trim() !== '')) {
        headers.push(...row.map(cell => String(cell || '').trim()));
        headerRowIndex = i;
        break;
      }
    }
    
    // Extract sample rows (after headers)
    const sampleRows: string[][] = [];
    if (headerRowIndex !== -1) {
      for (let i = headerRowIndex + 1; i < Math.min(headerRowIndex + 1 + maxSampleRows, jsonData.length); i++) {
        const row = jsonData[i];
        if (Array.isArray(row) && row.some(cell => cell && String(cell).trim() !== '')) {
          sampleRows.push(row.map(cell => String(cell || '').trim()));
        }
      }
    }
    
    context.sampleData.push({
      sheetName,
      headers,
      sampleRows
    });
  });
  
  return context;
}
