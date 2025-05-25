import asyncio
import logging
from typing import List, Dict, Any
from openai import AsyncOpenAI
import json
import random
from config import settings

logger = logging.getLogger(__name__)

class ClusterLabeler:
    """クラスターにラベルを生成するクラス"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def generate_labels(
        self,
        clusters: Dict[int, List[Dict[str, Any]]],
        model: str = "gpt-3.5-turbo",
        sample_size: int = 20
    ) -> List[Dict[str, Any]]:
        """各クラスターにラベルと要約を生成"""
        logger.info(f"Generating labels for {len(clusters)} clusters")
        
        tasks = []
        for cluster_id, arguments in clusters.items():
            task = self._generate_cluster_label(
                cluster_id,
                arguments,
                model,
                sample_size
            )
            tasks.append(task)
        
        labeled_clusters = await asyncio.gather(*tasks)
        
        logger.info("Labels generated successfully")
        return labeled_clusters
    
    async def _generate_cluster_label(
        self,
        cluster_id: int,
        arguments: List[Dict[str, Any]],
        model: str,
        sample_size: int
    ) -> Dict[str, Any]:
        """個別のクラスターにラベルを生成"""
        
        # サンプリング
        if len(arguments) > sample_size:
            sampled_args = random.sample(arguments, sample_size)
        else:
            sampled_args = arguments
        
        # プロンプトを構築
        prompt = self._build_label_prompt(sampled_args)
        
        try:
            # OpenAI APIを呼び出し
            response = await self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "あなたは議論のグループにわかりやすいラベルと要約を付ける専門家です。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=300
            )
            
            # レスポンスを解析
            content = response.choices[0].message.content
            label_data = self._parse_label_response(content)
            
            # クラスターの中心座標を計算
            x_coords = [arg['x'] for arg in arguments]
            y_coords = [arg['y'] for arg in arguments]
            center_x = sum(x_coords) / len(x_coords)
            center_y = sum(y_coords) / len(y_coords)
            
            return {
                "cluster_id": cluster_id,
                "label": label_data.get('label', f'クラスター{cluster_id + 1}'),
                "summary": label_data.get('summary', ''),
                "arguments": arguments,
                "size": len(arguments),
                "x": center_x,
                "y": center_y
            }
            
        except Exception as e:
            logger.error(f"Error generating label for cluster {cluster_id}: {e}")
            return {
                "cluster_id": cluster_id,
                "label": f"クラスター{cluster_id + 1}",
                "summary": "ラベル生成に失敗しました",
                "arguments": arguments,
                "size": len(arguments),
                "x": 0,
                "y": 0
            }
    
    def _build_label_prompt(self, arguments: List[Dict[str, Any]]) -> str:
        """ラベル生成用のプロンプトを構築"""
        arg_texts = [arg['argument'] for arg in arguments]
        args_str = "\n".join([f"- {text}" for text in arg_texts])
        
        return f"""以下の議論のグループに、わかりやすいラベルと要約を付けてください。

議論一覧:
{args_str}

以下の形式でJSONとして出力してください：

{{
  "label": "短くわかりやすいラベル（15文字以内）",
  "summary": "このグループの議論を要約した説明（50文字以内）"
}}

注意事項：
- ラベルは簡潔で覚えやすいものにしてください
- 要約は議論の共通点や主要なテーマを表現してください
- 日本語で出力してください
"""
    
    def _parse_label_response(self, content: str) -> Dict[str, str]:
        """ラベル生成の応答を解析"""
        try:
            data = json.loads(content)
            return {
                'label': data.get('label', ''),
                'summary': data.get('summary', '')
            }
        except json.JSONDecodeError:
            logger.error("Failed to parse label response as JSON")
            return {
                'label': '',
                'summary': ''
            }
