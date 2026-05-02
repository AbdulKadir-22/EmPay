import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import Stats from './components/sections/Stats';
import Features from './components/sections/Features';
import Roles from './components/sections/Roles';
import Workflow from './components/sections/Workflow';

function App() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-brand-purple/30 selection:text-brand-text transition-colors duration-500">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      
      <main>
        <Hero />
        <Stats />
        <Features />
        <Roles />
        <Workflow />
      </main>

      <Footer />
    </div>
  );
}

export default App;
