import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Rocket, Sun, Moon } from 'lucide-react';
import Button from '../ui/Button';

const Navbar = ({ isDark, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Roles', href: '#roles' },
    { name: 'Workflow', href: '#workflow' },
    { name: 'About', href: '#footer' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-4' : 'py-6'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`relative z-10 flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300 ${isScrolled ? 'bg-brand-bg/80 backdrop-blur-xl border border-border shadow-2xl shadow-brand-purple/5' : ''}`}>
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Rocket className="text-white w-6 h-6" />
            </div>
            <span className="font-syne font-extrabold text-2xl tracking-tighter text-brand-text">
              EmPay<span className="text-brand-purple">.</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-brand-muted hover:text-brand-text transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-purple transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            
            <div className="h-6 w-px bg-border mx-2" />
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-brand-surface border border-border text-brand-muted hover:text-brand-purple hover:border-brand-purple transition-all"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Button variant="secondary" className="px-6 py-2">
              Get Started
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-brand-surface border border-border text-brand-muted"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              className="text-brand-text p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-2 px-6 md:hidden"
          >
            <div className="bg-brand-surface border border-border rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium text-brand-muted hover:text-brand-text py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Button variant="secondary" className="w-full">
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
