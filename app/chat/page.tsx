import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
  return (
    <main className="flex h-[calc(100vh-64px)] bg-slate-950 text-white">

      <ChatSidebar />

      <section className="flex flex-1 flex-col">

        <div className="flex-1 space-y-6 overflow-y-auto p-8">

          <ChatMessage
            role="user"
            message="What is the leave policy?"
          />

          <ChatMessage
            role="assistant"
            message="According to the uploaded HR Policy, employees are entitled to 20 days of annual leave."
          />

          <ChatMessage
            role="user"
            message="Can employees share passwords?"
          />

          <ChatMessage
            role="assistant"
            message="No. The Information Security Policy prohibits password sharing."
          />

        </div>

        <ChatInput />

      </section>

    </main>
  );
}