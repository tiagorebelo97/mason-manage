# AI Analysis Feature - Testing Guide

## Prerequisites

1. **OpenAI API Key**: Get from https://platform.openai.com/api-keys
2. **Configuration**: Add to `.env` file:
   ```
   VITE_OPENAI_API_KEY="sk-..."
   ```
3. **Sample Excel Files**: Portuguese construction budget files with chapters and items

## Test Scenarios

### Test 1: Basic AI Analysis with Valid API Key

**Steps:**
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:8080
3. Login to the application
4. Go to an Orcamento (budget)
5. Upload a sample Excel file
6. Click "AI Analyse" button (with sparkles icon ✨)

**Expected Results:**
- Button shows loading state: "⟳ AI Analyzing..."
- After ~5-20 seconds, analysis completes
- Success toast appears: "File analyzed with AI successfully"
- AI Insights section displays below file info with:
  - Quality score (0-100) with colored progress bar
  - Summary text describing the budget
  - List of suggestions (if any issues found)
  - Data validation metrics (missing units, quantities, prices)
- File is marked as analyzed
- Excel data appears in tabs below

**Test Data:**
- Quality score should be 80-100 for clean data
- Quality score should be lower for data with missing fields

---

### Test 2: AI Analysis Without API Key

**Steps:**
1. Remove or comment out `VITE_OPENAI_API_KEY` from `.env`
2. Restart dev server
3. Upload an Excel file
4. Click "AI Analyse" button

**Expected Results:**
- Normal analysis runs first
- Fallback analysis runs (without OpenAI)
- Error toast: "Failed to analyze file with AI - OpenAI API key not configured"
- AI Insights section still displays with:
  - Quality score based on data completeness only
  - Summary: "Analysis completed with basic validation (AI analysis unavailable)"
  - Basic suggestions about missing data
  - Data validation metrics

---

### Test 3: AI Analysis with Invalid API Key

**Steps:**
1. Set `VITE_OPENAI_API_KEY="invalid-key"` in `.env`
2. Restart dev server
3. Upload an Excel file
4. Click "AI Analyse" button

**Expected Results:**
- Normal analysis completes
- OpenAI API call fails
- Error toast: "Failed to analyze file with AI - OpenAI API error"
- Fallback to basic analysis (same as Test 2)

---

### Test 4: Normal Analyze Button (Regression Test)

**Steps:**
1. Upload an Excel file
2. Click "Analyze" button (not AI Analyse)

**Expected Results:**
- Only normal analysis runs
- No AI insights displayed
- File is marked as analyzed
- Excel data appears in tabs
- AI Analyse button should no longer be visible after analysis

---

### Test 5: Button States and Interactions

**Test 5.1: Disabled States During Analysis**
1. Click "Analyze"
2. While analyzing, verify:
   - "Analyze" button is disabled
   - "AI Analyse" button is disabled

**Test 5.2: Disabled States During AI Analysis**
1. Click "AI Analyse"
2. While analyzing, verify:
   - "Analyze" button is disabled
   - "AI Analyse" button is disabled with spinner

**Test 5.3: After Analysis**
1. Complete any analysis
2. Verify both analysis buttons disappear

---

### Test 6: Data Quality Validation

**Test Data Sets:**

**Dataset A: Perfect Data**
- All items have UN (unit)
- All items have QT (quantity) > 0
- All items have prices > 0

**Expected AI Insights:**
- Quality score: 90-100
- Few or no suggestions
- All validation metrics: 0

---

**Dataset B: Poor Quality Data**
- 10+ items missing UN
- 10+ items with QT = 0 or null
- 10+ items with missing prices

**Expected AI Insights:**
- Quality score: 30-60
- Multiple suggestions about missing data
- Validation metrics show actual counts

---

**Dataset C: Medium Quality Data**
- Some items missing data (3-5 issues)
- Most data complete

**Expected AI Insights:**
- Quality score: 70-85
- Specific suggestions about which items need attention
- Moderate validation metrics

---

### Test 7: Large File Performance

**Steps:**
1. Upload Excel file with 200+ items
2. Click "AI Analyse"

