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

function normalizeWord(word: string): string {
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss") && !word.endsWith("us")) {
    return word.slice(0, -1);
  }
  return word;
}

function contentTokens(text: string): Set<string> {
  return new Set(
    tokenize(text)
      .filter((word) => !STOP_WORDS.has(word))
      .filter((word) => word.length > 1)
      .map(normalizeWord)
  );
}

const SYNONYMS: Record<string, string> = {
  study: "education",
  studies: "education",
  studied: "education",
  studying: "education",
  student: "education",
  school: "education",
  university: "education",
  college: "education",
  degree: "education",
  master: "education",
  masters: "education",
  ms: "education",
  msba: "education",
  program: "education",
  visa: "education",
  status: "education",
  authorization: "education",
  permit: "education",
  opt: "education",
  job: "experience",
  jobs: "experience",
  worked: "experience",
  working: "experience",
  work: "experience",
  career: "experience",
  employment: "experience",
  employer: "experience",
  companies: "experience",
  company: "experience",
  bank: "experience",
  banking: "experience",
  retail: "experience",
  tool: "skills",
  tools: "skills",
  tech: "skills",
  technologies: "skills",
  software: "skills",
  languages: "skills",
  language: "skills",
  programming: "skills",
  xgboost: "skills",
  shap: "skills",
  coding: "skills",
  hobby: "goals",
  hobbies: "goals",
  passionate: "goals",
  passion: "goals",
  aspiring: "goals",
  aspiration: "goals",
  aspirations: "goals",
  plan: "goals",
  plans: "goals",
  ai: "llm",
  ml: "machine",
};

function expandSynonyms(words: Set<string>): Set<string> {
  const expanded = new Set(words);
  for (const word of words) {
    const mapped = SYNONYMS[word];
    if (mapped) {
      expanded.add(normalizeWord(mapped));
    }
  }
  return expanded;
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
  context: string;
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
      context: section.content,
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
      context: [
        `Title: ${project.title}`,
        `Description: ${project.description}`,
        `Tech stack: ${project.techStack.join(", ")}`,
        `Features: ${project.features.join("; ")}`,
      ].join("\n"),
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
      context: `Title: ${post.title}\nContent: ${post.content}`,
      titleTokens: contentTokens(post.title),
      bodyTokens: contentTokens(post.content),
    });
  }

  return docs;
}

export type ContextPiece = {
  source: AssistantSource;
  content: string;
};

async function rankDocs(
  question: string
): Promise<{ doc: Doc; score: number }[]> {
  const docs = await buildDocs();
  const queryWords = expandSynonyms(contentTokens(question));

  if (docs.length === 0 || queryWords.size === 0) {
    return [];
  }

  const documentFrequency = new Map<string, number>();
  for (const word of queryWords) {
    const df = docs.filter(
      (doc) => doc.titleTokens.has(word) || doc.bodyTokens.has(word)
    ).length;
    if (df > 0) {
      documentFrequency.set(word, df);
    }
  }

  return docs
    .map((doc) => {
      let score = 0;
      for (const word of queryWords) {
        const df = documentFrequency.get(word);
        if (!df) continue;
        const weight = 1 + Math.log(docs.length / df);
        if (doc.titleTokens.has(word)) {
          score += TITLE_WORD_SCORE * weight;
        } else if (doc.bodyTokens.has(word)) {
          score += BODY_WORD_SCORE * weight;
        }
      }
      return { doc, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

export async function retrieveContext(
  question: string,
  count: number
): Promise<ContextPiece[]> {
  const scored = await rankDocs(question);
  return scored.slice(0, count).map(({ doc }) => ({
    source: doc.source,
    content: doc.context,
  }));
}

export async function answerQuestion(
  question: string
): Promise<AssistantAnswer> {
  const scored = await rankDocs(question);

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
