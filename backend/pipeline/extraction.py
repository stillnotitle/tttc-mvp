import asyncio
import logging
from typing import List, Dict, Any
import pandas as pd
from openai import AsyncOpenAI
import json
from config import settings

logger = logging.getLogger(__name__)

class ArgumentExtractor:
    """コメントから議論を抽出するクラス"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def extract_arguments(
        self,
        df: pd.DataFrame,
        question: str,
        model: str = "gpt-3.5-turbo",
        limit: int = 1000,
        workers: int = 3
    ) -> List[Dict[str, Any]]:
        """コメントから議論を抽出"""
        logger.info(f"Extracting arguments from {len(df)} comments")
        
        # 処理するコメント数を制限
        if len(df) > limit:
            df = df.head(limit)
        
        # バッチ処理用にコメントを分割
        batch_size = max(1, len(df) // workers)
        batches = [df[i:i+batch_size] for i in range(0, len(df), batch_size)]
        
        # 並列処理で抽出
        tasks = []
        for batch in batches:
            task = self._extract_batch(batch, question, model)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        
        # 結果を統合
        all_arguments = []
        for batch_result in results:
            all_arguments.extend(batch_result)
        
        logger.info(f"Extracted {len(all_arguments)} arguments")
        return all_arguments
    
    async def _extract_batch(
        self,
        batch: pd.DataFrame,
        question: str,
        model: str
    ) -> List[Dict[str, Any]]:
        """バッチ単位で議論を抽出"""
        arguments = []
        
        for _, row in batch.iterrows():
            comment_id = row['comment-id']
            comment_body = row['comment-body']
            
            # コメントが空の場合はスキップ
            if pd.isna(comment_body) or str(comment_body).strip() == '':
                continue
            
            try:
                # プロンプトを構築
                prompt = self._build_prompt(question, comment_body)
                
                # OpenAI APIを呼び出し
                response = await self.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "あなたは市民のコメントから主要な議論や意見を抽出する専門家です。"},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=500
                )
                
                # レスポンスを解析
                content = response.choices[0].message.content
                extracted = self._parse_extraction(content, comment_id)
                
                if extracted:
                    arguments.extend(extracted)
                    
            except Exception as e:
                logger.error(f"Error extracting from comment {comment_id}: {e}")
                continue
        
        return arguments
    
    def _build_prompt(self, question: str, comment: str) -> str:
        """抽出用のプロンプトを構築"""
        return f"""質問: {question}

コメント: {comment}

このコメントから、主要な議論や意見を抽出してください。
以下の形式でJSONとして出力してください：

{{
  "arguments": [
    {{
      "argument": "抽出された議論や意見",
      "summary": "短い要約（20文字以内）"
    }}
  ]
}}

注意事項：
- 1つのコメントから複数の議論を抽出できます
- 具体的で明確な意見のみを抽出してください
- 要約は簡潔にしてください
"""
    
    def _parse_extraction(self, content: str, comment_id: str) -> List[Dict[str, Any]]:
        """抽出結果を解析"""
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
            
            # JSONとして解析
            data = json.loads(content)
            arguments = data.get('arguments', [])
            
            # 結果を整形
            result = []
            for i, arg in enumerate(arguments):
                result.append({
                    "argument_id": f"{comment_id}_{i}",
                    "comment_id": comment_id,
                    "argument": arg.get('argument', ''),
                    "summary": arg.get('summary', '')
                })
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON for comment {comment_id}: {e}")
            logger.error(f"Content was: {content[:200]}...")
            return []
