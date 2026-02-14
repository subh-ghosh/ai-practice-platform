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
  ArrowRightIcon,
  CpuChipIcon,
  CircleStackIcon,
  WindowIcon
} from "@heroicons/react/24/solid";
import { Footer } from "@/widgets/layout";

// --- 1. HERO SECTION ---
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
    <div ref={containerRef} className="relative flex flex-col items-center justify-start pt-20 md:pt-40 min-h-[120vh] bg-[#050505] overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-[#050505] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 z-0 h-screen w-screen bg-transparent bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,163,255,0.15),transparent)] pointer-events-none" />

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

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-5xl md:text-8xl font-black tracking-tight text-white mb-8">
          Master Tech with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500">Intelligent Guidance</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Not just an editor. A complete ecosystem to generate challenges, track mastery, and visualize your growth in real-time.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col sm:flex-row gap-5 justify-center">
          <button onClick={() => navigate("/auth/sign-up")} className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300">
            Start Learning Free
          </button>
          <button onClick={() => navigate("/auth/sign-in")} className="px-8 py-4 rounded-full border border-white/10 text-slate-300 font-medium text-lg hover:bg-white/5 hover:text-white transition-colors">
            View Dashboard
          </button>
        </motion.div>
      </div>

      <motion.div style={{ rotateX, scale, y: translateY, opacity, perspective: 1200, transformStyle: "preserve-3d" }} className="relative z-20 mt-10 w-[95%] md:w-[85%] max-w-7xl mx-auto">
        <div className="relative rounded-[2rem] p-3 bg-white/5 ring-1 ring-white/10 backdrop-blur-2xl shadow-2xl">
          <div className="rounded-[1.5rem] overflow-hidden shadow-2xl bg-[#0a0a0c] border border-white/5 relative">
            <div className="w-full aspect-[16/9] bg-[#0a0a0c] flex relative overflow-hidden">
              <div className="w-72 border-r border-white/5 hidden md:flex flex-col p-6 gap-6 bg-[#0a0a0c]">
                <div className="h-8 w-32 bg-blue-500/20 rounded-lg animate-pulse"></div>
                <div className="space-y-4 mt-4">
                  <div className="h-4 w-full bg-white/5 rounded"></div><div className="h-4 w-3/4 bg-white/5 rounded"></div><div className="h-4 w-1/2 bg-white/5 rounded"></div>
                </div>
              </div>
              <div className="flex-1 p-8 bg-[#0f1115]">
                <div className="flex justify-between items-center mb-10">
                  <div className="h-10 w-64 bg-white/5 rounded-lg"></div>
                  <div className="flex gap-3"><div className="h-10 w-10 rounded-full bg-blue-500/20 border border-blue-500/30"></div><div className="h-10 w-10 rounded-full bg-purple-500/20 border border-purple-500/30"></div></div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 h-72 bg-gradient-to-br from-blue-900/10 to-transparent rounded-2xl border border-blue-500/20 p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] group-hover:bg-blue-600/20 transition-all"></div>
                    <div className="relative z-10 text-blue-400/60 text-sm font-mono tracking-widest uppercase mb-2">Active Module</div>
                    <div className="relative z-10 text-white text-4xl font-bold">Python Mastery</div>
                    <div className="mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full w-2/3 bg-blue-500 rounded-full"></div></div>
                  </div>
                  <div className="col-span-1 h-72 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
          </div>
        </div>
        <div className="absolute -inset-10 bg-blue-600/20 blur-[100px] -z-10 rounded-[3rem]" />
      </motion.div>
    </div>
  );
};

