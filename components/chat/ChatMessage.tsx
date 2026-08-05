type ChatMessageProps = {
  role: "user" | "assistant";
  message: string;
};

export default function ChatMessage({
  role,
  message,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-2xl rounded-xl px-5 py-4 ${
          isUser
            ? "bg-cyan-500 text-black"
            : "bg-slate-800 text-white"
        }`}
      >
        {message}
      </div>
    </div>
  );
}