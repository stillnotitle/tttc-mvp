import os
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from sklearn.manifold import TSNE
import umap
import logging

from pipeline.extraction import ArgumentExtractor
from pipeline.clustering import ArgumentClusterer
from pipeline.labeling import ClusterLabeler
from pipeline.visualization import VisualizationGenerator
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NumpyEncoder(json.JSONEncoder):
    """NumPy型をJSON対応の型に変換するカスタムエンコーダー"""
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)

def convert_numpy_types(obj):
    """ネストされたデータ構造内のNumPy型をPython標準型に変換"""
    if isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(v) for v in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    else:
        return obj

class PipelineRunner:
    """パイプライン実行クラス"""
    
    def __init__(self):
        self.extractor = ArgumentExtractor()
        self.clusterer = ArgumentClusterer()
        self.labeler = ClusterLabeler()
        self.visualizer = VisualizationGenerator()
    
    async def run_analysis(
        self,
        project_id: str,
        csv_path: str,
        config: Dict[str, Any],
        projects_db: Dict[str, Any]
    ):
        """分析を実行"""
        try:
            logger.info(f"Starting analysis for project {project_id}")
            output_dir = os.path.join(settings.OUTPUT_DIR, project_id)
            os.makedirs(output_dir, exist_ok=True)
            
            # 進捗を更新する関数
            def update_progress(step: str, progress: int):
                projects_db[project_id]["current_step"] = step
                projects_db[project_id]["progress"] = progress
            
            # 1. CSVファイルを読み込み
            update_progress("CSVファイルを読み込み中...", 10)
            df = pd.read_csv(csv_path)
            
            # 必須カラムの確認
            required_columns = ['comment-id', 'comment-body']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValueError(f"必須カラムが不足しています: {missing_columns}")
            
            # コメント数の制限
            if len(df) > settings.MAX_COMMENTS_PER_ANALYSIS:
                logger.warning(f"コメント数が制限を超えています。最初の{settings.MAX_COMMENTS_PER_ANALYSIS}件のみ処理します。")
                df = df.head(settings.MAX_COMMENTS_PER_ANALYSIS)
            
            # 2. 議論を抽出
            update_progress("議論を抽出中...", 30)
            extracted_args = await self.extractor.extract_arguments(
                df,
                question=projects_db[project_id]["question"],
                model=config.get("model", settings.OPENAI_MODEL),
                limit=config.get("extraction_limit", 1000),
                workers=config.get("extraction_workers", settings.EXTRACTION_WORKERS)
            )
            
            # 抽出結果を保存
            args_df = pd.DataFrame(extracted_args)
            # NumPy型を標準のPython型に変換
            args_df = args_df.astype(object).where(pd.notnull(args_df), None)
            args_df.to_csv(os.path.join(output_dir, "args.csv"), index=False)
            
            # 3. クラスタリング
            update_progress("クラスタリング中...", 50)
            clusters, embeddings = await self.clusterer.cluster_arguments(
                extracted_args,
                num_clusters=config.get("num_clusters", settings.DEFAULT_CLUSTERS)
            )
            
            # 4. ラベル生成
            update_progress("ラベルを生成中...", 70)
            labeled_clusters = await self.labeler.generate_labels(
                clusters,
                model=config.get("model", settings.OPENAI_MODEL),
                sample_size=config.get("label_sample_size", settings.LABEL_SAMPLE_SIZE)
            )
            
            # 5. 可視化データの生成
            update_progress("可視化データを生成中...", 85)
            visualization_data = await self.visualizer.generate_visualization(
                labeled_clusters,
                embeddings,
                args_df
            )
            
            # 6. 結果を保存
            update_progress("結果を保存中...", 95)
            result = {
                "project_id": project_id,
                "project_name": projects_db[project_id]["name"],
                "question": projects_db[project_id]["question"],
                "total_comments": len(df),
                "total_arguments": len(extracted_args),
                "clusters": visualization_data["clusters"],
                "takeaways": visualization_data.get("takeaways", []),
                "metadata": {
                    "created_at": datetime.now().isoformat(),
                    "config": config,
                    "version": "0.1.0"
                }
            }
            
            # NumPy型を標準のPython型に変換
            result = convert_numpy_types(result)
            
            # 結果をJSONファイルとして保存
            result_path = os.path.join(output_dir, "result.json")
            with open(result_path, "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2, cls=NumpyEncoder)
            
            # ステータスを更新
            projects_db[project_id]["status"] = "completed"
            projects_db[project_id]["analysis_status"] = "completed"
            projects_db[project_id]["progress"] = 100
            projects_db[project_id]["current_step"] = "完了"
            
            logger.info(f"Analysis completed for project {project_id}")
            
        except Exception as e:
            logger.error(f"Error in analysis for project {project_id}: {str(e)}")
            projects_db[project_id]["status"] = "error"
            projects_db[project_id]["analysis_status"] = "failed"
            projects_db[project_id]["error_message"] = str(e)
            raise
