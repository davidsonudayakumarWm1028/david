import React from 'react';
import { FilmIcon } from './icons/FilmIcon';
import { ImageIcon } from './icons/ImageIcon';
import { UploadCloudIcon } from './icons/UploadCloudIcon';
import { WandSparklesIcon } from './icons/WandSparklesIcon';

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
}

const steps = [
  { name: 'Upload Product', icon: UploadCloudIcon },
  { name: 'Get Script', icon: FilmIcon },
  { name: 'Upload Images', icon: ImageIcon },
  { name: 'Get Veo Prompts', icon: WandSparklesIcon },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            {stepIdx < currentStep - 1 ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-purple-600" />
                </div>
                <button
                  onClick={() => onStepClick(stepIdx + 1)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 transition-colors"
                  aria-label={`Go to step ${stepIdx + 1}: ${step.name}`}
                >
                  <step.icon />
                </button>
              </>
            ) : stepIdx === currentStep - 1 ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-700" />
                </div>
                <div
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-purple-600 bg-gray-800"
                  aria-current="step"
                >
                  <span className="h-4 w-4 text-purple-600" aria-hidden="true" >
                    <step.icon />
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-700" />
                </div>
                <div
                  className="group relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-gray-600 bg-gray-800"
                >
                   <span className="h-4 w-4 text-gray-500" aria-hidden="true" >
                    <step.icon />
                  </span>
                </div>
              </>
            )}
            <span className="absolute -bottom-7 w-20 text-center text-xs text-gray-400">{step.name}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
};