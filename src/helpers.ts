import { Color } from "./Colours";

export const Pluralise = (s: string, count: number) => {

    if (s === "Foot" && count > 1) {
        return "Feet"
    }
    return s+(count>1?"s":"");
}

export const loadAndModifyImage = async (
  imageUrl: string,
  f: (c: Color) => Color,
  canvas?: HTMLCanvasElement
): Promise<string> => {
  // Load the image
  const image = new Image();
  image.src = imageUrl;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  if (!canvas) {
    // Create an offscreen canvas
    canvas = document.createElement("canvas");
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context could not be created");
  }

  // Set the canvas size to match the image
  canvas.width = image.width;
  canvas.height = image.height;

  // Draw the image onto the canvas
  ctx.drawImage(image, 0, 0);

  // Get the image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Modify the image data (example: invert colors)
  for (let i = 0; i < data.length; i += 4) {
    var c = f({r: data[i], g: data[i+1], b: data[i+2], a: data[i+3]})
    data[i] = c.r;
    data[i + 1] = c.g; 
    data[i + 2] = c.b; 
    data[i + 3] = c.a; 
  }

  // Put the modified image data back on the canvas
  ctx.putImageData(imageData, 0, 0);

  // Create a new Image element with the modified data
  return canvas.toDataURL("image/png");
};

export const modifyImage = async (imageData: ImageData, canvas: HTMLCanvasElement, f: (c: Color) => Color) => {
  canvas.height = imageData.height;
  canvas.width = imageData.width;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context could not be created");
  }
  const data = imageData.data;

  // Modify the image data (example: invert colors)
  for (let i = 0; i < data.length; i += 4) {
    var c = f({r: data[i], g: data[i+1], b: data[i+2], a: data[i+3]})
    data[i] = c.r;
    data[i + 1] = c.g; 
    data[i + 2] = c.b; 
    data[i + 3] = c.a; 
  }

  // Put the modified image data back on the canvas
  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));

  return URL.createObjectURL(blob!);
}