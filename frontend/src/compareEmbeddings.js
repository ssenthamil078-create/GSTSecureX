// Cosine similarity between two embedding vectors (128-dim from face-api.js)
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Embedding vectors must be the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}

// face-api.js descriptors work well with Euclidean distance too;
// this threshold is tuned for cosine similarity (closer to 1 = more similar)
export const SIMILARITY_THRESHOLD = 0.90;

export function isVerified(similarity) {
  return similarity >= SIMILARITY_THRESHOLD;
}
