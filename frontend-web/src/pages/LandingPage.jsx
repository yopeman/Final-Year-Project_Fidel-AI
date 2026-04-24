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
  GraduationCap
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Learning",
      description: "Personalized English lessons powered by advanced AI algorithms.",
      iconColor: "text-brand-indigo",
      bgGlow: "group-hover:bg-brand-indigo/10",
      borderColor: "group-hover:border-brand-indigo/30"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Live Tutor Sessions",
      description: "Connect with certified tutors for real-time intensive practice.",
      iconColor: "text-brand-green",
      bgGlow: "group-hover:bg-brand-green/10",
      borderColor: "group-hover:border-brand-green/30"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Localized Content",
      description: "Tailored educational material designed specifically for Ethiopian learners.",
      iconColor: "text-primary",
      bgGlow: "group-hover:bg-primary/10",
      borderColor: "group-hover:border-primary/30"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Interactive Classes",
      description: "Engaging video sessions with built-in interactive learning tools.",
      iconColor: "text-brand-indigo",
      bgGlow: "group-hover:bg-brand-indigo/10",
      borderColor: "group-hover:border-brand-indigo/30"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Structured Curriculum",
      description: "Comprehensive, multi-level learning paths for absolute beginners to pros.",
      iconColor: "text-brand-green",
      bgGlow: "group-hover:bg-brand-green/10",
      borderColor: "group-hover:border-brand-green/30"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Monitor your English improvement with detailed real-time analytics.",
      iconColor: "text-primary",
      bgGlow: "group-hover:bg-primary/10",
      borderColor: "group-hover:border-primary/30"
    }
  ];

  const stats = [
    { number: "5000+", label: "Active Students" },
    { number: "200+", label: "Certified Tutors" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="gradient-bg text-white relative overflow-hidden font-sans selection:bg-brand-indigo/30 selection:text-white">
      {/* Background Decorators */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -mr-96 -mt-96 mix-blend-screen opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-indigo/10 rounded-full blur-[150px] -ml-96 -mb-96 mix-blend-screen opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-white/5 rounded-[100%] blur-[120px] rotate-45 pointer-events-none opacity-20"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-premium border-b-0 border-white/5 rounded-none">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-brand-green/30 group-hover:bg-brand-green/10 transition-all duration-500 shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-brand-green opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
                <GraduationCap className="w-6 h-6 text-white group-hover:text-brand-green transition-colors relative z-10" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter">Fidel<span className="text-brand-green">AI</span></span>
            </div>
            <div className="hidden md:flex items-center space-x-10">
              <a href="#features" className="text-accent-secondary hover:text-white text-sm font-black uppercase tracking-widest transition-colors duration-300">Platform</a>
              <a href="#how-it-works" className="text-accent-secondary hover:text-white text-sm font-black uppercase tracking-widest transition-colors duration-300">Methodology</a>
              <a href="#testimonials" className="text-accent-secondary hover:text-white text-sm font-black uppercase tracking-widest transition-colors duration-300">Success Stories</a>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-3 text-accent-secondary hover:text-white transition-colors duration-300 font-bold text-sm uppercase tracking-wider"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="group px-6 py-3 bg-primary text-[#080C14] rounded-xl font-black uppercase tracking-wider hover:scale-105 transition-all duration-300 yellow-glow flex items-center space-x-2"
              >
                <span>Initialize</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 z-10">
        <div className="container mx-auto">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="inline-block mb-6 px-6 py-2 rounded-full border border-brand-indigo/30 bg-brand-indigo/10 text-brand-indigo font-black uppercase tracking-widest text-xs">
              Next-Gen English Mastery Platform
            </motion.div>
            <motion.h1 
              variants={fadeInUp}
              className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-tight"
            >
              Master English through <br className="hidden md:block" />
              <span className="gradient-text">Neural Intelligence</span>
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-accent-secondary mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              The premium educational terminal designed to elevate Ethiopian learners. Harness adaptive AI and certified tutors to fast-track your fluency.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={() => navigate('/register')}
                className="group px-10 py-5 bg-primary text-[#080C14] rounded-[2rem] hover:opacity-90 transition transform hover:-translate-y-1 yellow-glow flex items-center justify-center space-x-3 w-full sm:w-auto"
              >
                <span className="text-lg font-black tracking-wider uppercase">Engage Protocol</span>
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
              </button>
              <button className="px-10 py-5 glass-effect text-accent-secondary hover:text-white rounded-[2rem] hover:bg-white/10 transition flex items-center justify-center space-x-3 w-full sm:w-auto">
                <span className="text-lg font-black tracking-wider uppercase">Review Architecture</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <div className="relative py-16 border-y border-white/5 bg-black/20 backdrop-blur-sm z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center group"
              >
                <div className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter group-hover:text-brand-green transition-colors duration-500">
                  {stat.number}
                </div>
                <div className="text-accent-muted font-bold uppercase tracking-widest text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="relative py-32 px-6 z-10">
        <div className="container mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">Core Systems</h2>
            <p className="text-accent-secondary text-xl font-medium max-w-2xl mx-auto">
              A meticulously engineered stack to guarantee linguistic acceleration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`group relative glass-effect rounded-[2.5rem] p-10 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden ${feature.borderColor}`}
              >
                {/* Feature background glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700"></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 transition-all duration-500 shadow-xl mb-8 ${feature.bgGlow}`}>
                    <div className={`${feature.iconColor} opacity-80 group-hover:opacity-100 transition-opacity duration-500`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className={`text-2xl font-black text-white mb-4 tracking-tight transition-colors ${feature.iconColor.replace('text-', 'group-hover:text-')}`}>{feature.title}</h3>
                  <p className="text-accent-secondary font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-32 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-black/30 z-10">
        <div className="container mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">Operational Flow</h2>
            <p className="text-accent-secondary text-xl font-medium">Initialize your linguistic subroutines.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-[4rem] left-0 w-full h-[2px] bg-gradient-to-r from-brand-indigo/0 via-brand-indigo/30 to-brand-indigo/0 z-0"></div>

            {[
              { step: "01", title: "Authentication", desc: "Securely connect to the terminal and establish your baseline metrics.", color: "text-brand-indigo", border: "border-brand-indigo" },
              { step: "02", title: "Processing", desc: "Our engine compiles a bespoke syllabus tailored precisely to your cognitive load.", color: "text-primary", border: "border-primary" },
              { step: "03", title: "Execution", desc: "Engage with neural tasks and human operatives to finalize fluency.", color: "text-brand-green", border: "border-brand-green" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="relative z-10"
              >
                <div className="glass-premium p-10 rounded-[3rem] border border-white/10 hover:border-white/30 transition-all duration-500 relative group h-full shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                  <div className={`absolute -top-8 left-10 w-16 h-16 bg-[#080C14] border-2 ${item.border} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    <span className={`text-xl font-black ${item.color}`}>{item.step}</span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{item.title}</h3>
                    <p className="text-accent-secondary font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-32 px-6 z-10">
        <div className="container mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">Operator Feedback</h2>
            <p className="text-accent-secondary text-xl font-medium">Telemetry from verified alumni.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sisay Atinkut", role: "University Student", text: "The terminal architecture is flawless. FidelAI optimized my syntax in a fraction of standard computational time." },
              { name: "Walelign Enemayehu", role: "Professional Analyst", text: "Vocal rendering feedback ensures my outputs are universally readable. Outstanding latency and support." },
              { name: "Yohanes Debebe", role: "Instructional Designer", text: "A seamless integration of machine logic and organic human interaction. Highly recommended." }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-effect p-10 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-500 shadow-xl"
              >
                <div className="flex items-center mb-8">
                  <div className="w-14 h-14 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center mr-5 shadow-lg">
                    <span className="text-brand-green font-black text-xl">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg tracking-tight">{testimonial.name}</h4>
                    <p className="text-accent-muted text-xs uppercase tracking-widest font-bold mt-1">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-white/80 italic font-medium leading-relaxed mb-6">"{testimonial.text}"</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-brand-indigo fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative glass-premium rounded-[3rem] p-12 md:p-20 text-center border border-brand-indigo/30 overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.1)]"
          >
            {/* CTA Background Layer */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-indigo/10 to-transparent z-0 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
                Ready to Upgrade Your <br className="hidden md:block"/> 
                <span className="gradient-text">Linguistic Engine?</span>
              </h2>
              <p className="text-accent-secondary text-xl mb-12 max-w-2xl mx-auto font-medium">
                Connect to the FidelAI mainframe and activate your 7-day priority access trial. No configuration required.
              </p>
              <button 
                onClick={() => navigate('/register')}
                className="group px-12 py-6 bg-primary text-[#080C14] rounded-[2rem] hover:opacity-90 transition-all transform hover:-translate-y-1 yellow-glow text-xl font-black tracking-wider uppercase inline-flex items-center space-x-4"
              >
                <span>Authorize Access</span>
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-premium border-b-0 border-white/5 border-t rounded-none text-white py-16 px-6 relative z-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start text-center md:text-left">
            <div className="mb-10 md:mb-0">
              <div className="flex items-center space-x-3 mb-4 justify-center md:justify-start">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <GraduationCap className="w-5 h-5 text-brand-green" />
                </div>
                <span className="text-2xl font-black tracking-tighter">Fidel<span className="text-brand-green">AI</span></span>
              </div>
              <p className="text-accent-muted font-bold uppercase tracking-widest text-xs max-w-xs">
                Educational Engine v2.0
              </p>
            </div>
            
            <div className="flex flex-col md:items-end">
              <p className="text-accent-muted text-sm font-medium mb-2">© 2026 FidelAI Core Systems.</p>
              <p className="text-accent-muted text-xs uppercase tracking-widest font-bold">
                Bahir Dar University - Final Year Protocol
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;