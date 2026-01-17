import React from 'react';
import { FaEnvelope, FaTwitter, FaYoutube, FaGithub } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-dark text-white py-12">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <h3 className="text-2xl font-bold tracking-wider mb-2">LOGIC PULLEY</h3>
                        <p className="text-gray-400 text-sm">
                            Teacher's & Medical Tech Partner
                        </p>
                    </div>

                    <div className="flex gap-6">
                        <SocialLink href="mailto:pulley.job2022@gmail.com" icon={<FaEnvelope />} label="Email" />
                        <SocialLink href="https://twitter.com/lucky_pulley" icon={<FaTwitter />} label="Twitter" />
                        <SocialLink href="https://www.youtube.com/channel/UCaCcMmGgIx35Tcfw3DHZLmQ" icon={<FaYoutube />} label="YouTube" />
                        <SocialLink href="https://github.com/pulley-job" icon={<FaGithub />} label="GitHub" />
                        <a href="https://note.com/lucky_pulley" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors" aria-label="Note">
                            <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
                                <rect width="40" height="40" rx="8" fill="currentColor" />
                                <path d="M14.85 11.9C17.55 11.85 20.35 11.8 22.6 11.86C27.56 11.98 29.43 14.14 29.51 19.49C29.57 22.5 29.51 31.15 29.51 31.15H24.14C24.14 27.94 24.15 25.87 24.15 24.36C24.16 22.32 24.16 21.33 24.14 19.96C24.08 17.87 23.48 16.86 21.86 16.68C20.14 16.47 15.36 16.64 15.36 16.64V31.15H9.99V11.96C11.45 11.96 13.13 11.93 14.85 11.90Z" fill="#111827" />
                            </svg>
                        </a>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {currentYear} Logic Pulley / Masaya Furui. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

const SocialLink = ({ href, icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-2xl hover:text-primary transition-colors hover:-translate-y-1 transform duration-300"
        aria-label={label}
    >
        {icon}
    </a>
);

export default Footer;
