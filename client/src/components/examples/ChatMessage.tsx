import { ChatMessage } from '../ChatMessage';

export default function ChatMessageExample() {
  return (
    <div className="p-6 bg-background space-y-4">
      <ChatMessage
        role="user"
        content="مرحباً! أريد إنشاء تطبيق ويب جديد"
        timestamp="الآن"
      />
      <ChatMessage
        role="assistant"
        content="أهلاً بك! سأساعدك في إنشاء تطبيق ويب احترافي. ما هو نوع التطبيق الذي تريد بناءه؟"
        timestamp="الآن"
      />
    </div>
  );
}
