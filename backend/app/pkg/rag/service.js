/**
 * Retrieval layer for meeting chat.
 *
 * The full transcript stays on the meeting record for display/export, while
 * chat uses these smaller chunks so each LLM request only receives relevant
 * context.
 */
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';
import { query, withTransaction } from '#app/connections/database.js';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'has',
  'have', 'i', 'in', 'is', 'it', 'of', 'on', 'or', 'our', 'that', 'the', 'this',
  'to', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'who', 'will',
  'with', 'you', 'your',
]);

export class RagService {
  async indexMeetingTranscript (meetingId, transcript) {
    const chunks = buildTranscriptChunks(transcript);
    if (!chunks.length) {
      await query('DELETE FROM transcript_chunks WHERE meeting_id = $1', [meetingId]);
      return [];
    }

    const embeddings = await this._embedChunks(chunks);

    await withTransaction(async (client) => {
      await client.query('DELETE FROM transcript_chunks WHERE meeting_id = $1', [meetingId]);

      for (let index = 0; index < chunks.length; index += 1) {
        const chunk = chunks[index];
        const embedding = embeddings[index] ? toVectorLiteral(embeddings[index]) : null;

        await client.query(
          `INSERT INTO transcript_chunks
             (meeting_id, chunk_index, speaker, start_seconds, end_seconds, text, embedding)
           VALUES ($1, $2, $3, $4, $5, $6, $7::vector)`,
          [
            meetingId,
            index,
            chunk.speaker || null,
            numberOrNull(chunk.start_seconds),
            numberOrNull(chunk.end_seconds),
            chunk.text,
            embedding,
          ]
        );
      }
    });

    logger.info(`Indexed ${chunks.length} transcript chunks for meeting ${meetingId}`);
    return chunks;
  }

  async getContextForQuestion (meeting, question) {
    if (!meeting?.id) return 'No meeting context is available.';

    const chunks = await this.retrieveRelevantChunks(meeting.id, question, meeting.transcript);

    const parts = [];
    if (meeting.summary) {
      parts.push(`Meeting summary:\n${meeting.summary}`);
    }

    if (chunks.length) {
      parts.push(`Relevant transcript excerpts:\n${formatChunks(chunks)}`);
    } else {
      parts.push('No transcript excerpts are available for this meeting.');
    }

    return parts.join('\n\n');
  }

  async retrieveRelevantChunks (meetingId, question, fallbackTranscript = null) {
    const limit = positiveInt(config.get('rag.max_chunks'), 6);

    if (config.get('openai.api_key')) {
      try {
        const [embedding] = await this._embedTexts([question]);
        if (embedding) {
          const result = await query(
            `SELECT id, chunk_index, speaker, start_seconds, end_seconds, text,
                    1 - (embedding <=> $2::vector) AS similarity
             FROM transcript_chunks
             WHERE meeting_id = $1 AND embedding IS NOT NULL
             ORDER BY embedding <=> $2::vector
             LIMIT $3`,
            [meetingId, toVectorLiteral(embedding), limit]
          );
          if (result.rows.length) return result.rows.map(formatDbChunk);
        }
      } catch (error) {
        logger.warn('Vector retrieval failed, using keyword fallback:', error.message);
      }
    }

    const fallbackRows = await query(
      `SELECT id, chunk_index, speaker, start_seconds, end_seconds, text
       FROM transcript_chunks
       WHERE meeting_id = $1
       ORDER BY chunk_index`,
      [meetingId]
    );

    if (fallbackRows.rows.length) {
      return rankChunksByKeyword(fallbackRows.rows.map(formatDbChunk), question).slice(0, limit);
    }

    return selectRelevantLocalChunks(fallbackTranscript, question, limit);
  }

  async _embedChunks (chunks) {
    if (!config.get('openai.api_key')) {
      logger.warn('OPENAI_API_KEY is not configured; transcript chunks will be stored without embeddings.');
      return chunks.map(() => null);
    }

    try {
      return await this._embedTexts(chunks.map((chunk) => chunk.text));
    } catch (error) {
      logger.warn('Could not embed transcript chunks:', error.message);
      return chunks.map(() => null);
    }
  }

  async _embedTexts (texts) {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: config.get('openai.api_key') });
    const batchSize = positiveInt(config.get('embedding.batch_size'), 32);
    const embeddings = [];

    for (let start = 0; start < texts.length; start += batchSize) {
      const batch = texts.slice(start, start + batchSize);
      const response = await client.embeddings.create({
        model: config.get('embedding.model'),
        input: batch,
      });

      for (const item of response.data || []) {
        embeddings.push(validateEmbedding(item.embedding));
      }
    }

    return embeddings;
  }
}

export function buildTranscriptChunks (transcript) {
  const maxWords = positiveInt(config.get('rag.chunk_words'), 220);
  const overlapWords = Math.min(positiveInt(config.get('rag.chunk_overlap_words'), 40), Math.floor(maxWords / 2));
  const segments = Array.isArray(transcript?.segments)
    ? transcript.segments.filter((segment) => segment?.text?.trim())
    : [];

  if (segments.length) return chunkSegments(segments, maxWords, overlapWords);

  const text = typeof transcript === 'string' ? transcript : transcript?.text;
  return chunkText(text || '', maxWords, overlapWords);
}

