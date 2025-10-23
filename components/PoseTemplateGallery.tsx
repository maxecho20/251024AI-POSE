
import React from 'react';
import type { PoseTemplate } from '../types';

interface PoseTemplateGalleryProps {
  templates: PoseTemplate[];
  selectedTemplate: PoseTemplate | null;
  onSelectTemplate: (template: PoseTemplate) => void;
  onUploadTemplate: () => void;
}

export function PoseTemplateGallery({ templates, selectedTemplate, onSelectTemplate, onUploadTemplate }: PoseTemplateGalleryProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-gray-200">Step 2: Choose a Pose</h2>
        <button 
          onClick={onUploadTemplate}
          className="text-sm bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-md hover:bg-indigo-500/40 transition-colors"
        >
          Upload +
        </button>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg shadow-inner">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[40rem] overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 transform hover:scale-105 group ${
                selectedTemplate?.id === template.id ? 'ring-4 ring-indigo-500 ring-offset-2 ring-offset-gray-800' : 'ring-2 ring-transparent'
              }`}
            >
              <img src={template.src} alt={template.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-bold">{template.name}</p>
              </div>
               {selectedTemplate?.id === template.id && (
                <div className="absolute inset-0 bg-indigo-500/30"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
