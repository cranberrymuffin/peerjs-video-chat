import React, { ChangeEvent } from 'react';

interface ImageInputProps {
  imageUrlInput: string;
  onUrlChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onUrlSubmit: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const ImageInput: React.FC<ImageInputProps> = ({
  imageUrlInput,
  onUrlChange,
  onUrlSubmit,
  onFileChange,
}) => {
  return (
    <div className="input-container">
      <div className="input-group">
        <input
          type="text"
          value={imageUrlInput}
          onChange={onUrlChange}
          placeholder="Enter image URL"
          className="input-field"
        />
        <button className="process-btn" onClick={onUrlSubmit}>
          Process Image from URL
        </button>
      </div>
      <div>
        <input
          type="file"
          id="file-input"
          onChange={onFileChange}
          accept="image/*"
          className="file-input"
        />
        <label htmlFor="file-input" className="file-input-label">
          Choose File
        </label>
      </div>
    </div>
  );
};

export default ImageInput;
