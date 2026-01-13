// Script de diagnóstico para executar no Console do Browser (F12)
// Cole este código na consola quando estiver na página do Hotel Mundial após análise

// Verificar os uncertain rows
console.log('=== DIAGNÓSTICO DE ITENS INCERTOS ===');

// Tentar encontrar os uncertain rows no localStorage ou sessionStorage
const keys = Object.keys(localStorage);
console.log('LocalStorage keys:', keys.filter(k => k.includes('uncertain') || k.includes('Hotel')));

// Instruções
console.log(`
INSTRUÇÕES PARA DEBUG:

1. Após fazer a análise, abra o Console (F12)
2. Cole este código:

// Ver todos os uncertain rows
console.log('Uncertain rows:', JSON.parse(JSON.stringify(uncertainRows || [])));

// Se não funcionar, tente:
const reactRoot = document.querySelector('#root');
console.log('React root:', reactRoot);

3. Partilhe o output aqui

OU MELHOR:

Partilhe o ficheiro Excel do Hotel Mundial para eu poder analisar a estrutura exata
e entender porque é que estes 3 itens específicos estão a ser marcados.

Informação necessária do Excel:
- Linha 1834 (Equipamento sanitário) - Artigo 8
- Linha 2657 (Tubagens) - Artigo 1  
- Linha 2775 (Tubagens) - Artigo 1

Preciso de ver:
- O que está na coluna ARTIGO
- O que está na coluna DESCRIÇÃO
- O que está nas colunas UN e QT
- Quais são as colunas vizinhas
`);
