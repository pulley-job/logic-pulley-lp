import React from 'react';
import Section from '../common/Section';

const Scope = () => {
    return (
        <Section id="scope" className="bg-gray-50" title="Can do for you.">
            <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100/50">
                <p className="text-center font-bold text-lg mb-8 text-gray-700">
                    学校・中小規模の組織において、以下のサポートが可能です。
                </p>
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl mx-auto">
                    {[
                        "学校・チーム内の業務フロー見直し・ICT導入",
                        "教職員向け研修講師・ハンズオンセミナー",
                        "Googleフォーム・GASを活用したツール開発",
                        "学内でのAI活用 / リテラシー研修",
                        "Looker Studioを用いた教育データの可視化",
                        "理学療法士、医療従事者教育へのICT活用支援",
                        "ICT活用に関するコラム・教材作成",
                        "授業・実習のICT化コーディネート",
                        "Google認定教育者・トレーナー資格取得サポート"
                    ].map((item, index) => (
                        <div key={index} className="flex items-start">
                            <span className="text-secondary mr-3 mt-1 flex-shrink-0">✓</span>
                            <span className="font-medium text-gray-700">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    );
};

export default Scope;
