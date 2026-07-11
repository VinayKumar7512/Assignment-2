export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} GrowEasy CRM. AI-powered lead import.
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Powered by Gemini AI
        </div>
      </div>
    </footer>
  );
}
