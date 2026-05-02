import React from 'react';
import { Rocket, Heart } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer id="footer" className="bg-brand-surface pt-20 pb-10 relative overflow-hidden border-t border-border transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-purple/50 to-transparent" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-purple/5 blur-[120px] rounded-full" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center">
                <Rocket className="text-white w-6 h-6" />
              </div>
              <span className="font-syne font-extrabold text-2xl tracking-tighter text-brand-text">
                EmPay<span className="text-brand-purple">.</span>
              </span>
            </a>
            <p className="text-brand-muted text-lg leading-relaxed max-w-md mb-8">
              Simplifying HR & Payroll Operations for Smarter Workplaces. Built for the people who run the people.
            </p>
            <div className="flex gap-4">
              {[FaGithub, FaTwitter, FaLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center hover:bg-brand-purple hover:text-white transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-syne font-bold text-brand-text mb-6">Platform</h4>
            <ul className="flex flex-col gap-4 text-brand-muted">
              <li><a href="#features" className="hover:text-brand-purple transition-colors">Features</a></li>
              <li><a href="#roles" className="hover:text-brand-purple transition-colors">Roles</a></li>
              <li><a href="#workflow" className="hover:text-brand-purple transition-colors">Workflow</a></li>
              <li><a href="#stats" className="hover:text-brand-purple transition-colors">Stats</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-syne font-bold text-brand-text mb-6">Built With</h4>
            <ul className="flex flex-col gap-4 text-brand-muted text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                Odoo ERP Principles
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                Role-Based Access
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                React & Tailwind CSS
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-purple" />
                Framer Motion
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-brand-muted">
          <p>© 2026 EmPay. All rights reserved.</p>
          <div className="flex items-center gap-2">
            Built with <Heart className="text-red-500 w-4 h-4 fill-red-500" /> for the Future of Work
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-text">Privacy Policy</a>
            <a href="#" className="hover:text-brand-text">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
