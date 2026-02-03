
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import MainSection from './components/MainSection';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f4]">
      <Header />
      <main className="flex-1 pb-20">
        <Hero />
        
        {/* Welcome Text - Positioned outside main card */}
        <div className="max-w-[1440px] mx-auto px-6 mb-7">
          <h2 className="text-[22px] font-bold text-[#111]">
            Welcome to Alibaba.com, Brian
          </h2>
        </div>

        <MainSection />
      </main>
    </div>
  );
};

export default App;
