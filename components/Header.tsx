
import React from 'react';

export function Header() {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          AI Pose <span className="text-indigo-400">Transfer</span> Studio
        </h1>
        <p className="mt-2 text-md text-gray-400 max-w-2xl mx-auto">
          Strike a new pose! Upload your photo, pick a template, and let our AI magically change your pose.
        </p>
      </div>
    </header>
  );
}
