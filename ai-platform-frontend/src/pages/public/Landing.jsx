import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  SparklesIcon,
  BoltIcon,
  ChartBarIcon,
  TrophyIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  ArrowRightIcon
} from "@heroicons/react/24/solid";
import { Footer } from "@/widgets/layout";

// --- COMPONENTS ---

// 1. Hero Section (Restored Checkered Glow)
const HeroScrollDemo = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), { stiffness: 100, damping: 30 });
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.9, 1]), { stiffness: 100, damping: 30 });
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-50, 0]), { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-start pt-20 md:pt-40 min-h-[120vh] bg-[#050505] overflow-hidden"
    >
      {/* RESTORED: Checkered Background & Overhead Glow */}
      <div className="absolute inset-0 w-full h-full bg-[#050505] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 z-0 h-screen w-screen bg-transparent bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,163,255,0.15),transparent)] pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-sm font-medium mb-8"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>The Intelligent Way to Code</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-8xl font-black tracking-tight text-white mb-8"
        >
          Master Tech with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500">
            Intelligent Guidance
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Not just an editor. A complete ecosystem to generate challenges,
          track mastery, and visualize your growth in real-time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-5 justify-center"
        >
          <button
            onClick={() => navigate("/auth/sign-up")}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300"
          >
            Start Learning Free
          </button>

          <button
            onClick={() => navigate("/auth/sign-in")}
            className="px-8 py-4 rounded-full border border-white/10 text-slate-300 font-medium text-lg hover:bg-white/5 hover:text-white transition-colors"
          >
            View Dashboard
          </button>
        </motion.div>
      </div>

      {/* 3D Dashboard Mockup */}
      <motion.div
        style={{ rotateX, scale, y: translateY, opacity, perspective: 1200, transformStyle: "preserve-3d" }}
        className="relative z-20 mt-10 w-[95%] md:w-[85%] max-w-7xl mx-auto"
      >
        <div className="relative rounded-[2rem] p-3 bg-white/5 ring-1 ring-white/10 backdrop-blur-2xl shadow-2xl">
          <div className="rounded-[1.5rem] overflow-hidden shadow-2xl bg-[#0a0a0c] border border-white/5 relative">

            {/* Mockup Interface */}
            <div className="w-full aspect-[16/9] bg-[#0a0a0c] flex relative overflow-hidden">
              {/* Sidebar Mockup */}
              <div className="w-72 border-r border-white/5 hidden md:flex flex-col p-6 gap-6 bg-[#0a0a0c]">
                <div className="h-8 w-32 bg-blue-500/20 rounded-lg animate-pulse"></div>
                <div className="space-y-4 mt-4">
                  <div className="h-4 w-full bg-white/5 rounded"></div>
                  <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                  <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                </div>
              </div>

              {/* Main Content Mockup */}
              <div className="flex-1 p-8 bg-[#0f1115]">
                <div className="flex justify-between items-center mb-10">
                  <div className="h-10 w-64 bg-white/5 rounded-lg"></div>
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 border border-blue-500/30"></div>
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 border border-purple-500/30"></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Big Card */}
                  <div className="col-span-2 h-72 bg-gradient-to-br from-blue-900/10 to-transparent rounded-2xl border border-blue-500/20 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] group-hover:bg-blue-600/20 transition-all"></div>
                    <div className="relative z-10 text-blue-400/60 text-sm font-mono tracking-widest uppercase mb-2">Active Module</div>
                    <div className="relative z-10 text-white text-4xl font-bold">Python Mastery</div>
                    <div className="mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Side Cards */}
                  <div className="col-span-1 h-72 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Glow Under Dashboard */}
        <div className="absolute -inset-10 bg-blue-600/20 blur-[100px] -z-10 rounded-[3rem]" />
      </motion.div>
    </div>
  );
};

