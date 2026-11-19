import { getAllQA } from "@/lib/qa";
import type { QAEntry } from "@/lib/qa";

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being", "am",
  "do", "does", "did", "done", "you", "your", "yours", "i", "me", "my", "we",
  "our", "he", "him", "his", "she", "her", "it", "its", "they", "them",
  "their", "what", "which", "who", "whom", "when", "where", "why", "how",
  "to", "of", "in", "on", "at", "for", "with", "about", "and", "or", "but",
  "if", "then", "so", "as", "by", "can", "could", "will", "would", "shall",
  "should", "may", "might", "must", "have", "has", "had", "this", "that",
  "these", "those", "there", "here", "tell", "please", "hi", "hello", "hey",
  "kind", "kinda", "like", "know", "think", "mike", "mike's", "zhao",
]);

export const FALLBACK_ANSWER =
  "I don't have an answer for that yet. Try asking about Mike's experience, projects, skills, or education — or reach him through the contact form.";

const MIN_SCORE = 3;
const KEYWORD_SCORE = 5;
const QUESTION_WORD_SCORE = 1;

export type AssistantAnswer = {
  answer: string;
  matched: boolean;
  source: { id: string; question: string } | null;
  related: { id: string; question: string }[];
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export async function answerQuestion(
  question: string
): Promise<AssistantAnswer> {
  const entries = await getAllQA();
  const lower = question.toLowerCase();
  const contentWords = new Set(
    tokenize(question).filter((word) => !STOP_WORDS.has(word))
  );

  const scored = entries
    .map((entry) => ({ entry, score: scoreEntry(entry, lower, contentWords) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const toRelated = (item: { entry: QAEntry; score: number }) => ({
    id: item.entry.id,
    question: item.entry.question,
  });

  const best = scored[0];

  if (!best || best.score < MIN_SCORE) {
    return {
      answer: FALLBACK_ANSWER,
      matched: false,
      source: null,
      related: scored.slice(0, 2).map(toRelated),
    };
  }

  return {
    answer: best.entry.answer,
    matched: true,
    source: { id: best.entry.id, question: best.entry.question },
    related: scored.slice(1, 3).map(toRelated),
  };
}

function scoreEntry(
  entry: QAEntry,
  lowerQuestion: string,
  contentWords: Set<string>
): number {
  let score = 0;

  for (const keyword of entry.keywords) {
    const normalized = keyword.toLowerCase();
    if (normalized.includes(" ")) {
      if (lowerQuestion.includes(normalized)) {
        score += KEYWORD_SCORE;
      }
    } else if (contentWords.has(normalized)) {
      score += KEYWORD_SCORE;
    }
  }

  for (const word of tokenize(entry.question)) {
    if (!STOP_WORDS.has(word) && contentWords.has(word)) {
      score += QUESTION_WORD_SCORE;
    }
  }

  return score;
}
