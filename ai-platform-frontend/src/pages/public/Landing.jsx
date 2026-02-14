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
  CodeBracketIcon,
  TrophyIcon,
  PlayCircleIcon,
  FireIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { Footer } from "@/widgets/layout";

// --- Animation Variants ---
const bounceIn = {
  hidden: { opacity: 0, y: 60, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", bounce: 0.5, duration: 0.8 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const floatAnimation = {
  animate: {
    y: [0, -15, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  }
};

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-200 transition-colors duration-500 font-sans">

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 md:pt-0">

        {/* Background Mesh Gradients */}
        <div className="absolute inset-0 -z-20 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(0,0,0,0))]" />

        {/* Floating Glows */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-blue-600/20 blur-[100px] -z-10 pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-violet-600/20 blur-[120px] -z-10 pointer-events-none"
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
                <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 border border-blue-200 dark:border-blue-500/30 backdrop-blur-md mb-8 shadow-sm hover:scale-105 transition-transform cursor-default group">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FireIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    Your Personal Tech Mentor
                  </span>
                </div>
              </motion.div>

              <motion.div variants={bounceIn}>
                <Typography variant="h1" className="mb-6 font-black tracking-tight leading-[1.1] text-5xl md:text-6xl lg:text-7xl text-slate-900 dark:text-white">
                  Code. Execute. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 drop-shadow-sm">
                    Level Up with AI.
                  </span>
                </Typography>
              </motion.div>

              <motion.div variants={bounceIn}>
                <Typography className="mb-10 text-lg md:text-xl font-medium text-slate-600 dark:text-slate-400 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                  Generate unlimited coding challenges, get your syntax instantly evaluated by AI, and follow customized video study plans pulling the best content from YouTube.
                </Typography>
              </motion.div>

              <motion.div variants={bounceIn} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 w-full sm:w-auto"
                  onClick={() => navigate("/auth/sign-up")}
                >
                  <span className="relative z-10">Start Coding Free</span>
                  <ArrowLongRightIcon className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>

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
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.6, duration: 1, delay: 0.2 }}
              className="md:col-span-5 hidden md:block perspective-[1000px]"
            >
              <motion.div variants={floatAnimation} className="relative w-full max-w-md ml-auto">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2.5rem] blur-xl opacity-30 animate-pulse" />

                <Card className="relative bg-white/70 dark:bg-[#121215]/90 backdrop-blur-2xl border border-white/50 dark:border-indigo-500/20 shadow-2xl rounded-[2.5rem] p-6 overflow-hidden">
                  <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/5">
                      <div>
                        <Typography variant="small" className="text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase text-xs mb-1">
                          Active Plan
                        </Typography>
                        <Typography variant="h6" className="text-slate-900 dark:text-white font-bold leading-none">
                          7-Day Python Bootcamp
                        </Typography>
                      </div>
                      <Chip value="23% Done" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full border-0 shadow-lg shadow-blue-500/20" />
                    </div>

                    <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden aspect-video group cursor-pointer mt-2 border border-slate-700/50 shadow-inner">
                      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircleIcon className="h-16 w-16 text-white group-hover:scale-110 group-hover:text-blue-400 transition-all duration-300 drop-shadow-lg" />
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                        <Typography variant="small" className="text-white font-bold">Day 2: Lists & Tuples</Typography>
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
              A Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">Learning Ecosystem</span>
            </Typography>
            <Typography className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-2">
              Everything you need to go from beginner to pro, housed in one beautiful dashboard.
            </Typography>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AI Code Evaluator",
                text: "Submit your Java or Python code. Our AI instantly checks syntax, logic, and OOP principles, giving you precise hints and corrections.",
                icon: CodeBracketIcon,
                color: "from-blue-500 to-cyan-500",
              },
              {
                title: "Curated Study Plans",
                text: "Tell us what you want to learn. We generate a day-by-day curriculum with embedded YouTube tutorials.",
                icon: PlayCircleIcon,
                color: "from-red-500 to-pink-500",
              },
              {
                title: "Deep Analytics",
                text: "Track your accuracy, average answer speed, and completion rates with beautiful charts to visualize your mastery over time.",
                icon: ChartBarIcon,
                color: "from-purple-500 to-indigo-500",
              },
              {
                title: "Global Leaderboard",
                text: "Compete with friends and other learners. Maintain your daily streak, earn XP for correct answers, and climb the ranks.",
                icon: TrophyIcon,
                color: "from-amber-400 to-orange-500",
              },
              {
                title: "Infinite Question Bank",
                text: "Never run out of practice. Generate unique questions on any topic at any difficulty level.",
                icon: SparklesIcon,
                color: "from-emerald-400 to-teal-500",
              },
              {
                title: "Frictionless UI",
                text: "Dark mode optimized, distraction-free interface built for deep work. Less time configuring, more time coding.",
                icon: CheckCircleIcon,
                color: "from-slate-600 to-slate-800",
              },
            ].map(({ title, text, icon: Icon, color }, idx) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.4, delay: idx * 0.1 } }
                }}
                className="group h-full"
              >
                <Card className="h-full rounded-[2rem] border border-slate-200 dark:border-indigo-500/10 bg-slate-50/50 dark:bg-[#121215] hover:-translate-y-3 transition-transform duration-300 overflow-hidden shadow-none hover:shadow-2xl hover:shadow-blue-500/10 group-hover:border-blue-500/30">
                  <CardBody className="p-8">
                    <div className={`mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br ${color} shadow-lg text-white transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={bounceIn}
            className="mb-12"
          >
            <Typography variant="h2" className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900 dark:text-white">
              Master the Most In-Demand Skills
            </Typography>
            <Typography className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Select your path and let our Smart Learning Engine customize your difficulty.
            </Typography>
          </motion.div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              "Java OOP", "Python Automation", "Data Structures", "Algorithms",
              "Full-Stack Web", "Database Systems", "PL/SQL", "Probability & Stats"
            ].map((subject, i) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: "spring", bounce: 0.6 }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer rounded-2xl border border-slate-200 dark:border-white/5 p-4 md:p-6 text-center text-slate-800 dark:text-slate-300 bg-white dark:bg-[#121215] shadow-sm hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 transition-all duration-300"
              >
                <span className="font-bold text-sm md:text-base">{subject}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA (FIXED LAYERING) ================= */}
      <section className="pb-24 pt-10 relative overflow-hidden bg-slate-50 dark:bg-[#050505]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
            viewport={{ once: true, amount: 0.3 }}
            className="relative mx-auto max-w-6xl"
          >
            {/* CTA Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] blur-2xl opacity-20 dark:opacity-40 translate-y-8" />

            {/* BULLETPROOF BACKGROUND LAYERING:
                We separate the Light Mode BG and Dark Mode BG into absolute separate divs.
                This ensures no CSS overrides happen. 
            */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10">

              {/* LAYER 1: LIGHT MODE BACKGROUND (White) - Hidden in Dark Mode */}
              <div className="absolute inset-0 bg-white dark:hidden z-0" />

              {/* LAYER 2: DARK MODE BACKGROUND (Gradient) - Hidden in Light Mode */}
              <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-slate-900 via-[#0a0a0c] to-black z-0" />

              {/* LAYER 3: INNER GLOWS */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none z-0" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none z-0" />

              {/* CONTENT LAYER (Relative Z-10) */}
              <div className="relative z-10 px-6 py-20 md:p-28 text-center flex flex-col items-center">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.7, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="mb-6 p-4 rounded-full bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 inline-block"
                >
                  <TrophyIcon className="h-12 w-12 text-yellow-500 dark:text-yellow-400" />
                </motion.div>

                <Typography variant="h2" className="mb-6 text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-lg">
                  Ready to climb the ranks?
                </Typography>

                <Typography className="text-slate-600 dark:text-blue-100/80 text-lg md:text-xl font-medium mb-10 max-w-2xl">
                  Join the platform. Build your 7-day plan. Earn your first 100 XP. <br className="hidden md:block" />
                  The ultimate AI tech-prep platform awaits.
                </Typography>

                <button
                  onClick={() => navigate("/auth/sign-up")}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 text-lg py-5 px-12 font-black transition-transform hover:scale-105 active:scale-95 border border-transparent dark:border-white/10 hover:dark:border-white/20"
                >
                  Start Your Free Plan
                </button>

                <Typography variant="small" className="text-slate-400 dark:text-white/40 mt-6 font-bold tracking-wide uppercase">
                  Basic Analytics & Free Generations Included
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