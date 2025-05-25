import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import silhouette_score
import umap
import logging

logger = logging.getLogger(__name__)

class ArgumentClusterer:
    """議論をクラスタリングするクラス"""
    
    def __init__(self):
        # 日本語テキスト用に設定を調整
        self.vectorizer = TfidfVectorizer(
            max_features=1500,  # 特徴量を増やす
            ngram_range=(1, 3),  # 3-gramまで考慮
            min_df=1,  # 最小出現文書数を1に変更
            max_df=0.95,  # 最大出現文書割合を95%に設定
            token_pattern=r'(?u)\b\w+\b',  # Unicode対応
            sublinear_tf=True  # TF-IDFの対数スケーリング
        )
    
    def find_optimal_clusters(self, embeddings: np.ndarray, min_clusters: int = 4, max_clusters: int = 12) -> int:
        """シルエットスコアを使って最適なクラスター数を探す"""
        if len(embeddings) < max_clusters:
            return min(min_clusters, len(embeddings) // 2)
        
        scores = []
        K = range(min_clusters, min(max_clusters + 1, len(embeddings)))
        
        for k in K:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = kmeans.fit_predict(embeddings)
            score = silhouette_score(embeddings, labels)
            scores.append(score)
            logger.info(f"Clusters: {k}, Silhouette Score: {score:.3f}")
        
        # 最高スコアのクラスター数を選択
        optimal_k = K[np.argmax(scores)]
        logger.info(f"Optimal number of clusters: {optimal_k}")
        return optimal_k
    
    async def cluster_arguments(
        self,
        arguments: List[Dict[str, Any]],
        num_clusters: int = 8
    ) -> Tuple[Dict[int, List[Dict[str, Any]]], np.ndarray]:
        """議論をクラスタリング"""
        logger.info(f"Clustering {len(arguments)} arguments into {num_clusters} clusters")
        
        # テキストデータを抽出
        texts = [arg['argument'] for arg in arguments]
        
        # 十分なデータがない場合の処理
        if len(texts) < num_clusters:
            num_clusters = max(2, len(texts) // 2)
            logger.warning(f"Adjusting number of clusters to {num_clusters} due to limited data")
        
        try:
            # TF-IDFベクトル化
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            
            # ベクトルが空の場合の処理
            if tfidf_matrix.shape[1] == 0:
                logger.error("No features extracted from texts")
                # フォールバック: 単純なランダムベクトルを使用
                embeddings = np.random.rand(len(texts), 50)
            else:
                # 次元削減（UMAP）
                n_neighbors = min(15, len(texts) - 1)
                reducer = umap.UMAP(
                    n_neighbors=n_neighbors,
                    n_components=min(50, tfidf_matrix.shape[1]),
                    min_dist=0.1,
                    metric='cosine',
                    random_state=42
                )
                
                embeddings = reducer.fit_transform(tfidf_matrix.toarray())
        
        except Exception as e:
            logger.error(f"Error in vectorization: {e}")
            # フォールバック: ランダムベクトルを使用
            embeddings = np.random.rand(len(texts), 50)
        
        # 2D投影用の座標を先に生成
        try:
            reducer_2d = umap.UMAP(
                n_neighbors=min(15, len(texts) - 1),
                n_components=2,
                min_dist=0.1,
                metric='cosine',
                random_state=42
            )
            
            coords_2d = reducer_2d.fit_transform(embeddings)
        except Exception as e:
            logger.error(f"Error in 2D projection: {e}")
            # フォールバック: ランダム座標を使用
            coords_2d = np.random.rand(len(texts), 2) * 10 - 5
        
        # K-meansクラスタリング
        kmeans = KMeans(
            n_clusters=num_clusters,
            random_state=42,
            n_init=20,  # 初期化回数を増やす
            max_iter=500  # 最大反復回数を増やす
        )
        
        cluster_labels = kmeans.fit_predict(embeddings)
        
        # クラスタごとに議論を整理（座標も含める）
        clusters = {}
        for i, label in enumerate(cluster_labels):
            if label not in clusters:
                clusters[label] = []
            
            arg = arguments[i].copy()
            arg['cluster_id'] = int(label)
            arg['x'] = float(coords_2d[i, 0])
            arg['y'] = float(coords_2d[i, 1])
            clusters[label].append(arg)
        
        logger.info(f"Created {len(clusters)} clusters")
        
        return clusters, embeddings
