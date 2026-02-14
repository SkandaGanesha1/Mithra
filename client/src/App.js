import React, { useState, useRef, useEffect } from 'react';
import CameraCapture from './components/CameraCapture';
import AudioRecorder from './components/AudioRecorder';
import DynamicUI from './components/DynamicUI';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [videoBase64, setVideoBase64] = useState(null);
  const [audioBase64, setAudioBase64] = useState(null);
  const [location, setLocation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          // Default location (Mumbai, India)
          setLocation({
            latitude: 19.0760,
            longitude: 72.8777,
          });
        }
      );
    } else {
      // Default location
      setLocation({
        latitude: 19.0760,
        longitude: 72.8777,
      });
    }
  }, []);

  const handleVideoCapture = (base64Data) => {
    setVideoBase64(base64Data);
    console.log('Video captured');
  };

  const handleAudioCapture = (base64Data) => {
    setAudioBase64(base64Data);
    console.log('Audio captured');
  };

  const handleSubmit = async () => {
    if (!audioBase64) {
      setError('Please record audio first');
      return;
    }

    if (!location) {
      setError('Location not available');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/master-bridge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoBase64: videoBase64,
          imageMimeType: 'video/mp4',
          audioBase64: audioBase64,
          audioMimeType: 'audio/webm',
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setVideoBase64(null);
    setAudioBase64(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🌉 Bhasha Bridge AI</h1>
        <p>भाषा ब्रिज - Your Multilingual Assistant</p>
      </header>

      <main className="App-main">
        {!result ? (
          <>
            <div className="capture-section">
              <h2>📹 Step 1: Capture Video (5 seconds)</h2>
              <CameraCapture onCapture={handleVideoCapture} />
              {videoBase64 && (
                <div className="status-message success">
                  ✅ Video captured successfully
                </div>
              )}
            </div>

            <div className="capture-section">
              <h2>🎤 Step 2: Record Your Question</h2>
              <AudioRecorder onCapture={handleAudioCapture} />
              {audioBase64 && (
                <div className="status-message success">
                  ✅ Audio recorded successfully
                </div>
              )}
            </div>

            <div className="location-section">
              {location ? (
                <div className="status-message info">
                  📍 Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </div>
              ) : (
                <div className="status-message warning">
                  📍 Getting location...
                </div>
              )}
            </div>

            <div className="submit-section">
              <button
                onClick={handleSubmit}
                disabled={!audioBase64 || !location || isProcessing}
                className="submit-button"
              >
                {isProcessing ? '⚙️ Processing...' : '🚀 Generate Answer'}
              </button>
            </div>

            {error && (
              <div className="error-message">
                ❌ Error: {error}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="result-section">
              <div className="result-header">
                <h2>✨ Your Personalized Solution</h2>
                <button onClick={handleReset} className="reset-button">
                  🔄 Start Over
                </button>
              </div>

              <div className="processing-info">
                <p>⏱️ Processed in {result.processing_time_ms}ms</p>
                <p>🗣️ Language: {result.voice_analysis?.language}</p>
                <p>😊 Sentiment: {result.voice_analysis?.sentiment}</p>
                <p>🎯 Intent: {result.voice_analysis?.intent}</p>
              </div>

              <DynamicUI result={result} />
            </div>
          </>
        )}
      </main>

      <footer className="App-footer">
        <p>Powered by Google Gemini 1.5 Pro & Flash | Built with ❤️ for India</p>
      </footer>
    </div>
  );
}

export default App;