// --- 2. MARQUEE ---
const SubjectMarquee = () => {
  const subjects = ["Python Automation", "Java OOP", "Data Structures", "React Hooks", "System Design", "SQL & Databases", "Algorithms", "REST APIs", "TypeScript"];
  return (
    <div className="py-12 bg-[#050505] border-y border-white/5 overflow-hidden flex relative z-10">
      <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-[#050505] to-transparent z-10" />
      <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-[#050505] to-transparent z-10" />
      <motion.div className="flex gap-12 whitespace-nowrap" animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }}>
        {[...subjects, ...subjects, ...subjects].map((tech, i) => (
          <div key={i} className="flex items-center gap-3 text-lg font-bold text-slate-500 select-none">
            <span className="w-2 h-2 rounded-full bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>{tech}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// --- 3. BENTO GRID ---
const BentoGrid = () => {
  return (
    <section className="py-32 bg-[#050505] px-4 relative overflow-hidden z-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-sm font-bold mb-6 tracking-wide uppercase">
            <BoltIcon className="w-4 h-4" /> Power Your Growth
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">An Ecosystem Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Excellence</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[340px]">
          {/* Card 1 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="md:col-span-2 group relative rounded-[2rem] overflow-hidden bg-[#0a0a0c] border border-white/10 p-8 md:p-10 hover:border-blue-500/30 transition-all duration-500 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-all duration-700" />
            <div className="absolute -bottom-12 -right-12 w-96 h-64 bg-[#0f1117] rounded-xl border border-white/10 shadow-2xl overflow-hidden transform group-hover:-translate-y-6 group-hover:-translate-x-6 transition-transform duration-500 z-10">
              <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2"><div className="w-3 h-3 rounded-full bg-red-500/80" /><div className="w-3 h-3 rounded-full bg-yellow-500/80" /><div className="w-3 h-3 rounded-full bg-green-500/80" /></div>
              <div className="p-4 font-mono text-sm text-blue-400/80 leading-relaxed">
                <p><span className="text-purple-400">class</span> <span className="text-yellow-300">Solution</span> {'{'}</p><p className="pl-4"><span className="text-purple-400">def</span> solve(self):</p><p className="pl-8 text-slate-500"># AI suggestions active</p><p className="pl-8 text-green-400">return "Optimized"</p><p className="pl-4">{'}'}</p>
              </div>
            </div>
            <div className="relative z-20 h-full flex flex-col justify-between w-full md:w-2/3">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform duration-300"><CodeBracketIcon className="w-7 h-7" /></div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-3 drop-shadow-md">Smart Code Evaluator</h3>
                <p className="text-slate-400 text-lg leading-relaxed">Write Java or Python directly in the browser. Our neural engine analyzes logic and OOP principles instantly.</p>
              </div>
            </div>
          </motion.div>
          {/* Card 2 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="md:col-span-1 group relative rounded-[2rem] overflow-hidden bg-[#0a0a0c] border border-white/10 p-8 hover:border-amber-500/30 transition-all duration-500 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/5 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-8 right-8 flex flex-col gap-2 opacity-20 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="h-8 w-24 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center px-3 gap-2 backdrop-blur-sm"><span className="text-amber-500 text-xs font-bold">#1</span><div className="h-1.5 w-12 bg-amber-500/40 rounded-full" /></div>
            </div>
            <div className="relative z-20 h-full flex flex-col justify-end mt-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform"><TrophyIcon className="w-7 h-7" /></div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Global Rank</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Compete with peers, maintain your streak, and climb the ranks.</p>
              </div>
            </div>
          </motion.div>
          {/* Card 3 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="md:col-span-1 group relative rounded-[2rem] overflow-hidden bg-[#0a0a0c] border border-white/10 p-8 hover:border-purple-500/30 transition-all duration-500 flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-end gap-2 h-24 mt-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
              <div className="w-1/4 bg-purple-500/20 rounded-t-md h-[40%] group-hover:h-[60%] transition-all duration-500" />
              <div className="w-1/4 bg-purple-600 rounded-t-md h-[90%] group-hover:h-[100%] transition-all duration-500" />
            </div>
            <div className="relative z-20 mt-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 text-purple-500"><ChartBarIcon className="w-7 h-7" /></div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Analytics</h3>
                <p className="text-slate-400 leading-relaxed text-sm">Visualize your mastery with interactive charts.</p>
              </div>
            </div>
          </motion.div>
          {/* Card 4 */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="md:col-span-2 group relative rounded-[2rem] overflow-hidden bg-[#0a0a0c] border border-white/10 p-8 md:p-10 hover:border-indigo-500/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-20 h-full flex flex-col justify-between md:w-1/2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform"><SparklesIcon className="w-7 h-7" /></div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">Infinite Practice</h3>
                <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-300">Never run out of material. Our AI generates unique scenarios tailored to your skill level.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- 4. NEW: EXPLODING ARCHITECTURE (3D SCROLL PULL-APART) ---
const ExplodingUI = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end end"],
  });

  // Controls the 3D rotation based on scroll (Flattens out as you scroll down)
  const rotateX = useSpring(useTransform(scrollYProgress, [0, 0.5], [50, 20]), { stiffness: 60, damping: 20 });
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 0.5], [-30, -10]), { stiffness: 60, damping: 20 });
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0.8, 1]), { stiffness: 60, damping: 20 });

  // Controls the separation of layers
  const layer1Y = useSpring(useTransform(scrollYProgress, [0, 0.5], [0, -120]), { stiffness: 60, damping: 20 });
  const layer3Y = useSpring(useTransform(scrollYProgress, [0, 0.5], [0, 120]), { stiffness: 60, damping: 20 });

  const layerOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  return (
    <section ref={containerRef} className="h-[200vh] bg-[#050505] relative">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">

        {/* Background Radial */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none" />

        <div className="text-center mb-20 relative z-20">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">The Anatomy of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Speed</span></h2>
          <p className="text-slate-400 text-lg">A 3-tier architecture designed to execute and analyze code in milliseconds.</p>
        </div>

        {/* 3D Container */}
        <motion.div
          style={{ rotateX, rotateZ, scale, opacity: layerOpacity }}
          className="relative w-[400px] h-[300px] md:w-[600px] md:h-[400px] transform-style-3d"
        >
          {/* Layer 3: Database/Core (Bottom) */}
          <motion.div
            style={{ y: layer3Y }}
            className="absolute inset-0 rounded-[2rem] bg-[#0f1115]/80 backdrop-blur-md border border-purple-500/30 shadow-[0_20px_50px_rgba(168,85,247,0.2)] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#a855f71a_1px,transparent_1px),linear-gradient(to_bottom,#a855f71a_1px,transparent_1px)] bg-[size:20px_20px] rounded-[2rem]"></div>
            <CircleStackIcon className="w-20 h-20 text-purple-500/50" />
            <span className="absolute bottom-4 right-6 text-purple-400/80 font-mono font-bold tracking-widest">LAYER 3: DATA</span>
          </motion.div>

          {/* Layer 2: Neural Engine (Middle) */}
          <motion.div
            className="absolute inset-0 rounded-[2rem] bg-indigo-900/20 backdrop-blur-xl border border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.2)] flex items-center justify-center"
          >
            <CpuChipIcon className="w-24 h-24 text-indigo-400" />
            <span className="absolute bottom-4 right-6 text-indigo-400 font-mono font-bold tracking-widest">LAYER 2: NEURAL ENGINE</span>
          </motion.div>

          {/* Layer 1: UI / App (Top) */}
          <motion.div
            style={{ y: layer1Y }}
            className="absolute inset-0 rounded-[2rem] bg-[#0a0a0c]/90 backdrop-blur-2xl border border-blue-500/60 shadow-[0_-20px_50px_rgba(59,130,246,0.2)] overflow-hidden flex flex-col"
          >
            <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-600" /><div className="w-3 h-3 rounded-full bg-slate-600" />
            </div>
            <div className="flex-1 p-6 flex items-center justify-center">
              <WindowIcon className="w-20 h-20 text-blue-400" />
            </div>
            <span className="absolute bottom-4 right-6 text-blue-400 font-mono font-bold tracking-widest drop-shadow-[0_0_8px_rgba(59,130,246,1)]">LAYER 1: INTERFACE</span>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

// --- 5. NEW: SCROLL-FOCUS FEATURE CARDS (Aggressive Zoom) ---
// Note: We create a specific component for individual cards to track their own scroll position.
const FocusCard = ({ title, desc, number, color }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "center center"]
  });

  // Scale from small to massive
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0.8, 1.05]), { stiffness: 100, damping: 20 });
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 1]);

  // Dynamic border glow based on scroll
  const borderColor = useTransform(scrollYProgress, [0, 1], ["rgba(255,255,255,0.05)", color]);

  return (
    <motion.div
      ref={cardRef}
      style={{ scale, opacity, borderColor, borderWidth: '1px' }}
      className="w-full max-w-4xl mx-auto aspect-[21/9] bg-[#0a0a0c] rounded-[2.5rem] p-10 md:p-16 flex flex-col justify-center relative overflow-hidden shadow-2xl mb-32"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 blur-[120px] rounded-full pointer-events-none" style={{ backgroundColor: color }} />

      <div className="text-[120px] md:text-[200px] font-black absolute -right-10 -bottom-10 opacity-5 pointer-events-none leading-none select-none">
        {number}
      </div>

      <div className="relative z-10">
        <h3 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">{title}</h3>
        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
};

