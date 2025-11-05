import { Slider } from "@/components/ui/slider";

interface CreativitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function CreativitySlider({ value, onChange }: CreativitySliderProps) {
  return (
    <div className="space-y-2" data-testid="creativity-slider">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">مستوى الإبداع</label>
        <span className="text-sm text-cyan-400">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        max={100}
        step={1}
        className="w-full"
        data-testid="slider-creativity"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>دقيق</span>
        <span>متوازن</span>
        <span>مبدع</span>
      </div>
    </div>
  );
}