function chunkSegments (segments, maxWords, overlapWords) {
  const chunks = [];
  let current = [];
  let wordCount = 0;

  for (const segment of segments) {
    const line = segmentToLine(segment);
    const count = countWords(line);
    if (current.length && wordCount + count > maxWords) {
      chunks.push(chunkFromSegments(current));
      current = takeOverlapSegments(current, overlapWords);
      wordCount = current.reduce((sum, item) => sum + countWords(item.line), 0);
    }
    current.push({ ...segment, line });
    wordCount += count;
  }

  if (current.length) chunks.push(chunkFromSegments(current));
  return chunks;
}

function chunkText (text, maxWords, overlapWords) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const chunks = [];
  const step = Math.max(1, maxWords - overlapWords);
  for (let start = 0; start < words.length; start += step) {
    const chunkWords = words.slice(start, start + maxWords);
    if (!chunkWords.length) break;
    chunks.push({ text: chunkWords.join(' ') });
    if (start + maxWords >= words.length) break;
  }
  return chunks;
}

function chunkFromSegments (segments) {
  const speakers = new Set(segments.map((segment) => segment.speaker).filter(Boolean));
  return {
    speaker: speakers.size === 1 ? [...speakers][0] : null,
    start_seconds: firstNumber(segments.map((segment) => segment.start)),
    end_seconds: lastNumber(segments.map((segment) => segment.end)),
    text: segments.map((segment) => segment.line).join('\n'),
  };
}

function takeOverlapSegments (segments, overlapWords) {
  if (!overlapWords) return [];
  const selected = [];
  let words = 0;

  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const segment = segments[index];
    selected.unshift(segment);
    words += countWords(segment.line);
    if (words >= overlapWords) break;
  }

  return selected;
}

function segmentToLine (segment) {
  const stamp = typeof segment.start === 'number'
    ? `[${formatSeconds(segment.start)}${typeof segment.end === 'number' ? `-${formatSeconds(segment.end)}` : ''}] `
    : '';
  const speaker = segment.speaker ? `${segment.speaker}: ` : '';
  return `${stamp}${speaker}${segment.text}`.trim();
}

function selectRelevantLocalChunks (transcript, question, limit = positiveInt(config.get('rag.max_chunks'), 6)) {
  return rankChunksByKeyword(buildTranscriptChunks(transcript), question).slice(0, limit);
}

function rankChunksByKeyword (chunks, question) {
  const queryTerms = tokenize(question);
  if (!queryTerms.length) return chunks;
  return chunks
    .map((chunk) => ({ ...chunk, similarity: keywordScore(chunk.text, queryTerms) }))
    .sort((a, b) => b.similarity - a.similarity || (a.chunk_index ?? 0) - (b.chunk_index ?? 0));
}

function tokenize (text) {
  return [...new Set(String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term)))];
}

function keywordScore (text, terms) {
  const normalized = String(text || '').toLowerCase();
  return terms.reduce((score, term) => score + (normalized.includes(term) ? 1 : 0), 0);
}

function formatChunks (chunks) {
  return chunks.map((chunk, index) => {
    const range = formatRange(chunk);
    return `Excerpt ${index + 1}${range ? ` ${range}` : ''}:\n${chunk.text}`;
  }).join('\n\n');
}

function formatRange (chunk) {
  if (typeof chunk.start_seconds !== 'number') return '';
  const end = typeof chunk.end_seconds === 'number' ? `-${formatSeconds(chunk.end_seconds)}` : '';
  return `[${formatSeconds(chunk.start_seconds)}${end}]`;
}

function formatDbChunk (row) {
  return {
    id: row.id,
    chunk_index: row.chunk_index,
    speaker: row.speaker,
    start_seconds: numberOrNull(row.start_seconds),
    end_seconds: numberOrNull(row.end_seconds),
    text: row.text,
    similarity: row.similarity == null ? null : Number(row.similarity),
  };
}

function toVectorLiteral (embedding) {
  return `[${embedding.map((value) => Number(value)).join(',')}]`;
}

function validateEmbedding (embedding) {
  const expected = Number(config.get('embedding.dimensions'));
  if (!Array.isArray(embedding)) throw new Error('Embedding response did not include a vector');
  if (embedding.length !== expected) {
    throw new Error(`Embedding dimension mismatch: expected ${expected}, received ${embedding.length}`);
  }
  return embedding.map((value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error('Embedding contained a non-finite value');
    return number;
  });
}

function countWords (text) {
  return String(text || '').split(/\s+/).filter(Boolean).length;
}

function positiveInt (value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function numberOrNull (value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function firstNumber (values) {
  for (const value of values) {
    const number = numberOrNull(value);
    if (number !== null) return number;
  }
  return null;
}

function lastNumber (values) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const number = numberOrNull(values[index]);
    if (number !== null) return number;
  }
  return null;
}

function formatSeconds (value) {
  const total = Math.max(0, Math.floor(value));
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export const ragService = new RagService();
