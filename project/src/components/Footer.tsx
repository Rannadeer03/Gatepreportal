import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2 text-gray-500 text-fluid-sm sm:text-fluid-base">
          <span>Made</span>
          <span>by Rannadeer Kumar and Shundhanshu</span>
        </div>
      </div>
    </footer>
  );
};