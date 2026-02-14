# API Documentation - Bhasha Bridge AI

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

Currently no authentication required for development. In production, use API keys:

```http
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### 1. Health Check

Check if the server is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-14T05:53:00.000Z"
}
```

**Status Codes**:
- `200`: Server is healthy
- `500`: Server error

**Example**:
```bash
curl http://localhost:3000/health
```

---

### 2. Agent Status

Get detailed status of all agents.

**Endpoint**: `GET /status`

**Response**:
```json
{
  "orchestrator": {
    "initialized": true,
    "executionMode": "parallel",
    "activeAgents": 3
  },
  "agents": {
    "language": {
      "id": "uuid",
      "name": "LanguageAnalyzerAgent",
      "state": "idle",
      "metrics": {
        "totalRequests": 10,
        "successfulRequests": 9,
        "failedRequests": 1,
        "averageResponseTime": 450.5
      },
      "lastError": null
    },
    "location": { ... },
    "ui": { ... }
  }
}
```

**Example**:
```bash
curl http://localhost:3000/status
```

---

### 3. Process Request

Process user input through the agent pipeline.

**Endpoint**: `POST /process`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "text": "मुझे डॉक्टर चाहिए",
  "audio": null,
  "image": null,
  "location": {
    "lat": 19.0760,
    "lng": 72.8777,
    "placeName": "Mumbai, India"
  },
  "userProfile": {
    "elderly": false,
    "lowLiteracy": true,
    "visuallyImpaired": false,
    "preferredLanguage": "Hindi",
    "theme": "light"
  }
}
```

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| text | string | Yes* | Text input from user |
| audio | string | Yes* | Base64 encoded audio data |
| image | string | Yes* | Base64 encoded image data |
| location | object | No | User's location |
| location.lat | number | No | Latitude |
| location.lng | number | No | Longitude |
| location.placeName | string | No | Place name |
| userProfile | object | No | User preferences |
| userProfile.elderly | boolean | No | Is user elderly |
| userProfile.lowLiteracy | boolean | No | Is user low literacy |
| userProfile.visuallyImpaired | boolean | No | Is user visually impaired |
| userProfile.preferredLanguage | string | No | Preferred language |
| userProfile.theme | string | No | UI theme (light/dark) |

*At least one of text, audio, or image is required.

**Response**:
```json
{
  "success": true,
  "requestId": "req_1707890000123_abc123",
  "language": {
    "primary_language": "Hindi",
    "detected_languages": ["Hindi"],
    "code_switching": false,
    "dialect": "Standard",
    "formality": "casual",
    "intent": "healthcare_request",
    "sentiment": "neutral",
    "key_entities": ["doctor"],
    "confidence": 0.95
  },
  "location": {
    "location": {
      "formattedAddress": "Mumbai, Maharashtra, India",
      "components": [...],
      "placeId": "ChIJwe1EZjDG5zsRaYxkjY_tpF0",
      "coordinates": {
        "lat": 19.0760,
        "lng": 72.8777
      }
    },
    "services": [
      {
        "name": "Lilavati Hospital",
        "address": "A-791, Bandra Reclamation",
        "rating": 4.5,
        "openNow": true,
        "placeId": "ChIJ...",
        "location": {
          "lat": 19.0544,
          "lng": 72.8260
        }
      }
    ],
    "context": {
      "festivals": [],
      "customs": [],
      "transportation": [],
      "weather": null,
      "regulations": []
    },
    "government": {
      "schemes": [],
      "applications": [],
      "contacts": []
    }
  },
  "ui": {
    "specification": {
      "layout": "list",
      "components": ["header", "searchBar", "serviceList", "footer"],
      "interactions": ["tap", "scroll", "search"],
      "data_display": "cards",
      "call_to_actions": {
        "primary": "Select Service",
        "secondary": "View Details"
      },
      "voice_support": true,
      "accessibility": {
        "screenReader": true,
        "largeText": true
      }
    },
    "component": "import React from 'react'...",
    "styling": {
      "fontSize": "large",
      "colorScheme": "light",
      "spacing": "comfortable",
      "theme": {
        "primary": "#4285F4",
        "secondary": "#34A853",
        "accent": "#FBBC04",
        "error": "#EA4335",
        "background": "#ffffff",
        "text": "#000000"
      },
      "responsive": {
        "mobile": "320px",
        "tablet": "768px",
        "desktop": "1024px"
      }
    },
    "accessibility": {
      "screenReaderSupport": true,
      "keyboardNavigation": true,
      "highContrast": false,
      "largeText": true,
      "voiceControl": true
    }
  },
  "generatedAt": "2026-02-14T05:53:00.000Z",
  "processingTime": 1234
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request (invalid input)
- `500`: Server error

**Error Response**:
```json
{
  "error": "Processing failed",
  "message": "Detailed error message"
}
```

**Examples**:

Windows PowerShell:
```powershell
curl -X POST http://localhost:3000/process `
  -H "Content-Type: application/json" `
  -d '{\"text\": \"मुझे डॉक्टर चाहिए\", \"location\": {\"lat\": 19.0760, \"lng\": 72.8777}}'
```

Linux/Mac:
```bash
curl -X POST http://localhost:3000/process \
  -H "Content-Type: application/json" \
  -d '{"text": "मुझे डॉक्टर चाहिए", "location": {"lat": 19.0760, "lng": 72.8777}}'
```

JavaScript:
```javascript
const response = await fetch('http://localhost:3000/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'मुझे डॉक्टर चाहिए',
    location: { lat: 19.0760, lng: 72.8777 }
  })
});

const result = await response.json();
console.log(result);
```

Python:
```python
import requests

response = requests.post('http://localhost:3000/process', json={
    'text': 'मुझे डॉक्टर चाहिए',
    'location': {'lat': 19.0760, 'lng': 72.8777}
})

result = response.json()
print(result)
```

---

## Rate Limiting

- Per user: 100 requests/hour
- Per IP: 1000 requests/hour
- Global: 10,000 requests/hour

**Response Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707893600
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request format or missing required fields |
| 401 | Unauthorized | Invalid or missing API key (production) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Server is temporarily unavailable |

---

## WebSocket API (Future)

Real-time agent communication (coming soon):

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Agent update:', data);
};

