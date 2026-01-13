const ExcelJS = require('exceljs');
const path = require('path');

async function analyzeResumo() {
    const filePath = path.join(__dirname, 'Cópia de HOTEL MUNDIAL - Fase 2_V2.xlsx');

    console.log('Reading Excel file:', filePath);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const resumoSheet = workbook.getWorksheet('Resumo');

    if (!resumoSheet) {
        console.log('Sheet "Resumo" not found!');
        return;
    }

    console.log('\n=== RESUMO SHEET ANALYSIS ===\n');
    console.log(`Total rows: ${resumoSheet.rowCount}`);
    console.log('\nFirst 50 rows:\n');

    for (let i = 1; i <= Math.min(50, resumoSheet.rowCount); i++) {
        const row = resumoSheet.getRow(i);
        if (row.hidden) continue;

        const cellA = row.getCell(1);
        const cellB = row.getCell(2);
        const cellC = row.getCell(3);

        const valueA = cellA.value?.toString().trim() || '';
        const valueB = cellB.value?.toString().trim() || '';
        const valueC = cellC.value?.toString().trim() || '';

        const isBoldA = cellA.font?.bold === true;
        const isBoldB = cellB.font?.bold === true;

        if (valueA || valueB || valueC) {
            console.log(`Row ${i}: A="${valueA}" ${isBoldA ? '[BOLD]' : ''} | B="${valueB}" ${isBoldB ? '[BOLD]' : ''} | C="${valueC}"`);
        }
    }
}

analyzeResumo().catch(console.error);
