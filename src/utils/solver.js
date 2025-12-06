export const solveGrid = (initialGrid) => {
  let grid = JSON.parse(JSON.stringify(initialGrid)); // Deep copy
  const allSolutions = [];
  let pass = 0;
  
  while (true) {
    pass++;
    const solutions = solveSinglePass(grid, pass);
    
    if (solutions.length === 0) {
      break;
    }
    
    allSolutions.push(...solutions);
    
    // Remove used cells and apply gravity
    grid = applyGravity(grid, solutions);
  }
  
  return allSolutions;
};

const solveSinglePass = (grid, passIndex) => {
  const solutions = [];
  const rows = grid.length;
  if (rows === 0) return [];
  const cols = grid[0].length;
  
  const used = Array(rows).fill().map(() => Array(cols).fill(false));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (used[r][c] || !grid[r][c]) continue; // Skip used or empty cells

      // Try to find a rectangle starting at (r, c) with sum 10
      let found = false;
      
      for (let rEnd = r; rEnd < rows; rEnd++) {
        for (let cEnd = c; cEnd < cols; cEnd++) {
          if (isRectangleFree(used, grid, r, c, rEnd, cEnd)) {
            const currentSum = calculateSum(grid, r, c, rEnd, cEnd);
            
            if (currentSum === 10) {
              markUsed(used, r, c, rEnd, cEnd);
              solutions.push(createSolution(grid, r, c, rEnd, cEnd, passIndex));
              found = true;
              break;
            } else if (currentSum > 10) {
              break; 
            }
          } else {
            break; 
          }
        }
        if (found) break;
      }
    }
  }
  
  return solutions;
};

function isRectangleFree(used, grid, rStart, cStart, rEnd, cEnd) {
  for (let r = rStart; r <= rEnd; r++) {
    for (let c = cStart; c <= cEnd; c++) {
      if (used[r][c] || !grid[r][c]) return false;
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

function createSolution(grid, rStart, cStart, rEnd, cEnd, passIndex) {
  const cells = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (let r = rStart; r <= rEnd; r++) {
    for (let c = cStart; c <= cEnd; c++) {
      const cell = grid[r][c];
      cells.push(cell);
      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      maxX = Math.max(maxX, cell.x + cell.w);
      maxY = Math.max(maxY, cell.y + cell.h);
    }
  }

  return {
    pass: passIndex,
    cells: cells,
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY
  };
}

function applyGravity(grid, solutions) {
  const rows = grid.length;
  const cols = grid[0].length;
  // Deep copy grid to avoid mutating the previous state if we want to keep history,
  // but here we are evolving the grid state.
  // We need to return a new grid structure where used cells are replaced by 0.
  
  const newGrid = grid.map(row => row.map(cell => {
      if (!cell) return null;
      return { ...cell }; // Shallow copy cell
  }));

  const removedCells = new Set();
  solutions.forEach(sol => {
      sol.cells.forEach(c => {
          // Find the cell in the new grid based on coordinates
          // Since we didn't shift, coordinates [r][c] are stable?
          // Wait, sol.cells has the cell objects from 'grid'.
          // 'grid' cells have x,y,w,h but not r,c explicitly stored?
          // But we know the grid structure hasn't changed if we don't shift.
          // So we can match by x,y or just iterate grid to find match.
          removedCells.add(c.x + ',' + c.y);
      });
  });

  for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
          const cell = newGrid[r][c];
          if (cell && removedCells.has(cell.x + ',' + cell.y)) {
              cell.value = '0';
          }
      }
  }
  
  return newGrid;
}