// 2. Infinite Marquee (Gradient Fade)
const SubjectMarquee = () => {
  const subjects = [
    "Python Automation", "Java OOP", "Data Structures", "React Hooks",
    "System Design", "SQL & Databases", "Algorithms", "Machine Learning Basics",
    "REST APIs", "Docker", "Next.js", "TypeScript"
  ];

  return (
    <div className="py-12 bg-[#050505] border-y border-white/5 overflow-hidden flex relative z-10">
      {/* Side Fade Masks */}
      <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-[#050505] to-transparent z-10" />
      <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-[#050505] to-transparent z-10" />

      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      >
        {[...subjects, ...subjects, ...subjects].map((tech, i) => (
          <div key={i} className="flex items-center gap-3 text-lg font-bold text-slate-500 select-none">
            <span className="w-2 h-2 rounded-full bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            {tech}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// 3. Ultra-Premium Bento Grid (Neon Edition)
const BentoGrid = () => {
  return (
    <section className="py-32 bg-[#050505] px-4 relative overflow-hidden z-10">

      {/* Background Ambient Glow (Global) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-sm font-bold mb-6 tracking-wide uppercase"
          >
            <BoltIcon className="w-4 h-4" /> Power Your Growth
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            An Ecosystem Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Excellence</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Stop jumping between tutorials and IDEs. We’ve unified the entire learning lifecycle into one seamless, intelligent platform.
          </p>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[340px]">

          {/* Card 1: Code Evaluator (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="md:col-span-2 group relative rounded-[2rem] overflow-hidden bg-[#0a0a0c] border border-white/10 p-8 md:p-10 hover:border-blue-500/30 transition-all duration-500 shadow-lg"
          >
            {/* NEON GLOW EFFECT */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-all duration-700" />

            {/* Decorative Mockup Editor */}
            <div className="absolute -bottom-12 -right-12 w-96 h-64 bg-[#0f1117] rounded-xl border border-white/10 shadow-2xl overflow-hidden transform group-hover:-translate-y-6 group-hover:-translate-x-6 transition-transform duration-500 z-10">
              <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="p-4 font-mono text-sm text-blue-400/80 leading-relaxed">
                <p><span className="text-purple-400">class</span> <span className="text-yellow-300">Solution</span> {'{'}</p>
                <p className="pl-4"><span className="text-purple-400">def</span> solve(self):</p>
                <p className="pl-8 text-slate-500"># AI suggestions active</p>
                <p className="pl-8 text-green-400">return "Optimized"</p>
                <p className="pl-4">{'}'}</p>
              </div>
            </div>

            <div className="relative z-20 h-full flex flex-col justify-between w-full md:w-2/3">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                <CodeBracketIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-md">Smart Code Evaluator</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Write Java or Python directly in the browser. Our neural engine analyzes logic and OOP principles instantly.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Leaderboard (Span 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
            className="md:col-span-1 group relative rounded-[2rem] overflow-hidden bg-[#0a0a0c] border border-white/10 p-8 hover:border-amber-500/30 transition-all duration-500 shadow-lg"
          >
            {/* NEON GLOW EFFECT */}
            <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-700" />

            {/* Decorative Leaderboard Snippet */}
            <div className="absolute top-8 right-8 flex flex-col gap-2 opacity-20 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="h-8 w-24 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center px-3 gap-2 backdrop-blur-sm">
                <span className="text-amber-500 text-xs font-bold">#1</span>
                <div className="h-1.5 w-12 bg-amber-500/40 rounded-full" />
              </div>
              <div className="h-8 w-20 bg-slate-500/10 border border-slate-500/20 rounded-lg flex items-center px-3 gap-2 ml-4 backdrop-blur-sm">
                <span className="text-slate-500 text-xs font-bold">#2</span>
                <div className="h-1.5 w-8 bg-slate-500/40 rounded-full" />
              </div>
            </div>

            <div className="relative z-20 h-full flex flex-col justify-end mt-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform duration-300">
                <TrophyIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Global Rank</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Compete with peers, maintain your streak, and climb the ranks.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Deep Analytics (Span 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            className="md:col-span-1 group relative rounded-[2rem] overflow-hidden bg-[#0a0a0c] border border-white/10 p-8 hover:border-purple-500/30 transition-all duration-500 shadow-lg flex flex-col justify-between"
          >
            {/* NEON GLOW EFFECT */}
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-purple-500/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-700" />

            {/* Decorative Mini Chart */}
            <div className="flex items-end gap-2 h-24 mt-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
              <div className="w-1/4 bg-purple-500/20 rounded-t-md h-[40%] group-hover:h-[60%] transition-all duration-500 delay-75" />
              <div className="w-1/4 bg-purple-500/40 rounded-t-md h-[70%] group-hover:h-[85%] transition-all duration-500 delay-100" />
              <div className="w-1/4 bg-purple-500/60 rounded-t-md h-[30%] group-hover:h-[50%] transition-all duration-500 delay-150" />
              <div className="w-1/4 bg-purple-600 rounded-t-md h-[90%] group-hover:h-[100%] transition-all duration-500 delay-200 shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
            </div>

            <div className="relative z-20 mt-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                <ChartBarIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Analytics</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Visualize your mastery with interactive charts.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Infinite Question Bank (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
            className="md:col-span-2 group relative rounded-[2rem] overflow-hidden bg-[#0a0a0c] border border-white/10 p-8 md:p-10 hover:border-indigo-500/30 transition-all duration-500 shadow-lg"
          >
            {/* NEON GLOW EFFECT */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/20 blur-[100px] rounded-full group-hover:bg-indigo-600/30 transition-colors duration-700" />

            {/* Decorative Question Cards */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:block">
              <div className="w-48 h-32 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 transform rotate-6 translate-x-4 translate-y-4 shadow-xl"></div>
              <div className="absolute inset-0 w-48 h-32 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 transform -rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 shadow-2xl flex flex-col gap-3">
                <div className="h-3 w-1/2 bg-white/40 rounded-full"></div>
                <div className="h-2 w-full bg-white/20 rounded-full mt-2"></div>
                <div className="h-2 w-3/4 bg-white/20 rounded-full"></div>
              </div>
            </div>

            <div className="relative z-20 h-full flex flex-col justify-between md:w-1/2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                <SparklesIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">Infinite Practice</h3>
                <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-300 transition-colors">
                  Never run out of material. Our AI generates unique scenarios on any topic, tailored to your skill level.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

// 4. Final CTA (Glassmorphism + Neon)
const BigCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-[#050505] px-4 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden group"
        >
          {/* Inner Glow on Hover */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <div className="relative z-10">
            <AcademicCapIcon className="w-16 h-16 text-blue-500 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Start your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                7-Day Streak
              </span>
            </h2>

            <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">
              Join thousands of developers mastering Data Structures and Algorithms with our intelligent platform.
            </p>

            <button
              onClick={() => navigate("/auth/sign-up")}
              className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]"
            >
              <span>Launch Study Plan</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// --- MAIN PAGE COMPONENT ---

export function Landing() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30">

      {/* 1. Hero with Scroll Zoom Effect */}
      <HeroScrollDemo />

      {/* 2. Infinite Marquee */}
      <SubjectMarquee />

      {/* 3. Modern Bento Grid Features */}
      <BentoGrid />

      {/* 4. Final CTA */}
      <BigCTA />

      {/* 5. Footer */}
      <div className="relative z-10 bg-[#050505]">
        <Footer />
      </div>

    </div>
  );
}

export default Landing;