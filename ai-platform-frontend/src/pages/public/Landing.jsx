import React, { useRef } from "react";
import {
  Button,
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
import { motion, useScroll, useTransform } from "framer-motion";
import { Footer } from "@/widgets/layout"; // 👈 IMPORT FOOTER

// --- Bouncy & Snappy Animation Variants ---
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

  // For the Scroll Zoom effect on the CTA
  const ctaRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"]
  });

  // Maps scroll progress to scale and opacity for a zoom-in effect
  const scaleCTA = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const opacityCTA = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <div className="overflow-x-hidden bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-50 transition-colors duration-500 font-sans">

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 md:pt-0">

        {/* Dynamic Abstract Background */}
        <div className="absolute inset-0 -z-20 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.15),rgba(255,255,255,0))]" />

        {/* Bouncing Glow Orbs */}
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-[100px] -z-10 pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-500/20 dark:bg-violet-600/20 blur-[120px] -z-10 pointer-events-none"
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
                <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 border border-blue-200 dark:border-blue-500/20 backdrop-blur-md mb-8 shadow-sm hover:scale-105 transition-transform cursor-default">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
                  <FireIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                    Your Personal Tech Mentor
                  </span>
                </div>
              </motion.div>

              <motion.div variants={bounceIn}>
                <Typography variant="h1" className="mb-6 font-black tracking-tight leading-[1.1] text-5xl md:text-6xl lg:text-7xl">
                  Code. Execute. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 drop-shadow-sm">
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
                <Button
                  size="lg"
                  className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-slate-900/20 dark:shadow-white/10 w-full sm:w-auto"
                  onClick={() => navigate("/auth/sign-up")}
                >
                  <span className="relative z-10 text-base font-bold">Start Coding Free</span>
                  <ArrowLongRightIcon className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />
                </Button>

                <Button
                  variant="outlined"
                  size="lg"
                  className="rounded-full border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all w-full sm:w-auto text-base font-bold"
                  onClick={() => navigate("/auth/sign-in")}
                >
                  View Dashboard
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Dashboard Mockup (Bouncy & Floating) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.6, duration: 1, delay: 0.2 }}
              className="md:col-span-5 hidden md:block perspective-[1000px]"
            >
              <motion.div variants={floatAnimation} className="relative w-full max-w-md ml-auto">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-40 animate-pulse" />

                {/* Simulated Study Plan Card */}
                <Card className="relative bg-white/70 dark:bg-[#18181b]/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-6 overflow-hidden">
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
                      <Chip value="23% Done" className="bg-blue-500 text-white rounded-full border-0" />
                    </div>

                    {/* Simulated YouTube Video Block */}
                    <div className="relative rounded-2xl bg-slate-900 overflow-hidden aspect-video group cursor-pointer mt-2">
                      <img src="https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=800&q=80" alt="Code" className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PlayCircleIcon className="h-14 w-14 text-white group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Typography variant="small" className="text-white font-bold">Day 2: Lists & Tuples</Typography>
                      </div>
                    </div>

                    <div className="mt-4 bg-slate-50 dark:bg-black/30 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">XP Earned Today</span>
                        <span className="text-sm font-black text-orange-500 flex items-center gap-1"><FireIcon className="h-4 w-4" /> 110 XP</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
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

      {/* ================= THE PLATFORM FEATURES ================= */}
      <section className="relative py-24 bg-white dark:bg-[#0a0a0c]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={bounceIn}
            className="text-center mb-16 md:mb-20"
          >
            <Typography variant="h2" className="mb-4 text-3xl md:text-5xl font-extrabold tracking-tight">
              A Complete <span className="text-blue-600 dark:text-blue-500">Learning Ecosystem</span>
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
                text: "Tell us what you want to learn (e.g., Machine Learning in 3 Days). We generate a day-by-day curriculum with embedded YouTube tutorials.",
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
                text: "Never run out of practice. Generate unique questions on any topic (from Arrays to Advanced Algorithms) at any difficulty level.",
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
                <Card className="h-full rounded-[2rem] border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#121215] hover:-translate-y-3 transition-transform duration-300 overflow-hidden shadow-none hover:shadow-2xl hover:shadow-blue-500/10">
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

      {/* ================= SUBJECTS GRID (Bouncy Hover) ================= */}
      <section className="py-24 relative overflow-hidden bg-slate-50 dark:bg-[#09090b]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={bounceIn}
            className="mb-12"
          >
            <Typography variant="h2" className="text-3xl md:text-4xl font-extrabold mb-4">
              Master the Most In-Demand Skills
            </Typography>
            <Typography className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Select your path and let our Smart Learning Engine customize your difficulty.
            </Typography>
          </motion.div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              "Python Basics", "Java OOP", "Machine Learning", "Data Structures",
              "Algorithms", "Problem Solving", "Web Development", "Database Systems"
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
                className="cursor-pointer rounded-2xl border border-slate-200 dark:border-white/10 p-4 md:p-6 text-center text-slate-800 dark:text-slate-200 bg-white dark:bg-[#18181b] shadow-sm hover:shadow-xl hover:shadow-blue-500/20 hover:border-blue-500/50 transition-colors"
              >
                <span className="font-bold text-sm md:text-base">{subject}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SCROLL ZOOM CTA SECTION ================= */}
      <section className="pb-24 pt-10 relative overflow-hidden bg-slate-50 dark:bg-[#09090b]">
        <div className="container mx-auto px-4" ref={ctaRef}>
          {/* Using motion.div hooked to useTransform for the scroll zoom effect */}
          <motion.div
            style={{ scale: scaleCTA, opacity: opacityCTA }}
            className="relative mx-auto max-w-6xl origin-bottom"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] blur-2xl opacity-30 translate-y-8" />

            <Card className="relative rounded-[3rem] border border-white/20 dark:border-white/10 bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-black overflow-hidden shadow-2xl">

              {/* Ethereal light effects inside CTA */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

              <CardBody className="px-6 py-20 md:p-28 text-center relative z-10 flex flex-col items-center">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  whileInView={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.7, delay: 0.2 }}
                  className="mb-6 p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 inline-block"
                >
                  <TrophyIcon className="h-12 w-12 text-yellow-400" />
                </motion.div>

                <Typography variant="h2" className="mb-6 text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg">
                  Ready to climb the ranks?
                </Typography>

                <Typography className="text-blue-100/90 text-lg md:text-xl font-medium mb-10 max-w-2xl">
                  Join the platform. Build your 7-day plan. Earn your first 100 XP. <br className="hidden md:block" />
                  The ultimate AI tech-prep platform awaits.
                </Typography>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate("/auth/sign-up")}
                    size="lg"
                    className="rounded-full bg-white text-blue-950 hover:bg-slate-100 shadow-xl shadow-white/10 text-lg py-5 px-12 border border-white/50 font-black"
                  >
                    Start Your Free Plan
                  </Button>
                </motion.div>

                <Typography variant="small" className="text-white/50 mt-6 font-bold tracking-wide uppercase">
                  Basic Analytics & Free Generations Included
                </Typography>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />

    </div>
  );
}

export default Landing;