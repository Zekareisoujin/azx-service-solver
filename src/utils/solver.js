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
  const newGrid = Array(rows).fill().map(() => Array(cols).fill(null));

  // Mark cells to remove
  const toRemove = new Set();
  solutions.forEach(sol => {
    sol.cells.forEach(cell => {
       // We identify cells by their unique object reference or coordinates in current grid?
       // Since we rebuilt the grid, references might be tricky if we deep copied.
       // But we are working on 'grid' which is the source of 'solutions'.
       // So we can just use the cell objects if we didn't copy in between.
       // Actually, let's just use the coordinates from the solution creation?
       // But createSolution extracted the cell objects.
       // Let's iterate columns and reconstruct.
    });
  });
  
  // Easier way: 
  // 1. Create a mask of removed cells based on the solutions found in THIS pass.
  //    (We know exactly which r,c were used because we just found them).
  //    Wait, 'solutions' doesn't store r,c range anymore, just cells.
  //    Let's store the range or just mark them in the grid before creating newGrid.
  
  // Actually, let's just iterate columns.
  // For each column, collect all cells that are NOT in the solutions.
  
  // We need to know which cells are in the solutions.
  const removedCells = new Set(solutions.flatMap(s => s.cells));
  
  for (let c = 0; c < cols; c++) {
    let writeRow = rows - 1;
    // Iterate from bottom up
    for (let r = rows - 1; r >= 0; r--) {
      const cell = grid[r][c];
      if (cell && !removedCells.has(cell)) {
        newGrid[writeRow][c] = cell;
        writeRow--;
      }
    }
  }
  
  return newGrid;
}
