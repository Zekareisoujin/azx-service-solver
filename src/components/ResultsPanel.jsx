import React from 'react';

const ResultsPanel = ({ output, isProcessing }) => {
    if (!output && !isProcessing) return null;

    return (
        <div className="results-panel">
            <h2>Detected Grid</h2>
            <pre className="grid-output">
                {isProcessing ? 'Processing image...' : output}
            </pre>
        </div>
    );
};

export default ResultsPanel;
