import { createWorker } from 'tesseract.js';

export async function performOCR(imageFile: File): Promise<string> {
  const worker = await createWorker('eng');
  const imageUrl = URL.createObjectURL(imageFile);
  
  try {
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);
    return text;
  } catch (error) {
    console.error("OCR Error:", error);
    await worker.terminate();
    URL.revokeObjectURL(imageUrl);
    throw new Error("Failed to extract text from the image.");
  }
}
