# 国家試験対策アプリ開発 - 実装計画書

## Project Overview
ユーザーが国家試験の過去問を解き、学習進捗を管理できるWebアプリケーションを構築します。
「シンプル操作」「Premium Design」「データドリブン」をコンセプトにします。

---

## Step 1: データ基盤の構築 (現在進行中)
GoogleスプレッドシートをヘッドレスCMS（マスターデータベース）として利用します。

### マスターDB構造 (Sheet: `AllQuestions`)
| カラム名 | データ型 | 説明 |
| :--- | :--- | :--- |
| `id` | String | ユニークID (例: 58-AM-01) |
| `exam_year` | Number | 第58回などの実施回 |
| `section` | String | 午前 / 午後 |
| `question_no` | Number | 問題番号 |
| `category` | String | 分野 (解剖学, 生理学, etc.) |
| `question_text` | String | 問題本文 |
| `options_json` | JSON String | 選択肢配列 (例: `["あ", "い", "う", "え", "お"]`) |
| `correct_idx` | Number | 正解の選択肢番号 (1-5) |
| `explanation` | String | 解説文 |
| `image_url` | String | 図表画像のURL (任意) |
| `display_type` | String | 表示形式 (`text_only`, `with_image`) |

---

## Step 2: Webアプリケーション開発 (Next Phase)

### Tech Stack
- **Framework**: HTML5 / JavaScript (Vanilla or simple module) for speed, or Next.js for scalability.
  - *Recommendation*: まずはシンプルに **Vanilla JS + Tailwind CSS** で、静的なHTMLとして動作させ、GitHub Pages等でホスト可能な形を目指します。
- **Styling**: Tailwind CSS (Premium Modern Look)
- **State Management**: LocalStorage (学習履歴の保存)

### UI/UX Design Strategy
1.  **Glassmorphism Card**: 問題カードはすりガラスのような質感で高級感を演出。
2.  **Instant Feedback**: 解答ボタンを押した瞬間に正誤アニメーションを表示。
3.  **Progress Ring**: 現在の正答率を円形グラフで常時表示。

---

## Step 3: 機能実装リスト
- [ ] **ランダム出題モード**: 年度や分野を指定してランダムに5問/10問出題。
- [ ] **解説表示**: 解答後に解説を展開。
- [ ] **履歴保存**: ブラウザに学習履歴を保存し、「前回間違えた問題」のみを出題するモードを実装。
- [ ] **Looker Studio連携**: 全ユーザーの解答ログ（もしサーバーがあれば）を集計し、難易度調整に役立てる。

---

## Next Action
1. 作成されたGASコード (`ExamDataCode.js`) を実行し、スプレッドシートのURLを取得する。
2. アプリケーションのUIプロトタイプを作成する。
