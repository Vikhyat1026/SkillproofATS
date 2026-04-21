import os
import math
import numpy as np
import onnxruntime as ort
from tokenizers import Tokenizer
from huggingface_hub import hf_hub_download

class ONNXEmbedder:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ONNXEmbedder, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self, model_repo="Xenova/all-MiniLM-L6-v2"):
        if self._initialized:
            return
        
        print(f"[INFO] Initializing shared ONNX engine ({model_repo})...")
        cache_dir = os.path.join(os.path.expanduser("~"), ".cache", "skillproof_models")
        os.makedirs(cache_dir, exist_ok=True)
        
        try:
            model_path = hf_hub_download(repo_id=model_repo, filename="onnx/model_quantized.onnx", cache_dir=cache_dir)
            tokenizer_path = hf_hub_download(repo_id=model_repo, filename="tokenizer.json", cache_dir=cache_dir)
            
            self.session = ort.InferenceSession(model_path)
            self.tokenizer = Tokenizer.from_file(tokenizer_path)
            self.tokenizer.enable_truncation(max_length=512)
            self._initialized = True
            print("[OK] Shared ONNX Engine ready.")
        except Exception as e:
            print(f"[ERROR] Failed to load ONNX engine: {e}")
            raise e

    def encode(self, text: str):
        encoded = self.tokenizer.encode(text)
        input_ids = np.array([encoded.ids], dtype=np.int64)
        attention_mask = np.array([encoded.attention_mask], dtype=np.int64)
        token_type_ids = np.array([encoded.type_ids], dtype=np.int64)

        inputs = {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
            "token_type_ids": token_type_ids
        }
        outputs = self.session.run(None, inputs)
        
        token_embeddings = outputs[0]
        input_mask_expanded = np.expand_dims(attention_mask, -1).astype(float)
        sum_embeddings = np.sum(token_embeddings * input_mask_expanded, 1)
        sum_mask = np.clip(np.sum(input_mask_expanded, 1), a_min=1e-9, a_max=None)
        
        embedding = sum_embeddings / sum_mask
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
            
        return embedding[0]

def cosine_similarity(v1, v2):
    if v1 is None or v2 is None: return 0.0
    return float(np.dot(v1, v2))

# Singleton instance for the whole app
embedder = ONNXEmbedder()
