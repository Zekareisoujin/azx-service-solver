export const solveGrid = (grid) => {
  const solutions = [];
  const rows = grid.length;
  if (rows === 0) return [];
  const cols = grid[0].length;
  
  // Keep track of used cells
  const used = Array(rows).fill().map(() => Array(cols).fill(false));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (used[r][c]) continue;

      // Try to find a rectangle starting at (r, c) with sum 10
      // We'll search for the "first" one we find (greedy)
      // We can prioritize smaller rectangles or specific shapes if needed,
      // but standard greedy usually just takes the first valid one.
      
      let found = false;
      
      // Iterate through possible end rows and cols
      for (let rEnd = r; rEnd < rows; rEnd++) {
        for (let cEnd = c; cEnd < cols; cEnd++) {
          // Check if this rectangle is valid (no used cells)
          if (isRectangleFree(used, r, c, rEnd, cEnd)) {
            const currentSum = calculateSum(grid, r, c, rEnd, cEnd);
            
            if (currentSum === 10) {
              // Found a solution! Mark used and add to list
              markUsed(used, r, c, rEnd, cEnd);
              solutions.push(createSolution(grid, r, c, rEnd, cEnd));
              found = true;
              break; // Break inner loop
            } else if (currentSum > 10) {
              // Optimization: if sum exceeds 10, extending further right won't help
              // (assuming positive numbers, which they are)
              break; 
            }
          } else {
            // Rectangle not free, stop extending right
            break; 
          }
        }
        if (found) break; // Break outer loop
      }
    }
  }
  
  return solutions;
};

function isRectangleFree(used, rStart, cStart, rEnd, cEnd) {
  for (let r = rStart; r <= rEnd; r++) {
    for (let c = cStart; c <= cEnd; c++) {
      if (used[r][c]) return false;
    }
  }
  return true;
}

function calculateSum(grid, rStart, cStart, rEnd, cEnd) {
  let sum = 0;
  for (let r = rStart; r <= rEnd; r++) {
    for (let c = cStart; c <= cEnd; c++) {
      sum += parseInt(grid[r][c].value, 10);
    }
  }
  return sum;
}

function markUsed(used, rStart, cStart, rEnd, cEnd) {
  for (let r = rStart; r <= rEnd; r++) {
    for (let c = cStart; c <= cEnd; c++) {
      used[r][c] = true;
    }
  }
}

function createSolution(grid, rStart, cStart, rEnd, cEnd) {
  // Calculate bounding box for visualization
  const topLeft = grid[rStart][cStart];
  const bottomRight = grid[rEnd][cEnd];
  
  return {
    r: rStart,
    c: cStart,
    rEnd,
    cEnd,
    x: topLeft.x,
    y: topLeft.y,
    w: (bottomRight.x + bottomRight.w) - topLeft.x,
    h: (bottomRight.y + bottomRight.h) - topLeft.y
  };
}
