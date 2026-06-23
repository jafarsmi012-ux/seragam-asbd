'use client';

import { Check } from 'lucide-react';
import type { OrderStep } from '@/lib/store';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: OrderStep;
  steps: { step: OrderStep; label: string }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full px-4 py-3 bg-white border-b border-navy-100 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {steps.map((item, idx) => {
          const isActive = currentStep === item.step;
          const isCompleted = currentStep > item.step;

          return (
            <div key={item.step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                    isActive && 'bg-navy-600 text-white shadow-md',
                    isCompleted && 'bg-islami-500 text-white',
                    !isActive && !isCompleted && 'bg-navy-100 text-navy-400'
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : item.step}
                </div>
                <span
                  className={cn(
                    'text-[10px] md:text-xs font-medium whitespace-nowrap',
                    isActive && 'text-navy-700',
                    isCompleted && 'text-islami-600',
                    !isActive && !isCompleted && 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 mb-5 transition-colors duration-300',
                    currentStep > item.step ? 'bg-islami-500' : 'bg-navy-100'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
