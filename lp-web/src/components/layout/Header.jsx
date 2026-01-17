import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

const NAV_ITEMS = [
    { label: 'About', href: '#history' },
    { label: 'Services', href: '#services' },
    { label: 'Scope', href: '#scope' },
    { label: 'Case Studies', href: '#achievements' },
    { label: 'Media', href: '#media' },
];

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-sm py-2'
                    : 'bg-white/80 backdrop-blur-sm py-4'
                }`}
        >
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Logo */}
                <a href="#" className="font-bold text-2xl tracking-wider text-primary">
                    LOGIC PULLEY
                </a>

                {/* Desktop Nav */}
                <nav className="hidden md:block">
                    <ul className="flex gap-8">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.label}>
                                <a
                                    href={item.href}
                                    className="font-medium relative group hover:text-primary transition-colors"
                                >
                                    {item.label}
                                    <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-primary text-2xl p-2 outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden overflow-hidden"
                        >
                            <ul className="flex flex-col p-6 gap-4">
                                {NAV_ITEMS.map((item) => (
                                    <li key={item.label}>
                                        <a
                                            href={item.href}
                                            className="block text-lg font-medium hover:text-primary"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default Header;
