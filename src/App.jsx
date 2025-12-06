import React, { useState, useEffect } from 'react';
import PasteArea from './components/PasteArea';
import ResultsPanel from './components/ResultsPanel';
import CalibrationPanel from './components/CalibrationPanel';
import { processImage } from './utils/imageProcessing';
import { scanGrid } from './utils/gridScanner';
import { solveGrid } from './utils/solver';

function App() {
  const [step, setStep] = useState('paste'); // paste, calibrate, result
  const [clusters, setClusters] = useState([]);
  const [blobs, setBlobs] = useState([]);
  const [imageDims, setImageDims] = useState({ w: 0, h: 0 });
  const [gridData, setGridData] = useState(null);
  const [calibrationData, setCalibrationData] = useState(null);
  const [solutions, setSolutions] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('azx_calibration');
    if (saved) {
      try {
        setCalibrationData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse calibration data", e);
      }
    }
  }, []);

  const handleImageProcessed = (img) => {
    const result = processImage(img);
    setBlobs(result.blobs);
    setClusters(result.uniqueTemplates);
    setImageDims({ w: result.width, h: result.height });
    setSolutions([]); // Clear previous solutions

    if (calibrationData) {
      // Auto-scan with saved calibration
      const grid = scanGrid(result.blobs, calibrationData, result.width, result.height);
      const solved = solveGrid(grid);
      setSolutions(solved);

      const outputText = `Found ${solved.length} subgrids summing to 10.\n\n` +
        grid.map(row => row.map(c => c.value).join(' ')).join('\n');
      setGridData(outputText);
      setStep('result');
    } else if (result.uniqueTemplates.length > 0) {
      setStep('calibrate');
    } else {
      alert('No digits found!');
    }
  };

  const handleCalibrationComplete = (data) => {
    localStorage.setItem('azx_calibration', JSON.stringify(data));
    setCalibrationData(data);

    const grid = scanGrid(blobs, data, imageDims.w, imageDims.h);
    const solved = solveGrid(grid);
    setSolutions(solved);

    const outputText = `Found ${solved.length} subgrids summing to 10.\n\n` +
      grid.map(row => row.map(c => c.value).join(' ')).join('\n');
    setGridData(outputText);
    setStep('result');
  };

  const handleRecalibrate = () => {
    if (confirm('Are you sure you want to clear saved calibration?')) {
      localStorage.removeItem('azx_calibration');
      setCalibrationData(null);
      setStep('calibrate');
    }
  };

  return (
    <div className="container">
      <header>
        <h1>AZX Service Solver</h1>
        <p>Paste your number grid image (Ctrl+V)</p>
      </header>

      <main>
        <PasteArea onImageProcessed={handleImageProcessed} solutions={solutions} />

        {step === 'calibrate' && (
          <CalibrationPanel
            clusters={clusters}
            onCalibrationComplete={handleCalibrationComplete}
          />
        )}

        {step === 'result' && (
          <ResultsPanel
            output={gridData}
            isProcessing={false}
            onRecalibrate={handleRecalibrate}
          />
        )}
      </main>
    </div>
  );
}

export default App;
