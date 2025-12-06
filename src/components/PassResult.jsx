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
            ctx.strokeStyle = '#3b82f6'; // Primary blue
            ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';

            currentSolutions.forEach(sol => {
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
