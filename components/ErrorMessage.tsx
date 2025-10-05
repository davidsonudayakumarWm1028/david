
import React from 'react';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center gap-3 bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg" role="alert">
      <AlertTriangleIcon />
      <span className="font-medium">{message}</span>
    </div>
  );
};
