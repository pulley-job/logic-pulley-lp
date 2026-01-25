import React from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';
import Section from '../common/Section';

const Closing = () => {
    return (
        <Section id="closing" className="bg-gradient-to-b from-white to-gray-50 pb-20">
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
                        なぜ、今なのか？
                    </h2>
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-10">
                        「教員としては十分なキャリアがあるのに、なぜ今？」と問われれば、<br />
                        <strong className="text-primary text-2xl block mt-4 mb-4">
                            「自分のクラスだけでなく、<br className="md:hidden" />日本の教育インフラそのものを<br className="md:hidden" />アップデートしたいから」
                        </strong>
                        と答えます。
                    </p>
                    <div className="bg-white p-8 rounded-xl shadow-lg text-left inline-block max-w-2xl mx-auto border border-gray-100">
                        <p className="text-gray-600 leading-loose mb-6">
                            教員として目の前の生徒を救うことにも、もちろん大きなやりがいを感じています。<br />
                            しかし、御社の持つプラットフォームを使えば、<br />
                            <strong>数万人、数十万人の子供たちと先生の環境を変えることができる。</strong>
                        </p>
                        <p className="text-gray-600 leading-loose">
                            安定した教職を捨ててでも、その<strong className="text-secondary">「社会変革の当事者」</strong>になりたい。<br />
                            その覚悟を持って、今回の募集に応募いたしました。
                        </p>
                    </div>

                    <div className="mt-12">
                        <a
                            href="mailto:contact@logicpulley.com" // Replace with actual contact method if needed
                            className="bg-secondary text-white font-bold py-4 px-10 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3 text-lg"
                        >
                            <FaPaperPlane />
                            Contact Me
                        </a>
                    </div>
                </motion.div>
            </div>
        </Section>
    );
};

export default Closing;
