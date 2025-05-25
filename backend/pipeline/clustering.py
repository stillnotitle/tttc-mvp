import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
import umap
import logging

logger = logging.getLogger(__name__)

class ArgumentClusterer:
    """議論をクラスタリングするクラス"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            ngram_range=(1, 2),
            min_df=2
        )
    
    async def cluster_arguments(
        self,
        arguments: List[Dict[str, Any]],
        num_clusters: int = 8
    ) -> Tuple[Dict[int, List[Dict[str, Any]]], np.ndarray]:
        """議論をクラスタリング"""
        logger.info(f"Clustering {len(arguments)} arguments into {num_clusters} clusters")
        
        # テキストデータを抽出
        texts = [arg['argument'] for arg in arguments]
        
        # TF-IDFベクトル化
        tfidf_matrix = self.vectorizer.fit_transform(texts)
        
        # 次元削減（UMAP）
        reducer = umap.UMAP(
            n_neighbors=15,
            n_components=50,
            min_dist=0.1,
            metric='cosine',
            random_state=42
        )
        
        embeddings = reducer.fit_transform(tfidf_matrix.toarray())
        
        # K-meansクラスタリング
        kmeans = KMeans(
            n_clusters=num_clusters,
            random_state=42,
            n_init=10
        )
        
        cluster_labels = kmeans.fit_predict(embeddings)
        
        # クラスタごとに議論を整理
        clusters = {}
        for i, label in enumerate(cluster_labels):
            if label not in clusters:
                clusters[label] = []
            
            arg = arguments[i].copy()
            arg['cluster_id'] = int(label)
            clusters[label].append(arg)
        
        logger.info(f"Created {len(clusters)} clusters")
        
        # 2D投影用の座標を生成
        reducer_2d = umap.UMAP(
            n_neighbors=15,
            n_components=2,
            min_dist=0.1,
            metric='cosine',
            random_state=42
        )
        
        coords_2d = reducer_2d.fit_transform(embeddings)
        
        # 各議論に座標を追加
        for i, arg in enumerate(arguments):
            arg['x'] = float(coords_2d[i, 0])
            arg['y'] = float(coords_2d[i, 1])
        
        return clusters, embeddings
