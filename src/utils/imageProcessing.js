export const processImage = (img) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // 1. Thresholding (isolate white text)
  const binaryMap = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    // Simple brightness check
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (brightness > 180) { // Threshold for white text
      binaryMap[i / 4] = 1;
    } else {
      binaryMap[i / 4] = 0;
    }
  }

  // 2. Blob Detection (Connected Components)
  const blobs = findBlobs(binaryMap, width, height);

  // 3. Filter blobs (remove noise) and attach data
  const digitBlobs = blobs.filter(b => b.w > 5 && b.h > 8 && b.w < 50 && b.h < 50);
  
  digitBlobs.forEach(blob => {
      blob.data = extractBlobData(blob, binaryMap, width);
  });

  // 4. Extract unique templates
  const uniqueTemplates = clusterBlobs(digitBlobs, binaryMap, width);

  return {
    binaryMap,
    width,
    height,
    blobs: digitBlobs,
    uniqueTemplates
  };
};

function findBlobs(binaryMap, width, height) {
  const visited = new Uint8Array(width * height);
  const blobs = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (binaryMap[idx] === 1 && visited[idx] === 0) {
        const blob = { x, y, w: 0, h: 0, pixels: [] };
        const queue = [[x, y]];
        visited[idx] = 1;
        
        let minX = x, maxX = x, minY = y, maxY = y;

        while (queue.length > 0) {
          const [cx, cy] = queue.shift();
          blob.pixels.push({ x: cx, y: cy });

          minX = Math.min(minX, cx);
          maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy);
          maxY = Math.max(maxY, cy);

          // Check neighbors
          const neighbors = [
            [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
          ];

          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (binaryMap[nIdx] === 1 && visited[nIdx] === 0) {
                visited[nIdx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }

        blob.x = minX;
        blob.y = minY;
        blob.w = maxX - minX + 1;
        blob.h = maxY - minY + 1;
        blobs.push(blob);
      }
    }
  }
  return blobs;
}

function clusterBlobs(blobs, binaryMap, width) {
  const clusters = [];
  
  for (const blob of blobs) {
    let matched = false;
    
    // Extract blob data for comparison
    const blobData = extractBlobData(blob, binaryMap, width);

    for (const cluster of clusters) {
      if (Math.abs(cluster.w - blob.w) > 2 || Math.abs(cluster.h - blob.h) > 2) continue;
      
      const similarity = compareBlobs(blobData, cluster.data);
      if (similarity > 0.9) {
        cluster.instances.push(blob);
        matched = true;
        break;
      }
    }

    if (!matched) {
      clusters.push({
        id: clusters.length,
        w: blob.w,
        h: blob.h,
        data: blobData,
        instances: [blob],
        label: null // To be filled by user
      });
    }
  }
  
  return clusters;
}

function extractBlobData(blob, binaryMap, width) {
  const data = new Uint8Array(blob.w * blob.h);
  for (let y = 0; y < blob.h; y++) {
    for (let x = 0; x < blob.w; x++) {
      const srcIdx = (blob.y + y) * width + (blob.x + x);
      data[y * blob.w + x] = binaryMap[srcIdx];
    }
  }
  return data;
}

function compareBlobs(data1, data2) {
  // Simple pixel matching
  let matches = 0;
  const total = data1.length;
  for (let i = 0; i < total; i++) {
    if (data1[i] === data2[i]) matches++;
  }
  return matches / total;
}

export const createBlobImage = (cluster) => {
    const canvas = document.createElement('canvas');
    canvas.width = cluster.w;
    canvas.height = cluster.h;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(cluster.w, cluster.h);
    
    for (let i = 0; i < cluster.data.length; i++) {
        const val = cluster.data[i] === 1 ? 255 : 0; // White text on black
        imgData.data[i * 4] = val;
        imgData.data[i * 4 + 1] = val;
        imgData.data[i * 4 + 2] = val;
        imgData.data[i * 4 + 3] = val === 0 ? 0 : 255; // Transparent background
    }
    
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL();
};
