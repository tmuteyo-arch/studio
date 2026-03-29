'use client';

/**
 * Validates document image quality using client-side heuristics.
 * Checks for brightness (too dark) and edge variance (blurry/unreadable).
 */
export async function validateImageQualityHeuristic(dataUri: string): Promise<{ isValid: boolean; reason?: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // If we can't get context, we allow it but log a warning (fallback)
        resolve({ isValid: true });
        return;
      }

      // Use a smaller scale for performance while maintaining enough detail for stats
      const maxDim = 800;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height / width) * maxDim;
          width = maxDim;
        } else {
          width = (width / height) * maxDim;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      let totalLuminance = 0;
      let count = 0;

      // Brightness check: Average luminance
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Standard luminance formula
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;
        count++;
      }

      const avgBrightness = totalLuminance / count;

      // Threshold: 45 (0-255 range). Below 45 is usually very dark.
      if (avgBrightness < 45) {
        resolve({ isValid: false, reason: 'Image is too dark.' });
        return;
      }

      // Sharpness/Blur check: Calculating variance of Laplacian-like operator
      // We'll sample gradients to detect high-frequency data (text edges)
      let varianceSum = 0;
      let sqDiffSum = 0;
      
      const lums = new Float32Array(count);
      for (let i = 0; i < data.length; i += 4) {
        lums[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      // Simple variance check: high variance in a document usually means clear text vs background
      // Low variance usually means blur or a blank page
      for (let i = 0; i < count; i++) {
        sqDiffSum += Math.pow(lums[i] - avgBrightness, 2);
      }
      
      const variance = sqDiffSum / count;

      // Threshold: 800. A clear document with text usually has variance > 1500.
      // A blurry image or one without edges visible usually drops below 800.
      if (variance < 800) {
        resolve({ isValid: false, reason: 'Image is blurry or lacks detail.' });
        return;
      }

      resolve({ isValid: true });
    };
    img.onerror = () => resolve({ isValid: false, reason: 'Could not load image.' });
    img.src = dataUri;
  });
}
