import React from 'react';
import Hero from '../components/sections/Hero';
import Stats from '../components/sections/Stats';
import Features from '../components/sections/Features';
import Roles from '../components/sections/Roles';
import Workflow from '../components/sections/Workflow';

const Landing = () => {
  return (
    <main>
      <Hero />
      <Stats />
      <Features />
      <Roles />
      <Workflow />
    </main>
  );
};

export default Landing;
