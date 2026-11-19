"use client";

import { useState } from "react";

export default function ChatInput({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = value.trim();
    if (!text || disabled) {
      return;
    }
    onSend(text);
    setValue("");
  }

  return (
    <form className="chat-input-row" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Ask about Mike's background..."
        value={value}
        maxLength={300}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Your question"
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        {disabled ? "..." : "Send"}
      </button>
    </form>
  );
}
