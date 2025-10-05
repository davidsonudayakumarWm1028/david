import React, { useState, useEffect } from 'react';
import { CheckIcon } from './icons/CheckIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface FinalPromptCardProps {
  imageFile: File | null;
  veoPrompt: string;
  shotNumber: number;
}

export const FinalPromptCard: React.FC<FinalPromptCardProps> = ({ imageFile, veoPrompt, shotNumber }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [imageFile]);

  const handleCopy = () => {
    navigator.clipboard.writeText(veoPrompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col md:flex-row items-start gap-6">
      <div className="flex-shrink-0 w-full md:w-48 h-48">
        {imagePreview ? (
          <img src={imagePreview} alt={`Shot ${shotNumber}`} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">No Image</div>
        )}
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-gray-200">Shot {shotNumber} - Veo Prompt</h3>
        <div className="mt-2 bg-gray-900/70 p-4 rounded-lg border border-gray-600 flex justify-between items-start gap-4">
            <p className="text-gray-300 leading-relaxed text-sm">
                {veoPrompt}
            </p>
            <button
                onClick={handleCopy}
                className="flex-shrink-0 group relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 bg-gray-700 hover:bg-gray-600 text-gray-300"
                aria-label="Copy Veo prompt"
            >
                {isCopied ? <CheckIcon /> : <ClipboardIcon />}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {isCopied ? 'Copied!' : 'Copy'}
                </span>
            </button>
        </div>
      </div>
    </div>
  );
};
