'use client';

import { ArrowDown, Sparkles, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32" id="hero-section">
      {}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full bg-chart-2/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {}
        <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Import Engine
        </div>

        {}
        <h1 className="animate-fade-in-up animation-delay-100 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Import Any CSV Into{' '}
          <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
            GrowEasy CRM
          </span>
        </h1>

        {}
        <p className="animate-fade-in-up animation-delay-200 mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Upload CSVs from Facebook, Google Ads, real estate platforms, or any source.
          Our AI intelligently maps your data to CRM fields — no manual column matching needed.
        </p>

        {}
        <div className="animate-fade-in-up animation-delay-300 mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span>Smart Field Detection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10">
              <Sparkles className="h-4 w-4 text-chart-2" />
            </div>
            <span>Gemini AI Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
              <Shield className="h-4 w-4 text-success" />
            </div>
            <span>Zero Data Fabrication</span>
          </div>
        </div>

        {}
        <div className="animate-fade-in-up animation-delay-400 mt-10">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="group h-12 rounded-xl px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            id="get-started-btn"
          >
            Get Started
            <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
