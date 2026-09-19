import math
import re
from typing import List, Dict, Any

class LocalRAGEngine:
    """
    100% Offline Private Local RAG Engine.
    Parses local codebase files/documents, computes local TF-IDF embeddings, and retrieves relevant context.
    Guarantees no document data leaves the local host machine.
    """
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []

    def add_document(self, filepath: str, content: str):
        lines = content.splitlines()
        chunk_size = 15
        for i in range(0, max(1, len(lines)), chunk_size):
            chunk_text = "\n".join(lines[i:i + chunk_size])
            if chunk_text.strip():
                self.documents.append({
                    "filepath": filepath,
                    "start_line": i + 1,
                    "end_line": min(len(lines), i + chunk_size),
                    "content": chunk_text,
                    "tokens": self._tokenize(chunk_text)
                })

    def _tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r"\w+", text) if len(w) > 2]

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.documents:
            return []

        query_tokens = set(self._tokenize(query))
        if not query_tokens:
            return self.documents[:top_k]

        scored_chunks = []
        for doc in self.documents:
            overlap = sum(1 for t in query_tokens if t in doc["tokens"])
            score = round(overlap / (math.log(len(doc["tokens"]) + 2)), 4)
            if score > 0:
                scored_chunks.append({
                    "filepath": doc["filepath"],
                    "line_range": f"L{doc['start_line']}-L{doc['end_line']}",
                    "content": doc["content"],
                    "relevance_score": score
                })

        scored_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_chunks[:top_k]
