const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = "d:/Projetos/mason/mason-manage/excel_files/Cópia de HOTEL MUNDIAL - Fase 2_V2.xlsx";

try {
    console.log(`Reading file from: ${filePath}`);
    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    console.log("Sheet Names:", workbook.SheetNames);

    const HEADER_PATTERNS = {
        UN: ['UN', 'UNIDADE', 'UNI', 'UNID', 'UNID.'],
        QT: ['QT', 'QUANTIDADE', 'QUANT', 'QUANT.', 'QTY', 'QNT', 'TOTAIS', 'TOTAL'],
        PRECO: ['PRECO', 'PREÇO', 'PU', 'UNITARIO', 'UNITÁRIO', 'P.U.', 'P.UNITARIO', 'PRECO UNIT.', 'PREÇO UNIT.'],
        ARTIGO: ['ARTIGO', 'ART', 'ART.', 'CAP', 'CAP.', 'CODIGO', 'CÓDIGO', 'COD', 'COD.', 'ITEM']
    };

    workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        let jsonData = [];
        try {
            jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        } catch (e) {
            console.error(`Error reading sheet ${sheetName}:`, e);
            return;
        }

        if (jsonData.length === 0) return;

        // Extract headers (first non-empty row)
        let headers = [];
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(20, jsonData.length); i++) {
            const row = jsonData[i];
            if (Array.isArray(row) && row.some(cell => cell && String(cell).trim() !== '')) {
                // Precise header detection
                const matchCount = row.filter(cell => {
                    if (!cell) return false;
                    const upCell = String(cell).toUpperCase().trim();
                    return Object.values(HEADER_PATTERNS).flat().some(p =>
                        upCell === p || upCell.startsWith(`${p} `) || upCell.includes(` ${p}`)
                    );
                }).length;

                const nonEmptyCells = row.filter(cell => cell && String(cell).trim() !== '').length;

                if (matchCount >= 2 || (matchCount >= 1 && nonEmptyCells >= 4)) {
                    headers = row.map(cell => String(cell || '').trim());
                    headerRowIndex = i;
                    console.log(`Found header in sheet '${sheetName}' at row ${i}:`, headers);
                    break;
                }
            }
        }

        if (headerRowIndex === -1) {
            console.warn(`Could not find header row in sheet '${sheetName}'`);
            return;
        }

        const findIndex = (patterns) => headers.findIndex(h =>
            h && patterns.some(p => h.toUpperCase().trim() === p)
        );

        const unIndex = findIndex(HEADER_PATTERNS.UN);
        const qtIndex = findIndex(HEADER_PATTERNS.QT);
        const precoIndex = findIndex(HEADER_PATTERNS.PRECO);
        const artigoIndex = findIndex(HEADER_PATTERNS.ARTIGO);
        const descricaoIndex = headers.findIndex(h => h && ['DESIGNACAO', 'DESIGNAÇÃO', 'DESCRIÇÃO', 'DESCRICAO', 'DESC'].some(p => h.toUpperCase().trim() === p));

        console.log(`Sheet '${sheetName}' column mapping: Artigo:${artigoIndex}, Desc:${descricaoIndex}, UN:${unIndex}, QT:${qtIndex}, Preco:${precoIndex}`);

        let missingUnits = 0;
        let missingQuantities = 0;
        let missingPrices = 0;
        let totalItems = 0;

        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const hasArtigo = artigoIndex >= 0 && row[artigoIndex] && String(row[artigoIndex]).trim() !== '';
            const hasDesc = descricaoIndex >= 0 && row[descricaoIndex] && String(row[descricaoIndex]).trim() !== '';
            const hasUN = unIndex >= 0 && row[unIndex] && String(row[unIndex]).trim() !== '';

            if (hasDesc && (hasArtigo || hasUN)) {
                totalItems++;
                const qtVal = qtIndex >= 0 ? row[qtIndex] : undefined;
                const precoVal = precoIndex >= 0 ? row[precoIndex] : undefined;

                if (unIndex >= 0 && !hasUN) missingUnits++;
                if (qtIndex >= 0 && (!qtVal || String(qtVal).trim() === '')) missingQuantities++;
                if (precoIndex >= 0 && (!precoVal || String(precoVal).trim() === '')) missingPrices++;
            }
        }
        console.log(`Sheet '${sheetName}' Stats: TotalItems:${totalItems}, MissingUnits:${missingUnits}, MissingQty:${missingQuantities}, MissingPrices:${missingPrices}`);
    });

} catch (e) {
    console.error("Error:", e);
}
