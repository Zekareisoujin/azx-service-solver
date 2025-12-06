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
          // Use sliding window matching to handle slight misalignments
          const score = compareDataWithOffset(blob, template);
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

  // 2. Sort digits into rows
  // Sort by Y first to find rows
  detectedDigits.sort((a, b) => a.y - b.y);

  const rawRows = [];
  let currentRow = [];
  let lastY = -1;

  for (const digit of detectedDigits) {
    // Use a dynamic threshold based on digit height, default to 20 if height is missing
    const threshold = digit.h ? digit.h * 0.5 : 20;
    
    if (lastY === -1 || Math.abs(digit.y - lastY) < threshold) {
      currentRow.push(digit);
    } else {
      // Sort current row by X
      currentRow.sort((a, b) => a.x - b.x);
      rawRows.push(currentRow);
      currentRow = [digit];
    }
    lastY = digit.y;
  }
  if (currentRow.length > 0) {
    currentRow.sort((a, b) => a.x - b.x);
    rawRows.push(currentRow);
  }

  // 3. Align columns
  if (rawRows.length === 0) return [];

  // Calculate grid pitch (average distance between columns)
  // Collect all x-distances between adjacent cells in all rows
  const xDistances = [];
  rawRows.forEach(row => {
    for (let i = 0; i < row.length - 1; i++) {
      const dist = row[i+1].x - row[i].x;
      xDistances.push(dist);
    }
  });

  // Calculate median pitch
  xDistances.sort((a, b) => a - b);
  let gridPitch = 0;
  if (xDistances.length > 0) {
      const mid = Math.floor(xDistances.length / 2);
      gridPitch = xDistances[mid];
  }
  
  // Fallback if no distances found (single column?)
  if (gridPitch === 0 && detectedDigits.length > 0) {
      gridPitch = detectedDigits[0].w || 40; 
  }

  // Find global min X to use as anchor
  let minX = Infinity;
  detectedDigits.forEach(d => {
      if (d.x < minX) minX = d.x;
  });

  // Construct the aligned grid
  const alignedRows = [];
  
  rawRows.forEach(row => {
      const alignedRow = [];
      row.forEach(digit => {
          // Calculate column index
          const colIndex = Math.round((digit.x - minX) / gridPitch);
          
          // Fill gaps with null
          while (alignedRow.length < colIndex) {
              alignedRow.push(null);
          }
          // Ensure we don't overwrite if multiple digits map to same col (shouldn't happen with correct pitch)
          alignedRow[colIndex] = digit;
      });
      alignedRows.push(alignedRow);
  });

  // Normalize row lengths
  const maxCols = Math.max(...alignedRows.map(r => r.length));
  alignedRows.forEach(row => {
      while (row.length < maxCols) {
          row.push(null);
      }
  });

  return alignedRows;
};

function compareDataWithOffset(blob, template) {
    let maxScore = 0;
    
    // Try offsets: -1, 0, 1 in both X and Y
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const score = compareData(blob, template, dx, dy);
            if (score > maxScore) maxScore = score;
        }
    }
    return maxScore;
}

function compareData(blob, template, offsetX, offsetY) {
    const data1 = blob.data;
    const data2 = template.data;
    const w1 = blob.w;
    const h1 = blob.h;
    const w2 = template.w;
    const h2 = template.h;
    
    let matches = 0;
    let total = 0;

    // Determine the overlapping region
    const startX = Math.max(0, -offsetX);
    const startY = Math.max(0, -offsetY);
    const endX = Math.min(w1, w2 - offsetX);
    const endY = Math.min(h1, h2 - offsetY);

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const idx1 = y * w1 + x;
            const idx2 = (y + offsetY) * w2 + (x + offsetX);
            
            if (data1[idx1] === data2[idx2]) {
                matches++;
            }
            total++;
        }
    }
    
    // Penalize for non-overlapping pixels (size mismatch)
    const totalPixels = Math.max(w1 * h1, w2 * h2);
    // Adjust total to account for the full area, not just overlap
    // A simple way is to treat non-overlapping pixels as mismatches
    
    if (total === 0) return 0;
    
    // We want to count matches over the UNION of the areas.
    // Matches / (Area1 + Area2 - Matches) ? Jaccard index?
    // Or just Matches / MaxArea.
    
    return matches / totalPixels;
}
