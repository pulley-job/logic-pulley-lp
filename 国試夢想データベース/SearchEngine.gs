/**
 * SearchEngine - 問題検索エンジン
 */
const SearchEngine = {

    /**
     * 問題を検索
     * @param {Object} criteria - 検索条件
     * @param {Array} criteria.years - 年度リスト
     * @param {string} criteria.session - 時間帯（AM/PM/both）
     * @param {Array} criteria.majorCategories - 大分類リスト
     * @param {Array} criteria.middleCategories - 中分類リスト
     * @param {Array} criteria.minorCategories - 小分類リスト
     * @param {string} criteria.difficulty - 難易度（A/B/C/all）
     * @param {boolean} criteria.originalOnly - 自作問題のみ
     * @param {string} criteria.keyword - キーワード検索
     */
    search: function (criteria) {
        let questions = SheetService.getAllQuestions();

        // 年度フィルタ
        if (criteria.years && criteria.years.length > 0) {
            questions = questions.filter(q => criteria.years.includes(q.year));
        }

        // 時間帯フィルタ
        if (criteria.session && criteria.session !== 'both') {
            questions = questions.filter(q => q.session === criteria.session);
        }

        // 大分類フィルタ
        if (criteria.majorCategories && criteria.majorCategories.length > 0) {
            questions = questions.filter(q => criteria.majorCategories.includes(q.majorCategory));
        }

        // 中分類フィルタ
        if (criteria.middleCategories && criteria.middleCategories.length > 0) {
            questions = questions.filter(q => criteria.middleCategories.includes(q.middleCategory));
        }

        // 小分類フィルタ
        if (criteria.minorCategories && criteria.minorCategories.length > 0) {
            questions = questions.filter(q => criteria.minorCategories.includes(q.minorCategory));
        }

        // 難易度フィルタ
        if (criteria.difficulty && criteria.difficulty !== 'all') {
            questions = questions.filter(q => q.difficulty === criteria.difficulty);
        }

        // 自作問題フィルタ
        if (criteria.originalOnly) {
            questions = questions.filter(q => q.isOriginal === true);
        }

        // キーワード検索
        if (criteria.keyword && criteria.keyword.trim()) {
            const keyword = criteria.keyword.trim().toLowerCase();
            questions = questions.filter(q => {
                return q.questionText.toLowerCase().includes(keyword) ||
                    q.explanation?.toLowerCase().includes(keyword) ||
                    q.choice1?.toLowerCase().includes(keyword) ||
                    q.choice2?.toLowerCase().includes(keyword) ||
                    q.choice3?.toLowerCase().includes(keyword) ||
                    q.choice4?.toLowerCase().includes(keyword) ||
                    q.choice5?.toLowerCase().includes(keyword);
            });
        }

        // ソート（年度降順、問題番号昇順）
        questions.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            if (a.session !== b.session) return a.session.localeCompare(b.session);
            return a.questionNumber - b.questionNumber;
        });

        return {
            total: questions.length,
            questions: questions
        };
    },

    /**
     * IDで問題を取得
     */
    getById: function (id) {
        const questions = SheetService.getAllQuestions();
        return questions.find(q => q.id === id) || null;
    },

    /**
     * 複数IDで問題を取得
     */
    getByIds: function (ids) {
        const questions = SheetService.getAllQuestions();
        return questions.filter(q => ids.includes(q.id));
    }
};
