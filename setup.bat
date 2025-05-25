@echo off
REM Talk to the City MVP セットアップスクリプト (Windows)

echo Talk to the City MVP のセットアップを開始します...

REM 環境変数ファイルのコピー
if not exist .env (
    echo 環境変数ファイルを作成しています...
    copy .env.example .env
    echo ⚠️  .envファイルにOpenAI APIキーを設定してください
)

if not exist backend\.env (
    copy backend\.env.example backend\.env
)

REM ディレクトリの作成
echo 必要なディレクトリを作成しています...
if not exist data\uploads mkdir data\uploads
if not exist data\outputs mkdir data\outputs
if not exist logs mkdir logs

REM Dockerイメージのビルド
echo Dockerイメージをビルドしています...
docker-compose build

echo.
echo ✅ セットアップが完了しました！
echo.
echo 次のステップ:
echo 1. .envファイルを編集してOpenAI APIキーを設定してください
echo    notepad .env
echo.
echo 2. アプリケーションを起動してください
echo    docker-compose up
echo.
echo 3. ブラウザで http://localhost にアクセスしてください
echo.
pause
