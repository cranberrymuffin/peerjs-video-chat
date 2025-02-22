import React, { useState } from 'react';

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string>('');

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => setImageSrc(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* File Upload Input */}
      <input type="file" accept="image/*" onChange={handleFileUpload} />

      {/* SVG Filter with Sobel */}
      {imageSrc && (
        <svg width="600px" height="800px">
          <defs>
            <filter id="sobel" x="0%" y="0%" width="100%" height="100%">
              {/* Convert source image to grayscale luminance map */}
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0.2126 0.7152 0.0722 0 1
                0.2126 0.7152 0.0722 0 1
                0.2126 0.7152 0.0722 0 1
                1     1     1     0 0"
                result="luminance"
              />

              {/* Sobel edge detection for greyscale */}
              <feConvolveMatrix
                in="luminance"
                order="3"
                kernelMatrix="-1 -2 -1  
                                0 0 0  
                                1 2 1"
                result="hor"
              />
              <feConvolveMatrix
                in="luminance"
                order="3"
                kernelMatrix="-1 0 1  
                                -2 0 2  
                                -1 0 1"
                result="ver"
              />
              <feComposite
                operator="arithmetic"
                k2="1"
                k3="1"
                in="hor"
                in2="ver"
                result="edges"
              />

              {/* Set the final edges as the result */}
              <feFlood flood-color="black" result="black" />
              <feComposite operator="over" in="edges" />
            </filter>
          </defs>

          {/* Display original image */}
          <image
            width="400"
            height="300"
            preserveAspectRatio="xMinYMin meet"
            xlinkHref={imageSrc}
          />

          {/* Display Sobel filtered image */}
          <image
            filter="url(#sobel)"
            y="400"
            width="400"
            height="300"
            xlinkHref={imageSrc}
          />
        </svg>
      )}
    </div>
  );
};

export default App;
