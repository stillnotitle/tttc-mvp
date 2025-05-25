import logging
from typing import List, Dict, Any
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

class VisualizationGenerator:
    """可視化データを生成するクラス"""
    
    async def generate_visualization(
        self,
        clusters: List[Dict[str, Any]],
        embeddings: np.ndarray,
        args_df: pd.DataFrame
    ) -> Dict[str, Any]:
        """可視化用のデータを生成"""
        logger.info("Generating visualization data")
        
        # クラスターデータを整形
        visualization_clusters = []
        
        for cluster in clusters:
            # 各クラスターの議論を座標でソート（視覚的な一貫性のため）
            sorted_args = sorted(
                cluster['arguments'],
                key=lambda x: (x['x'], x['y'])
            )
            
            viz_cluster = {
                "cluster_id": cluster['cluster_id'],
                "label": cluster['label'],
                "summary": cluster['summary'],
                "size": cluster['size'],
                "x": cluster['x'],
                "y": cluster['y'],
                "arguments": [
                    {
                        "argument_id": arg['argument_id'],
                        "comment_id": arg['comment_id'],
                        "argument": arg['argument'],
                        "summary": arg['summary'],
                        "x": arg['x'],
                        "y": arg['y']
                    }
                    for arg in sorted_args
                ]
            }
            
            visualization_clusters.append(viz_cluster)
        
        # 全体的な要点を生成（簡易版）
        takeaways = self._generate_takeaways(clusters)
        
        return {
            "clusters": visualization_clusters,
            "takeaways": takeaways,
            "stats": {
                "total_clusters": len(clusters),
                "total_arguments": sum(c['size'] for c in clusters),
                "avg_cluster_size": np.mean([c['size'] for c in clusters])
            }
        }
    
    def _generate_takeaways(self, clusters: List[Dict[str, Any]]) -> List[str]:
        """全体的な要点を生成（簡易版）"""
        takeaways = []
        
        # 最大のクラスターについて
        largest_cluster = max(clusters, key=lambda x: x['size'])
        takeaways.append(
            f"最も多くの意見が集まったテーマは「{largest_cluster['label']}」で、"
            f"{largest_cluster['size']}件の議論がありました。"
        )
        
        # クラスター数について
        takeaways.append(
            f"議論は大きく{len(clusters)}つのテーマに分類されました。"
        )
        
        # 議論の分布について
        sizes = [c['size'] for c in clusters]
        if np.std(sizes) > np.mean(sizes) * 0.5:
            takeaways.append(
                "意見は特定のテーマに集中する傾向が見られました。"
            )
        else:
            takeaways.append(
                "意見は各テーマに比較的均等に分布していました。"
            )
        
        return takeaways
