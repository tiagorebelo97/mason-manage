const XLSX = require('xlsx');

// Ler o ficheiro Excel
const workbook = XLSX.readFile('Cópia de HOTEL MUNDIAL - Fase 2_V2.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log('Sheet:', sheetName);
console.log('');

// Converter para array
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

// Analisar as linhas problemáticas
const problematicRows = [
    { line: 1834, index: 1833 },
    { line: 2657, index: 2656 },
    { line: 2775, index: 2774 }
];

problematicRows.forEach(({ line, index }) => {
    console.log(`=== LINHA ${line} ===`);
    if (index < data.length) {
        const row = data[index];
        row.forEach((cell, colIdx) => {
            if (cell !== '') {
                const colLetter = XLSX.utils.encode_col(colIdx);
                console.log(`  ${colLetter} (col ${colIdx}): "${cell}"`);
            }
        });
    } else {
        console.log('  (linha não existe)');
    }
    console.log('');
});
