import React, { useEffect, useRef, useState } from 'react';

const PasteArea = ({ onImageProcessed }) => {
    const canvasRef = useRef(null);
    const [isWaiting, setIsWaiting] = useState(true);

    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    const url = URL.createObjectURL(blob);
                    const img = new Image();

                    img.onload = () => {
                        renderImage(img);
                        onImageProcessed(img);
                    };

                    img.src = url;
                    break;
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [onImageProcessed]);

    const renderImage = (img) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        setIsWaiting(false);
    };

    return (
        <div className={`paste-area ${!isWaiting ? 'has-content' : ''}`}>
            {isWaiting && <div className="placeholder-text">Waiting for image... (Ctrl+V)</div>}
            <canvas ref={canvasRef} style={{ display: isWaiting ? 'none' : 'block' }} />
        </div>
    );
};

export default PasteArea;
