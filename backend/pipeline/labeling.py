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
                    {"role": "system", "content": "あなたは議論のグループにわかりやすいラベルと要約を付ける専門家です。必ずJSON形式で回答してください。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=300
            )
            
            # レスポンスを解析
            content = response.choices[0].message.content
            label_data = self._parse_label_response(content)
            
            # クラスターの中心座標を計算（argumentsに座標が含まれている場合）
            x_coords = [arg.get('x', 0) for arg in arguments if 'x' in arg]
            y_coords = [arg.get('y', 0) for arg in arguments if 'y' in arg]
            
            if x_coords and y_coords:
                center_x = sum(x_coords) / len(x_coords)
                center_y = sum(y_coords) / len(y_coords)
            else:
                # 座標がない場合はランダムに配置
                center_x = random.uniform(-5, 5)
                center_y = random.uniform(-5, 5)
            
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
            # エラー時のフォールバック
            x_coords = [arg.get('x', 0) for arg in arguments if 'x' in arg]
            y_coords = [arg.get('y', 0) for arg in arguments if 'y' in arg]
            
            if x_coords and y_coords:
                center_x = sum(x_coords) / len(x_coords)
                center_y = sum(y_coords) / len(y_coords)
            else:
                center_x = random.uniform(-5, 5)
                center_y = random.uniform(-5, 5)
            
            return {
                "cluster_id": cluster_id,
                "label": f"クラスター{cluster_id + 1}",
                "summary": "ラベル生成に失敗しました",
                "arguments": arguments,
                "size": len(arguments),
                "x": center_x,
                "y": center_y
            }
    
    def _build_label_prompt(self, arguments: List[Dict[str, Any]]) -> str:
        """ラベル生成用のプロンプトを構築"""
        arg_texts = [arg['argument'] for arg in arguments]
        args_str = "\n".join([f"- {text}" for text in arg_texts])
        
        return f"""以下の議論のグループに、他のグループと区別できる特徴的なラベルと要約を付けてください。

議論一覧:
{args_str}

以下の形式でJSONとして出力してください：

{{
  "label": "短くわかりやすいラベル（15文字以内）",
  "summary": "このグループの議論を要約した説明（50文字以内）"
}}

注意事項：
- ラベルは簡潔で覚えやすいものにしてください
- 「公園施設」のような一般的すぎるラベルは避け、具体的な特徴を含めてください
- 要約は議論の共通点や主要なテーマを表現してください
- 他のグループと明確に区別できるラベルを付けてください
- 日本語で出力してください
"""
    
    def _parse_label_response(self, content: str) -> Dict[str, str]:
        """ラベル生成の応答を解析"""
        try:
            # コードブロックやマークダウンを削除
            content = content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.startswith('```'):
                content = content[3:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()
            
            data = json.loads(content)
            return {
                'label': data.get('label', ''),
                'summary': data.get('summary', '')
            }
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse label response as JSON: {e}")
            logger.error(f"Content was: {content}")
            return {
                'label': '',
                'summary': ''
            }
