const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import mongoose from 'mongoose';
import { KnowledgeBase } from '../models/KnowledgeBase';

/**
 * Splits input text into smaller paragraphs/chunks with an overlapping boundary
 */
export const chunkText = (text: string, chunkSize: number = 800, overlap: number = 150): string[] => {
  if (!text) return [];
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleanText.length) {
    const endIndex = Math.min(startIndex + chunkSize, cleanText.length);
    let chunk = cleanText.substring(startIndex, endIndex);
    
    // Attempt to align chunk endings to the end of a sentence or space to prevent chopped context
    if (endIndex < cleanText.length) {
      const lastSpace = chunk.lastIndexOf(' ');
      if (lastSpace > chunkSize * 0.7) {
        chunk = chunk.substring(0, lastSpace);
      }
    }
    
    chunks.push(chunk.trim());
    startIndex += chunkSize - overlap;
  }
  
  return chunks;
};

/**
 * Parses file buffers (PDF, DOCX, TXT) into raw string contents
 */
export const parseFile = async (fileBuffer: Buffer, fileType: string): Promise<string> => {
  try {
    if (fileType === 'pdf') {
      const pdfData = await pdf(fileBuffer);
      return pdfData.text || '';
    } else if (fileType === 'docx') {
      const docxData = await mammoth.extractRawText({ buffer: fileBuffer });
      return docxData.value || '';
    } else {
      // Default plain text format
      return fileBuffer.toString('utf-8');
    }
  } catch (error: any) {
    console.error('File parsing error:', error.message);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};

/**
 * RAG search function: Retrieves the most contextually relevant chunks
 * matching the search query terms from all uploaded documents.
 */
export const getRelevantContext = async (query: string, limit: number = 3): Promise<string> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return '';
    }
    const documents = await KnowledgeBase.find({});
    if (!documents || documents.length === 0) {
      return '';
    }

    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
    
    interface ScoredChunk {
      chunk: string;
      score: number;
      source: string;
    }

    const scoredChunks: ScoredChunk[] = [];

    for (const doc of documents) {
      for (const chunk of doc.chunks) {
        const chunkLower = chunk.toLowerCase();
        let score = 0;

        // Score based on term frequency matches
        for (const term of queryTerms) {
          if (chunkLower.includes(term)) {
            score += 1;
            // Bonus score for exact phrase match
            if (chunkLower.includes(queryLower)) {
              score += 2;
            }
          }
        }

        if (score > 0) {
          scoredChunks.push({
            chunk,
            score,
            source: doc.title
          });
        }
      }
    }

    // Sort by descending score
    scoredChunks.sort((a, b) => b.score - a.score);

    // Take top matches and format as context block
    const topMatches = scoredChunks.slice(0, limit);
    if (topMatches.length === 0) {
      return '';
    }

    return topMatches
      .map((m, idx) => `[Source ${idx + 1}: ${m.source}]\n${m.chunk}`)
      .join('\n\n');
  } catch (error) {
    console.error('Error retrieving context chunks:', error);
    return '';
  }
};
