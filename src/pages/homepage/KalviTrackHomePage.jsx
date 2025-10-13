import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, Users, Target, Award, TrendingUp, Zap, Shield, Clock, BarChart3, BookOpen, Code, Trophy, Sparkles } from 'lucide-react';

export default function KalviTrackHome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Users className="w-12 h-12" />,
      title: "Multi-Role Management",
      description: "Seamless coordination between Admin, HR, Faculty, and Students with intelligent role-based access control",
      gradient: "from-teal-400 via-cyan-500 to-blue-500",
      shadowColor: "shadow-teal-500/50"
    },
    {
      icon: <Target className="w-12 h-12" />,
      title: "Performance Tracking",
      description: "Real-time monitoring of assignments, tests, LeetCode challenges, and daily progress tracking",
      gradient: "from-purple-400 via-pink-500 to-rose-500",
      shadowColor: "shadow-purple-500/50"
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Smart Rankings",
      description: "Automated student ranking system based on CodeChef contests, LeetCode, and assessment scores",
      gradient: "from-orange-400 via-amber-500 to-yellow-500",
      shadowColor: "shadow-orange-500/50"
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Growth Analytics",
      description: "Comprehensive dashboards with insights, reports, and data-driven recommendations",
      gradient: "from-blue-400 via-indigo-500 to-violet-500",
      shadowColor: "shadow-blue-500/50"
    }
  ];

  const highlights = [
    { icon: <Zap className="w-8 h-8" />, title: "Lightning Fast", desc: "Real-time updates", color: "from-yellow-400 to-orange-500" },
    { icon: <Shield className="w-8 h-8" />, title: "Secure Access", desc: "Role-based security", color: "from-teal-400 to-cyan-500" },
    { icon: <Clock className="w-8 h-8" />, title: "24/7 Tracking", desc: "Never miss a moment", color: "from-purple-400 to-pink-500" },
    { icon: <BarChart3 className="w-8 h-8" />, title: "Smart Analytics", desc: "Data-driven insights", color: "from-blue-400 to-indigo-500" }
  ];

  const activities = [
    { icon: <BookOpen className="w-5 h-5" />, text: "Daily Assignments", gradient: "from-teal-500 to-cyan-600" },
    { icon: <Code className="w-5 h-5" />, text: "LeetCode Tracking", gradient: "from-purple-500 to-pink-600" },
    { icon: <Trophy className="w-5 h-5" />, text: "Contest Rankings", gradient: "from-orange-500 to-amber-600" },
    { icon: <Sparkles className="w-5 h-5" />, text: "Mock Interviews", gradient: "from-blue-500 to-indigo-600" }
  ];

  const handleNavigation = (path) => {
    console.log(`Navigating to ${path}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-500 shadow-2xl backdrop-blur-lg' 
          : 'bg-gradient-to-r from-teal-600 via-cyan-700 to-teal-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center space-x-3 group cursor-pointer py-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl transform group-hover:rotate-12 transition-all duration-500 group-hover:scale-110">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-600 to-cyan-600 font-black text-2xl">K</span>
                </div>
                <div className="absolute inset-0 bg-white rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight block">KalviTrack</span>
                <span className="text-xs text-teal-100 font-medium">Student Progress System</span>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-white hover:text-teal-100 transition font-semibold text-sm">Features</a>
              <a href="#about" className="text-white hover:text-teal-100 transition font-semibold text-sm">About</a>
              <a href="#contact" className="text-white hover:text-teal-100 transition font-semibold text-sm">Contact</a>
              <button 
                onClick={() => handleNavigation('/login')}
                className="text-white hover:bg-white hover:text-teal-600 font-bold transition-all duration-300 border-2 border-white px-6 py-2.5 rounded-xl text-sm"
              >
                Login
              </button>
              <button 
                onClick={() => handleNavigation('/register')}
                className="bg-white text-teal-600 px-6 py-2.5 rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 font-bold text-sm hover:scale-105"
              >
                Register
              </button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
                {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-teal-700 border-t border-teal-500 animate-slide-down">
            <div className="px-4 pt-3 pb-4 space-y-3">
              <a href="#features" className="block py-2.5 text-white hover:text-teal-100 font-semibold">Features</a>
              <a href="#about" className="block py-2.5 text-white hover:text-teal-100 font-semibold">About</a>
              <a href="#contact" className="block py-2.5 text-white hover:text-teal-100 font-semibold">Contact</a>
              <button 
                onClick={() => handleNavigation('/login')}
                className="block w-full text-left py-2.5 text-white font-bold border-2 border-white px-4 rounded-xl"
              >
                Login
              </button>
              <button 
                onClick={() => handleNavigation('/register')}
                className="block w-full bg-white text-teal-600 px-6 py-2.5 rounded-xl font-bold"
              >
                Register
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-teal-300 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
          <div className="absolute top-40 -right-20 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"></div>
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-10">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-full shadow-xl animate-bounce-slow">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm">🚀 Complete Internship Management Platform</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-tight">
              <span className="block animate-slide-in-left">Build Your Future</span>
              <span className="block mt-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent animate-slide-in-right animate-gradient-flow">
                Track Your Success
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 leading-relaxed max-w-4xl mx-auto font-medium animate-fade-in-up">
              End-to-end student progress monitoring with intelligent analytics, 
              real-time tracking, and automated placement management
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 animate-fade-in-up-delayed">
              {activities.map((activity, index) => (
                <div 
                  key={index} 
                  className="group relative bg-white p-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${activity.gradient} rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:rotate-12 transition-transform duration-500`}>
                    {activity.icon}
                  </div>
                  <p className="text-sm font-bold text-gray-800 text-center">{activity.text}</p>
                  <div className={`absolute inset-0 bg-gradient-to-br ${activity.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 animate-fade-in-up-more-delayed">
              <button 
                onClick={() => handleNavigation('/login')}
                className="group relative bg-gradient-to-r from-teal-500 via-cyan-600 to-teal-500 text-white px-12 py-5 rounded-2xl font-black text-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-110 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Start Your Journey Now
                  <ChevronRight className="ml-3 w-6 h-6 group-hover:translate-x-3 transition-transform duration-500" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50 via-transparent to-cyan-50 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <div 
                key={index} 
                className="group text-center transform hover:scale-110 transition-all duration-500 cursor-pointer"
                style={{animation: `fadeInScale 0.8s ease-out ${index * 0.1}s forwards`, opacity: 0}}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-3xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl group-hover:shadow-2xl group-hover:rotate-12 transition-all duration-500`}>
                  {item.icon}
                </div>
                <h3 className="font-black text-lg text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 font-semibold">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - 2x2 Grid */}
      <section id="features" className="py-24 md:py-32 bg-gradient-to-br from-gray-50 via-white to-cyan-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle, #14b8a6 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 animate-bounce-slow">
              <span className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                ✨ POWERFUL FEATURES
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent animate-gradient-flow">
                Succeed
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              Comprehensive tools built for modern internship and placement management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-3xl p-8 md:p-10 hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 border-2 border-gray-100 hover:border-transparent overflow-hidden"
                style={{
                  animation: `slideInRotate 0.8s ease-out ${index * 0.2}s forwards`,
                  opacity: 0
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-700`}></div>
                
                <div className="relative z-10">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg ${feature.shadowColor} group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-cyan-600 transition-all duration-500">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
                
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full filter blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block mb-6 animate-pulse">
            <Sparkles className="w-16 h-16 text-yellow-300" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
            Transform Your Learning Experience Today
          </h2>
          <p className="text-xl md:text-2xl text-teal-50 mb-12 leading-relaxed font-semibold max-w-3xl mx-auto">
            Join hundreds of successful students and institutions achieving excellence with comprehensive progress tracking and intelligent analytics
          </p>
          <button 
            onClick={() => handleNavigation('/login')}
            className="group bg-white text-teal-600 px-14 py-6 rounded-2xl font-black text-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-110 inline-flex items-center"
          >
            Get Started Now
            <ChevronRight className="ml-3 w-7 h-7 group-hover:translate-x-3 transition-transform duration-500" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-xl">K</span>
                </div>
                <span className="text-2xl font-black text-white">KalviTrack</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                Empowering students from learning to placement with cutting-edge tracking and analytics technology.
              </p>
            </div>
            <div>
              <h3 className="font-black text-white mb-5 text-lg">Product</h3>
              <ul className="space-y-3 text-sm font-semibold">
                <li><a href="#" className="hover:text-teal-400 transition-colors duration-300">Features</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors duration-300">Pricing</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors duration-300">Updates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-black text-white mb-5 text-lg">Company</h3>
              <ul className="space-y-3 text-sm font-semibold">
                <li><a href="#" className="hover:text-teal-400 transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors duration-300">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-black text-white mb-5 text-lg">Support</h3>
              <ul className="space-y-3 text-sm font-semibold">
                <li><a href="#" className="hover:text-teal-400 transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors duration-300">Documentation</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors duration-300">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-sm text-gray-400 font-semibold">
              &copy; 2025 KalviTrack. All rights reserved. Built with ❤️ for student success.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-30px, 30px) rotate(-5deg); }
          66% { transform: translate(20px, -20px) rotate(5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -40px) scale(1.1); }
        }
        
        @keyframes slideInRotate {
          from {
            opacity: 0;
            transform: translateY(50px) rotate(-5deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounceLight {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 20s infinite ease-in-out;
        }
        
        .animate-float-delayed {
          animation: float-delayed 25s infinite ease-in-out;
        }
        
        .animate-float-slow {
          animation: float-slow 30s infinite ease-in-out;
        }
        
        .animate-bounce-slow {
          animation: bounceLight 3s infinite ease-in-out;
        }
        
        .animate-gradient-flow {
          background-size: 200% 200%;
          animation: gradientFlow 5s ease infinite;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 1s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 1s ease-out 0.2s backwards;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out 0.4s backwards;
        }
        
        .animate-fade-in-up-delayed {
          animation: fadeInUp 1s ease-out 0.6s backwards;
        }
        
        .animate-fade-in-up-more-delayed {
          animation: fadeInUp 1s ease-out 0.8s backwards;
        }
        
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}