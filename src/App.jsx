import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import PasteArea from './components/PasteArea';
import ResultsPanel from './components/ResultsPanel';

function App() {
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageProcessed = async (img) => {
    setIsProcessing(true);
    setOutput('');

    try {
      const result = await Tesseract.recognize(
        img,
        'eng',
        { logger: m => console.log(m) }
      );
      setOutput(result.data.text);
    } catch (error) {
      setOutput('Error processing image: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>AZX Service Solver</h1>
        <p>Paste your number grid image (Ctrl+V)</p>
      </header>

      <main>
        <PasteArea onImageProcessed={handleImageProcessed} />
        <ResultsPanel output={output} isProcessing={isProcessing} />
      </main>
    </div>
  );
}

export default App;
