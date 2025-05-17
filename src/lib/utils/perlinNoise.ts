export const loadPerlinImage = async (path: string): Promise<HTMLImageElement> => {
    const image = new Image();
    image.src = path;
    return new Promise((resolve, reject) => {
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Failed to load image from ${path}`));
    });
}

export const getPerlinNoiseWithinViewport = async (image: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const pixels = imageData.data;
  
    const values = [];

    for (let y = 0; y < image.height; y++) {
      const row = [];
      for (let x = 0; x < image.width; x++) {
        const i = (y * image.width + x) * 4; // We multiply by for since pixel is stored as R, G, B, A
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
  
        const gray = (r + g + b) / 3; // Average the three colors to gray scale
        const value = gray / 255; // Normalize from 0-255 to 0-1
  
        row.push(value);
      }
      values.push(row);
    }

    return values;
}