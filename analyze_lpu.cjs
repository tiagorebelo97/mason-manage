const ExcelJS = require('exceljs');
const path = require('path');

async function analyzeLPUDetalhado() {
    const filePath = path.join(__dirname, 'Cópia de HOTEL MUNDIAL - Fase 2_V2.xlsx');

    console.log('Reading Excel file:', filePath);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const lpuSheet = workbook.getWorksheet('LPU detalhado');

    if (!lpuSheet) {
        console.log('Sheet "LPU detalhado" not found!');
        return;
    }

    console.log('\n=== LPU DETALHADO SHEET - First 30 rows ===\n');

    for (let i = 1; i <= 30; i++) {
        const row = lpuSheet.getRow(i);
        if (row.hidden) {
            console.log(`Row ${i}: [HIDDEN]`);
            continue;
        }

        const cellA = row.getCell(1);
        const cellB = row.getCell(2);
        const cellC = row.getCell(3);

        const valueA = cellA.value?.toString().trim() || '';
        const valueB = cellB.value?.toString().trim() || '';
        const valueC = cellC.value?.toString().trim() || '';

        const isBoldA = cellA.font?.bold === true;
        const isBoldB = cellB.font?.bold === true;
        const isBoldC = cellB.font?.bold === true;

        const bgColorA = cellA.fill?.fgColor?.argb || '';

        if (valueA || valueB || valueC) {
            console.log(`Row ${i}: A="${valueA}" ${isBoldA ? '[BOLD]' : ''} ${bgColorA ? `[BG:${bgColorA}]` : ''} | B="${valueB}" ${isBoldB ? '[BOLD]' : ''} | C="${valueC}"`);
        }
    }
}

analyzeLPUDetalhado().catch(console.error);
