# AI Analyze Feature Documentation

## Overview
The AI Analyze feature enhances Excel file analysis for construction budgets (orçamentos) using artificial intelligence. It provides better understanding of file structure, enhanced descriptions, and intelligent categorization while respecting all normal analysis logic.

## Features

### 1. Enhanced Item Descriptions
- AI processes item descriptions to make them clearer and more comprehensive
- Original descriptions are improved with additional context and clarity
- Particularly useful for abbreviated or unclear descriptions in Excel files

### 2. Smart Speciality Suggestions
- AI analyzes items and suggests relevant construction specialities
- Examples: Electrical, Plumbing, HVAC, Masonry, Carpentry, etc.
- Helps with automatic categorization and organization

### 3. Structure Insights
- **Sheet Purpose**: AI identifies the purpose of each Excel sheet
- **Chapter Summaries**: Provides summaries of chapter content
- Better understanding of multi-sheet workbooks

### 4. Seamless Integration
- Works alongside normal analysis
- All existing analysis logic is preserved
- Graceful degradation if AI service is unavailable

## Setup

### 1. Get OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (it starts with `sk-`)

### 2. Configure Environment
Add your API key to the `.env` file:

```bash
# OpenAI API key for AI-enhanced Excel analysis (optional)
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Important**: 
- Keep your API key secret
- Never commit `.env` file to version control
- The API key is optional - normal analysis works without it

### 3. Restart Development Server
After adding the API key, restart your development server:

```bash
npm run dev
```

## Usage

### In the Budgets (Orçamentos) Section:

1. **Upload Excel File**
   - Navigate to an orçamento (budget)
   - Click "Upload Excel File"
   - Select your Excel file

2. **Choose Analysis Type**
   - **Analyze**: Standard analysis without AI
   - **AI Analyze**: Enhanced analysis with AI assistance (sparkles icon ✨)

3. **Review Results**
   - AI-enhanced descriptions appear in the analyzed data
   - All chapters, articles, and items are extracted as normal
   - Additional insights from AI are integrated seamlessly

## How It Works

### Analysis Flow
1. **File Upload**: Excel file is uploaded to storage
2. **Download & Parse**: File is downloaded and parsed with XLSX library
3. **Context Extraction**: Sample data is extracted for AI analysis
4. **AI Processing**: OpenAI analyzes the context and provides insights
5. **Enhancement**: Descriptions and categorizations are enhanced
6. **Normal Analysis**: All regular analysis steps proceed as usual
7. **Database Storage**: Results are stored in the database

### AI Model
- Uses **GPT-4o-mini** for cost-effective analysis
- Optimized for construction budget understanding
- Portuguese language support built-in
- JSON-structured responses for reliability

## Cost Considerations

### OpenAI Pricing (as of 2024)
- GPT-4o-mini is the most affordable GPT-4 model
- Typical cost per analysis: $0.01 - $0.05
- Cost depends on Excel file size and complexity

### Cost Optimization
- AI only analyzes sample data (first 10 rows per sheet)
- Uses efficient prompting to minimize tokens
- Caches context to avoid redundant processing
- Falls back to normal analysis if AI is unavailable

## Error Handling

### Graceful Degradation
If AI analysis fails:
- Error is logged but doesn't stop the analysis
- Normal analysis proceeds without AI enhancements
- User still gets fully analyzed data
- Error toast notification shows what went wrong

### Common Issues

1. **No API Key Configured**
   - AI features are disabled
   - Normal analysis works fine
   - No error messages shown

2. **Invalid API Key**
   - Error logged to console
   - Falls back to normal analysis
   - User sees normal success message

3. **Rate Limiting**
   - OpenAI has rate limits
   - Service automatically retries with backoff
   - Falls back to normal analysis if limits exceeded

4. **Network Issues**
   - Timeouts are handled gracefully
   - Analysis continues without AI enhancements
   - User experience is not interrupted

## Technical Details

### File Structure
```
src/
├── services/
│   └── aiAnalysisService.ts    # AI analysis logic
├── pages/
│   └── MapaQuantidades.tsx     # UI with AI button
└── contexts/
    └── LanguageContext.tsx      # Translations
```

### Key Functions

#### `analyzeWithAI(context: ExcelAnalysisContext)`
- Main AI analysis function
- Takes Excel context (sheets, headers, data)
- Returns enhanced descriptions and suggestions
- Handles errors gracefully

#### `extractExcelContext(workbook: XLSX.WorkBook)`
- Extracts sample data from Excel workbook
- Collects headers and first 10 rows per sheet
- Optimized for AI processing
- Returns structured context object

### API Integration
```typescript
// AI service uses OpenAI SDK
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

// Analysis call
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
  response_format: { type: 'json_object' },
  temperature: 0.3,
  max_tokens: 2000
});
```

## Security Considerations

### API Key Security
- ⚠️ **Client-side API key**: Current implementation uses client-side API calls
- API key is visible in browser network requests
- For production, consider using a backend proxy

### Recommended Production Setup
1. Create a backend API endpoint
2. Store API key on server only
3. Frontend calls backend, backend calls OpenAI
4. Implement rate limiting and authentication

### Data Privacy
- Excel data is sent to OpenAI for analysis
- Only sample data (first 10 rows) is sent
- OpenAI processes data according to their privacy policy
- Consider data sensitivity before enabling AI features

## Troubleshooting

### AI Analysis Not Working

1. **Check API Key**
   ```bash
   # In browser console
   console.log(import.meta.env.VITE_OPENAI_API_KEY)
   ```

2. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for error messages in Console tab
   - Check Network tab for failed requests

3. **Test Normal Analysis**
   - Try clicking "Analyze" instead of "AI Analyze"
   - If normal analysis works, issue is AI-specific

### Common Error Messages

- **"OpenAI API key not configured"**: Add API key to `.env`
- **"Failed to analyze file with AI"**: Check API key validity
- **"Rate limit exceeded"**: Wait and try again later
- **"Network error"**: Check internet connection

## Future Enhancements

### Planned Features
- [ ] Backend proxy for API key security
- [ ] Batch analysis for multiple files
- [ ] Custom AI prompts per project
- [ ] Historical analysis caching
- [ ] AI-suggested speciality mappings
- [ ] Multi-language AI support improvements

### Potential Improvements
- Use streaming for faster perceived performance
- Implement retry logic with exponential backoff
- Add user feedback mechanism for AI quality
- Support for other AI providers (Anthropic, Azure)

## Support

### Getting Help
- Check browser console for detailed error messages
- Review OpenAI dashboard for API usage and errors
- Ensure latest version of the application

### Reporting Issues
When reporting issues, include:
- Browser console logs
- Excel file structure (without sensitive data)
- Steps to reproduce
- Whether normal analysis works

## License & Credits

This feature uses:
- **OpenAI GPT-4o-mini**: For AI analysis
- **XLSX**: For Excel file parsing
- **ExcelJS**: For enhanced Excel features

AI analysis is optional and the application works fully without it.
