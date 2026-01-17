import React from 'react';
import Section from '../common/Section';
import { FaFileCode, FaGamepad, FaBrain, FaYoutube, FaArrowRight } from 'react-icons/fa6';

const MediaCard = ({ image, icon, title, desc, link, linkText, isYoutube = false }) => (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] flex flex-col h-full group">
        <div className="relative h-48 overflow-hidden bg-gray-200">
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className={`absolute bottom-[-20px] right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-xl z-10 ${isYoutube ? 'bg-red-600 text-white' : 'bg-white text-emerald-500'
                }`}>
                {icon}
            </div>
        </div>
        <div className="p-6 pt-10 flex flex-col flex-grow">
            <h3 className="font-bold text-lg mb-2 leading-tight">{title}</h3>
            <p className="text-sm text-gray-600 mb-6 flex-grow">{desc}</p>
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-sm font-bold mt-auto ${isYoutube ? 'text-red-600 hover:text-red-700' : 'text-gray-800 hover:text-primary'
                    }`}
            >
                {linkText} <FaArrowRight />
            </a>
        </div>
    </article>
);

const Media = () => {
    return (
        <Section id="media" title="Media & Activities" className="bg-gray-50">

            {/* Note Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
                <MediaCard
                    image="https://assets.st-note.com/production/uploads/images/237854472/rectangle_large_type_2_db7c3aeba6e84ab0b323f2e02f5fd1c8.jpeg?fit=bounds&quality=85&width=1280"
                    icon={<FaFileCode />}
                    title="求人票入力フォーム最終版？？"
                    desc="スプレッドシートの「横スクロール」はもう禁止。マスタ連動＆自動入力フォームで業務を最大化。"
                    link="https://note.com/lucky_pulley/n/n876fff387956"
                    linkText="詳細を見る"
                />
                <MediaCard
                    image="https://assets.st-note.com/production/uploads/images/230267673/rectangle_large_type_2_86cff5212b741ce1d98bf1c775af95e3.jpeg?fit=bounds&quality=85&width=1280"
                    icon={<FaGamepad />}
                    title="やらされ感満載の課題が「RPG」に！"
                    desc="【Google認定教育者 × 理学療法教員】Googleフォームで学生の学習意欲に火をつけた方法"
                    link="https://note.com/lucky_pulley/n/n09b503a29415"
                    linkText="詳細を見る"
                />
                <MediaCard
                    image="https://assets.st-note.com/production/uploads/images/227691888/rectangle_large_type_2_e321538f7f6c39bbaf9745730f5c93b4.png?fit=bounds&quality=85&width=1280"
                    icon={<FaBrain />}
                    title="「答え」ではなく「問い」をくれた相棒"
                    desc="理学療法士教員がGeminiと歩んだ「学び」の話"
                    link="https://note.com/lucky_pulley/n/n7bb3e2f5a46e"
                    linkText="詳細を見る"
                />
            </div>

            {/* Guest Media */}
            <div className="mb-16">
                <h3 className="text-2xl font-bold text-center mb-10">Guest Media Appearances</h3>
                <div className="grid md:grid-cols-4 gap-6">
                    <MediaCard
                        image="https://img.youtube.com/vi/3S_dJN-0exI/maxresdefault.jpg"
                        icon={<FaYoutube />}
                        title="生成AIで添削時間を大幅削減!?"
                        desc="【Teacher's Shift】専門学校でのICT活用と働き方改革。（前編）"
                        link="https://www.youtube.com/watch?v=3S_dJN-0exI"
                        linkText="動画を見る"
                        isYoutube={true}
                    />
                    <MediaCard
                        image="https://img.youtube.com/vi/KP4B81eO4IU/maxresdefault.jpg"
                        icon={<FaYoutube />}
                        title="学生のために働く教員の多忙な1日"
                        desc="【Teacher's Shift】仕事と家庭の両立、未来への展望。（後編）"
                        link="https://www.youtube.com/watch?v=KP4B81eO4IU"
                        linkText="動画を見る"
                        isYoutube={true}
                    />
                    <MediaCard
                        image="https://img.youtube.com/vi/IsWzP2h1_Fw/maxresdefault.jpg"
                        icon={<FaYoutube />}
                        title="教育と業務効率化の両立（前編）"
                        desc="【iTeachers TV】ICTで実現する学びと業務の進化。"
                        link="https://www.youtube.com/watch?v=IsWzP2h1_Fw"
                        linkText="動画を見る"
                        isYoutube={true}
                    />
                    <MediaCard
                        image="https://img.youtube.com/vi/0YUQvI9KE3g/maxresdefault.jpg"
                        icon={<FaYoutube />}
                        title="教育と業務効率化の両立（後編）"
                        desc="【iTeachers TV】ICT導入の具体的効果について。"
                        link="https://www.youtube.com/watch?v=0YUQvI9KE3g"
                        linkText="動画を見る"
                        isYoutube={true}
                    />
                </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
                <a
                    href="https://www.youtube.com/channel/UCaCcMmGgIx35Tcfw3DHZLmQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white px-8 py-3 rounded-full shadow-md text-red-600 font-bold hover:shadow-lg hover:scale-105 transition-all text-lg border border-red-100"
                >
                    <FaYoutube className="text-2xl" /> YouTubeチャンネル
                </a>
                <a
                    href="https://note.com/lucky_pulley"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white px-8 py-3 rounded-full shadow-md text-emerald-600 font-bold hover:shadow-lg hover:scale-105 transition-all text-lg border border-emerald-100"
                >
                    <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.85 11.9C17.55 11.85 20.35 11.8 22.6 11.86C27.56 11.98 29.43 14.14 29.51 19.49C29.57 22.5 29.51 31.15 29.51 31.15H24.14C24.14 27.94 24.15 25.87 24.15 24.36C24.16 22.32 24.16 21.33 24.14 19.96C24.08 17.87 23.48 16.86 21.86 16.68C20.14 16.47 15.36 16.64 15.36 16.64V31.15H9.99V11.96C11.45 11.96 13.13 11.93 14.85 11.90Z" fill="currentColor" />
                    </svg>
                    Note記事一覧
                </a>
            </div>
        </Section>
    );
};

export default Media;
