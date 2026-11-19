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
  sources?: AssistantSourceRef[];
  related: AssistantSourceRef[];
  timestamp: string;
};

function SourceLine({ source }: { source: AssistantSourceRef }) {
  const label = source.label ?? source.question ?? "";
  const prefix = source.type
    ? `${source.type.charAt(0).toUpperCase()}${source.type.slice(1)} — `
    : "";
  return source.link ? (
    <a href={source.link} target="_blank" rel="noopener noreferrer">
      {prefix}
      {label}
    </a>
  ) : (
    <>
      {prefix}
      {label}
    </>
  );
}

export default function ChatMessage({
  message,
  onAskRelated,
}: {
  message: ChatStoredMessage;
  onAskRelated: (question: string) => void;
}) {
  const isUser = message.role === "user";
  const sources = message.sources?.length
    ? message.sources
    : message.source
      ? [message.source]
      : [];

  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      <div className="chat-bubble">
        {isUser ? (
          message.text
        ) : (
          <>
            <p>{message.text}</p>
            {sources.length > 0 ? (
              <p className="chat-source">
                Based on:{" "}
                {sources.map((source, index) => (
                  <span
                    key={
                      source.id ?? source.label ?? source.question ?? index
                    }
                  >
                    {index > 0 ? " · " : ""}
                    <SourceLine source={source} />
                  </span>
                ))}
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
