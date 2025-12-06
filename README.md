# AZX Service Solver

A React-based web application designed to solve number grid puzzles from the "AZX Service" game. It uses computer vision techniques to detect numbers from a pasted image and a greedy algorithm to find optimal subgrids.

## Features

-   **Instant Image Processing**: Paste your game screenshot directly (Ctrl+V).
-   **In-Browser Calibration**: No external dependencies. Calibrate the digit recognition once, and it's saved for future use.
-   **Greedy Solver**: Automatically finds non-overlapping rectangular subgrids that sum to 10.
-   **Multi-Pass with Gravity**: Simulates the game mechanics by removing solved grids and applying gravity, then solving again in multiple passes.
-   **Visual Results**: Displays the solution for each pass as a separate image with clear bounding boxes.
-   **Stats**: Calculates total cells cleared and potential score.

## Usage

1.  **Paste Image**: Copy a screenshot of the number grid and paste it into the app.
2.  **Calibrate (First Time Only)**:
    *   The app will detect unique digit shapes.
    *   Label each shape (0-9) in the calibration panel.
    *   Click "Save Calibration".
3.  **View Results**: The app will automatically scan the grid and display the solutions for each pass.
4.  **Recalibrate**: If detection is incorrect, click "Recalibrate" to clear saved data and start over.

## Development

This project uses [Vite](https://vitejs.dev/) + [React](https://reactjs.org/).

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Deployment

The project is configured to deploy to GitHub Pages via GitHub Actions. Pushing to the `master` branch triggers the deployment workflow.
