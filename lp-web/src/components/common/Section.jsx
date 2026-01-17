import React from 'react';
import { motion } from 'framer-motion';

const Section = ({ id, title, subtitle, children, className = '' }) => {
    return (
        <section id={id} className={`py-24 px-6 md:px-12 relative ${className}`}>
            <div className="container mx-auto max-w-6xl">
                {(title || subtitle) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        {title && (
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block relative">
                                {title}
                                <span className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-secondary rounded-full" />
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mt-6 text-text-muted max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>
                )}
                {children}
            </div>
        </section>
    );
};

export default Section;
