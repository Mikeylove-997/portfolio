export type ChatStoredMessage = {
  role: "user" | "assistant";
  text: string;
  source: { id: string; question: string } | null;
  related: { id: string; question: string }[];
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

  return (
    <div className={`chat-message ${isUser ? "user" : "assistant"}`}>
      <div className="chat-bubble">
        {isUser ? (
          message.text
        ) : (
          <>
            <p>{message.text}</p>
            {message.source ? (
              <p className="chat-source">Based on: {message.source.question}</p>
            ) : null}
            {!isUser && message.related.length > 0 ? (
              <div className="chat-related">
                {message.related.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onAskRelated(item.question)}
                  >
                    {item.question}
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
