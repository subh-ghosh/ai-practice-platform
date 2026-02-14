import React from "react";
import {
  Typography,
  Card,
  CardBody,
  Chip,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLongRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  LightBulbIcon, // Swapped CodeBracketIcon for LightBulbIcon
  TrophyIcon,
  PlayCircleIcon,
  FireIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { Footer } from "@/widgets/layout";

// --- Animation Variants ---
const bounceIn = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", bounce: 0.4, duration: 0.8 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
  }
};

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-200 transition-colors duration-500 font-sans">

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 md:pt-0">

        {/* Background Mesh Gradients */}
        <div className="absolute inset-0 -z-20 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.08),rgba(0,0,0,0))]" />

        {/* Very Subtle Floating Orbs */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[120px] -z-10 pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[150px] -z-10 pointer-events-none"
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid items-center gap-16 md:grid-cols-12">

            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="md:col-span-7 text-center md:text-left pt-10 md:pt-0"
            >
              <motion.div variants={bounceIn} className="flex justify-center md:justify-start">
                <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md mb-8 shadow-sm cursor-default">
                  <FireIcon className="h-4 w-4 text-orange-500" />
                  {/* UPDATED COPY: General study focus */}
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Intelligent Learning Engine
                  </span>
                </div>
              </motion.div>

              <motion.div variants={bounceIn}>
                {/* UPDATED COPY: General study focus */}
                <Typography variant="h1" className="mb-6 font-black tracking-tight leading-[1.1] text-5xl md:text-6xl lg:text-7xl text-slate-900 dark:text-white">
                  Study Smarter. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                    Retain More.
                  </span>
                </Typography>
              </motion.div>

              <motion.div variants={bounceIn}>
                {/* UPDATED COPY: Removed coding references */}
                <Typography className="mb-10 text-lg md:text-xl font-medium text-slate-600 dark:text-slate-400 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                  Generate unlimited practice questions for any subject, get instantly evaluated by our neural engine, and follow curated video study plans to master difficult concepts.
                </Typography>
              </motion.div>

              <motion.div variants={bounceIn} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                {/* PRIMARY CTA: Updated Text */}
                <button
                  className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-slate-900 dark:bg-white px-8 py-4 text-base font-bold text-white dark:text-slate-900 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95 w-full sm:w-auto"
                  onClick={() => navigate("/auth/sign-up")}
                >
                  <span className="relative z-10">Start Studying Free</span>
                  <ArrowLongRightIcon className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                {/* SECONDARY CTA */}
                <button
                  className="rounded-full border border-slate-300 px-8 py-4 text-base font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white w-full sm:w-auto"
                  onClick={() => navigate("/auth/sign-in")}
                >
                  View Dashboard
                </button>
              </motion.div>
            </motion.div>

            {/* Right Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 1, delay: 0.2 }}
              className="md:col-span-5 hidden md:block perspective-[1000px] group"
            >
              <motion.div variants={floatAnimation} className="relative w-full max-w-md ml-auto">

                {/* FIX: SIGNIFICANTLY REDUCED GLOW.
                    - Changed opacity-30 to opacity-5
                    - Changed blur-xl to blur-md
                    - Removed animate-pulse
                */}
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2.5rem] blur-md opacity-5" />

                {/* Mockup Card - Slightly reduced border opacity for cleaner look */}
                <Card className="relative bg-white/70 dark:bg-[#121215]/90 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-xl rounded-[2.5rem] p-6 overflow-hidden transition-all duration-500 group-hover:shadow-blue-500/10 dark:group-hover:shadow-blue-900/20 group-hover:border-blue-500/20">
                  <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/5">
                      <div>
                        <Typography variant="small" className="text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase text-xs mb-1">
                          Active Plan
                        </Typography>
                        {/* UPDATED COPY: General Subject */}
                        <Typography variant="h6" className="text-slate-900 dark:text-white font-bold leading-none">
                          Advanced Calculus Prep
                        </Typography>
                      </div>
                      <Chip value="23% Done" className="bg-blue-600 text-white rounded-full border-0" />
                    </div>

                    {/* Video Thumbnail - Reduced internal glow opacity */}
                    <div className="relative rounded-2xl bg-slate-800 overflow-hidden aspect-video group/video cursor-pointer mt-2 border border-slate-700/50">
                      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 transition-opacity group-hover/video:opacity-30" />

                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircleIcon className="h-16 w-16 text-white/80 transition-all duration-300 group-hover/video:scale-110 group-hover/video:text-white" />
                      </div>

                      <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                        {/* UPDATED COPY: General Topic */}
                        <Typography variant="small" className="text-white font-bold">Day 2: Derivatives & Limits</Typography>
                      </div>
                    </div>

                    <div className="mt-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">XP Earned Today</span>
                        <span className="text-sm font-black text-orange-500 flex items-center gap-1"><FireIcon className="h-4 w-4" /> 110 XP</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full w-[45%]" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="relative py-24 bg-white dark:bg-[#0a0a0c]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={bounceIn}
            className="text-center mb-16 md:mb-20"
          >
            <Typography variant="h2" className="mb-4 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              A Complete <span className="text-blue-600 dark:text-blue-500">Learning Ecosystem</span>
            </Typography>
            <Typography className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-2">
              Everything you need to go from beginner to master, housed in one beautiful dashboard.
            </Typography>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                // UPDATED COPY: General Knowledge Focus
                title: "Smart Answer Evaluator",
                text: "Submit your answers to complex questions. Our neural engine instantly checks your logic and factual accuracy, providing precise hints and conceptual corrections.",
                icon: LightBulbIcon, // Changed icon to Lightbulb
                color: "from-blue-500 to-cyan-500",
                hoverBorder: "group-hover:border-blue-500/30"
              },
              {
                title: "Curated Study Plans",
                text: "Tell us what subject you want to learn. We generate a day-by-day curriculum with embedded YouTube tutorials from top educators.",
                icon: PlayCircleIcon,
                color: "from-red-500 to-pink-500",
                hoverBorder: "group-hover:border-red-500/30"
              },
              {
                title: "Deep Analytics",
                text: "Track your accuracy, retention rates, and study streaks with beautiful charts to visualize your mastery over time.",
                icon: ChartBarIcon,
                color: "from-purple-500 to-indigo-500",
                hoverBorder: "group-hover:border-purple-500/30"
              },
              {
                title: "Global Leaderboard",
                text: "Compete with friends and other learners. Maintain your daily streak, earn XP for correct answers, and climb the ranks.",
                icon: TrophyIcon,
                color: "from-amber-400 to-orange-500",
                hoverBorder: "group-hover:border-amber-500/30"
              },
              {
                title: "Infinite Question Bank",
                text: "Never run out of practice materials. Generate unique questions on any topic at any difficulty level instantly.",
                icon: SparklesIcon,
                color: "from-emerald-400 to-teal-500",
                hoverBorder: "group-hover:border-emerald-500/30"
              },
              {
                title: "Frictionless UI",
                text: "Dark mode optimized, distraction-free interface built for deep work. Less time configuring, more time studying.",
                icon: CheckCircleIcon,
                color: "from-slate-600 to-slate-800",
                hoverBorder: "group-hover:border-slate-500/30"
              },
            ].map(({ title, text, icon: Icon, color, hoverBorder }, idx) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.3, delay: idx * 0.1 } }
                }}
                className="group h-full"
              >
                <Card className={`h-full rounded-[2rem] border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#121215] hover:-translate-y-2 transition-all duration-300 overflow-hidden shadow-none hover:shadow-xl dark:hover:shadow-black/30 ${hoverBorder}`}>
                  <CardBody className="p-8">
                    <div className={`mb-6 inline-flex p-4 rounded-2xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-white/70 group-hover:bg-gradient-to-br ${color} group-hover:text-white group-hover:shadow-lg transition-all duration-300`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <Typography variant="h4" className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                      {title}
                    </Typography>
                    <Typography className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      {text}
                    </Typography>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SUBJECTS GRID ================= */}
      <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#050505]">

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={bounceIn}
            className="mb-12"
          >
            <Typography variant="h2" className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900 dark:text-white">
              Master Any Subject
            </Typography>
            <Typography className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Select your path. Our engine adapts to your performance level.
            </Typography>
          </motion.div>

          {/* UPDATED COPY: General Study Topics */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-4xl mx-auto">
            {[
              "Mathematics", "Computer Science", "Physics", "Chemistry",
              "Biology", "History", "Literature", "Economics"
            ].map((subject, i) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: "spring", bounce: 0.5 }}
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer rounded-2xl border border-slate-200 dark:border-white/5 p-4 md:p-5 text-center text-slate-800 dark:text-slate-300 bg-white dark:bg-[#121215] shadow-sm hover:shadow-md hover:border-blue-500/30 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-bold text-sm md:text-base"
              >
                {subject}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="pb-24 pt-10 relative overflow-hidden bg-slate-50 dark:bg-[#050505]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-5xl"
          >

            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 group">

              {/* LAYER 1: LIGHT MODE BG */}
              <div className="absolute inset-0 bg-white dark:hidden z-0" />

              {/* LAYER 2: DARK MODE BG (Clean deep gradient) */}
              <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-slate-900 to-black z-0" />

              {/* CONTENT LAYER */}
              <div className="relative z-10 px-6 py-16 md:p-24 text-center flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="mb-6 p-4 rounded-full bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 inline-block"
                >
                  <TrophyIcon className="h-10 w-10 text-yellow-500" />
                </motion.div>

                <Typography variant="h2" className="mb-4 text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  Ready to climb ranks?
                </Typography>

                {/* UPDATED COPY: General study focus */}
                <Typography className="text-slate-600 dark:text-slate-300 text-lg font-medium mb-8 max-w-lg">
                  Build your plan. Earn XP. Master your subjects. The ultimate intelligent study platform awaits.
                </Typography>

                <button
                  onClick={() => navigate("/auth/sign-up")}
                  className="rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/10 hover:shadow-blue-500/40 text-lg py-4 px-10 font-bold transition-all hover:scale-105 active:scale-95"
                >
                  Start Free Plan
                </button>

                <Typography variant="small" className="text-slate-400 dark:text-white/30 mt-6 font-semibold tracking-wide uppercase text-xs">
                  No credit card required
                </Typography>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />

    </div>
  );
}

export default Landing;