export const purposeLayout = (purpose, deckId) => {
    const nrLines = purpose?.length || 0;
    const purposeParagraphs = nrLines > 1 ? purpose : (nrLines === 1 ? [...purpose, ""] : ["", ""]);
    return purposeParagraphs.map((text,i) => ({ text, i, deckId }));
}