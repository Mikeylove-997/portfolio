"use client";

import ChatMessage from "@/components/ChatMessage";

const STARTERS = [
  { id: "starter-1", question: "What's Mike's education?" },
  {
    id: "starter-2",
    question: "Tell me about the Payactiv project",
  },
  {
    id: "starter-3",
    question: "What skills does Mike have?",
  },
];

export default function StarterQuestions({
  onAsk,
}: {
  onAsk: (question: string) => void;
}) {
  return (
    <ChatMessage
      message={{
        role: "assistant",
        text: "Try one of these to start:",
        source: null,
        related: STARTERS,
        timestamp: "starter",
      }}
      onAskRelated={onAsk}
    />
  );
}
