export type AssistantSourceRef = {
  type?: string;
  id?: string;
  label?: string;
  link?: string | null;
  question?: string;
};

export type ChatStoredMessage = {
  role: "user" | "assistant";
  text: string;
  source: AssistantSourceRef | null;
  related: AssistantSourceRef[];
  timestamp: string;
};

export default function ChatMessage({
  message,
  onAskRelated,
}: {
  message: ChatStoredMessage;
  onAskRelated: (question: string) => void;
}) {
  const isUser = message.role === "user";
  const source = message.source;
  const sourceLabel = source?.label ?? source?.question ?? null;
  const sourcePrefix = source?.type
    ? `${source.type.charAt(0).toUpperCase()}${source.type.slice(1)} — `
    : "";

  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      <div className="chat-bubble">
        {isUser ? (
          message.text
        ) : (
          <>
            <p>{message.text}</p>
            {source && sourceLabel ? (
              <p className="chat-source">
                Based on:{" "}
                {source.link ? (
                  <a
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {sourcePrefix}
                    {sourceLabel}
                  </a>
                ) : (
                  <>
                    {sourcePrefix}
                    {sourceLabel}
                  </>
                )}
              </p>
            ) : null}
            {!isUser && message.related.length > 0 ? (
              <div className="chat-related">
                {message.related.map((item) => (
                  <button
                    key={item.id ?? item.label ?? item.question}
                    type="button"
                    onClick={() =>
                      onAskRelated(
                        `Tell me about ${item.label ?? item.question}`
                      )
                    }
                  >
                    {item.label ?? item.question}
                  </button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
