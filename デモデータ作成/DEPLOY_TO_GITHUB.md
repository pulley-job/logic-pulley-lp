
# GitHub Pages Deployment Workflow

## 1. ビルド
まず、本番用のファイルを生成しました。
`dist` フォルダに最適化された HTML/CSS/JS ファイルが作成されています。

## 2. GitHub リポジトリの作成
以下の手順で GitHub に新しいリポジトリを作成してください。
1. [GitHub New Repository](https://github.com/new) にアクセス。
2. Repository name を入力 (例: `logic-pulley-exams`)。
3. "Public" を選択。
4. "Create repository" をクリック。

## 3. プッシュとデプロイ
ターミナルで以下のコマンドを順番に実行して、GitHub にコードをアップロードします。
(ユーザー名とリポジトリ名はご自身のものに置き換えてください)

```bash
cd web-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/logic-pulley-exams.git
git push -u origin main
```

## 4. GitHub Pages の設定
1. GitHub リポジトリページで **Settings** > **Pages** に移動。
2. **Build and deployment** の Source を `GitHub Actions` ではなく `Deploy from a branch` に設定（またはVite用のAction設定を利用）。
   - **簡単設定**: `gh-pages` ブランチを使うのが一般的です。以下のコマンドで `dist` フォルダの中身だけを `gh-pages` ブランチにプッシュして公開する方法が最も手軽です。

```bash
# gh-pages パッケージをインストール (開発用)
npm install --save-dev gh-pages

# package.json にデプロイ用スクリプトを追加
# "deploy": "gh-pages -d dist"
```

その後、`npm run deploy` を実行すれば完了です！
