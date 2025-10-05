import React, { useState } from 'react';
import { CheckIcon } from './icons/CheckIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { ShotDetail } from '../types';

interface ScriptPromptCardProps {
  shot: ShotDetail;
}

export const ScriptPromptCard: React.FC<ScriptPromptCardProps> = ({ shot }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shot.image_prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-2">
        {shot.shot_number}
      </h3>
      <p className="text-gray-300 leading-relaxed mb-4">
        <strong>Script:</strong> {shot.shot_description}
      </p>
      <div className="bg-gray-900/70 p-4 rounded-lg border border-gray-600">
        <div className="flex justify-between items-start gap-4">
          <p className="text-gray-400 font-mono text-sm leading-relaxed">
            <strong>Image Prompt:</strong> {shot.image_prompt}
          </p>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 group relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 bg-gray-700 hover:bg-gray-600 text-gray-300"
            aria-label="Copy prompt"
          >
            {isCopied ? <CheckIcon /> : <ClipboardIcon />}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isCopied ? 'Copied!' : 'Copy'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
