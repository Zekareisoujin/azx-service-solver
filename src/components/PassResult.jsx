import React, { useEffect, useRef } from 'react';

const PassResult = ({ image, solutions, passIndex }) => {
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
        ctx.drawImage(img, 0, 0);

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

                // Draw bounding box for the solution
                ctx.fillRect(sol.x, sol.y, sol.w, sol.h);
                ctx.strokeRect(sol.x, sol.y, sol.w, sol.h);
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
