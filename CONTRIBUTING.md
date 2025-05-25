# コントリビューションガイド

Talk to the City MVPプロジェクトへの貢献をありがとうございます！

## 開発環境のセットアップ

### 前提条件

- Git
- Node.js 18以上
- Python 3.10以上
- Docker & Docker Compose
- OpenAI APIキー

### セットアップ手順

1. リポジトリをフォーク
2. ローカルにクローン
```bash
git clone https://github.com/your-username/tttc-mvp.git
cd tttc-mvp
```

3. セットアップスクリプトを実行
```bash
# Linux/Mac
chmod +x setup.sh
./setup.sh

# Windows
setup.bat
```

4. 環境変数を設定
```bash
# .envファイルを編集
OPENAI_API_KEY=sk-your-api-key
```

## 開発ワークフロー

### ブランチ戦略

- `main`: 本番環境用ブランチ
- `develop`: 開発用ブランチ
- `feature/*`: 新機能開発用
- `fix/*`: バグ修正用

### コミットメッセージ

以下の形式を使用してください：

```
type(scope): subject

body

footer
```

タイプ:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット変更
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセスや補助ツールの変更

例:
```
feat(frontend): プロジェクト共有機能を追加

- 共有リンクの生成機能を実装
- 閲覧専用モードを追加
- 共有設定画面を作成

Closes #123
```

## コーディング規約

### TypeScript/JavaScript

- ESLintの設定に従う
- 関数名は動詞で始める
- コンポーネント名はPascalCase
- 変数名はcamelCase

### Python

- PEP 8に従う
- 型ヒントを使用
- docstringを記載

### CSS

- Tailwind CSSのユーティリティクラスを優先
- カスタムCSSは最小限に

## テスト

### フロントエンド

```bash
cd frontend
npm test
```

### バックエンド

```bash
cd backend
pytest
```

## プルリクエスト

1. ブランチを作成
```bash
git checkout -b feature/amazing-feature
```

2. 変更をコミット
```bash
git commit -m 'feat: add amazing feature'
```

3. ブランチをプッシュ
```bash
git push origin feature/amazing-feature
```

4. プルリクエストを作成

### PRチェックリスト

- [ ] コードがビルドできる
- [ ] テストが通る
- [ ] ドキュメントを更新した
- [ ] コミットメッセージが規約に従っている
- [ ] 関連するIssueをリンクした

## 質問・サポート

- Issueを作成
- Discussionsで質問

## ライセンス

コントリビューションはGNU AGPLv3ライセンスの下でリリースされます。
