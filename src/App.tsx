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
              {/* Convert source image to luminance map for Red Channel */}
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 1 
                        0 0 0 0 1 
                        0 0 0 0 1 
                        1 0 0 0 0"
                result="RChan"
              />

              {/* Convert source image to luminance map for Green Channel */}
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 1 
                        0 0 0 0 1 
                        0 0 0 0 1 
                        0 1 0 0 0"
                result="GChan"
              />

              {/* Convert source image to luminance map for Blue Channel */}
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 1 
                        0 0 0 0 1 
                        0 0 0 0 1 
                        0 0 1 0 0"
                result="BChan"
              />

              {/* Sobel edge detection for Red Channel */}
              <feConvolveMatrix
                in="RChan"
                order="3"
                kernelMatrix="-1 -2 -1  
                                0 0 0  
                                1 2 1"
                result="Rhor"
              />
              <feConvolveMatrix
                in="RChan"
                order="3"
                kernelMatrix="-1 0 1  
                                -2 0 2  
                                -1 0 1"
                result="Rver"
              />
              <feComposite
                operator="arithmetic"
                k2="1"
                k3="1"
                in="Rhor"
                in2="Rver"
              />

              {/* Sobel edge detection for Green Channel */}
              <feConvolveMatrix
                in="GChan"
                order="3"
                kernelMatrix="-1 -2 -1  
                                0 0 0  
                                1 2 1"
                result="Ghor"
              />
              <feConvolveMatrix
                in="GChan"
                order="3"
                kernelMatrix="-1 0 1  
                                -2 0 2  
                                -1 0 1"
                result="Gver"
              />
              <feComposite
                operator="arithmetic"
                k2="1"
                k3="1"
                in="Ghor"
                in2="Gver"
              />

              {/* Sobel edge detection for Blue Channel */}
              <feConvolveMatrix
                in="BChan"
                order="3"
                kernelMatrix="-1 -2 -1  
                                0 0 0  
                                1 2 1"
                result="Bhor"
              />
              <feConvolveMatrix
                in="BChan"
                order="3"
                kernelMatrix="-1 0 1  
                                -2 0 2  
                                -1 0 1"
                result="Bver"
              />
              <feComposite
                operator="arithmetic"
                k2="1"
                k3="1"
                in="Bhor"
                in2="Bver"
              />

              {/* Combine all channel edges */}
              <feComposite
                operator="arithmetic"
                in="Rhor"
                in2="Ghor"
                k2="1"
                k3="1"
                result="finalEdge1"
              />
              <feComposite
                operator="arithmetic"
                in="finalEdge1"
                in2="Bhor"
                k2="1"
                k3="1"
                result="finaledges"
              />

              {/* Set the final edges as the result */}
              <feFlood flood-color="black" result="black" />
              <feComposite operator="over" in="finaledges" />
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
