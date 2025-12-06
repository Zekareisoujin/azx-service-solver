import React from 'react';

const ResultsPanel = ({ output, isProcessing, onRecalibrate }) => {
    if (!output && !isProcessing) return null;

    return (
        <div className="results-panel">
            <div className="results-header">
                <h2>Detected Grid</h2>
                {onRecalibrate && (
                    <button className="secondary-button" onClick={onRecalibrate}>
                        Recalibrate
                    </button>
                )}
            </div>
            <pre className="grid-output">
                {isProcessing ? 'Processing image...' : output}
            </pre>
        </div>
    );
};

export default ResultsPanel;
