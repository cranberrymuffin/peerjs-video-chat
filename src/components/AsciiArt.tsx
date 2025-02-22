import React from 'react';

interface AsciiArtProps {
  asciiArt: string | null;
  onBack: () => void;
}

const AsciiArt: React.FC<AsciiArtProps> = ({ asciiArt, onBack }) => {
  return (
    <div className="ascii-art-container">
      <pre>{asciiArt}</pre>
      <button className="go-back-btn" onClick={onBack}>
        Go Back
      </button>
    </div>
  );
};

export default AsciiArt;
