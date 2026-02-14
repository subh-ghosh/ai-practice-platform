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

// 1. The Scroll-Zoom Hero Container
const HeroScrollDemo = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), {
    stiffness: 100,
    damping: 30,
  });
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.9, 1]), {
    stiffness: 100,
    damping: 30,
  });
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-50, 0]), {
    stiffness: 100,
    damping: 30,
  });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-start pt-20 md:pt-40 min-h-[140vh] bg-slate-50 dark:bg-[#050505] overflow-hidden"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-[#050505] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 z-0 h-screen w-screen bg-transparent bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,163,255,0.13),rgba(255,255,255,0))]" />

      {/* Header Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>The Future of Learning is Here</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6"
        >
          Master Tech with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
            Intelligent Guidance
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8"
        >
          Not just an editor. A complete ecosystem to generate challenges,
          track mastery, and visualize your growth in real-time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate("/auth/sign-up")}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:scale-105 hover:shadow-blue-500/40 transition-all shadow-xl shadow-blue-500/20"
          >
            Start Learning Free
          </button>

          <button
            onClick={() => navigate("/auth/sign-in")}
            className="px-8 py-4 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            View Dashboard
          </button>
        </motion.div>
      </div>

      {/* The 3D Scroll Dashboard Mockup */}
      <motion.div
        style={{
          rotateX,
          scale,
          y: translateY,
          opacity,
          perspective: 1000,
          transformStyle: "preserve-3d",
        }}
        className="relative z-20 mt-10 w-[90%] md:w-[80%] max-w-6xl mx-auto"
      >
        <div className="relative rounded-[2rem] p-2 bg-slate-900/5 dark:bg-white/10 ring-1 ring-slate-900/10 dark:ring-white/20 backdrop-blur-xl">
          <div className="rounded-[1.5rem] overflow-hidden shadow-2xl bg-slate-900 border border-slate-800">
            {/* Mockup UI - You can replace this whole block with a high-res <img> of your real dashboard later */}
            <div className="w-full aspect-[16/9] bg-[#0f1117] flex relative overflow-hidden">
              {/* Mockup UI - Sidebar */}
              <div className="w-64 border-r border-white/5 hidden md:flex flex-col p-6 gap-4">
                <div className="h-8 w-24 bg-blue-600/20 rounded-lg animate-pulse"></div>
                <div className="h-4 w-full bg-white/5 rounded mt-8"></div>
                <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                <div className="h-4 w-1/2 bg-white/5 rounded"></div>
              </div>
              {/* Mockup UI - Main */}
              <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="h-10 w-64 bg-white/5 rounded-lg"></div>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20"></div>
                    <div className="h-10 w-10 rounded-full bg-purple-500/20"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 h-64 bg-gradient-to-br from-blue-900/20 to-slate-900/50 rounded-xl border border-blue-500/10 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-500/5 blur-3xl"></div>
                    <div className="relative z-10 text-white/50 text-sm font-mono">Current Progress</div>
                    <div className="relative z-10 text-white text-3xl font-bold mt-2">Python Mastery</div>
                  </div>
                  <div className="col-span-1 h-64 bg-slate-800/30 rounded-xl border border-white/5"></div>
                  <div className="col-span-1 h-40 bg-slate-800/30 rounded-xl border border-white/5"></div>
                  <div className="col-span-2 h-40 bg-slate-800/30 rounded-xl border border-white/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glow under the image */}
        <div className="absolute -inset-4 bg-blue-500/20 blur-3xl -z-10 rounded-[3rem]" />
      </motion.div>
    </div>
  );
};

