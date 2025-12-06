import React, { useEffect, useRef } from 'react';

const PassResult = ({ passIndex, image, solutions, clearedCells }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (image && solutions) {
            renderPass(image, solutions);
        }
    }, [image, solutions]);

    const renderPass = (img, currentSolutions) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(image, 0, 0);

        // Mask out cleared cells from previous passes
        if (clearedCells && clearedCells.length > 0) {
            ctx.fillStyle = '#1e293b'; // Surface color to fully hide them
            clearedCells.forEach(cell => {
                ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
            });
        }

        // Draw solutions
        if (currentSolutions.length > 0) {
            ctx.lineWidth = 3;

            currentSolutions.forEach((sol, index) => {
                // Generate a unique color for this solution
                // Use HSL to ensure distinctness and good visibility
                const hue = (index * 137.508) % 360; // Golden angle approximation
                const color = `hsla(${hue}, 70%, 50%, 1)`;
                const fillColor = `hsla(${hue}, 70%, 50%, 0.4)`;

                ctx.strokeStyle = color;
                ctx.fillStyle = fillColor;

                // Draw lines connecting the cells to show they belong together
                ctx.beginPath();
                const firstCell = sol.cells[0];
                ctx.moveTo(firstCell.x + firstCell.w / 2, firstCell.y + firstCell.h / 2);

                sol.cells.forEach(cell => {
                    ctx.lineTo(cell.x + cell.w / 2, cell.y + cell.h / 2);
                });
                ctx.stroke();

                // Draw each cell in the solution
                sol.cells.forEach(cell => {
                    ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
                    ctx.strokeRect(cell.x, cell.y, cell.w, cell.h);
                });
            });
        }
    };

    return (
        <div className="pass-result">
            <h3>Pass {passIndex}</h3>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default PassResult;
