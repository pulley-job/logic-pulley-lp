import React from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaChartBar, FaGlobe, FaQrcode, FaChalkboardUser, FaRobot, FaHospitalUser, FaComments } from 'react-icons/fa6';
import Section from '../common/Section';

const achievements = [
    { icon: <FaPaperPlane />, title: "学校法人のペーパーレス化・業務効率化", desc: "学内のペーパーレス化を推進し、iPadとノートPCを活用したワークスタイルを確立。作業効率を劇的に改善しました。" },
    { icon: <FaChartBar />, title: "成績・学習状況の可視化システム", desc: "Googleスプレッドシート、Looker Studio、GASを連携。個別の成績カルテや模擬試験の推移を即座に可視化。" },
    { icon: <FaGlobe />, title: "求人票の完全ウェブ化", desc: "従来のアナログな求人票をウェブ化。学生が「いつでも・どこでも」スマホやPCから情報を閲覧できる環境を構築。" },
    { icon: <FaQrcode />, title: "就職説明会の受付業務効率化", desc: "QRコードとノーコードアプリ(AppSheet)を活用。長蛇の列ができていた受付時間を大幅に短縮。" },
    { icon: <FaChalkboardUser />, title: "教職員向けICT研修・継続サポート", desc: "教員や事務職員向けにGoogle Workspace活用講座を年10回以上開催。導入のみならず、定着を支援。" },
    { icon: <FaRobot />, title: "生成AI (Gemini) による業務自動化", desc: "GeminiやGoogle関連のAIツールを活用し、日々のルーチン業務を自動化。生産性を向上させています。" },
    { icon: <FaHospitalUser />, title: "医療現場の組織・スタッフ管理支援", desc: "医療機関からの依頼で、組織図やスタッフのシフト・状態管理をサポート。実用的なシートやツールを提供。" },
    { icon: <FaComments />, title: "口コミ返信AI自動化（中小企業向け）", desc: "Gemini API × Googleスプレッドシートで、口コミへの返信文を自動生成するシステムを構築。" },
];

const Achievements = () => {
    return (
        <Section id="achievements" title="Case Studies">
            <div className="grid md:grid-cols-2 gap-6">
                {achievements.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="text-secondary text-2xl mt-1 mr-4 bg-green-50 p-3 rounded-lg flex-shrink-0">
                            {item.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2 text-gray-800">{item.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Section>
    );
};

export default Achievements;
