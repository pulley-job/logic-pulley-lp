import React from 'react';
import { motion } from 'framer-motion';
import { FaFileCode, FaChartPie, FaChalkboardUser, FaRobot } from 'react-icons/fa6';
import Section from '../common/Section';

const services = [
    {
        icon: <FaFileCode />,
        title: "Google活用・業務効率化",
        subtitle: "Google Workspace Optimization",
        description: "Google Apps Script (GAS) や AppSheet を活用し、現場の「困った」を解決するツールを開発します。",
        points: ["フォーム自動返信・連携システム", "AppSheetアプリ開発", "ペーパーレス化導入支援"]
    },
    {
        icon: <FaChartPie />,
        title: "データの整理・「見える化」",
        subtitle: "Data Visualization",
        description: "溜まったままのExcelやアンケートデータを、Looker Studioで分かりやすいダッシュボードに。",
        points: ["スプレッドシートのデータベース化", "成績・業務データの可視化", "アンケート集計の自動化"]
    },
    {
        icon: <FaChalkboardUser />,
        title: "ICT研修・セミナー講師",
        subtitle: "ICT Training for Teachers",
        description: "Google認定トレーナーとして、教職員・医療従事者向けの研修を行います。「現場でどう使うか」に特化。",
        points: ["Google Workspace 活用研修", "授業・業務活用術セミナー", "管理者向け設定サポート"]
    },
    {
        icon: <FaRobot />,
        title: "生成AI (Gemini) 活用",
        subtitle: "Generative AI Support",
        description: "Geminiをはじめとした生成AIを、業務や授業の「相棒」にする方法をお伝えします。",
        points: ["AIによる事務作業時短術", "教育現場でのAIガイドライン", "授業でのAI活用アイデア"]
    }
];

const Services = () => {
    return (
        <Section id="services" title="Support Service">
            <div className="grid md:grid-cols-2 gap-8">
                {services.map((service, index) => (
                    <motion.article
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-8 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:translate-y-[-5px]"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center text-primary text-2xl mb-6 shadow-sm">
                            {service.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-1">{service.title}</h3>
                        <p className="text-xs text-secondary font-bold tracking-wider uppercase mb-4">{service.subtitle}</p>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed border-b border-gray-100 pb-4">
                            {service.description}
                        </p>
                        <ul className="space-y-2">
                            {service.points.map((point, i) => (
                                <li key={i} className="flex items-center text-sm font-medium text-gray-700">
                                    <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-3" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </motion.article>
                ))}
            </div>
        </Section>
    );
};

export default Services;
