const ACTION_KEYWORDS = [
  'action item', 'todo', 'to do', 'task', 'follow up', 'follow-up', 'next step',
  'need to', 'needs to', 'have to', 'must', 'should', 'will', 'assign', 'assigned',
  'owner', 'responsible', 'deadline', 'due', 'by tomorrow', 'by next', 'send',
  'share', 'review', 'create', 'update', 'fix', 'schedule', 'prepare',
];

export function transcriptToText (transcriptData, { preferSegments = false } = {}) {
  if (!transcriptData) return '';
  if (typeof transcriptData === 'string') return cleanTranscriptText(transcriptData);

  const plainText = cleanTranscriptText(transcriptData.text || '');
  if (plainText && !preferSegments) return plainText;

  const segments = Array.isArray(transcriptData.segments)
    ? transcriptData.segments.filter((segment) => segment?.text?.trim())
    : [];

  if (segments.length) {
    return cleanTranscriptText(segments.map(segmentToLine).filter(Boolean).join('\n'));
  }

  return plainText;
}

export function cleanTranscriptText (text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function countWords (text) {
  return wordsFromText(text).length;
}

export function chunkTextByWords (text, { chunkWords = 1200, overlapWords = 120 } = {}) {
  const words = wordsFromText(text);
  if (!words.length) return [];

  const safeChunkWords = Math.max(1, Number(chunkWords) || 1200);
  const safeOverlapWords = Math.min(Math.max(0, Number(overlapWords) || 0), Math.floor(safeChunkWords / 2));
  const step = Math.max(1, safeChunkWords - safeOverlapWords);
  const chunks = [];

  for (let start = 0; start < words.length; start += step) {
    const end = Math.min(start + safeChunkWords, words.length);
    chunks.push({
      index: chunks.length + 1,
      startWord: start,
      endWord: end,
      text: words.slice(start, end).join(' '),
    });
    if (end >= words.length) break;
  }

  return chunks;
}

export function trimToWordLimit (text, maxWords) {
  const words = wordsFromText(text);
  const limit = Math.max(0, Number(maxWords) || 0);
  if (!limit || words.length <= limit) return cleanTranscriptText(text);
  return words.slice(0, limit).join(' ');
}

export function selectActionCandidateText (text, { maxWords = 5000 } = {}) {
  const units = splitIntoCandidateUnits(text);
  const seen = new Set();
  const candidates = [];

  for (const unit of units) {
    const normalized = unit.toLowerCase();
    if (!ACTION_KEYWORDS.some((keyword) => normalized.includes(keyword))) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    candidates.push(unit);
  }

  const source = candidates.length ? candidates.join('\n') : text;
  return trimToWordLimit(source, maxWords);
}

export function positiveInt (value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function segmentToLine (segment) {
  const speaker = segment.speaker ? `${segment.speaker}: ` : '';
  return `${speaker}${segment.text || ''}`.trim();
}

function splitIntoCandidateUnits (text) {
  return cleanTranscriptText(text)
    .split(/\n+|[.!?]\s+/)
    .map((unit) => unit.trim())
    .filter(Boolean);
}

function wordsFromText (text) {
  return String(text || '').split(/\s+/).filter(Boolean);
}
