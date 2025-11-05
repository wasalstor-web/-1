import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';
  
  return (
    <div
      className={cn(
        "flex gap-4 mb-6",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      data-testid={`message-${role}`}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
        isUser ? "bg-gradient-to-br from-cyan-500 to-purple-600" : "bg-muted"
      )}>
        {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5" />}
      </div>
      
      <div className={cn("flex-1 max-w-3xl", isUser && "text-left")}>
        <div className={cn(
          "rounded-2xl p-4",
          isUser ? "bg-gradient-to-br from-cyan-500/10 to-purple-600/10 border border-cyan-500/20" : "bg-card"
        )}>
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-2">{timestamp}</p>
        )}
      </div>
    </div>
  );
}
