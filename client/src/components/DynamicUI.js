import React from 'react';

const DynamicUI = ({ result }) => {
  if (!result || !result.success) {
    return (
      <div className="error-container">
        <h3>❌ Processing Failed</h3>
        <p>Unable to generate UI. Please try again.</p>
      </div>
    );
  }

  const { visual_context, voice_analysis, location_data, generated_ui } = result;

  // Render fallback UI if generated UI is not available
  if (!generated_ui || !generated_ui.component_code) {
    return (
      <div className="fallback-ui">
        <div className="result-card">
          <h3>📊 Analysis Results</h3>
          
          {visual_context && (
            <div className="section">
              <h4>👁️ Visual Analysis</h4>
              <p><strong>Context:</strong> {visual_context.visual_context}</p>
              <p><strong>Category:</strong> {visual_context.category}</p>
              {visual_context.details && visual_context.details.medicine_name && (
                <p><strong>Medicine:</strong> {visual_context.details.medicine_name}</p>
              )}
            </div>
          )}

          {voice_analysis && (
            <div className="section">
              <h4>🗣️ Voice Analysis</h4>
              <p><strong>Transcript:</strong> {voice_analysis.transcript}</p>
              <p><strong>Language:</strong> {voice_analysis.language}</p>
              <p><strong>Sentiment:</strong> {voice_analysis.sentiment}</p>
              <p><strong>Intent:</strong> {voice_analysis.intent}</p>
            </div>
          )}

          {location_data && location_data.nearby_services && (
            <div className="section">
              <h4>📍 Nearby Services</h4>
              <div className="services-list">
                {location_data.nearby_services.slice(0, 3).map((service, idx) => (
                  <div key={idx} className="service-card">
                    <h5>{service.name}</h5>
                    <p>📍 {service.distance} • {service.address}</p>
                    {service.phone && <p>📞 {service.phone}</p>}
                    {service.rating && <p>⭐ {service.rating}/5</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Try to render the generated component
  // Note: In a real app, you'd use a safer method like sandboxed iframe
  // This is a demo showing the concept
  return (
    <div className="generated-ui-container">
      <div className="ui-preview">
        <h3>🎨 Generated UI ({generated_ui.language})</h3>
        <div className="ui-mode-badge">{generated_ui.ui_mode}</div>
        
        {/* Display the raw code for demo purposes */}
        <details className="code-preview">
          <summary>📝 View Generated Code</summary>
          <pre><code>{generated_ui.component_code}</code></pre>
        </details>

        {/* Show structured results */}
        <div className="structured-results">
          {visual_context && visual_context.category === 'medicine' && (
            <div className="medicine-card">
              <h4>💊 Medicine Information</h4>
              {visual_context.details && (
                <>
                  <p className="medicine-name">
                    {visual_context.details.medicine_name || 'Medicine identified'}
                  </p>
                  {visual_context.details.usage_instructions && (
                    <div className="dosage-info">
                      <h5>Usage Instructions:</h5>
                      <p>{visual_context.details.usage_instructions}</p>
                      
                      {/* Medicine timing icons */}
                      <div className="timing-icons">
                        <div className="time-slot">
                          <span className="icon">☀️</span>
                          <span>सुबह (Morning)</span>
                        </div>
                        <div className="time-slot">
                          <span className="icon">🌙</span>
                          <span>रात (Night)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {voice_analysis && voice_analysis.entities && voice_analysis.entities.some(e => e.type === 'person') && (
                <div className="care-alert">
                  <p>👵 Caring for: {voice_analysis.entities.find(e => e.type === 'person').value}</p>
                </div>
              )}
              
              {voice_analysis && voice_analysis.sentiment === 'urgent' && location_data && (
                <div className="emergency-actions">
                  <button className="emergency-button">
                    📞 Call Doctor
                  </button>
                  <button className="emergency-button">
                    🚑 Emergency Services
                  </button>
                </div>
              )}
            </div>
          )}

          {location_data && location_data.nearby_services && (
            <div className="services-section">
              <h4>📍 Nearby Services</h4>
              <div className="services-grid">
                {location_data.nearby_services.slice(0, 4).map((service, idx) => (
                  <div key={idx} className="service-item">
                    <div className="service-header">
                      <h5>{service.name}</h5>
                      {service.rating && (
                        <span className="rating">⭐ {service.rating}</span>
                      )}
                    </div>
                    <p className="distance">📍 {service.distance}</p>
                    <p className="address">{service.address}</p>
                    {service.phone && (
                      <a href={`tel:${service.phone}`} className="call-button">
                        📞 Call
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicUI;
