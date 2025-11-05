import { useState } from 'react';
import { CreativitySlider } from '../CreativitySlider';

export default function CreativitySliderExample() {
  const [creativity, setCreativity] = useState(50);
  
  return (
    <div className="p-6 bg-background max-w-md">
      <CreativitySlider value={creativity} onChange={setCreativity} />
    </div>
  );
}
