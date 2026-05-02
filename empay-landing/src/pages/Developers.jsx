import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { FaGithub, FaLinkedin, FaGlobe, FaEnvelope } from 'react-icons/fa';

const developers = [
  {
    name: 'Abdulkadir Shaikh',
    role: 'Lead Developer',
    avatar: '/team/akadir.png',
    github: 'https://github.com/Abdulkadir-22',
    linkedin: 'https://www.linkedin.com/in/abdul-kadir-shaikh-47ab9a357/',
    website: 'https://abdulkadir.in',
    email: 'akadir22086@gmail.com',
    color: 'bg-blue-500',
  },
  {
    name: 'Rehan Multani',
    role: 'Co Developer',
    avatar: '/team/rehan.png',
    github: 'https://github.com/Rehan1141',
    linkedin: 'https://www.linkedin.com/in/rehanmultani/',
    website: '#',
    email: 'rehanmultani1141@gmail.com',
    color: 'bg-sky-400',
  },
];

const Developers = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/10 blur-[120px] rounded-full -z-10 animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold font-syne text-brand-text mb-6"
          >
            Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-blue-500">Developers</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-brand-muted text-lg max-w-2xl mx-auto"
          >
            The minds behind the innovation and engineering of EmPay. Dedicated to building the future of HRMS and Payroll.
          </motion.p>
        </div>

        {/* Developer Cards Grid */}
        <div className="flex flex-wrap justify-center gap-12">
          {developers.map((dev, index) => (
            <motion.div
              key={dev.name}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="glass-card p-10 rounded-[40px] w-full md:w-[450px] border border-border hover:border-brand-purple/50 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-purple/10">
                {/* Avatar Section */}
                <div className="relative mb-8 flex flex-col items-center">
                  <div className="relative p-2 rounded-full border-2 border-dashed border-brand-purple/30 group-hover:border-brand-purple transition-colors duration-500">
                    <img
                      src={dev.avatar}
                      alt={dev.name}
                      className="w-48 h-48 rounded-full object-cover shadow-2xl"
                    />
                  </div>
                  {/* Role Badge */}
                  <div className={`mt-4 px-6 py-1.5 rounded-full ${dev.color} text-white text-sm font-bold shadow-lg shadow-blue-500/20`}>
                    {dev.role}
                  </div>
                </div>

                {/* Info Section */}
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold font-syne text-brand-text mb-8">
                    {dev.name}
                  </h2>

                  {/* Social Links */}
                  <div className="flex justify-center gap-6 mb-10">
                    <SocialLink href={dev.github} icon={<FaGithub size={24} />} />
                    <SocialLink href={dev.linkedin} icon={<FaLinkedin size={24} />} />
                    {dev.website !== '#' && <SocialLink href={dev.website} icon={<FaGlobe size={24} />} />}
                    <SocialLink href={`mailto:${dev.email}`} icon={<FaEnvelope size={24} />} />
                  </div>

                  {/* Sponsor Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-4 rounded-2xl bg-pink-500/10 text-pink-500 font-bold flex items-center justify-center gap-2 hover:bg-pink-500 hover:text-white transition-all duration-300"
                  >
                    <Heart size={20} fill="currentColor" />
                    Sponsor
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SocialLink = ({ href, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="p-3 rounded-2xl bg-brand-surface border border-border text-brand-muted hover:text-brand-purple hover:border-brand-purple hover:scale-110 transition-all duration-300"
  >
    {icon}
  </a>
);

export default Developers;
