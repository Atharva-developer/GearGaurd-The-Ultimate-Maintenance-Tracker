import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Shield } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* --- Navbar --- */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          {/* Logo Icon */}
          <div className="w-10 h-10 bg-[#714B67] rounded-lg flex items-center justify-center text-white font-bold text-xl">
            G
          </div>
          <span className="text-2xl font-bold text-[#714B67] tracking-tight">GearGuard</span>
        </div>
        
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-[#714B67]">Apps</a>
          <a href="#" className="hover:text-[#714B67]">Community</a>
          <a href="#" className="hover:text-[#714B67]">Pricing</a>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-gray-600 font-medium hover:text-[#714B67]"
          >
            Sign in
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-5 py-2 bg-[#714B67] text-white font-bold rounded shadow-md hover:bg-[#5d3d54] transition-all"
          >
            Try it free
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-24 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-[#714B67] mb-6 leading-tight">
          All your maintenance on <br className="hidden md:block" />
          <span className="relative inline-block px-2">
            <span className="absolute inset-0 bg-[#F0B323] transform -skew-x-3 rounded-sm opacity-80"></span>
            <span className="relative text-white">one platform.</span>
          </span>
        </h1>
        
        <p className="text-2xl text-gray-500 mb-10 font-light italic">
          Simple, efficient, yet <span className="text-[#017E84] font-bold decoration-wavy underline decoration-2 underline-offset-4">affordable!</span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-[#714B67] text-white text-lg font-bold rounded shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Start now - It's free
          </button>
          <button className="px-8 py-4 bg-gray-100 text-gray-700 text-lg font-bold rounded hover:bg-gray-200 transition-all">
            Meet an advisor
          </button>
        </div>

        {/* Floating Cards / Image Placeholder */}
        <div className="relative mx-auto max-w-4xl">
           <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 transform rotate-1 hover:rotate-0 transition-all duration-500">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-left">
                 <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <Zap className="w-8 h-8 text-[#714B67] mb-2" />
                    <h3 className="font-bold text-gray-800">Fast Requests</h3>
                    <p className="text-xs text-gray-500">Log issues in seconds</p>
                 </div>
                 <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <Shield className="w-8 h-8 text-[#F0B323] mb-2" />
                    <h3 className="font-bold text-gray-800">Secure Data</h3>
                    <p className="text-xs text-gray-500">Bank-grade encryption</p>
                 </div>
                 <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                    <CheckCircle className="w-8 h-8 text-[#017E84] mb-2" />
                    <h3 className="font-bold text-gray-800">Job Done</h3>
                    <p className="text-xs text-gray-500">Track until completion</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;