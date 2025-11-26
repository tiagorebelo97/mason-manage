# AI Analyze Feature - Quick Reference

## Quick Setup
1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env`: `VITE_OPENAI_API_KEY=sk-your-key`
3. Restart dev server: `npm run dev`

## Using AI Analyze
1. Go to Orçamentos → Select a budget
2. Upload Excel file
3. Click "AI Analyze" button (✨ icon)
4. Wait for analysis to complete
5. Review enhanced results

## What AI Provides
- ✅ Enhanced, clearer item descriptions
- ✅ Smart speciality suggestions
- ✅ Sheet purpose identification
- ✅ Chapter summaries
- ✅ Better understanding of complex files

## Key Features
- Works alongside normal analysis
- Graceful fallback if AI unavailable
- Cost-effective (GPT-4o-mini)
- Portuguese language support
- No impact on existing functionality

## Costs
- ~$0.01-$0.05 per analysis
- Based on file size
- Optional feature - can be disabled

## Troubleshooting
| Issue | Solution |
|-------|----------|
| Button doesn't work | Check API key in `.env` |
| Error message | Check browser console |
| Slow analysis | Large files take longer |
| Rate limit error | Wait a few minutes |

## Without API Key
- Feature is disabled
- Normal analysis still works
- No error messages
- Application functions normally

## Security Note
⚠️ API key is client-side. For production, use backend proxy.

## Need Help?
See full documentation: [AI_ANALYZE_FEATURE.md](./AI_ANALYZE_FEATURE.md)
