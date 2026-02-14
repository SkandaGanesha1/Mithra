import React, { useState, useRef } from 'react';

const CameraCapture = ({ onCapture }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [hasVideo, setHasVideo] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Cannot access camera. Please grant camera permissions.');
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) {
      await startCamera();
    }

    chunksRef.current = [];
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp8',
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          onCapture(base64data);
          setHasVideo(true);
        };
        
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setCountdown(5);

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
          setCountdown(5);
          
          // Stop camera stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        }
      }, 5000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setCountdown(5);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  return (
    <div className="camera-capture">
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="video-preview"
          style={{ display: isRecording ? 'block' : 'none' }}
        />
        
        {isRecording && (
          <div className="recording-overlay">
            <div className="countdown">{countdown}</div>
            <div className="recording-indicator">🔴 Recording...</div>
          </div>
        )}

        {!isRecording && !hasVideo && (
          <div className="placeholder">
            <span className="icon">📹</span>
            <p>Ready to capture video</p>
          </div>
        )}

        {!isRecording && hasVideo && (
          <div className="placeholder success">
            <span className="icon">✅</span>
            <p>Video captured!</p>
          </div>
        )}
      </div>

      <div className="controls">
        {!isRecording ? (
          <button onClick={startRecording} className="capture-button">
            📹 Record 5-Second Video
          </button>
        ) : (
          <button onClick={stopRecording} className="stop-button">
            ⏹️ Stop Recording
          </button>
        )}
      </div>

      <p className="hint">
        💡 Tip: Hold up medicine, crop, or document to the camera
      </p>
    </div>
  );
};

export default CameraCapture;
