/**
 * SheetService - スプレッドシート操作サービス
 */
const SheetService = {

    /**
     * マスタースプレッドシートを取得
     */
    getSpreadsheet: function () {
        const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
        if (!id) {
            throw new Error('スプレッドシートIDが設定されていません');
        }
        return SpreadsheetApp.openById(id);
    },

    /**
     * 問題マスターシートを取得
     */
    getQuestionsSheet: function () {
        return this.getSpreadsheet().getSheetByName('問題マスター');
    },

    /**
     * カテゴリマスターシートを取得
     */
    getCategorySheet: function () {
        return this.getSpreadsheet().getSheetByName('カテゴリマスター');
    },

    /**
     * 全問題データを取得
     */
    getAllQuestions: function () {
        const sheet = this.getQuestionsSheet();
        if (!sheet) {
            throw new Error('問題マスターシートが見つかりません');
        }

        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const questions = [];

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row[0]) continue; // 空行スキップ

            questions.push({
                id: row[0],           // 問題ID
                year: row[1],         // 年度
                examNumber: row[2],   // 回数
                session: row[3],      // 時間帯 (AM/PM)
                questionNumber: row[4], // 問題番号
                majorCategory: row[5],  // 大分類
                middleCategory: row[6], // 中分類
                minorCategory: row[7],  // 小分類
                questionText: row[8],   // 問題文
                imageUrl: row[9],       // 画像URL
                choice1: row[10],       // 選択肢1
                choice2: row[11],       // 選択肢2
                choice3: row[12],       // 選択肢3
                choice4: row[13],       // 選択肢4
                choice5: row[14],       // 選択肢5
                correctAnswer: row[15], // 正解番号
                explanation: row[16],   // 解説テキスト
                isOriginal: row[17],    // 自作問題フラグ
                difficulty: row[18],    // 難易度
                createdAt: row[19],     // 登録日時
                updatedAt: row[20]      // 更新日時
            });
        }

        return questions;
    },

    /**
     * カテゴリ一覧を取得
     */
    getCategories: function () {
        // カテゴリマスターシートから取得、なければデフォルト値
        const sheet = this.getCategorySheet();

        if (sheet) {
            const data = sheet.getDataRange().getValues();
            const categories = {
                major: [],
                middle: {},
                minor: {}
            };

            for (let i = 1; i < data.length; i++) {
                const [major, middle, minor] = data[i];

                if (major && !categories.major.includes(major)) {
                    categories.major.push(major);
                }

                if (middle) {
                    if (!categories.middle[major]) {
                        categories.middle[major] = [];
                    }
                    if (!categories.middle[major].includes(middle)) {
                        categories.middle[major].push(middle);
                    }
                }

                if (minor) {
                    const key = `${major}|${middle}`;
                    if (!categories.minor[key]) {
                        categories.minor[key] = [];
                    }
                    if (!categories.minor[key].includes(minor)) {
                        categories.minor[key].push(minor);
                    }
                }
            }

            return categories;
        }

        // デフォルトカテゴリ
        return this.getDefaultCategories();
    },

    /**
     * デフォルトカテゴリを取得
     */
    getDefaultCategories: function () {
        return {
            major: ['実地', '専門', '基礎'],
            middle: {
                '実地': ['運動器', '中枢', '評価', '内部', '運動学', '精神/心理', 'その他'],
                '専門': ['運動器', '中枢', '評価', '内部', '運動学', '精神/心理', 'その他'],
                '基礎': ['運動器', '中枢', '評価', '内部', '運動学', '精神/心理', 'その他']
            },
            minor: {
                '実地|運動器': ['脊髄損傷', '運動療法（概論）', '末梢神経障害', '脊椎疾患・熱傷・変形性関節症', 'リウマチ', 'スポーツ外傷', '画像評価・整形外科的テスト'],
                '実地|中枢': ['脳基礎', '頭部外傷', '難病', '伝導路・脳画像', '理学療法・視聴覚・ALS・評価・高次脳', '神経基礎', '自律神経', '脳血管', '小脳', '多発性硬化症', '嚥下', 'パーキンソン病・肩手症候群・ポストポリオ'],
                '実地|評価': ['関節可動域検査', '徒手筋力検査', '感覚検査', '反射検査', '疼痛検査', '形態測定', 'バランス検査'],
                '実地|内部': ['肝臓・膵臓・胆嚢・病理', '血液～免疫と疾患', 'DM・運動生理・代謝・体温・腎臓', '心臓の解剖・循環生理・心電図・心疾患・PAD/大血管疾患', '呼吸解剖・生理', '呼吸器機能検査', '呼吸器疾患', '排便尿', 'がんリハ', '内分泌', '内分泌疾患', '細胞器官', '生殖器', '消化器', '老年症候群', 'フレイル', '薬理'],
                '実地|運動学': ['骨・関節', '運動学（上肢・下肢）', '基本動作', '姿勢・歩行', '筋生理', '筋の（付着）起始・停止', '支配神経'],
                '実地|その他': ['義肢', '装具', '物療', 'ADL', '小児', 'リハ概論'],
                // 専門・基礎も同様の構造（実際の運用時にカテゴリマスターから取得）
            }
        };
    },

    /**
     * 年度一覧を取得
     */
    getYears: function () {
        const questions = this.getAllQuestions();
        const years = [...new Set(questions.map(q => q.year))].sort((a, b) => b - a);
        return years;
    },

    /**
     * 問題を追加
     */
    addQuestion: function (question) {
        const sheet = this.getQuestionsSheet();
        if (!sheet) {
            throw new Error('問題マスターシートが見つかりません');
        }

        const now = new Date();
        const row = [
            question.id || this.generateQuestionId(question.year, question.session, question.questionNumber),
            question.year,
            question.examNumber || `第${question.year}回`,
            question.session,
            question.questionNumber,
            question.majorCategory,
            question.middleCategory,
            question.minorCategory || '',
            question.questionText,
            question.imageUrl || '',
            question.choice1,
            question.choice2,
            question.choice3,
            question.choice4,
            question.choice5 || '',
            question.correctAnswer,
            question.explanation || '',
            question.isOriginal || false,
            question.difficulty || '',
            now,
            now
        ];

        sheet.appendRow(row);
        return row[0]; // 問題IDを返す
    },

    /**
     * 問題IDを生成
     */
    generateQuestionId: function (year, session, number) {
        const sessionCode = session === 'AM' ? 'A' : 'P';
        const numStr = String(number).padStart(3, '0');
        return `${year}${sessionCode}-${numStr}`;
    },

    /**
     * 問題を複数追加
     */
    addQuestions: function (questions) {
        const results = [];
        for (const q of questions) {
            try {
                const id = this.addQuestion(q);
                results.push({ success: true, id: id });
            } catch (error) {
                results.push({ success: false, error: error.message });
            }
        }
        return results;
    }
};
