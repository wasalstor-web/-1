import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Check, Copy, Play, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageContentProps {
  content: string;
  role: 'user' | 'assistant';
}

export function MessageContent({ content, role }: MessageContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (code: string, language: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: '✅ تم النسخ',
        description: `تم نسخ كود ${language} بنجاح`,
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: 'فشل نسخ الكود',
      });
    }
  };

  if (role === 'user') {
    return <div className="text-base leading-relaxed whitespace-pre-wrap">{content}</div>;
  }

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          code(props) {
            const { inline, className, children, ...rest } = props as any;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && language) {
              return (
                <div className="relative group my-4" data-testid={`code-block-${language}`}>
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-[#1E1E1E] border-b border-white/10 rounded-t-xl">
                    <span className="text-xs font-mono text-cyan-400 uppercase font-bold">
                      {language}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(codeString, language)}
                        className="h-7 px-2 text-xs hover:bg-white/10"
                        data-testid={`button-copy-code-${language}`}
                      >
                        {copiedCode === codeString ? (
                          <>
                            <Check className="w-3 h-3 ml-1" />
                            تم النسخ
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 ml-1" />
                            نسخ
                          </>
                        )}
                      </Button>
                      {(language === 'python' || language === 'javascript' || language === 'js') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            toast({
                              title: '⚡ تشغيل الكود',
                              description: `سيتم إضافة تنفيذ ${language} قريباً`,
                            });
                          }}
                          className="h-7 px-2 text-xs hover:bg-green-500/20 hover:text-green-400"
                          data-testid={`button-run-code-${language}`}
                        >
                          <Play className="w-3 h-3 ml-1" />
                          تشغيل
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          copyToClipboard(`اشرح هذا الكود بالتفصيل:\n\`\`\`${language}\n${codeString}\n\`\`\``, 'prompt');
                          toast({
                            title: '💡 طلب الشرح',
                            description: 'تم نسخ prompt الشرح - الصقه في المحادثة',
                          });
                        }}
                        className="h-7 px-2 text-xs hover:bg-purple-500/20 hover:text-purple-400"
                        data-testid={`button-explain-code-${language}`}
                      >
                        <Sparkles className="w-3 h-3 ml-1" />
                        شرح
                      </Button>
                    </div>
                  </div>

                  <div className="pt-12">
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={language}
                      PreTag="div"
                      className="rounded-xl !mt-0 !bg-[#1E1E1E]"
                      customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '0.875rem',
                        lineHeight: 1.7,
                        borderRadius: '0 0 0.75rem 0.75rem',
                      }}
                      {...rest}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            }

            return (
              <code
                className="px-2 py-1 bg-cyan-500/10 text-cyan-300 rounded-md font-mono text-sm border border-cyan-500/20"
                {...rest}
              >
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-4 leading-relaxed text-base">{children}</p>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 mt-6 neon-text-gradient">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 mt-5 text-cyan-400">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mb-2 mt-4 text-purple-400">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-2 text-white/90">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-2 text-white/90">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-cyan-500 pl-4 py-2 my-4 bg-cyan-500/5 rounded-r-lg italic text-white/80">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-white/10 rounded-lg">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="px-4 py-2 bg-white/5 border border-white/10 font-semibold text-left">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="px-4 py-2 border border-white/10">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
