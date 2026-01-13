
type ChapterWithArticles = {
    chapter: {
        id: string;
        chapter_number: string;
        chapter_name: string;
    };
    articles: any[];
};

type ChapterNode = {
    item: ChapterWithArticles;
    children: ChapterNode[];
};

const buildChapterTree = (chapters: ChapterWithArticles[]): ChapterNode[] => {
    const root: ChapterNode[] = [];
    const stack: ChapterNode[] = [];

    console.log("Building chapter tree with", chapters.length, "chapters");

    for (const chapter of chapters) {
        const node: ChapterNode = { item: chapter, children: [] };
        const currentNum = chapter.chapter.chapter_number.trim();
        let placed = false;

        while (stack.length > 0) {
            const parent = stack[stack.length - 1];
            const parentNum = parent.item.chapter.chapter_number.trim();

            // Debug log for checking relationships
            console.log(`Checking ${currentNum} against parent ${parentNum}`);

            if (currentNum.startsWith(parentNum + ".") ||
                currentNum.startsWith(parentNum + " ")) {
                console.log(`  -> JS says: "${currentNum}".startsWith("${parentNum}.") is ${currentNum.startsWith(parentNum + ".")}`);
                parent.children.push(node);
                stack.push(node);
                placed = true;
                break;
            } else {
                console.log(`  -> Pop ${parentNum}`);
                stack.pop();
            }
        }

        if (!placed) {
            console.log(`  -> Push Root ${currentNum}`);
            root.push(node);
            stack.push(node);
        }
    }

    console.log("Tree root nodes:", root.length);
    return root;
};

// Mock data based on user issues
const mockChapters: ChapterWithArticles[] = [
    { chapter: { id: "1", chapter_number: "1.1", chapter_name: "Estaleiro" }, articles: [] },
    { chapter: { id: "2", chapter_number: "1.1.1", chapter_name: "Montagem" }, articles: [] },
    { chapter: { id: "3", chapter_number: "1.1.1.1", chapter_name: "Single Article" }, articles: [] },
    { chapter: { id: "4", chapter_number: "1.2", chapter_name: "Other" }, articles: [] }
];

console.log("--- Test 1: Sorted Input ---");
const tree = buildChapterTree(mockChapters);
console.log(JSON.stringify(tree, (key, value) => {
    if (key === 'item') return value.chapter.chapter_number;
    return value;
}, 2));

console.log("\n--- Test 2: Unsorted Input (simulate sorting logic) ---");
const unsortedChapters = [
    mockChapters[1], // 1.1.1
    mockChapters[0], // 1.1
    mockChapters[3], // 1.2
    mockChapters[2]  // 1.1.1.1
];

unsortedChapters.sort((a, b) =>
    a.chapter.chapter_number.localeCompare(b.chapter.chapter_number, undefined, { numeric: true, sensitivity: 'base' })
);

console.log("Sorted order:", unsortedChapters.map(c => c.chapter.chapter_number));
const tree2 = buildChapterTree(unsortedChapters);
console.log("Roots count:", tree2.length);
