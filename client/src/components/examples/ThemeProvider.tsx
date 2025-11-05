import { ThemeProvider } from '../ThemeProvider';

export default function ThemeProviderExample() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="p-6 bg-background text-foreground">
        <p>Theme Provider Active</p>
      </div>
    </ThemeProvider>
  );
}
