import React, { useState } from 'react';
import AsciiArt from './components/AsciiArt';
import ImageInput from './components/ImageInput';
import Loading from './components/Loading';
import { processImage } from './utils/imageProcessing';
import './style.css';

const App = () => {
  const [asciiArt, setAsciiArt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');

  const asciiChars: string[] = [
    '@',
    '%',
    '#',
    '*',
    '+',
    '=',
    '-',
    ':',
    '.',
    ' ',
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      processImage(file, setAsciiArt, setIsLoading, asciiChars);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrlInput(event.target.value);
  };

  const handleUrlSubmit = () => {
    if (imageUrlInput) {
      processImage(imageUrlInput, setAsciiArt, setIsLoading, asciiChars);
    }
  };

  const handleBackToInput = () => {
    setAsciiArt(null);
    setImageUrlInput('');
  };

  return (
    <div className="app-container">
      {asciiArt ? (
        <AsciiArt asciiArt={asciiArt} onBack={handleBackToInput} />
      ) : isLoading ? (
        <Loading />
      ) : (
        <ImageInput
          imageUrlInput={imageUrlInput}
          onUrlChange={handleUrlChange}
          onUrlSubmit={handleUrlSubmit}
          onFileChange={handleFileChange}
        />
      )}
    </div>
  );
};

export default App;
