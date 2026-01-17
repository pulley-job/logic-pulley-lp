import React from 'react';
import { motion } from 'framer-motion';
import { FaUser } from 'react-icons/fa';

const Hero = () => {
    return (
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 pt-20">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(66,133,244,0.1),transparent_50%)]" />
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(52,168,83,0.1),transparent_50%)]" />

            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10 max-w-6xl">

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex-1 text-center md:text-left"
                >
                    <h1 className="text-5xl md:text-7xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent leading-tight">
                        古井 雅也
                    </h1>
                    <p className="text-xl md:text-2xl font-medium text-gray-600 mb-6">
                        理学療法士 × Google認定トレーナー
                    </p>
                    <p className="text-primary font-bold tracking-[0.2em] mb-4">LOGIC PULLEY</p>

                    <div className="text-sm text-text-light mb-8 bg-white/50 inline-block p-4 rounded-lg backdrop-blur-sm border border-white/50">
                        <p>※Google認定トレーナーとは、Google for Educationを活用した<br className="hidden md:block" />授業改善・業務効率化を支援するICTスペシャリストです</p>
                        <a
                            href="https://edu.google.com/intl/ALL_jp/for-educators/certification-programs/professional-expertise/certified-trainer/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline mt-2 inline-block text-xs"
                        >
                            → 詳細は公式サイトへ
                        </a>
                    </div>

                    <div className="pl-4 border-l-4 border-primary mb-8 text-left max-w-lg mx-auto md:mx-0">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            現場の負担を、テクノロジーで軽くする。<br />
                            Google Workspaceを活用した、<br className="md:hidden" />「明日から使える」業務改善を提案します。
                        </p>
                    </div>

                    <motion.a
                        href="#services"
                        whileHover={{ scale: 1.05, boxShadow: "0 15px 30px rgba(66, 133, 244, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block bg-gradient-primary text-white font-bold py-3 px-8 rounded-full shadow-lg"
                    >
                        View Services
                    </motion.a>
                </motion.div>

                {/* Visual */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="flex-1 flex justify-center md:justify-end"
                >
                    <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full border-8 border-white shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center overflow-hidden">
                        {/* Placeholder for Profile Image */}
                        {/* TODO: Replace with actual image later */}
                        <div className="text-center text-gray-400">
                            <FaUser className="text-6xl mb-2 mx-auto opactiy-20" />
                            <span>Coming Soon</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
