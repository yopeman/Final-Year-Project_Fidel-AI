import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Users, 
  Globe, 
  Video, 
  BookOpen, 
  Star,
  ArrowRight,
  GraduationCap,
  CheckCircle
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Learning",
      description: "Personalized English lessons powered by advanced AI"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Live Tutor Sessions",
      description: "Connect with certified tutors for real-time practice"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Localized Content",
      description: "Content tailored for Ethiopian learners"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Interactive Classes",
      description: "Engaging video sessions with interactive tools"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Structured Curriculum",
      description: "Comprehensive learning paths for all levels"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics"
    }
  ];

  const stats = [
    { number: "5000+", label: "Active Students" },
    { number: "200+", label: "Certified Tutors" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">Fidel<span className="text-indigo-600">AI</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-indigo-600 transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition">How it Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition">Testimonials</a>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-gray-700 hover:text-indigo-600 transition font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div 
            {...fadeInUp}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Master English with
              <span className="text-indigo-600 block mt-2">AI-Powered Learning</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Personalized English education platform for Ethiopian learners. 
              AI-driven lessons, live tutor sessions, and local payment integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition transform hover:-translate-y-1 shadow-lg flex items-center justify-center space-x-2"
              >
                <span className="text-lg font-semibold">Start Learning Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-50 transition border shadow-md">
                <span className="text-lg font-semibold">Watch Demo</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose FidelAI?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive English learning solution designed specifically for Ethiopian students
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-indigo-600">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 text-lg">Start your English learning journey in 3 simple steps</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Sign Up & Assessment", desc: "Create account and take level assessment" },
              { step: "02", title: "Personalized Plan", desc: "Get AI-generated learning path based on your level" },
              { step: "03", title: "Learn & Practice", desc: "Start lessons with AI and live tutor sessions" }
            ].map((item, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                  <div className="text-6xl font-bold text-indigo-100 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-indigo-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
            <p className="text-gray-600 text-lg">Join thousands of successful English learners</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sisay Atinkut", role: "University Student", text: "FidelAI transformed my English skills in just 3 months!" },
              { name: "Walelign Enemayehu", role: "Professional", text: "The AI pronunciation feedback is incredibly accurate." },
              { name: "Yohanes Debebe", role: "Teacher", text: "Perfect blend of technology and human teaching." }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-indigo-600 font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your English Skills?</h2>
            <p className="text-indigo-100 text-xl mb-10 max-w-2xl mx-auto">
              Join thousands of successful learners. Start your 7-day free trial today.
            </p>
            <button 
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-white text-indigo-600 rounded-xl hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-xl text-lg font-semibold"
            >
              Get Started Now - It's Free
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <GraduationCap className="w-8 h-8 text-indigo-400" />
              <span className="text-2xl font-bold">Fidel<span className="text-indigo-400">AI</span></span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2024 FidelAI. All rights reserved.</p>
              <p className="text-gray-500 text-sm mt-2">Bahir Dar University - Final Year Project</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;