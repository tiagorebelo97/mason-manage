# AI Analysis Feature

## Overview

The AI Analysis feature enhances the Excel file analysis capabilities by using OpenAI's GPT-4 to provide intelligent insights about construction budget files (Orçamentos).

## Features

### 1. AI-Powered Analysis Button

A new "AI Analyse" button has been added next to the standard "Analyze" button in the MapaQuantidades page. This button:

- Runs the normal analysis first (to ensure all data is extracted properly)
- Sends the extracted data to OpenAI for intelligent analysis
- Displays AI-generated insights in a dedicated section

### 2. AI Insights Display

After running the AI analysis, the following information is displayed:

- **Quality Score**: A 0-100 score indicating the overall quality of the budget data
- **Summary**: A brief overview of the budget structure and contents
- **Suggestions**: Actionable recommendations for improving the budget
- **Data Validation**: Detailed statistics about missing or incomplete data:
  - Missing units
  - Missing quantities
  - Missing prices
  - Data inconsistencies

### 3. Smart Analysis

The AI analysis respects all the rules from the normal analysis and adds:

- Validation of data completeness
- Identification of potential errors or inconsistencies
- Suggestions for better chapter organization
- Quality scoring based on multiple factors
- Insights about budget structure

## Configuration

### Setting up OpenAI API Key

1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file:

```env
VITE_OPENAI_API_KEY="your-openai-api-key-here"
```

3. Restart your development server

### Without API Key

If the OpenAI API key is not configured:
- The AI Analysis button will still be available
- When clicked, it will run the normal analysis
- It will provide basic validation without AI insights
- An error message will indicate that the API key is not configured

## Usage

1. Upload an Excel file (Orçamento)
2. Click the "AI Analyse" button (with sparkles icon ✨)
3. Wait for the analysis to complete
4. Review the AI insights displayed below the file information
5. Use the suggestions to improve your budget data

## Technical Details

### AI Service

The AI analysis is handled by `src/services/aiAnalysisService.ts`, which:

- Prepares a summary of the extracted data
- Calls OpenAI's GPT-4o-mini model
- Processes the AI response
- Falls back to basic validation if AI is unavailable

### Integration Points

- **MapaQuantidades.tsx**: Main page with the AI Analysis button
- **LanguageContext.tsx**: Translation strings for the feature
- **aiAnalysisService.ts**: AI service implementation

### API Usage

The feature uses OpenAI's Chat Completions API with:
- Model: `gpt-4o-mini` (cost-effective and fast)
- Temperature: 0.7 (balanced creativity and consistency)
- Max tokens: 1500 (sufficient for detailed analysis)

## Cost Considerations

- Each AI analysis costs approximately $0.01-0.03 depending on the file size
- The service uses GPT-4o-mini to minimize costs while maintaining quality
- Only essential data is sent to the API (not the entire Excel file)

## Future Enhancements

Potential improvements for future versions:

1. Chapter-specific AI suggestions
2. Item-level AI insights
3. Automatic fixing of common errors
4. Budget comparison and benchmarking
5. Custom AI prompts based on user preferences
6. Support for other AI providers (Anthropic Claude, etc.)

## Security

- API keys are stored in environment variables (not committed to git)
- Only metadata and summaries are sent to OpenAI (not sensitive data)
- All API calls are made client-side over HTTPS
- Users must explicitly click the AI Analysis button

## Troubleshooting

### "OpenAI API key not configured" error
- Make sure you have added `VITE_OPENAI_API_KEY` to your `.env` file
- Restart your development server after adding the key

### "OpenAI API error" message
- Check that your API key is valid and has available credits
- Verify you have internet connectivity
- Check OpenAI's status page for service issues

### Analysis takes too long
- Large files with many items may take 10-30 seconds to analyze
- The progress indicator shows when analysis is in progress
- Be patient and don't refresh the page
