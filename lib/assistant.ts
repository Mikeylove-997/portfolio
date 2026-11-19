import { getBackgroundSections } from "@/lib/background";
import { getAllProjects } from "@/lib/projects";
import { getAllBlogs } from "@/lib/blogs";

export const FALLBACK_ANSWER =
  "I don't have an answer for that yet. Try asking about Mike's experience, projects, skills, or education — or reach him through the contact form.";

const MIN_SCORE = 4;
const TITLE_WORD_SCORE = 5;
const BODY_WORD_SCORE = 2;
const EXCERPT_LENGTH = 200;

export type AssistantSourceType = "background" | "project" | "blog";

export type AssistantSource = {
  type: AssistantSourceType;
  id: string;
  label: string;
  link: string | null;
};

export type AssistantAnswer = {
  answer: string;
  matched: boolean;
  source: AssistantSource | null;
  related: AssistantSource[];
};

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
  "what's", "whats",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function contentTokens(text: string): Set<string> {
  return new Set(tokenize(text).filter((word) => !STOP_WORDS.has(word)));
}

function toId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function excerpt(text: string): string {
  return text.length > EXCERPT_LENGTH
    ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}...`
    : text;
}

type Doc = {
  source: AssistantSource;
  answer: string;
  titleTokens: Set<string>;
  bodyTokens: Set<string>;
};

async function buildDocs(): Promise<Doc[]> {
  const [sections, projects, posts] = await Promise.all([
    getBackgroundSections(),
    getAllProjects(),
    getAllBlogs(),
  ]);

  const docs: Doc[] = [];

  for (const section of sections) {
    docs.push({
      source: {
        type: "background",
        id: toId(section.title),
        label: section.title,
        link: "/about-me",
      },
      answer: excerpt(section.content),
      titleTokens: contentTokens(section.title),
      bodyTokens: contentTokens(section.content),
    });
  }

  for (const project of projects) {
    docs.push({
      source: {
        type: "project",
        id: project.slug,
        label: project.title,
        link: `/projects/${project.slug}`,
      },
      answer: `${project.title} — ${project.description}`,
      titleTokens: contentTokens(
        [project.title, ...project.techStack].join(" ")
      ),
      bodyTokens: contentTokens(
        [...project.features, project.description].join(" ")
      ),
    });
  }

  for (const post of posts) {
    docs.push({
      source: {
        type: "blog",
        id: post.slug,
        label: post.title,
        link: `/blogs/${post.slug}`,
      },
      answer: `${post.title}: ${excerpt(post.content)}`,
      titleTokens: contentTokens(post.title),
      bodyTokens: contentTokens(post.content),
    });
  }

  return docs;
}

export async function answerQuestion(
  question: string
): Promise<AssistantAnswer> {
  const docs = await buildDocs();
  const queryWords = contentTokens(question);

  const scored = docs
    .map((doc) => {
      let score = 0;
      for (const word of queryWords) {
        if (doc.titleTokens.has(word)) {
          score += TITLE_WORD_SCORE;
        } else if (doc.bodyTokens.has(word)) {
          score += BODY_WORD_SCORE;
        }
      }
      return { doc, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const toSource = (item: { doc: Doc; score: number }) => item.doc.source;

  const best = scored[0];

  if (!best || best.score < MIN_SCORE) {
    return {
      answer: FALLBACK_ANSWER,
      matched: false,
      source: null,
      related: scored.slice(0, 2).map(toSource),
    };
  }

  return {
    answer: best.doc.answer,
    matched: true,
    source: best.doc.source,
    related: scored.slice(1, 3).map(toSource),
  };
}
