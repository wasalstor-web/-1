import { useState } from 'react';
import { AIModelSelector } from '../AIModelSelector';

export default function AIModelSelectorExample() {
  const [model, setModel] = useState<'gpt-4' | 'claude' | 'gemini'>('gpt-4');
  
  return (
    <div className="p-6 bg-background">
      <AIModelSelector value={model} onChange={setModel} />
      <p className="mt-4 text-center text-muted-foreground">النموذج المختار: {model}</p>
    </div>
  );
}
