import React from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import History from './components/sections/History';
import CoreValue from './components/sections/CoreValue';
import Services from './components/sections/Services';
import Scope from './components/sections/Scope';
import Achievements from './components/sections/Achievements';
import Media from './components/sections/Media';

function App() {
  return (
    <div className="bg-bg text-text selection:bg-primary selection:text-white">
      <Header />
      <main>
        <Hero />
        <History />
        <CoreValue />
        <Services />
        <Scope />
        <Achievements />
        <Media />
      </main>
      <Footer />
    </div>
  );
}

export default App;
