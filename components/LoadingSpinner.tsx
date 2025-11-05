
import React from 'react';

export const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-white font-semibold">{message}</p>
    </div>
  );
};
