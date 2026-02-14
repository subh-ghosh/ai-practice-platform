import React from "react";
import { motion } from "framer-motion";
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

// --- ANIMATIONS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function About() {
  return (
    <div className="relative w-full overflow-hidden bg-[#050505] min-h-screen flex flex-col font-sans selection:bg-blue-500/30">

      {/* Background Gradients & Grid (Matches Landing Page) */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
      <div className="absolute top-0 z-0 h-screen w-screen bg-transparent bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,163,255,0.15),transparent)] pointer-events-none" />

      {/* Main Content Section */}
      {/* -mt-16 to pull it seamlessly under the transparent navbar */}
      <section className="relative z-10 flex-1 w-full flex items-center justify-center pt-32 pb-16 -mt-16">
        <div className="container mx-auto px-4 max-w-2xl">

          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            {/* The Compact Glass Card */}
            <div className="rounded-[2.5rem] border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-2xl overflow-hidden p-8 md:p-12 relative flex flex-col items-center text-center">

              {/* Internal subtle glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Avatar with Spring Animation */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                className="relative mb-6"
              >
                {/* Glowing ring behind avatar */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 blur-lg opacity-50" />
                <img
                  src="https://avatars.githubusercontent.com/u/176177158?v=4"
                  alt="Subarta Ghosh"
                  className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#0a0a0c] shadow-xl object-cover hover:scale-105 transition-transform duration-300"
                />
                {/* Online Status Dot */}
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-[3px] border-[#0a0a0c] rounded-full z-10" />
              </motion.div>

              {/* Creator Badge */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[11px] font-bold mb-4 tracking-wide uppercase">
                  <SparklesIcon className="w-3 h-3" /> Creator & Builder
                </div>
              </motion.div>

              {/* Name */}
              <motion.h1
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight"
              >
                Subarta Ghosh
              </motion.h1>

              {/* Tags Grid */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-2 mb-8"
              >
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-xs">
                  <CodeBracketIcon className="w-3.5 h-3.5" /> Full Stack Dev
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs">
                  <AcademicCapIcon className="w-3.5 h-3.5" /> CS Student
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-bold text-xs">
                  <BuildingLibraryIcon className="w-3.5 h-3.5" /> VIT Vellore
                </div>
              </motion.div>

              {/* Bio Text */}
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm md:text-base text-slate-400 max-w-md mx-auto mb-8 leading-relaxed font-medium"
              >
                Building smart tools that help students master concepts with ease.
                Focused on creating neural-driven products, clean design, and steady growth.
              </motion.p>

              {/* Social Actions */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap justify-center gap-3 w-full"
              >
                <a href="https://www.linkedin.com/in/subhh/" target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300">
                    <LinkedInIcon className="w-4 h-4" /> LinkedIn
                  </button>
                </a>

                <a href="https://github.com/subh-ghosh" target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/10 text-slate-300 font-bold text-sm hover:bg-white/5 hover:text-white transition-colors duration-300">
                    <GithubIcon className="w-4 h-4" /> GitHub
                  </button>
                </a>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* Footer remains at the bottom of the page */}
      <div className="relative z-20">
        <Footer />
      </div>

    </div>
  );
}

export default About;