**Expected Results:**
- Analysis completes within 30 seconds
- No browser freezing or UI blocking
- Loading indicators show progress
- All data extracted correctly

---

### Test 8: UI Responsiveness

**Desktop (>768px):**
- Buttons side by side
- AI Insights section full width
- 3-column grid for validation metrics

**Mobile (<768px):**
- Buttons stack vertically or wrap
- AI Insights section responsive
- Validation metrics stack in single column

**Test on:**
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

---

### Test 9: Language Switching

**Steps:**
1. Set language to English
2. Upload file and analyze
3. Verify all labels in English
4. Switch to Portuguese
5. Verify all labels in Portuguese

**Expected Labels:**
- English: "AI Analyse", "AI Analyzing...", "Quality Score"
- Portuguese: "Análise IA", "A analisar com IA...", "Pontuação de Qualidade"

---

### Test 10: Error Recovery

**Test 10.1: Network Error**
1. Disconnect network after normal analysis
2. Wait for AI call to fail
3. Verify graceful fallback to basic analysis

**Test 10.2: Malformed AI Response**
1. (Requires mocking) Simulate invalid JSON from OpenAI
2. Verify error is caught and fallback works

**Test 10.3: Missing Database Data**
1. Delete data during AI fetch
2. Verify error message appears

---

### Test 11: Multiple Files

**Steps:**
1. Upload and analyze file A
2. Delete file A
3. Upload and analyze file B with AI
4. Verify insights are for file B, not cached from file A

---

### Test 12: Security

**Check that:**
- API key is not exposed in browser console
- API key is not in source code (only in .env)
- API requests use HTTPS
- No sensitive data is logged to console in production

---

## Performance Benchmarks

| Metric | Target | Notes |
|--------|--------|-------|
| Normal Analysis Time | < 10s | For files with 100-200 items |
| AI Analysis Time | < 30s | Includes normal analysis + OpenAI call |
| UI Response Time | < 100ms | Button clicks, state changes |
| Memory Usage | < 200MB | Browser tab memory |

---

## Regression Testing

After implementing AI Analysis, verify these existing features still work:

1. ✅ Normal file upload
2. ✅ Normal analysis without AI
3. ✅ File deletion
4. ✅ Tab navigation after analysis
5. ✅ Chapter and item display
6. ✅ Article-based view
7. ✅ Specialties management
8. ✅ Comments and observations

---

## Known Limitations

1. **API Rate Limits**: OpenAI has rate limits (60 requests/min for free tier)
2. **Cost**: Each analysis costs ~$0.01-0.03 depending on file size
3. **Language**: AI responses are in English, may need translation
4. **Accuracy**: AI suggestions are not 100% accurate, should be reviewed

---

## Debugging Tips

### Enable Detailed Logging

Add to browser console before testing:
```javascript
localStorage.debug = 'app:*'
```

### Check Network Tab

1. Open DevTools > Network
2. Filter by "openai"
3. Check request/response for AI calls

### Common Issues

**"No tabs found after analysis"**
- Normal analysis failed or is too slow
- Check database for partial data
- Increase polling attempts in code

**"Failed to parse AI response"**
- OpenAI returned invalid JSON
- Check network response in DevTools
- May need to adjust AI prompt

**Quality score is 0**
- Too many missing data items
- Check data validation metrics for details

---

## Automated Testing (Future)

Consider adding:
1. Unit tests for `aiAnalysisService.ts`
2. Integration tests for AI mutation
3. E2E tests with Playwright
4. Mock OpenAI responses for consistent testing

---

## Test Report Template

```markdown
## AI Analysis Test Report

**Date:** YYYY-MM-DD
**Tester:** Name
**Environment:** Dev/Staging/Production
**OpenAI API:** Configured/Not Configured

### Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| Test 1: Basic AI Analysis | ✅ Pass | |
| Test 2: Without API Key | ✅ Pass | |
| Test 3: Invalid API Key | ✅ Pass | |
| ... | | |

### Issues Found

1. Issue description
   - Severity: High/Medium/Low
   - Steps to reproduce
   - Expected vs Actual

### Overall Assessment

- ✅ Feature ready for production
- ⚠️  Minor issues, can deploy with notes
- ❌ Critical issues, do not deploy
```