ws.send(JSON.stringify({
  action: 'process',
  data: { text: 'मुझे डॉक्टर चाहिए' }
}));
```

---

## SDK Support

### JavaScript/TypeScript SDK (Coming Soon)

```javascript
import { BhashaBridge } from 'bhasha-bridge-sdk';

const client = new BhashaBridge({
  apiKey: 'your-api-key',
  baseURL: 'http://localhost:3000'
});

const result = await client.process({
  text: 'मुझे डॉक्टर चाहिए',
  location: { lat: 19.0760, lng: 72.8777 }
});
```

### Python SDK (Coming Soon)

```python
from bhasha_bridge import BhashaBridge

client = BhashaBridge(api_key='your-api-key')

result = client.process(
    text='मुझे डॉक्टर चाहिए',
    location={'lat': 19.0760, 'lng': 72.8777}
)
```

---

## Webhooks (Future)

Configure webhooks to receive notifications:

```json
POST /webhooks/configure
{
  "url": "https://your-domain.com/webhook",
  "events": ["processing.complete", "agent.error"]
}
```

---

## Best Practices

1. **Always include location** for better context
2. **Set user profile** for optimized UI generation
3. **Handle errors gracefully** with try-catch
4. **Cache results** when appropriate
5. **Use rate limiting headers** to avoid limits
6. **Validate input** before sending to API

---

## Support

For API issues:
- Open GitHub issue
- Check [QUICKSTART.md](../QUICKSTART.md)
- Read [ARCHITECTURE.md](ARCHITECTURE.md)

---

**API Version**: v1.0.0  
**Last Updated**: February 14, 2026