// 2. Infinite Marquee for Subjects
const SubjectMarquee = () => {
  const subjects = [
    "Python Automation", "Java OOP", "Data Structures", "React Hooks",
    "System Design", "SQL & Databases", "Algorithms", "Machine Learning Basics",
    "REST APIs", "Docker", "Next.js", "TypeScript"
  ];

  return (
    <div className="py-10 bg-white dark:bg-[#050505] border-y border-slate-100 dark:border-white/5 overflow-hidden flex">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
      >
        {[...subjects, ...subjects, ...subjects].map((tech, i) => (
          <div key={i} className="flex items-center gap-2 text-xl font-bold text-slate-300 dark:text-slate-700 select-none">
            <span className="text-blue-500">•</span>
            {tech}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// 3. Ultra-Premium Bento Grid Feature Section
const BentoGrid = () => {
  return (
    <section className="py-32 bg-slate-50 dark:bg-[#050505] px-4 relative overflow-hidden z-10">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-sm font-bold mb-6 tracking-wide uppercase"
          >
            <BoltIcon className="w-4 h-4" /> Power Your Growth
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            An Ecosystem Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Excellence</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Stop jumping between tutorials and IDEs. We’ve unified the entire learning lifecycle into one seamless, intelligent platform.
          </p>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[340px]">

          {/* Card 1: Code Evaluator (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 group relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-slate-800 p-8 md:p-10 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors shadow-sm"
          >
            {/* Background Gradient & Glow */}
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)]" />

            {/* Decorative Mockup Editor */}
            <div className="absolute -bottom-12 -right-12 w-96 h-64 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden transform group-hover:-translate-y-4 group-hover:-translate-x-4 transition-transform duration-500">
              <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="p-4 font-mono text-sm text-blue-400/80">
                <p><span className="text-purple-400">class</span> <span className="text-yellow-300">Solution</span> {'{'}</p>
                <p className="pl-4"><span className="text-purple-400">public static</span> void main(String[] args) {'{'}</p>
                <p className="pl-8 text-slate-400">// AI analyzing syntax...</p>
                <p className="pl-8 text-green-400">System.out.println("Perfect!");</p>
                <p className="pl-4">{'}'}</p>
                <p>{'}'}</p>
              </div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between w-2/3">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <CodeBracketIcon className="w-7 h-7 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Smart Code Evaluator</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  Write Java or Python directly in the browser. Our neural engine analyzes logic and OOP principles instantly, offering precise hints.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Leaderboard (Span 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 group relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-slate-800 p-8 hover:border-amber-500/50 transition-colors shadow-sm"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.05),transparent_60%)] dark:bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.1),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Decorative Leaderboard Snippet */}
            <div className="absolute top-8 right-8 flex flex-col gap-2 opacity-30 dark:opacity-20 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="h-8 w-32 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center px-3 gap-2">
                <span className="text-amber-500 text-xs font-bold">1</span>
                <div className="h-2 w-16 bg-amber-500/40 rounded-full" />
              </div>
              <div className="h-8 w-28 bg-slate-500/10 border border-slate-500/20 rounded-lg flex items-center px-3 gap-2 ml-4">
                <span className="text-slate-500 text-xs font-bold">2</span>
                <div className="h-2 w-12 bg-slate-500/40 rounded-full" />
              </div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end mt-16">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                <TrophyIcon className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Global Rank</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Compete with peers, maintain your streak, and earn XP to climb to the top.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Deep Analytics (Span 1) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 group relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-[#0a0a0c] border border-slate-200 dark:border-slate-800 p-8 hover:border-purple-500/50 transition-colors shadow-sm flex flex-col justify-between"
          >
            {/* Decorative Mini Chart */}
            <div className="flex items-end gap-2 h-24 mt-4 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
              <div className="w-1/4 bg-purple-500/20 rounded-t-md h-[40%] group-hover:h-[60%] transition-all duration-500 delay-75" />
              <div className="w-1/4 bg-purple-500/40 rounded-t-md h-[70%] group-hover:h-[85%] transition-all duration-500 delay-100" />
              <div className="w-1/4 bg-purple-500/60 rounded-t-md h-[30%] group-hover:h-[50%] transition-all duration-500 delay-150" />
              <div className="w-1/4 bg-purple-600 rounded-t-md h-[90%] group-hover:h-[100%] transition-all duration-500 delay-200" />
            </div>

            <div className="relative z-10 mt-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <ChartBarIcon className="w-7 h-7 text-purple-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Deep Analytics</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Visualize your mastery over time with beautiful, interactive charts.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Infinite Question Bank (Span 2) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 group relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 md:p-10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all"
          >
            {/* Abstract floating shapes for "Infinite/AI" vibe */}
            <div className="absolute top-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute -bottom-10 right-32 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 delay-100" />

            {/* Decorative Question Cards */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:block">
              <div className="w-48 h-32 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 transform rotate-6 translate-x-4 translate-y-4 shadow-xl"></div>
              <div className="absolute inset-0 w-48 h-32 bg-white/10 backdrop-blur-md rounded-xl border border-white/30 p-4 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-xl flex flex-col gap-3">
                <div className="h-3 w-1/2 bg-white/40 rounded-full"></div>
                <div className="h-2 w-full bg-white/20 rounded-full mt-2"></div>
                <div className="h-2 w-3/4 bg-white/20 rounded-full"></div>
              </div>
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between md:w-1/2">
              <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center mb-6">
                <SparklesIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">Infinite Practice</h3>
                <p className="text-blue-100 text-lg leading-relaxed">
                  Never run out of material. Our AI generates unique scenarios, challenges, and trivia on any topic, at your exact difficulty level.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

// 4. Final CTA
const BigCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-slate-50 dark:bg-[#050505] px-4 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-[#121215]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[3rem] p-12 md:p-20 shadow-2xl"
        >
          <AcademicCapIcon className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
            Start your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              7-Day Streak
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-xl mx-auto">
            Join thousands of developers mastering Data Structures and Algorithms with our intelligent platform.
          </p>

          <button
            onClick={() => navigate("/auth/sign-up")}
            className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 shadow-xl shadow-blue-600/30"
          >
            <span>Launch Study Plan</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}

// --- MAIN PAGE COMPONENT ---

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30">

      {/* 1. Hero with Scroll Zoom Effect */}
      <HeroScrollDemo />

      {/* 2. Infinite Marquee */}
      <SubjectMarquee />

      {/* 3. Ultra-Premium Bento Grid Features */}
      <BentoGrid />

      {/* 4. Final CTA */}
      <BigCTA />

      {/* 5. Footer */}
      <div className="relative z-10 bg-white dark:bg-[#050505]">
        <Footer />
      </div>

    </div>
  );
}

export default Landing;