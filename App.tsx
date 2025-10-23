
import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PoseTemplateGallery } from './components/PoseTemplateGallery';
import { GeneratedImage } from './components/GeneratedImage';
import { SparklesIcon } from './components/icons/SparklesIcon';
import type { PoseTemplate } from './types';
import { generatePoseImage } from './services/geminiService';

const INITIAL_TEMPLATES: PoseTemplate[] = [
  { id: 1, name: 'Yoga Serenity', src: 'https://images.pexels.com/photos/4164844/pexels-photo-4164844.jpeg' },
  { id: 2, name: 'Joyful Leap', src: 'https://images.pexels.com/photos/1553783/pexels-photo-1553783.jpeg' },
  { id: 3, name: 'Pondering Stance', src: 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg' },
  { id: 4, name: 'Heroic Arrival', src: 'https://images.pexels.com/photos/2781814/pexels-photo-2781814.jpeg' },
  { id: 5, name: 'Elegant Dance', src: 'https://images.pexels.com/photos/1152994/pexels-photo-1152994.jpeg' },
  { id: 6, name: 'Confident Point', src: 'https://images.pexels.com/photos/3757955/pexels-photo-3757955.jpeg' },
  { id: 7, name: 'Casual Confidence', src: 'https://images.pexels.com/photos/3076516/pexels-photo-3076516.jpeg' },
  { id: 8, name: 'Relaxed Lean', src: 'https://images.pexels.com/photos/1036627/pexels-photo-1036627.jpeg' },
];

interface ImageSource {
  dataUrl: string;
  mimeType: string;
}

function App() {
  const [userImage, setUserImage] = useState<ImageSource | null>(null);
  const [templates, setTemplates] = useState<PoseTemplate[]>(INITIAL_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<PoseTemplate | null>(templates[0]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const newTemplateInputRef = useRef<HTMLInputElement>(null);

  const handleUserImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserImage({
        dataUrl: reader.result as string,
        mimeType: file.type,
      });
      setGeneratedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleNewTemplateUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newTemplate: PoseTemplate = {
        id: Date.now(),
        name: `Custom ${templates.length + 1 - INITIAL_TEMPLATES.length}`,
        src: reader.result as string,
      };
      setTemplates(prev => [newTemplate, ...prev]);
      setSelectedTemplate(newTemplate);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateClick = useCallback(async () => {
    if (!userImage || !selectedTemplate) {
      setError('Please upload your photo and select a pose template.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // 1. Prepare User Image
      const userImageBase64 = userImage.dataUrl.split(',')[1];
      const userImageMimeType = userImage.mimeType;

      // 2. Prepare Template Image
      let templateImageBase64: string;
      let templateImageMimeType: string;

      if (selectedTemplate.src.startsWith('data:')) {
        // It's an uploaded template (data URL)
        const parts = selectedTemplate.src.split(',');
        const mimeTypePart = parts[0].match(/:(.*?);/);
        templateImageMimeType = mimeTypePart ? mimeTypePart[1] : 'image/jpeg';
        templateImageBase64 = parts[1];
      } else {
        // It's an initial template (URL), so we fetch it
        const response = await fetch(selectedTemplate.src);
        if (!response.ok) {
          throw new Error(`Failed to fetch template image: ${response.statusText}`);
        }
        const blob = await response.blob();
        templateImageMimeType = blob.type;
        templateImageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const result = await generatePoseImage(
        { data: userImageBase64, mimeType: userImageMimeType },
        { data: templateImageBase64, mimeType: templateImageMimeType }
      );
      
      setGeneratedImage(`data:image/png;base64,${result}`);
    } catch (e: unknown) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  }, [userImage, selectedTemplate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="flex flex-col gap-8">
            <ImageUploader
              id="user-image-uploader"
              title="Step 1: Upload Your Photo"
              onImageUpload={handleUserImageUpload}
              imagePreview={userImage?.dataUrl ?? null}
            />
            <PoseTemplateGallery
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
              onUploadTemplate={() => newTemplateInputRef.current?.click()}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col items-center gap-6">
            <button
              onClick={handleGenerateClick}
              disabled={isLoading || !userImage || !selectedTemplate}
              className="w-full max-w-md flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100"
            >
              <SparklesIcon />
              {isLoading ? 'Generating Your Pose...' : 'Generate Image'}
            </button>
            
            <GeneratedImage
              generatedImage={generatedImage}
              isLoading={isLoading}
              error={error}
            />
          </div>

        </div>
        
        {/* Hidden file input for uploading new templates */}
        <input
            type="file"
            ref={newTemplateInputRef}
            onChange={(e) => e.target.files && handleNewTemplateUpload(e.target.files[0])}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
        />
      </main>
    </div>
  );
}

export default App;
