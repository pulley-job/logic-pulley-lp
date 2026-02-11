/**
 * ImportService - インポート機能
 */
const ImportService = {

    /**
     * スプレッドシートから問題をインポート
     * @param {string} sourceSpreadsheetId - インポート元スプレッドシートID
     */
    importFromSpreadsheet: function (sourceSpreadsheetId) {
        const sourceSheet = SpreadsheetApp.openById(sourceSpreadsheetId).getSheets()[0];
        const data = sourceSheet.getDataRange().getValues();

        if (data.length < 2) {
            throw new Error('インポートするデータがありません');
        }

        const headers = data[0];
        const requiredColumns = ['年度', '時間帯', '問題番号', '大分類', '問題文', '選択肢1', '選択肢2', '正解番号'];

        // ヘッダー検証
        const columnMap = {};
        for (let i = 0; i < headers.length; i++) {
            columnMap[headers[i]] = i;
        }

        for (const col of requiredColumns) {
            if (columnMap[col] === undefined) {
                throw new Error(`必須カラム「${col}」が見つかりません`);
            }
        }

        // データをインポート
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (let i = 1; i < data.length; i++) {
            const row = data[i];

            try {
                const question = {
                    year: row[columnMap['年度']],
                    examNumber: row[columnMap['回数']] || `第${row[columnMap['年度']]}回`,
                    session: row[columnMap['時間帯']],
                    questionNumber: row[columnMap['問題番号']],
                    majorCategory: row[columnMap['大分類']],
                    middleCategory: row[columnMap['中分類']] || '',
                    minorCategory: row[columnMap['小分類']] || '',
                    questionText: row[columnMap['問題文']],
                    imageUrl: row[columnMap['画像URL']] || '',
                    choice1: row[columnMap['選択肢1']],
                    choice2: row[columnMap['選択肢2']],
                    choice3: row[columnMap['選択肢3']] || '',
                    choice4: row[columnMap['選択肢4']] || '',
                    choice5: row[columnMap['選択肢5']] || '',
                    correctAnswer: row[columnMap['正解番号']],
                    explanation: row[columnMap['解説テキスト']] || '',
                    isOriginal: row[columnMap['自作問題フラグ']] === true || row[columnMap['自作問題フラグ']] === 'TRUE',
                    difficulty: row[columnMap['難易度']] || ''
                };

                // バリデーション
                this.validateQuestion(question);

                // 追加
                SheetService.addQuestion(question);
                results.success++;

            } catch (error) {
                results.failed++;
                results.errors.push({
                    row: i + 1,
                    message: error.message
                });
            }
        }

        return results;
    },

    /**
     * 問題データを検証
     */
    validateQuestion: function (question) {
        if (!question.year) throw new Error('年度が必要です');
        if (!question.session) throw new Error('時間帯が必要です');
        if (!['AM', 'PM'].includes(question.session)) throw new Error('時間帯はAMまたはPMで指定してください');
        if (!question.questionNumber) throw new Error('問題番号が必要です');
        if (!question.majorCategory) throw new Error('大分類が必要です');
        if (!['実地', '専門', '基礎'].includes(question.majorCategory)) throw new Error('大分類は「実地」「専門」「基礎」のいずれかです');
        if (!question.questionText) throw new Error('問題文が必要です');
        if (!question.choice1 || !question.choice2) throw new Error('選択肢が2つ以上必要です');
        if (!question.correctAnswer) throw new Error('正解番号が必要です');
        if (question.correctAnswer < 1 || question.correctAnswer > 5) throw new Error('正解番号は1～5の範囲です');
    },

    /**
     * インポート用テンプレートを作成
     */
    createTemplate: function () {
        const templateName = '国試問題インポートテンプレート_' +
            Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd');

        const ss = SpreadsheetApp.create(templateName);
        const sheet = ss.getActiveSheet();
        sheet.setName('問題データ');

        // ヘッダー行
        const headers = [
            '年度',
            '回数',
            '時間帯',
            '問題番号',
            '大分類',
            '中分類',
            '小分類',
            '問題文',
            '画像URL',
            '選択肢1',
            '選択肢2',
            '選択肢3',
            '選択肢4',
            '選択肢5',
            '正解番号',
            '解説テキスト',
            '自作問題フラグ',
            '難易度'
        ];

        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length)
            .setBackground('#4a90d9')
            .setFontColor('#ffffff')
            .setFontWeight('bold');

        // サンプルデータ
        const sampleData = [
            60, '第60回', 'AM', 1, '基礎', '運動器', '脊髄損傷',
            '脊髄損傷について正しいのはどれか。',
            '',
            '完全麻痺では深部腱反射が亢進する。',
            '不完全麻痺では感覚が完全に消失する。',
            '高位損傷ほど自律神経過反射が起こりやすい。',
            '中心性損傷では上肢より下肢の障害が重度である。',
            '前脊髄動脈症候群では深部感覚が障害される。',
            3, '高位頸髄損傷（T6以上）では自律神経過反射が起こりやすい。',
            true, 'B'
        ];

        sheet.getRange(2, 1, 1, sampleData.length).setValues([sampleData]);
        sheet.getRange(2, 1, 1, sampleData.length).setBackground('#e8f0fe');

        // 列幅調整
        sheet.setColumnWidth(1, 60);   // 年度
        sheet.setColumnWidth(2, 80);   // 回数
        sheet.setColumnWidth(3, 70);   // 時間帯
        sheet.setColumnWidth(4, 80);   // 問題番号
        sheet.setColumnWidth(5, 80);   // 大分類
        sheet.setColumnWidth(6, 100);  // 中分類
        sheet.setColumnWidth(7, 150);  // 小分類
        sheet.setColumnWidth(8, 300);  // 問題文
        sheet.setColumnWidth(9, 200);  // 画像URL
        sheet.setColumnWidth(10, 200); // 選択肢1
        sheet.setColumnWidth(11, 200); // 選択肢2
        sheet.setColumnWidth(12, 200); // 選択肢3
        sheet.setColumnWidth(13, 200); // 選択肢4
        sheet.setColumnWidth(14, 200); // 選択肢5
        sheet.setColumnWidth(15, 80);  // 正解番号
        sheet.setColumnWidth(16, 300); // 解説テキスト
        sheet.setColumnWidth(17, 100); // 自作問題フラグ
        sheet.setColumnWidth(18, 80);  // 難易度

        // 入力規則を設定
        // 時間帯
        sheet.getRange(2, 3, 100, 1).setDataValidation(
            SpreadsheetApp.newDataValidation()
                .requireValueInList(['AM', 'PM'])
                .build()
        );

        // 大分類
        sheet.getRange(2, 5, 100, 1).setDataValidation(
            SpreadsheetApp.newDataValidation()
                .requireValueInList(['実地', '専門', '基礎'])
                .build()
        );

        // 難易度
        sheet.getRange(2, 18, 100, 1).setDataValidation(
            SpreadsheetApp.newDataValidation()
                .requireValueInList(['A', 'B', 'C'])
                .build()
        );

        // 自作問題フラグ
        sheet.getRange(2, 17, 100, 1).setDataValidation(
            SpreadsheetApp.newDataValidation()
                .requireValueInList(['TRUE', 'FALSE'])
                .build()
        );

        // 説明シートを追加
        const helpSheet = ss.insertSheet('入力ガイド');
        helpSheet.getRange('A1').setValue('■ インポート用テンプレート 入力ガイド');
        helpSheet.getRange('A1').setFontWeight('bold').setFontSize(14);

        const guide = [
            [''],
            ['【必須項目】'],
            ['年度', '試験の年度（例: 60）'],
            ['時間帯', 'AM または PM'],
            ['問題番号', '1～200'],
            ['大分類', '実地 / 専門 / 基礎'],
            ['問題文', '問題の本文'],
            ['選択肢1～2', '最低2つの選択肢が必要'],
            ['正解番号', '1～5'],
            [''],
            ['【任意項目】'],
            ['回数', '例: 第60回（未入力の場合は年度から自動生成）'],
            ['中分類', '運動器 / 中枢 / 評価 / 内部 / 運動学 / 精神・心理 / その他'],
            ['小分類', '詳細カテゴリ'],
            ['画像URL', 'Google Drive共有リンク'],
            ['選択肢3～5', '任意'],
            ['解説テキスト', '解答の解説'],
            ['自作問題フラグ', 'TRUE / FALSE'],
            ['難易度', 'A / B / C']
        ];

        helpSheet.getRange(2, 1, guide.length, 2).setValues(guide);
        helpSheet.setColumnWidth(1, 150);
        helpSheet.setColumnWidth(2, 400);

        return {
            spreadsheetId: ss.getId(),
            url: ss.getUrl(),
            name: templateName
        };
    }
};
