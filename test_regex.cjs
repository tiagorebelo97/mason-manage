// Test the chapter detection regex
const regex = /^(\d+|[A-Z])(\.\d+)*\.?$/;

const testCases = [
    "A",
    "B",
    "1.1",
    "1.1.1",
    "1.2",
    "3.1",
    "A.",
    "1.",
    "1.1."
];

console.log('Testing chapter detection regex:\n');
testCases.forEach(test => {
    const matches = regex.test(test);
    console.log(`"${test}" -> ${matches ? '✅ MATCH' : '❌ NO MATCH'}`);
});
