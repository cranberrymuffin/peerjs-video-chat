import { removeBackground } from '@imgly/background-removal';

const FONT_SIZE = 6; // Font size in pixels

const calculateDimensions = (): { width: number; height: number } => {
  const charWidth = FONT_SIZE;
  const charHeight = FONT_SIZE;

  const maxWidth = window.innerWidth;
  const maxHeight = window.innerHeight;

  return {
    width: Math.floor(maxWidth / charWidth),
    height: Math.floor(maxHeight / charHeight),
  };
};

const cropImage = (image: HTMLImageElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Draw the image to get pixel data
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let top = canvas.height,
    bottom = 0,
    left = canvas.width,
    right = 0;

  // Find the bounding box of non-transparent pixels
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const alpha = pixels[i + 3]; // Alpha channel

      if (alpha > 128) {
        // If pixel is not fully transparent
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
    }
  }

  // Crop the image based on the bounding box
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d')!;
  croppedCanvas.width = right - left + 1;
  croppedCanvas.height = bottom - top + 1;
  croppedCtx.drawImage(
    canvas,
    left,
    top,
    right - left + 1,
    bottom - top + 1,
    0,
    0,
    right - left + 1,
    bottom - top + 1,
  );

  return croppedCanvas;
};

const convertToAscii = (
  image: HTMLImageElement,
  width: number,
  height: number,
  asciiChars: string[],
): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  let asciiStr = '';

  for (let i = 0; i < pixels.length; i += 4) {
    const [r, g, b, a] = pixels.slice(i, i + 4);

    asciiStr +=
      a < 128
        ? ' '
        : asciiChars[
            Math.floor(
              ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) *
                (asciiChars.length - 1),
            )
          ];

    if ((i / 4 + 1) % width === 0) asciiStr += '\n';
  }
  return asciiStr
    .split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');
};

export const processImage = async (
  imageSource: Blob | string,
  setAsciiArt: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  asciiChars: string[],
): Promise<void> => {
  setIsLoading(true);

  try {
    const removedBlob = await removeBackground(
      imageSource instanceof Blob
        ? imageSource
        : await (await fetch(imageSource)).blob(),
    );
    if (!removedBlob) return setIsLoading(false);

    const url = URL.createObjectURL(removedBlob);

    const image = new Image();
    image.onload = () => {
      const { width: maxWidth, height: maxHeight } = calculateDimensions();

      // Crop the image before converting to ASCII
      const croppedCanvas = cropImage(image);
      const croppedImage = new Image();
      croppedImage.src = croppedCanvas.toDataURL();

      croppedImage.onload = () => {
        const aspectRatio =
          croppedImage.naturalWidth / croppedImage.naturalHeight;

        let width = croppedImage.naturalWidth;
        let height = croppedImage.naturalHeight;

        // Ensure the image fits within the maxWidth and maxHeight
        if (width > maxWidth) {
          width = maxWidth;
          height = Math.floor(width / aspectRatio);
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = Math.floor(height * aspectRatio);
        }

        setAsciiArt(convertToAscii(croppedImage, width, height, asciiChars));
        setIsLoading(false);
      };
    };
    image.src = url;
  } catch (error) {
    console.error('Error processing image:', error);
    setIsLoading(false);
  }
};
