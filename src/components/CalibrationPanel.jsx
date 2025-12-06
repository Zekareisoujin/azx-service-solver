import React, { useState, useEffect } from 'react';
import { createBlobImage } from '../utils/imageProcessing';

const CalibrationPanel = ({ clusters, onCalibrationComplete }) => {
    const [labels, setLabels] = useState({});

    useEffect(() => {
        // Initialize labels
        const initialLabels = {};
        clusters.forEach(c => {
            initialLabels[c.id] = '';
        });
        setLabels(initialLabels);
    }, [clusters]);

    const handleLabelChange = (id, value) => {
        setLabels(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSave = () => {
        // Map cluster IDs to user labels
        const calibrationData = {};
        clusters.forEach(c => {
            const label = labels[c.id];
            if (label) {
                calibrationData[c.id] = {
                    label,
                    data: Array.from(c.data),
                    w: c.w,
                    h: c.h
                };
            }
        });
        onCalibrationComplete(calibrationData);
    };

    return (
        <div className="calibration-panel">
            <h2>Calibration Required</h2>
            <p>Please label the unique numbers found in the image.</p>

            <div className="clusters-grid">
                {clusters.map(cluster => (
                    <div key={cluster.id} className="cluster-item">
                        <img src={createBlobImage(cluster)} alt="digit" />
                        <input
                            type="text"
                            maxLength="1"
                            value={labels[cluster.id] || ''}
                            onChange={(e) => handleLabelChange(cluster.id, e.target.value)}
                            placeholder="?"
                        />
                        <span className="count">x{cluster.instances.length}</span>
                    </div>
                ))}
            </div>

            <button className="primary-button" onClick={handleSave}>
                Save Calibration & Scan
            </button>
        </div>
    );
};

export default CalibrationPanel;
