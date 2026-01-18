import React from 'react';

const LoadingSpinner = () => { // Removed React.FC
  return (
    React.createElement("div", { className: "flex justify-center items-center py-4" },
      React.createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" }) // Red spinner
    )
  );
};

export default LoadingSpinner;