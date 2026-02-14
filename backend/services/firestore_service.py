"""
Firebase Firestore service for data persistence
"""
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    logging.warning("Firebase Admin SDK not installed")

from backend.config.settings import settings

logger = logging.getLogger(__name__)


class FirestoreService:
    """
    Firestore database service wrapper
    Provides CRUD operations for all collections
    """
    
    def __init__(self):
        self.db = None
        
        if FIREBASE_AVAILABLE and not settings.DEMO_MODE:
            try:
                # Initialize Firebase
                if not firebase_admin._apps:
                    cred = credentials.Certificate(settings.FIREBASE_CREDS_PATH)
                    firebase_admin.initialize_app(cred)
                
                self.db = firestore.client()
                logger.info("Firestore initialized successfully")
            except Exception as e:
                logger.warning(f"Firestore initialization failed: {e}")
        else:
            logger.info("Running in demo mode - Firestore not initialized")
    
    def create(self, collection: str, document_id: str, data: Dict) -> bool:
        """Create a document in Firestore"""
        if not self.db:
            logger.debug(f"Demo: Would create {collection}/{document_id}")
            return True
        
        try:
            self.db.collection(collection).document(document_id).set(data)
            logger.info(f"Created document: {collection}/{document_id}")
            return True
        except Exception as e:
            logger.error(f"Error creating document: {e}")
            return False
    
    def read(self, collection: str, document_id: str) -> Optional[Dict]:
        """Read a document from Firestore"""
        if not self.db:
            logger.debug(f"Demo: Would read {collection}/{document_id}")
            return None
        
        try:
            doc = self.db.collection(collection).document(document_id).get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error reading document: {e}")
            return None
    
    def update(self, collection: str, document_id: str, data: Dict) -> bool:
        """Update a document in Firestore"""
        if not self.db:
            logger.debug(f"Demo: Would update {collection}/{document_id}")
            return True
        
        try:
            self.db.collection(collection).document(document_id).update(data)
            logger.info(f"Updated document: {collection}/{document_id}")
            return True
        except Exception as e:
            logger.error(f"Error updating document: {e}")
            return False
    
    def delete(self, collection: str, document_id: str) -> bool:
        """Delete a document from Firestore"""
        if not self.db:
            logger.debug(f"Demo: Would delete {collection}/{document_id}")
            return True
        
        try:
            self.db.collection(collection).document(document_id).delete()
            logger.info(f"Deleted document: {collection}/{document_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            return False
    
    def query(self, collection: str, filters: List[tuple], limit: Optional[int] = None) -> List[Dict]:
        """
        Query documents in Firestore
        
        Args:
            collection: Collection name
            filters: List of (field, operator, value) tuples
            limit: Maximum number of results
        
        Returns:
            List of matching documents
        """
        if not self.db:
            logger.debug(f"Demo: Would query {collection} with filters {filters}")
            return []
        
        try:
            query = self.db.collection(collection)
            
            for field, operator, value in filters:
                query = query.where(field, operator, value)
            
            if limit:
                query = query.limit(limit)
            
            docs = query.stream()
            results = [doc.to_dict() for doc in docs]
            
            logger.info(f"Query returned {len(results)} results")
            return results
        except Exception as e:
            logger.error(f"Error querying collection: {e}")
            return []
    
    def batch_write(self, operations: List[Dict]) -> bool:
        """
        Perform batch write operations
        
        Args:
            operations: List of operation dicts with keys: type, collection, document_id, data
        
        Returns:
            Success status
        """
        if not self.db:
            logger.debug(f"Demo: Would perform {len(operations)} batch operations")
            return True
        
        try:
            batch = self.db.batch()
            
            for op in operations:
                doc_ref = self.db.collection(op["collection"]).document(op["document_id"])
                
                if op["type"] == "set":
                    batch.set(doc_ref, op["data"])
                elif op["type"] == "update":
                    batch.update(doc_ref, op["data"])
                elif op["type"] == "delete":
                    batch.delete(doc_ref)
            
            batch.commit()
            logger.info(f"Batch write completed: {len(operations)} operations")
            return True
        except Exception as e:
            logger.error(f"Error in batch write: {e}")
            return False


# Global instance
firestore_service = FirestoreService()
