#!/bin/bash

# Talk to the City MVP セットアップスクリプト

echo "Talk to the City MVP のセットアップを開始します..."

# 環境変数ファイルのコピー
if [ ! -f .env ]; then
    echo "環境変数ファイルを作成しています..."
    cp .env.example .env
    echo "⚠️  .envファイルにOpenAI APIキーを設定してください"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
fi

# ディレクトリの作成
echo "必要なディレクトリを作成しています..."
mkdir -p data/uploads
mkdir -p data/outputs
mkdir -p logs

# Dockerイメージのビルド
echo "Dockerイメージをビルドしています..."
docker-compose build

echo ""
echo "✅ セットアップが完了しました！"
echo ""
echo "次のステップ:"
echo "1. .envファイルを編集してOpenAI APIキーを設定してください"
echo "   $ nano .env"
echo ""
echo "2. アプリケーションを起動してください"
echo "   $ docker-compose up"
echo ""
echo "3. ブラウザで http://localhost にアクセスしてください"
echo ""
