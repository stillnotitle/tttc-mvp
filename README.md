# Talk to the City MVP - 自治体職員向けコメント分析ツール

## 概要

Talk to the City (TttC) MVPは、自治体職員が市民からのコメントやフィードバックを簡単に分析・可視化できるウェブアプリケーションです。

元の[Talk to the City](https://github.com/ntv-experiment-public/shugiinsenyo2024-tttc)プロジェクトの強力なビジュアライゼーション機能を保持しながら、より使いやすいインターフェースを提供します。

## 主な機能

- 📊 **簡単なデータアップロード**: CSVファイルをドラッグ&ドロップでアップロード
- 🤖 **AI分析**: コメントから主要な議論を自動抽出
- 🗂️ **自動クラスタリング**: 類似した意見を自動的にグループ化
- 📈 **インタラクティブな可視化**: 議論の分布を視覚的に探索
- 🌐 **多言語対応**: 日本語を含む複数言語に対応
- 👥 **共有機能**: レポートを簡単に共有

## 技術スタック

- **フロントエンド**: Next.js, React, TypeScript, Tailwind CSS
- **バックエンド**: FastAPI (Python)
- **AI処理**: OpenAI API
- **可視化**: D3.js, React

## セットアップ

### 前提条件

- Node.js 18以上
- Python 3.10以上
- OpenAI APIキー

### インストール手順

1. リポジトリをクローン
```bash
git clone https://github.com/stillnotitle/tttc-mvp.git
cd tttc-mvp
```

2. 環境変数を設定
```bash
cp .env.example .env
# .envファイルを編集してOpenAI APIキーを追加
```

3. Dockerで起動
```bash
docker-compose up
```

アプリケーションは http://localhost:3000 でアクセスできます。

## 使い方

1. ブラウザで http://localhost:3000 にアクセス
2. 「新しいプロジェクト」をクリック
3. CSVファイルをアップロード（必須列: `comment-id`, `comment-body`）
4. 分析設定を入力（質問、プロジェクト名など）
5. 「分析開始」をクリック
6. 生成されたレポートを確認・共有

## CSVファイルの形式

必須列：
- `comment-id`: コメントの一意識別子
- `comment-body`: コメント本文

オプション列：
- `agree`: 賛成票数
- `disagree`: 反対票数
- `timestamp`: タイムスタンプ
- その他のメタデータ

## 開発

### ローカル開発環境

```bash
# フロントエンド
cd frontend
npm install
npm run dev

# バックエンド
cd backend
python -m venv venv
source venv/bin/activate  # Windowsの場合: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## ライセンス

GNU Affero General Public License v3.0

## クレジット

このプロジェクトは[AI Objectives Institute](http://aiobjectives.org)による[Talk to the City](https://github.com/AIObjectives/talk-to-the-city-reports)プロジェクトをベースにしています。
