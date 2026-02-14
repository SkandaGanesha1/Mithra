import React, { useState, useRef } from 'react';

const AudioRecorder = ({ onCapture }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          onCapture(base64data);
          setHasAudio(true);
        };
        
        reader.readAsDataURL(blob);

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Cannot access microphone. Please grant microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-recorder">
      <div className="audio-visualizer">
        {!isRecording && !hasAudio && (
          <div className="placeholder">
            <span className="icon">🎤</span>
            <p>Ready to record</p>
          </div>
        )}

        {isRecording && (
          <div className="recording-animation">
            <div className="pulse-circle"></div>
            <span className="icon recording">🎤</span>
            <p className="duration">{formatDuration(duration)}</p>
            <p className="status">Recording...</p>
          </div>
        )}

        {!isRecording && hasAudio && (
          <div className="placeholder success">
            <span className="icon">✅</span>
            <p>Audio recorded!</p>
          </div>
        )}
      </div>

      <div className="controls">
        {!isRecording ? (
          <button onClick={startRecording} className="capture-button">
            🎤 Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="stop-button">
            ⏹️ Stop Recording
          </button>
        )}
      </div>

      <p className="hint">
        💡 Example: "दादी को ये दवाई कब देनी है?" (When should I give this medicine to grandma?)
      </p>
    </div>
  );
};

export default AudioRecorder;
