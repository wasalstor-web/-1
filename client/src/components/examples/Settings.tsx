import Settings from '../../pages/Settings';
import { ThemeProvider } from '../ThemeProvider';

export default function SettingsExample() {
  return (
    <ThemeProvider>
      <div className="bg-background min-h-screen">
        <Settings />
      </div>
    </ThemeProvider>
  );
}
