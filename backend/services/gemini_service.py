"""
Gemini AI service for language and vision tasks
"""
import logging
from typing import Dict, List, Optional, Any

from backend.config.settings import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Google Gemini AI service wrapper
    Handles text generation, vision analysis, and language tasks
    """
    
    def __init__(self):
        self.model_name = settings.MODEL_NAME
        self.vision_model = settings.VISION_MODEL
        self.context_window = settings.CONTEXT_WINDOW
        
        # In production, initialize Gemini client
        # import google.generativeai as genai
        # genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        # self.model = genai.GenerativeModel(self.model_name)
        
        logger.info(f"Gemini service initialized (model: {self.model_name})")
    
    async def generate_text(
        self, 
        prompt: str, 
        context: Optional[str] = None,
        language: Optional[str] = None
    ) -> str:
        """
        Generate text using Gemini
        
        Args:
            prompt: Input prompt
            context: Optional context for better responses
            language: Optional target language
        
        Returns:
            Generated text
        """
        if settings.DEMO_MODE:
            return self._demo_text_generation(prompt, language)
        
        # In production:
        # full_prompt = f"Context: {context}\n\n{prompt}" if context else prompt
        # response = self.model.generate_content(full_prompt)
        # return response.text
        
        return "Generated response"
    
    async def analyze_image(
        self, 
        image_url: str, 
        prompt: str
    ) -> Dict[str, Any]:
        """
        Analyze image using Gemini Vision
        
        Args:
            image_url: URL of the image
            prompt: Analysis prompt
        
        Returns:
            Analysis results
        """
        if settings.DEMO_MODE:
            return self._demo_image_analysis(image_url, prompt)
        
        # In production:
        # vision_model = genai.GenerativeModel(self.vision_model)
        # image = PIL.Image.open(requests.get(image_url, stream=True).raw)
        # response = vision_model.generate_content([prompt, image])
        # return {"analysis": response.text}
        
        return {"analysis": "Image analysis result"}
    
    async def translate_text(
        self, 
        text: str, 
        source_lang: str, 
        target_lang: str
    ) -> str:
        """
        Translate text between languages
        
        Args:
            text: Text to translate
            source_lang: Source language code
            target_lang: Target language code
        
        Returns:
            Translated text
        """
        if settings.DEMO_MODE:
            return self._demo_translation(text, source_lang, target_lang)
        
        prompt = f"""
        Translate the following text from {source_lang} to {target_lang}:
        
        {text}
        
        Return only the translation, no explanations.
        """
        
        return await self.generate_text(prompt)
    
    async def detect_language(self, text: str) -> str:
        """
        Detect language of text
        
        Args:
            text: Input text
        
        Returns:
            Language code (kannada, hindi, tamil, english)
        """
        if settings.DEMO_MODE:
            # Simple heuristic for demo
            if any(ord(char) in range(0x0C80, 0x0CFF) for char in text):
                return "kannada"
            elif any(ord(char) in range(0x0900, 0x097F) for char in text):
                return "hindi"
            elif any(ord(char) in range(0x0B80, 0x0BFF) for char in text):
                return "tamil"
            else:
                return "english"
        
        prompt = f"""
        Detect the language of this text and return only one of: kannada, hindi, tamil, english
        
        Text: {text}
        """
        
        result = await self.generate_text(prompt)
        return result.strip().lower()
    
    async def extract_structured_data(
        self, 
        text: str, 
        schema: Dict
    ) -> Dict:
        """
        Extract structured data from text according to schema
        
        Args:
            text: Input text
            schema: Expected output schema
        
        Returns:
            Extracted data matching schema
        """
        prompt = f"""
        Extract the following information from the text and return as JSON:
        
        Schema: {schema}
        
        Text: {text}
        
        Return only valid JSON, no explanations.
        """
        
        result = await self.generate_text(prompt)
        
        # Parse JSON result
        import json
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            logger.error("Failed to parse JSON from Gemini response")
            return {}
    
    def _demo_text_generation(self, prompt: str, language: Optional[str]) -> str:
        """Demo mode text generation"""
        return f"Generated response for: {prompt[:50]}..."
    
    def _demo_image_analysis(self, image_url: str, prompt: str) -> Dict:
        """Demo mode image analysis"""
        return {
            "detected_items": [
                {
                    "product_name": "Maggi 2-Minute Noodles",
                    "brand": "Maggi",
                    "variant": "Masala",
                    "size": "70g",
                    "quantity": 5
                }
            ]
        }
    
    def _demo_translation(self, text: str, source: str, target: str) -> str:
        """Demo mode translation"""
        translations = {
            ("english", "kannada"): "ನಮಸ್ಕಾರ",
            ("kannada", "english"): "Hello",
            ("english", "hindi"): "नमस्ते",
            ("hindi", "english"): "Hello"
        }
        return translations.get((source, target), text)


# Global instance
gemini_service = GeminiService()