const ScrollFocusStack = () => {
  return (
    <section className="py-40 bg-[#050505] px-4 relative">
      <div className="text-center mb-40">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Ultimate</span> Workflow</h2>
      </div>

      <FocusCard
        number="01"
        color="rgba(59,130,246,0.6)" // Blue
        title="Curated Study Plans."
        desc="Stop guessing what to study. Tell us your goal, and we generate a day-by-day curriculum with embedded video tutorials and practice checkpoints."
      />
      <FocusCard
        number="02"
        color="rgba(168,85,247,0.6)" // Purple
        title="Execute in Browser."
        desc="No installations required. Write, compile, and run complex Java or Python programs instantly in a distraction-free, dark-mode optimized IDE."
      />
      <FocusCard
        number="03"
        color="rgba(245,158,11,0.6)" // Amber
        title="Track & Dominate."
        desc="Every keystroke builds your profile. Track accuracy, speed, earn XP, and climb the global leaderboard to prove your absolute mastery."
      />
    </section>
  );
};

// --- 6. FINAL CTA ---
const BigCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-32 bg-[#050505] px-4 overflow-hidden relative z-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="relative z-10">
            <AcademicCapIcon className="w-16 h-16 text-blue-500 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Start your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">7-Day Streak</span></h2>
            <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">Join thousands of developers mastering Data Structures and Algorithms with our intelligent platform.</p>
            <button onClick={() => navigate("/auth/sign-up")} className="group relative inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)]">
              <span>Launch Study Plan</span><ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
    <div className="bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30">
      <HeroScrollDemo />
      <SubjectMarquee />
      <BentoGrid />
      <ExplodingUI />
      <ScrollFocusStack />
      <BigCTA />
      <div className="relative z-20 bg-[#050505]">
        <Footer />
      </div>
    </div>
  );
}

export default Landing;