import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Footer } from "@/widgets/layout";
import {
  CodeBracketIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  SparklesIcon
} from "@heroicons/react/24/solid";

// --- CUSTOM ICONS (For Github/LinkedIn) ---
const GithubIcon = (props) => (
  <svg role="img" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297 24 5.67 18.627.297 12 .297z" />
  </svg>
);

const LinkedInIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.557V9H7.12v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
  </svg>
);

// --- PROFILE HERO COMPONENT ---
const ProfileHero = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.2], [20, 0]), { stiffness: 100, damping: 30 });
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.2], [0.9, 1]), { stiffness: 100, damping: 30 });
  const translateY = useSpring(useTransform(scrollYProgress, [0, 0.2], [-30, 0]), { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.8, 1]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center -mt-16 pt-32 md:pt-48 min-h-[90vh] bg-[#050505] overflow-hidden"
    >
      {/* Background Gradients (Matches Landing) */}
      <div className="absolute inset-0 w-full h-full bg-[#050505] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 z-0 h-screen w-screen bg-transparent bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,163,255,0.15),transparent)] pointer-events-none" />

      {/* Main Profile Card (3D Tilt Effect) */}
      <motion.div
        style={{ rotateX, scale, y: translateY, opacity, perspective: 1200, transformStyle: "preserve-3d" }}
        className="relative z-20 w-[95%] max-w-3xl mx-auto"
      >
        <div className="relative rounded-[3rem] p-1 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-2xl shadow-2xl">
          <div className="rounded-[2.8rem] overflow-hidden bg-[#0a0a0c] border border-white/5 relative p-12 md:p-16 flex flex-col items-center text-center">

            {/* Background Glow inside card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />

            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-md opacity-50" />
              <img
                src="https://avatars.githubusercontent.com/u/176177158?v=4"
                alt="Subarta Ghosh"
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0a0a0c] shadow-xl object-cover"
              />
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-[#0a0a0c] rounded-full z-10" />
            </motion.div>

            {/* Name & Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-sm font-bold mb-6 tracking-wide uppercase">
                <SparklesIcon className="w-4 h-4" /> Creator & Builder
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                Subarta Ghosh
              </h1>
            </motion.div>

            {/* Tags Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-sm">
                <CodeBracketIcon className="w-4 h-4" /> Full Stack Dev
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm">
                <AcademicCapIcon className="w-4 h-4" /> CS Student
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-slate-300 font-bold text-sm">
                <BuildingLibraryIcon className="w-4 h-4" /> VIT Vellore
              </div>
            </motion.div>

            {/* Bio Text */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed font-medium"
            >
              Building smart tools that help students master concepts with ease.
              Focused on creating neural-driven products, clean design, and steady growth.
            </motion.p>

            {/* Social Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a href="https://www.linkedin.com/in/subhh/" target="_blank" rel="noopener noreferrer">
                <button className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300">
                  <LinkedInIcon className="w-5 h-5" /> LinkedIn
                </button>
              </a>

              <a href="https://github.com/subh-ghosh" target="_blank" rel="noopener noreferrer">
                <button className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/10 text-slate-300 font-bold text-lg hover:bg-white/5 hover:text-white transition-colors">
                  <GithubIcon className="w-5 h-5" /> GitHub
                </button>
              </a>
            </motion.div>

          </div>
        </div>

        {/* Glow Under Card */}
        <div className="absolute -inset-10 bg-blue-600/20 blur-[100px] -z-10 rounded-[3rem]" />
      </motion.div>
    </div>
  );
};

// --- MAIN PAGE WRAPPER ---
export function About() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30">

      {/* 1. Profile Hero Section */}
      <ProfileHero />

      {/* 2. Footer */}
      <div className="relative z-10 bg-[#050505]">
        <Footer />
      </div>

    </div>
  );
}

export default About;