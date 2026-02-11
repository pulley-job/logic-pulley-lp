/**
 * ExportService - エクスポート機能
 */
const ExportService = {

    /**
     * 問題をエクスポート
     * @param {Array} questionIds - エクスポート対象の問題ID
     * @param {string} format - 出力形式（googledoc/pdf/word）
     * @param {string} type - 出力タイプ（questions/answers/full）
     */
    export: function (questionIds, format, type) {
        // 問題を取得
        const questions = SearchEngine.getByIds(questionIds);
        if (questions.length === 0) {
            throw new Error('エクスポート対象の問題がありません');
        }

        // Googleドキュメントを作成
        const doc = this.createDocument(questions, type);

        // フォーマットに応じて処理
        switch (format) {
            case 'googledoc':
                return {
                    type: 'googledoc',
                    url: doc.getUrl(),
                    name: doc.getName()
                };

            case 'pdf':
                const pdfBlob = this.convertToPdf(doc);
                const pdfFile = DriveApp.createFile(pdfBlob);
                return {
                    type: 'pdf',
                    url: pdfFile.getUrl(),
                    name: pdfFile.getName()
                };

            case 'word':
                const wordUrl = this.getWordDownloadUrl(doc);
                return {
                    type: 'word',
                    url: wordUrl,
                    name: doc.getName() + '.docx'
                };

            default:
                throw new Error('不正な出力形式です');
        }
    },

    /**
     * Googleドキュメントを作成
     */
    createDocument: function (questions, type) {
        const timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd_HHmmss');
        const typeName = {
            'questions': '問題集',
            'answers': '解答集',
            'full': '問題・解答集'
        }[type] || '問題集';

        const docName = `国試問題_${typeName}_${timestamp}`;
        const doc = DocumentApp.create(docName);
        const body = doc.getBody();

        // タイトル
        body.appendParagraph(`理学療法士国家試験 ${typeName}`)
            .setHeading(DocumentApp.ParagraphHeading.HEADING1)
            .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

        body.appendParagraph(`作成日: ${Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年M月d日')}`)
            .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

        body.appendParagraph('').appendHorizontalRule();

        // 問題を追加
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];

            if (type === 'questions' || type === 'full') {
                this.addQuestion(body, q, i + 1);
            }

            if (type === 'answers' || type === 'full') {
                this.addAnswer(body, q, i + 1, type === 'full');
            }

            // 区切り線（最後以外）
            if (i < questions.length - 1) {
                body.appendParagraph('').appendHorizontalRule();
            }
        }

        doc.saveAndClose();
        return doc;
    },

    /**
     * 問題を追加
     */
    addQuestion: function (body, question, number) {
        // 問題ヘッダー
        const header = `問${number}（${question.examNumber} ${question.session} 問${question.questionNumber}）`;
        body.appendParagraph(header)
            .setHeading(DocumentApp.ParagraphHeading.HEADING2);

        // カテゴリ情報
        const categories = [question.majorCategory, question.middleCategory, question.minorCategory]
            .filter(Boolean).join(' > ');
        if (categories) {
            body.appendParagraph(`【${categories}】`)
                .setItalic(true);
        }

        // 問題文
        body.appendParagraph(question.questionText);

        // 画像（あれば）
        if (question.imageUrl) {
            try {
                const imageBlob = this.fetchImage(question.imageUrl);
                if (imageBlob) {
                    body.appendImage(imageBlob).setWidth(400);
                }
            } catch (e) {
                body.appendParagraph('[画像読み込みエラー]').setItalic(true);
            }
        }

        // 選択肢
        body.appendParagraph('');
        const choices = [
            question.choice1,
            question.choice2,
            question.choice3,
            question.choice4,
            question.choice5
        ].filter(Boolean);

        for (let i = 0; i < choices.length; i++) {
            body.appendParagraph(`${i + 1}. ${choices[i]}`);
        }
    },

    /**
     * 解答を追加
     */
    addAnswer: function (body, question, number, isFullMode) {
        if (isFullMode) {
            body.appendParagraph('');
        }

        // 解答ヘッダー
        const answerText = isFullMode ?
            `【解答】 ${question.correctAnswer}` :
            `問${number}（${question.examNumber} ${question.session} 問${question.questionNumber}）: ${question.correctAnswer}`;

        const answerPara = body.appendParagraph(answerText);
        answerPara.setBold(true);

        // 解説（あれば）
        if (question.explanation) {
            body.appendParagraph('【解説】');
            body.appendParagraph(question.explanation);
        }
    },

    /**
     * 画像を取得
     */
    fetchImage: function (url) {
        try {
            // Google Driveの共有リンクの場合
            if (url.includes('drive.google.com')) {
                const fileId = this.extractDriveFileId(url);
                if (fileId) {
                    const file = DriveApp.getFileById(fileId);
                    return file.getBlob();
                }
            }

            // 通常のURLの場合
            const response = UrlFetchApp.fetch(url);
            return response.getBlob();
        } catch (e) {
            console.error('画像取得エラー:', e);
            return null;
        }
    },

    /**
     * Google DriveファイルIDを抽出
     */
    extractDriveFileId: function (url) {
        const patterns = [
            /\/file\/d\/([^\/]+)/,
            /id=([^&]+)/,
            /\/d\/([^\/]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    },

    /**
     * PDFに変換
     */
    convertToPdf: function (doc) {
        const docId = doc.getId();
        const pdfBlob = DriveApp.getFileById(docId).getAs('application/pdf');
        pdfBlob.setName(doc.getName() + '.pdf');
        return pdfBlob;
    },

    /**
     * Word形式のダウンロードURLを取得
     */
    getWordDownloadUrl: function (doc) {
        const docId = doc.getId();
        return `https://docs.google.com/document/d/${docId}/export?format=docx`;
    }
};
