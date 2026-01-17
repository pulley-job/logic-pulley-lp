import React from 'react';
import { motion } from 'framer-motion';
import { FaBasketballBall, FaUserNurse, FaChalkboardTeacher, FaIdCard, FaArrowRight, FaUserCircle } from 'react-icons/fa';
import Section from '../common/Section';

const historyData = [
    {
        icon: <FaBasketballBall />,
        title: "Origins & Sports",
        items: [
            { year: "1988", text: "福岡県北九州市にて誕生" },
            { year: "2003-2004", title: "木屋瀬中学校", text: "全中ベスト8 / 九州大会優勝" },
            { year: "2006-2007", title: "中村学園三陽高校", text: "福岡県ベスト4" }
        ]
    },
    {
        icon: <FaUserNurse />,
        title: "Therapist Career",
        items: [
            { year: "2010", text: "下関リハビリテーション学院 卒業" },
            { year: "2010-2015", title: "臨床理学療法士として従事", text: "新武雄病院 / 蒲田リハビリテーション病院" },
            { year: "Specialty", text: "急性期、回復期、外来、訪問リハビリテーション" }
        ]
    },
    {
        icon: <FaChalkboardTeacher />,
        title: "Educator & DX",
        subtitle: "理学療法士養成校教員として10年以上従事",
        items: [
            { year: "2015-2022", text: "福岡和白リハビリテーション学院" },
            { year: "2022-2025", text: "八千代リハビリテーション学院" },
            { year: "2025-Present", text: "小倉リハビリテーション学院" },
            { year: "業務", text: "広報・教務・ICTトラブル対応・DX推進" }
        ]
    }
];

const HistoryCard = ({ icon, title, subtitle, items, index }) => (
    <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white p-8 rounded-2xl shadow-card hover:shadow-card-hover transition-shadow border border-gray-50 h-full flex flex-col"
    >
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-primary text-xl mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        {subtitle && <p className="text-sm text-text-muted mb-4">{subtitle}</p>}

        <div className="flex-grow space-y-4">
            {items.map((item, i) => (
                <div key={i} className="border-l-2 border-gray-100 pl-4 py-1">
                    <span className="text-xs font-bold text-secondary block mb-1">{item.year}</span>
                    {item.title && <strong className="block text-sm mb-1">{item.title}</strong>}
                    <p className="text-sm text-gray-600">{item.text}</p>
                </div>
            ))}
        </div>
    </motion.article>
);

const History = () => {
    return (
        <Section id="history" title="History">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                {historyData.map((data, index) => (
                    <HistoryCard key={index} {...data} index={index} />
                ))}
            </div>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100"
            >
                <div className="flex flex-col md:flex-row">
                    <div className="p-8 md:p-12 md:w-3/5">
                        <h4 className="flex items-center gap-3 text-2xl font-bold mb-6 text-dark">
                            <FaIdCard className="text-primary" />
                            古井 雅也 (Masaya Furui)
                        </h4>
                        <ul className="space-y-3 mb-8">
                            {[
                                "理学療法士養成校教員 / 現役理学療法士",
                                "Google認定教育者 Lv1 & Lv2 / Google認定トレーナー",
                                "Gemini Certified Educator",
                                "Google Data Analytics Professional",
                                "Professional ChromeOS Administrator"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center text-gray-700">
                                    <span className="text-secondary mr-3">✓</span> {item}
                                </li>
                            ))}
                        </ul>
                        <div className="bg-blue-50/50 p-6 rounded-xl text-gray-700 leading-relaxed text-sm md:text-base">
                            <p className="mb-4 font-bold text-primary">【臨床知 × 教育実践 × デジタル技術】</p>
                            <p>
                                私の強みは、15年以上の臨床経験に裏打ちされた「教育実践力」と、それを加速させる「ICT・データ活用能力」です。
                                Googleデータアナリティクスの知見を活かし、学生の成績データを分析して個別最適化された指導計画を立案。
                                教育の質の向上と業務効率化を両面から推進し、組織の発展に貢献します。
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-8 md:w-2/5 flex flex-col justify-center">
                        <article className="bg-white rounded-xl shadow-md overflow-hidden hover:translate-y-[-5px] transition-transform duration-300">
                            <div className="h-40 overflow-hidden relative">
                                <img
                                    src="https://assets.st-note.com/production/uploads/images/133743692/rectangle_large_type_2_1b23c9eaf41b8a16538491d166f4ba77.jpeg?fit=bounds&quality=85&width=1280"
                                    alt="Profile Article"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-[-20px] right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-emerald-500">
                                    <FaUserCircle className="text-2xl" />
                                </div>
                            </div>
                            <div className="p-6 pt-8">
                                <h3 className="font-bold mb-2">理学療法士がGoogle認定トレーナーになれた話</h3>
                                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                                    私のこれまでの歩みと、なぜICT教育×理学療法という道を選んだのか。
                                </p>
                                <a
                                    href="https://note.com/lucky_pulley/n/nd35ad47f056e"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-bold flex items-center gap-2 hover:text-primary transition-colors"
                                >
                                    自己紹介を読む <FaArrowRight />
                                </a>
                            </div>
                        </article>
                    </div>
                </div>
            </motion.div>
        </Section>
    );
};

export default History;
