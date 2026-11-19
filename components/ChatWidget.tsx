"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import ChatMessage from "@/components/ChatMessage";
import type { ChatStoredMessage } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

const STORAGE_KEY = "mz-assistant-chat";
const MAX_MESSAGES = 50;

function parseStored(raw: string | null): ChatStoredMessage[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is ChatStoredMessage =>
          !!item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.text === "string"
      )
      .slice(-MAX_MESSAGES)
      .map((item) => ({
        role: item.role,
        text: item.text,
        source: item.source ?? null,
        related: Array.isArray(item.related) ? item.related : [],
        timestamp:
          typeof item.timestamp === "string"
            ? item.timestamp
            : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatStoredMessage[]>(() =>
    typeof window === "undefined"
      ? []
      : parseStored(window.localStorage.getItem(STORAGE_KEY))
  );
  const [thinking, setThinking] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = messages.slice(-MAX_MESSAGES);
    if (trimmed.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, thinking]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  async function ask(text: string) {
    const userMessage: ChatStoredMessage = {
      role: "user",
      text,
      source: null,
      related: [],
      timestamp: new Date().toISOString(),
    };
    setMessages((current) => [...current, userMessage]);
    setThinking(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });

      const assistantMessage: ChatStoredMessage = response.ok
        ? await response.json().then((data) => ({
            role: "assistant" as const,
            text: data.answer,
            source: data.source ?? null,
            related: Array.isArray(data.related) ? data.related : [],
            timestamp: new Date().toISOString(),
          }))
        : {
            role: "assistant",
            text: "Something went wrong. Please try again.",
            source: null,
            related: [],
            timestamp: new Date().toISOString(),
          };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "Something went wrong. Please try again.",
          source: null,
          related: [],
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function clearChat() {
    window.localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          className="chat-fab"
          onClick={() => setOpen(true)}
        >
          Ask Mike Zhao Assistant
        </button>
      ) : null}
      {open ? (
        <div className="chat-panel" role="dialog" aria-label="Mike Zhao Assistant">
          <div className="chat-header">
            <strong>Mike Zhao Assistant</strong>
            <div className="chat-header-actions">
              <button type="button" onClick={clearChat}>
                Clear chat
              </button>
              <button type="button" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
          </div>
          <div className="chat-messages" ref={listRef}>
            {messages.length === 0 ? (
              <p className="chat-note">
                Hi! Ask me anything about Mike&apos;s experience, projects,
                skills, or education.
              </p>
            ) : (
              messages.map((message, index) => (
                <ChatMessage
                  key={`${message.timestamp}-${index}`}
                  message={message}
                  onAskRelated={ask}
                />
              ))
            )}
            {thinking ? <p className="chat-note">Thinking...</p> : null}
          </div>
          <p className="chat-note">
            Your chat is saved only in this browser. Prefer a human?{" "}
            <Link href="/contact-me" onClick={() => setOpen(false)}>
              Contact Mike
            </Link>
            .
          </p>
          <ChatInput disabled={thinking} onSend={ask} />
        </div>
      ) : null}
    </>
  );
}
