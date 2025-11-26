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

export interface AIAnalysisResult {
  enhancedDescriptions: Record<string, string>; // artigo -> enhanced description
  suggestedSpecialities: Record<string, string[]>; // artigo -> speciality suggestions
  structureInsights: {
    sheetPurpose: Record<string, string>; // sheet name -> purpose
    chapterSummaries: Record<string, string>; // chapter number -> summary
  };
}

/**
 * Analyze Excel file context with AI to better understand structure and content
 */
export async function analyzeWithAI(
  context: ExcelAnalysisContext
): Promise<AIAnalysisResult> {
  try {
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
        }
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

Respond in JSON format with the following structure:
{
  "enhancedDescriptions": { "artigo_number": "enhanced_description" },
  "suggestedSpecialities": { "artigo_number": ["speciality1", "speciality2"] },
  "structureInsights": {
    "sheetPurpose": { "sheet_name": "purpose_description" },
    "chapterSummaries": { "chapter_number": "chapter_summary" }
  }
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 2000
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      console.error('AI response was empty or missing. Completion:', completion);
      throw new Error('No response from AI: empty or missing content in completion');
    }

    // Parse JSON response with error handling
    let result: AIAnalysisResult;
    try {
      result = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Response content:', responseContent);
      throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }
    
    return result;
  } catch (error) {
    console.error('AI analysis error:', error);
    // Return empty result on error, don't fail the entire analysis
    return {
      enhancedDescriptions: {},
      suggestedSpecialities: {},
      structureInsights: {
        sheetPurpose: {},
        chapterSummaries: {}
      }
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

Focus on the most important items and provide practical insights that will help with budget organization and speciality assignment.`;
  
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
