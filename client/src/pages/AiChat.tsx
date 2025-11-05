import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Plus, 
  Sparkles, 
  MessageSquare, 
  Trash2,
  Code2,
  Zap,
  Bot
} from 'lucide-react';
import type { AiConversation, AiMessage } from '@shared/schema';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChat() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery<AiConversation[]>({
    queryKey: ['/api/ai/conversations'],
  });

  const { data: conversationMessages = [] } = useQuery<AiMessage[]>({
    queryKey: ['/api/ai/conversations', selectedConversationId, 'messages'],
    enabled: !!selectedConversationId,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await apiRequest('POST', '/api/ai/conversations', { title, context: 'general' });
      return res.json();
    },
    onSuccess: (newConv: AiConversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
      setSelectedConversationId(newConv.id);
      setMessages([]);
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/ai/conversations/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
      setSelectedConversationId(null);
      setMessages([]);
    },
  });

  const saveMessageMutation = useMutation({
    mutationFn: async ({ conversationId, role, content }: { conversationId: string, role: string, content: string }) => {
      const res = await apiRequest('POST', `/api/ai/conversations/${conversationId}/messages`, { role, content });
      return res.json();
    },
  });

  useEffect(() => {
    if (conversationMessages.length > 0) {
      setMessages(conversationMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })));
    }
  }, [conversationMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    let convId = selectedConversationId;
    
    if (!convId) {
      const newConv = await createConversationMutation.mutateAsync('محادثة جديدة');
      convId = newConv.id;
    }

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    
    await saveMessageMutation.mutateAsync({
      conversationId: convId,
      role: 'user',
      content: input.trim(),
    });

    const currentInput = input.trim();
    setInput('');
    setIsStreaming(true);

    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          context: 'general',
        }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullResponse += parsed.content;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = fullResponse;
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      await saveMessageMutation.mutateAsync({
        conversationId: convId,
        role: 'assistant',
        content: fullResponse,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/ai/conversations'] });
    } catch (error) {
      console.error('Error streaming:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content = 'عذراً، حدث خطأ أثناء معالجة الطلب.';
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleNewChat = () => {
    createConversationMutation.mutate('محادثة جديدة');
  };

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-white" dir="rtl">
      {/* Sidebar */}
      <div className="w-80 border-l border-white/10 bg-[#0F0F14] flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Button
            onClick={handleNewChat}
            disabled={createConversationMutation.isPending}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover-elevate active-elevate-2 neon-glow-cyan font-bold"
            data-testid="button-new-chat"
          >
            <Plus className="w-5 h-5 ml-2" />
            محادثة جديدة
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Card
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`p-4 cursor-pointer transition-all hover-elevate ${
                  selectedConversationId === conv.id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 neon-border-glow'
                    : 'bg-[#16161D] border-white/10'
                }`}
                data-testid={`conversation-${conv.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                      <h3 className="text-sm font-semibold truncate">{conv.title}</h3>
                    </div>
                    <p className="text-xs text-white/50">
                      {new Date(conv.lastMessageAt).toLocaleDateString('ar-SA', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversationMutation.mutate(conv.id);
                    }}
                    className="shrink-0 w-8 h-8 hover:bg-red-500/20 hover:text-red-400"
                    data-testid={`button-delete-${conv.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 bg-[#16161D] rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">AI Developer</p>
              <p className="text-xs text-white/50">مساعد التطوير الذكي</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#0F0F14]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center neon-glow-cyan">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold neon-text-gradient">AI Developer Assistant</h1>
              <p className="text-sm text-white/60">مساعدك الذكي في البرمجة والتطوير</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-2" />
              متصل
            </Badge>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-8">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-2xl">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center neon-glow-purple">
                  <Code2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold mb-4 neon-text-gradient">مرحباً بك في AI Developer Assistant</h2>
                <p className="text-white/60 text-lg mb-8">
                  ابدأ محادثة جديدة للحصول على مساعدة في البرمجة، كتابة الكود، وحل المشاكل التقنية
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-6 bg-[#16161D] border-white/10 hover-elevate cursor-pointer" data-testid="template-code-review">
                    <Zap className="w-8 h-8 text-cyan-400 mb-3" />
                    <h3 className="font-semibold mb-2">مراجعة الكود</h3>
                    <p className="text-sm text-white/50">احصل على تحليل واقتراحات لتحسين الكود</p>
                  </Card>
                  <Card className="p-6 bg-[#16161D] border-white/10 hover-elevate cursor-pointer" data-testid="template-debug-help">
                    <Code2 className="w-8 h-8 text-purple-400 mb-3" />
                    <h3 className="font-semibold mb-2">حل المشاكل التقنية</h3>
                    <p className="text-sm text-white/50">اكتشف الأخطاء واحصل على حلول فورية</p>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-start' : 'justify-start'}`}
                  data-testid={`message-${msg.role}-${idx}`}
                >
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : 'bg-gradient-to-br from-cyan-500 to-purple-600 neon-glow-cyan'
                  }`}>
                    {msg.role === 'user' ? (
                      <div className="w-6 h-6 rounded-full bg-white/20" />
                    ) : (
                      <Bot className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`rounded-2xl p-6 ${
                      msg.role === 'user'
                        ? 'bg-[#16161D] border border-white/10'
                        : 'bg-gradient-to-br from-cyan-500/10 to-purple-600/10 border border-cyan-500/20'
                    }`}>
                      <p className="text-sm font-medium mb-2 text-white/70">
                        {msg.role === 'user' ? 'أنت' : 'AI Developer'}
                      </p>
                      <div className="text-base leading-relaxed whitespace-pre-wrap">
                        {msg.content || (
                          <div className="flex items-center gap-2 text-cyan-400">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span>جاري الكتابة...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-white/10 p-6 bg-[#0F0F14]/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="اكتب رسالتك هنا..."
                disabled={isStreaming}
                className="flex-1 h-14 bg-[#16161D] border-white/20 text-base focus:border-cyan-500 focus:ring-cyan-500/20"
                data-testid="input-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isStreaming}
                className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-purple-600 hover-elevate active-elevate-2 neon-glow-cyan font-bold"
                data-testid="button-send"
              >
                <Send className="w-5 h-5 ml-2" />
                إرسال
              </Button>
            </div>
            <p className="text-xs text-white/40 mt-3 text-center">
              AI Developer Assistant يستخدم GPT-4 Mini للمساعدة في البرمجة والتطوير
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
