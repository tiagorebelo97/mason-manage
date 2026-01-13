// Script para analisar as linhas problemáticas do Excel
// Execute: node analyze_excel_rows.js

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function analyzeExcel() {
    // Conectar ao Supabase
    const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY
    );

    // Buscar o projeto Hotel Mundial
    const { data: orcamento } = await supabase
        .from('orcamentos')
        .select('id, name')
        .eq('name', 'Hotel Mundial')
        .single();

    if (!orcamento) {
        console.log('Projeto Hotel Mundial não encontrado');
        return;
    }

    console.log('Projeto encontrado:', orcamento.name, '- ID:', orcamento.id);

    // Buscar o ficheiro
    const { data: files } = await supabase
        .from('orcamento_files')
        .select('*')
        .eq('orcamento_id', orcamento.id);

    if (!files || files.length === 0) {
        console.log('Nenhum ficheiro encontrado');
        return;
    }

    const file = files[0];
    console.log('Ficheiro:', file.file_name);
    console.log('URL:', file.file_url);

    // Descarregar o ficheiro
    const response = await fetch(file.file_url);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);

    // Analisar cada sheet
    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n=== SHEET: ${sheetName} ===`);
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        // Linhas problemáticas (ajustar índices para 0-based)
        const problematicRows = [1833, 2656, 2774]; // 1834-1, 2657-1, 2775-1

        problematicRows.forEach(rowIdx => {
            if (rowIdx < data.length) {
                console.log(`\nLinha ${rowIdx + 1}:`);
                const row = data[rowIdx];

                // Mostrar todas as colunas
                row.forEach((cell, colIdx) => {
                    if (cell !== '') {
                        const colLetter = XLSX.utils.encode_col(colIdx);
                        console.log(`  ${colLetter}: "${cell}"`);
                    }
                });

                // Tentar identificar as colunas principais
                console.log('\nAnálise:');
                console.log('  Primeira célula não vazia:', row.find(c => c !== ''));
                console.log('  Total de colunas com dados:', row.filter(c => c !== '').length);
            }
        });
    });
}

analyzeExcel().catch(console.error);
