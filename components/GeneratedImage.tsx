import React from 'react';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface GeneratedImageProps {
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

export function GeneratedImage({ generatedImage, isLoading, error }: GeneratedImageProps) {
    const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'pose-transfer-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-2xl aspect-[2/3] bg-gray-800 rounded-lg shadow-inner flex items-center justify-center p-4">
      <div className="relative w-full h-full flex items-center justify-center">
        {isLoading && (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <LoadingSpinner />
            <p className="text-lg animate-pulse">AI is working its magic...</p>
            <p className="text-sm text-gray-500">This can take a moment.</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center text-red-400">
            <h3 className="text-lg font-semibold">Generation Failed</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!isLoading && !error && generatedImage && (
          <>
            <img
              src={generatedImage}
              alt="Generated pose"
              className="object-contain w-full h-full rounded-md animate-fade-in"
              style={{ animation: 'fadeIn 0.5s ease-in-out' }}
            />
            <button
              onClick={handleDownload}
              title="Download Image"
              aria-label="Download generated image"
              className="absolute top-4 right-4 bg-gray-900/60 text-white p-2 rounded-full hover:bg-gray-900/80 transition-colors duration-200 backdrop-blur-sm"
            >
              <DownloadIcon />
            </button>
          </>
        )}
        
        {!isLoading && !error && !generatedImage && (
             <div className="text-center text-gray-500">
                <h3 className="text-lg font-semibold">Your Result Will Appear Here</h3>
                <p className="text-sm">Upload a photo, select a pose, and click "Generate".</p>
             </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}