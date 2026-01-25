import React from 'react';
import { motion } from 'framer-motion';
import { FaHandshake, FaCode, FaMagnifyingGlass, FaAward, FaChalkboardUser, FaLaptopCode, FaCertificate } from 'react-icons/fa6';
import Section from '../common/Section';

const coreValues = [
    {
        icon: <FaHandshake />,
        title: "現場の拒否反応を乗り越える力",
        subtitle: "Overcoming Resistance to Change",
        description: "「変わりたくない」という現場の声と11年間向き合ってきた経験。ICT導入への抵抗勢力を、ファンに変える実績があります。",
        highlights: [
            "年間10回以上の継続的な研修実施（企画〜効果検証まで完遂）",
            "「業務が増える」という不安を払拭する伴走型サポート",
            "ベテラン層の意識改革・デジタル活用定着化"
        ],
        color: "from-blue-500 to-cyan-500"
    },
    {
        icon: <FaLaptopCode />,
        title: "「欲しい」を形にする開発スキル",
        subtitle: "Technical Problem-Solving",
        description: "口先だけでなく、自ら手を動かして課題を解決。現場の「こんなのあったらいいな」を即座にプロトタイピングできます。",
        highlights: [
            "Google Apps Script (GAS) による校務支援システム開発・運用",
            "Looker Studioでのデータ可視化ダッシュボード構築",
            "教職員の残業時間削減と教育活動時間の創出を実現"
        ],
        color: "from-green-500 to-emerald-500"
    },
    {
        icon: <FaMagnifyingGlass />,
        title: "本質的な課題発見力",
        subtitle: "Deep Insight from the Field",
        description: "11年間の教育現場経験で培った、教育機関特有の課題に対する圧倒的な解像度。表面的なニーズではなく、本当の課題を見抜きます。",
        highlights: [
            "学校組織の意思決定フロー・稟議プロセスへの深い理解",
            "保護者対応・学生対応など、先生が抱える見えないプレッシャーの把握",
            "「導入後に使われない」を防ぐ、現場視点の導入設計"
        ],
        color: "from-purple-500 to-violet-500"
    }
];

const certifications = [
    { icon: <FaCertificate />, name: "Google認定トレーナー" },
    { icon: <FaAward />, name: "Google認定教育者 Lv1・Lv2" },
    { icon: <FaChalkboardUser />, name: "Googleデータアナリティクス プロフェッショナル" },
    { icon: <FaCode />, name: "ChromeOS Administrator" }
];

const CoreValue = () => {
    return (
        <Section id="corevalue" title="Core Value" subtitle="Why Choose Me">
            {/* キャッチコピー */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <p className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed mb-4">
                    「<span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">先生、これどう使うの？</span>」という
                    <br className="hidden md:block" />
                    現場の戸惑いを、一番近くで解決し続けてきた
                    <br className="hidden md:block" />
                    教員 兼 Google認定トレーナー
                </p>
                <p className="text-gray-600 max-w-3xl mx-auto">
                    教育現場の「リアル」と「DX」をつなぐ、実践型のエデュケーション・パートナーです。
                    高尚な戦略だけでなく、現場に入り込む泥臭さを持って、「変わりたくない」を「変わってよかった」に変えます。
                </p>
            </motion.div>

            {/* 3つのコアバリュー */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                {coreValues.map((value, index) => (
                    <motion.article
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group"
                    >
                        {/* アイコンヘッダー */}
                        <div className={`h-24 bg-gradient-to-r ${value.color} flex items-center justify-center text-white text-4xl`}>
                            {value.icon}
                        </div>
                        
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-1">{value.title}</h3>
                            <p className="text-xs text-gray-500 tracking-wider uppercase mb-4">{value.subtitle}</p>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6 border-b border-gray-100 pb-4">
                                {value.description}
                            </p>
                            <ul className="space-y-3">
                                {value.highlights.map((highlight, i) => (
                                    <li key={i} className="flex items-start text-sm text-gray-700">
                                        <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mr-3 mt-1.5 flex-shrink-0" />
                                        {highlight}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.article>
                ))}
            </div>

            {/* 資格セクション */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8"
            >
                <h3 className="text-center text-lg font-bold text-gray-700 mb-6">保有資格・認定</h3>
                <div className="flex flex-wrap justify-center gap-4">
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-medium text-gray-700"
                        >
                            <span className="text-primary">{cert.icon}</span>
                            {cert.name}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* クロージングメッセージ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="mt-16 text-center"
            >
                <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-2xl p-8 md:p-12 text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-6">
                        日本の教育インフラを、<br className="md:hidden" />アップデートしたい。
                    </h3>
                    <p className="text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8">
                        1人の教員として生徒を救うことにやりがいを感じる一方、
                        プラットフォームを活用すれば、数万人・数十万人の子供たちと先生の環境を変えられる。
                        その「社会変革の当事者」になる覚悟を持っています。
                    </p>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-6 py-3 rounded-full">
                        <span className="font-bold">現職：</span>
                        <span>理学療法士養成校 教員（教員歴11年 / 37歳）</span>
                    </div>
                </div>
            </motion.div>
        </Section>
    );
};

export default CoreValue;
