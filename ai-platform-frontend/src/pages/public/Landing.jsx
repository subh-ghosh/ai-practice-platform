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
          {/* UPDATED BLUE BUTTON */}
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

// 3. Bento Grid Feature Section
const BentoGrid = () => {
  const features = [
    {
      title: "Smart Code Evaluator",
      description: "Our neural engine checks logic & OOP principles instantly.",
      icon: <CodeBracketIcon className="w-6 h-6 text-white" />,
      className: "md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white",
      darkText: false
    },
    {
      title: "Global Leaderboard",
      description: "Compete daily for XP and streaks.",
      icon: <TrophyIcon className="w-6 h-6 text-amber-500" />,
      className: "md:col-span-1 bg-slate-50 dark:bg-[#121215] border border-slate-200 dark:border-white/10",
      darkText: true
    },
    {
      title: "Deep Analytics",
      description: "Visualize your mastery over time with interactive charts.",
      icon: <ChartBarIcon className="w-6 h-6 text-purple-500" />,
      className: "md:col-span-1 bg-slate-50 dark:bg-[#121215] border border-slate-200 dark:border-white/10",
      darkText: true
    },
    {
      title: "Infinite Question Bank",
      description: "Never run out of practice. AI generates unique scenarios.",
      icon: <BoltIcon className="w-6 h-6 text-yellow-400" />,
      className: "md:col-span-2 bg-slate-900 dark:bg-white/5 border border-slate-800 dark:border-white/10 text-white",
      darkText: false
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-[#050505] px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Everything you need to <span className="text-blue-600 dark:text-blue-400">excel</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A comprehensive suite of tools designed to take you from beginner to professional developer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:auto-rows-[300px]">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-[2rem] p-8 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group ${feature.className}`}
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.darkText ? 'bg-slate-100 dark:bg-white/10' : 'bg-white/20'}`}>
                {feature.icon}
              </div>

              <div>
                <h3 className={`text-2xl font-bold mb-2 ${feature.darkText ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
                  {feature.title}
                </h3>
                <p className={`text-lg leading-relaxed ${feature.darkText ? 'text-slate-600 dark:text-slate-400' : 'text-blue-100'}`}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
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

      {/* 3. Modern Bento Grid Features */}
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