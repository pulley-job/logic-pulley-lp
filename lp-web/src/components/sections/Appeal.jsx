import React from 'react';
import { motion } from 'framer-motion';
import Section from '../common/Section';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';

const Appeal = () => {
    return (
        <Section id="appeal" className="bg-white" title="To the Hiring Team">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-br from-gray-50 to-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 relative"
                >
                    <FaQuoteLeft className="absolute top-8 left-8 text-gray-200 text-4xl" />

                    <div className="relative z-10 space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                                <span className="bg-primary w-2 h-8 mr-4 rounded-full"></span>
                                なぜ私が御社に必要なのか
                            </h3>
                            <p className="text-gray-700 leading-loose text-lg">
                                企業のDX推進においてよく言われる<strong className="bg-yellow-100 px-1">「高尚な戦略だけでなく、現場に入り込む泥臭さが必要」</strong>という言葉に、教育現場に身を置く者として強く共感しました。
                            </p>
                            <p className="text-gray-700 leading-loose text-lg mt-4">
                                私は11年間、理学療法士養成校の教員として勤務する傍ら、Google認定トレーナーとして「変わりたくない現場」の意識変革と向き合ってきました。
                                今の御社には、「外から売る人」だけでなく、<strong className="bg-yellow-100 px-1">「中の痛みが分かり、共通言語で対話できる人間（私）」</strong>が必要です。
                            </p>
                        </div>
                    </div>

                    <FaQuoteRight className="absolute bottom-8 right-8 text-gray-200 text-4xl" />
                </motion.div>
            </div>
        </Section>
    );
};

export default Appeal;
