export const scanGrid = (blobs, calibrationData, width, height) => {
  const detectedDigits = [];

  // 1. Match blobs to calibrated templates
  for (const blob of blobs) {
    let bestMatch = null;
    let maxScore = 0;

    for (const id in calibrationData) {
      const template = calibrationData[id];
      // Simple size check first
      if (Math.abs(template.w - blob.w) > 2 || Math.abs(template.h - blob.h) > 2) continue;

      // Compare pixel data
      // Note: In a real app we might want to re-extract blob data here if not preserved
      // For now assuming we can compare the raw pixel data we have or re-extract
      // Since we don't have the raw binary map here easily, we rely on the fact that
      // the blobs passed in are the same objects from processImage, which we can augment
      // or we can just pass the binaryMap to this function too.
      
      // Let's assume we pass binaryMap to this function or the blobs have data attached.
      // For this implementation, let's assume blobs have 'data' attached from processImage
      // (We need to update processImage to attach data to all blobs, not just clusters)
      
      if (blob.data && template.data) {
          const score = compareData(blob.data, template.data);
          if (score > 0.85 && score > maxScore) {
              maxScore = score;
              bestMatch = template.label;
          }
      }
    }

    if (bestMatch) {
      detectedDigits.push({
        x: blob.x,
        y: blob.y,
        w: blob.w,
        h: blob.h,
        value: bestMatch
      });
    }
  }

  // 2. Sort digits into rows and columns
  // Sort by Y first to find rows
  detectedDigits.sort((a, b) => a.y - b.y);

  const rows = [];
  let currentRow = [];
  let lastY = -1;

  for (const digit of detectedDigits) {
    if (lastY === -1 || Math.abs(digit.y - lastY) < 20) { // Row height threshold
      currentRow.push(digit);
    } else {
      // Sort current row by X
      currentRow.sort((a, b) => a.x - b.x);
      rows.push(currentRow);
      currentRow = [digit];
    }
    lastY = digit.y;
  }
  if (currentRow.length > 0) {
    currentRow.sort((a, b) => a.x - b.x);
    rows.push(currentRow);
  }

  return rows;
};

function compareData(data1, data2) {
    if (data1.length !== data2.length) return 0;
    let matches = 0;
    for(let i=0; i<data1.length; i++) {
        if (data1[i] === data2[i]) matches++;
    }
    return matches / data1.length;
}
