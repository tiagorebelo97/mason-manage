const ExcelJS = require('exceljs');
const path = require('path');

async function analyzeExcel() {
    const filePath = path.join(__dirname, 'Cópia de HOTEL MUNDIAL - Fase 2_V2.xlsx');

    console.log('Reading Excel file:', filePath);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    console.log('\n=== EXCEL STRUCTURE ANALYSIS ===\n');

    workbook.eachSheet((worksheet, sheetId) => {
        console.log(`\n📄 SHEET: "${worksheet.name}"`);
        console.log('─'.repeat(80));

        let chapterCount = 0;
        const chapters = [];

        worksheet.eachRow((row, rowNumber) => {
            // Skip header rows
            if (rowNumber <= 5) return;

            // Check if row is hidden
            if (row.hidden) return;

            const cellA = row.getCell(1);
            const cellB = row.getCell(2);

            // Look for chapter patterns (bold text in column A or B)
            const valueA = cellA.value?.toString().trim() || '';
            const valueB = cellB.value?.toString().trim() || '';

            // Check if it's a chapter (bold font or specific patterns)
            const isBoldA = cellA.font?.bold === true;
            const isBoldB = cellB.font?.bold === true;

            // Chapter number patterns
            const chapterPattern = /^[A-Z0-9][\.\s]/;

            if ((isBoldA || isBoldB) && (chapterPattern.test(valueA) || chapterPattern.test(valueB))) {
                chapterCount++;
                const chapterNum = valueA || valueB;
                const chapterName = valueA ? valueB : '';

                chapters.push({
                    row: rowNumber,
                    number: chapterNum,
                    name: chapterName,
                    boldA: isBoldA,
                    boldB: isBoldB
                });

                if (chapterCount <= 20) { // Show first 20 chapters
                    console.log(`  ${chapterCount}. Row ${rowNumber}: "${chapterNum}" - "${chapterName}"`);
                }
            }
        });

        console.log(`\n  Total chapters found: ${chapterCount}`);

        if (chapterCount > 20) {
            console.log(`  ... (showing first 20, total ${chapterCount})`);
        }
    });

    console.log('\n' + '='.repeat(80));
}

analyzeExcel().catch(console.error);
