'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-foreground"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Grow<span className="text-primary">Easy</span>
            </h1>
            <p className="hidden text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:block">
              CRM Importer
            </p>
          </div>
        </div>

        {}
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:inline-flex">
            AI-Powered
          </span>

          {}
          {mounted && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="h-9 w-9 rounded-xl"
                    id="theme-toggle"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-45" />
                    ) : (
                      <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                }
              />
              <TooltipContent>
                Switch to {theme === 'dark' ? 'light' : 'dark'} mode
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </header>
  );
}
