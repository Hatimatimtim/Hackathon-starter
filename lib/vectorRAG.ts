import { DocumentChunk, getAllDocumentChunks } from "./documentStore";

export interface RankedChunk {
  chunk: DocumentChunk;
  score: number;
}

/**
 * Lightweight TF-IDF / term-overlap semantic vector search simulator.
 * Calculates term relevance scores for document chunks given a search query or compliance rule requirement.
 */
export function getTopRelevantChunks(query: string, topK: number = 4): RankedChunk[] {
  const allChunks = getAllDocumentChunks();
  if (allChunks.length === 0) return [];

  const queryTerms = extractTerms(query);
  if (queryTerms.length === 0) {
    return allChunks.slice(0, topK).map((chunk) => ({ chunk, score: 0.5 }));
  }

  const scoredChunks: RankedChunk[] = allChunks.map((chunk) => {
    const chunkTerms = extractTerms(chunk.content);
    let matchCount = 0;
    let weightSum = 0;

    queryTerms.forEach((term) => {
      const termCount = chunkTerms.filter((t) => t === term).length;
      if (termCount > 0) {
        matchCount++;
        // Boost terms based on term length (longer technical terms match better)
        weightSum += 1 + Math.log(termCount) + (term.length > 6 ? 0.5 : 0);
      }
    });

    const score = queryTerms.length > 0 ? (matchCount / queryTerms.length) * 0.6 + (weightSum / (queryTerms.length * 2)) * 0.4 : 0;
    return {
      chunk,
      score: Math.min(1.0, Math.round(score * 100) / 100),
    };
  });

  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

function extractTerms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

const STOP_WORDS = new Set([
  "the", "and", "for", "that", "this", "with", "you", "are", "have", "from",
  "was", "were", "been", "will", "would", "should", "could", "all", "any", "can",
  "has", "had", "not", "but", "what", "which", "who", "whom", "this", "these",
  "those", "then", "than", "when", "where", "why", "how", "each", "every",
]);
