/**
 * AI Analysis Service
 * Provides AI-powered analysis of Excel file data
 */

export interface ExcelAnalysisData {
  chapters: Array<{
    chapter_number: string;
    chapter_name: string;
    chapter_comments?: string;
  }>;
  items: Array<{
    artigo: string;
    descricao: string;
    un: string | null;
    qt: number | null;
    preco_unitario: number | null;
    item_comments?: string | null;
  }>;
  articles?: Array<{
    artigo: string;
    title: string;
    contents: Array<{
      type: 'text' | 'item';
      data: string | any;
    }>;
  }>;
}

export interface AIAnalysisResult {
  enhancedChapters: Array<{
    chapter_number: string;
    chapter_name: string;
    chapter_comments?: string;
    ai_suggestions?: string;
  }>;
  enhancedItems: Array<{
    artigo: string;
    descricao: string;
    un: string | null;
    qt: number | null;
    preco_unitario: number | null;
    item_comments?: string | null;
    ai_insights?: string;
  }>;
  insights: {
    summary: string;
    qualityScore: number;
    suggestions: string[];
    dataValidation: {
      missingUnits: number;
      missingQuantities: number;
      missingPrices: number;
      inconsistencies: string[];
    };
  };
}

/**
 * Analyzes Excel data using OpenAI API
 */
export async function analyzeExcelWithAI(
  data: ExcelAnalysisData,
  fileName: string
): Promise<AIAnalysisResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  // Prepare data summary for AI analysis
  const dataSummary = {
    fileName,
    totalChapters: data.chapters.length,
    totalItems: data.items.length,
    totalArticles: data.articles?.length || 0,
    chapters: data.chapters.map(c => ({
      number: c.chapter_number,
      name: c.chapter_name,
      hasComments: !!c.chapter_comments
    })),
    itemsSample: data.items.slice(0, 20).map(i => ({
      artigo: i.artigo,
      descricao: i.descricao,
      un: i.un,
      qt: i.qt,
      hasComments: !!i.item_comments
    }))
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert construction budget analyst. Analyze the provided Excel data from a Portuguese construction budget file (Orçamento). 
            
Your task is to:
1. Validate data quality and identify missing or inconsistent information
2. Provide insights about the budget structure
3. Suggest improvements for chapter organization
4. Identify potential errors or inconsistencies in quantities, units, or prices
5. Generate a quality score (0-100)
6. Provide actionable suggestions for improvement

Respond in JSON format with the following structure:
{
  "summary": "Brief overview of the budget",
  "qualityScore": 85,
  "suggestions": ["suggestion 1", "suggestion 2"],
  "dataValidation": {
    "missingUnits": 0,
    "missingQuantities": 0,
    "missingPrices": 0,
    "inconsistencies": ["description of any inconsistencies"]
  }
}`
          },
          {
            role: 'user',
            content: `Analyze this construction budget data:\n\n${JSON.stringify(dataSummary, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const aiAnalysis = JSON.parse(result.choices[0].message.content);

    // Count actual data quality issues
    const missingUnits = data.items.filter(i => !i.un).length;
    const missingQuantities = data.items.filter(i => i.qt === null || i.qt === 0).length;
    const missingPrices = data.items.filter(i => i.preco_unitario === null || i.preco_unitario === 0).length;

    // Merge AI analysis with actual counts
    const insights = {
      summary: aiAnalysis.summary || 'AI analysis completed',
      qualityScore: aiAnalysis.qualityScore || 80,
      suggestions: aiAnalysis.suggestions || [],
      dataValidation: {
        missingUnits,
        missingQuantities,
        missingPrices,
        inconsistencies: aiAnalysis.dataValidation?.inconsistencies || []
      }
    };

    // Return enhanced data with AI insights
    return {
      enhancedChapters: data.chapters.map(chapter => ({
        ...chapter,
        ai_suggestions: undefined // Could add chapter-specific suggestions in future
      })),
      enhancedItems: data.items.map(item => ({
        ...item,
        ai_insights: undefined // Could add item-specific insights in future
      })),
      insights
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Fallback: provide basic analysis without AI
    const missingUnits = data.items.filter(i => !i.un).length;
    const missingQuantities = data.items.filter(i => i.qt === null || i.qt === 0).length;
    const missingPrices = data.items.filter(i => i.preco_unitario === null || i.preco_unitario === 0).length;
    
    const suggestions = [];
    if (missingUnits > 0) suggestions.push(`${missingUnits} items are missing unit information`);
    if (missingQuantities > 0) suggestions.push(`${missingQuantities} items are missing quantities`);
    if (missingPrices > 0) suggestions.push(`${missingPrices} items are missing prices`);
    
    return {
      enhancedChapters: data.chapters,
      enhancedItems: data.items,
      insights: {
        summary: 'Analysis completed with basic validation (AI analysis unavailable)',
        qualityScore: 70 - (missingUnits + missingQuantities + missingPrices),
        suggestions,
        dataValidation: {
          missingUnits,
          missingQuantities,
          missingPrices,
          inconsistencies: []
        }
      }
    };
  }
}
