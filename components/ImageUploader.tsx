import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloudIcon } from './icons/UploadCloudIcon';

interface ImageUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
  small?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ file, setFile, small = false }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [file]);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  }, [setFile]);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  if (preview) {
    return (
      <div className={`relative group ${small ? 'w-full h-40' : 'w-full max-w-md mx-auto h-64'}`}>
        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
          <button onClick={() => setFile(null)} className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold">Remove</button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={`relative block ${small ? 'w-full p-6' : 'max-w-md mx-auto p-12'} text-center border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 transition-colors cursor-pointer`}
    >
      <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      <div className="flex flex-col items-center">
        <UploadCloudIcon />
        <span className={`mt-2 block ${small ? 'text-xs' : 'text-sm'} font-semibold text-gray-300`}>
          Drag & drop or click to upload
        </span>
      </div>
    </div>
  );
};
