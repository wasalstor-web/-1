import { useState } from "react";
import { Brain, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AIModel = 'gpt-4' | 'claude' | 'gemini';

interface AIModelSelectorProps {
  value: AIModel;
  onChange: (model: AIModel) => void;
}

const models = [
  { id: 'gpt-4' as AIModel, name: 'GPT-4', icon: Brain, color: 'from-green-400 to-emerald-600' },
  { id: 'claude' as AIModel, name: 'Claude', icon: Sparkles, color: 'from-orange-400 to-amber-600' },
  { id: 'gemini' as AIModel, name: 'Gemini', icon: Zap, color: 'from-blue-400 to-indigo-600' },
];

export function AIModelSelector({ value, onChange }: AIModelSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3" data-testid="ai-model-selector">
      {models.map((model) => {
        const isActive = value === model.id;
        const Icon = model.icon;
        
        return (
          <Button
            key={model.id}
            onClick={() => onChange(model.id)}
            variant={isActive ? "default" : "outline"}
            className={cn(
              "flex flex-col items-center gap-2 h-auto py-4 transition-all",
              isActive && `bg-gradient-to-r ${model.color} text-white border-0`
            )}
            data-testid={`button-model-${model.id}`}
          >
            <Icon className="w-6 h-6" />
            <span className="font-medium">{model.name}</span>
          </Button>
        );
      })}
    </div>
  );
}
