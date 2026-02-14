import React from "react";
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
  LightBulbIcon,
  PuzzlePieceIcon,
  CalculatorIcon,
} from "@heroicons/react/24/solid";
import { motion, useScroll, useTransform } from "framer-motion";
import { Footer } from "@/widgets/layout"; // 👈 IMPORT FOOTER

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const floatAnimation = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="overflow-x-hidden bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-50 transition-colors duration-500">

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 md:pt-0">

        {/* Next-Level Background System */}
        <div className="absolute inset-0 -z-20 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.15),rgba(255,255,255,0))]" />

        {/* Animated Glow Orbs */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          className="absolute top-[10%] left-[15%] h-[300px] w-[300px] rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-[100px] -z-10 pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
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
              <motion.div variants={fadeInUp} className="flex justify-center md:justify-start">
                <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 border border-blue-200 dark:border-blue-500/20 backdrop-blur-md mb-8 shadow-sm">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
                  <SparklesIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    AI-Powered Feedback Engine
                  </span>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Typography variant="h1" className="mb-6 font-black tracking-tight leading-[1.1] text-5xl md:text-7xl lg:text-8xl">
                  Practice <span className="italic font-light">smarter.</span><br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 drop-shadow-sm">
                    Learn faster.
                  </span>
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Typography className="mb-10 text-lg md:text-xl font-medium text-slate-600 dark:text-slate-400 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                  Get fresh questions, write your answer, and receive pinpoint AI insights instantly. Cut the noise and build your mastery loop.
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  size="lg"
                  className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:scale-105 transition-all duration-300 shadow-xl shadow-slate-900/20 dark:shadow-white/10 w-full sm:w-auto"
                  onClick={() => navigate("/auth/sign-in")}
                >
                  <span className="relative z-10 text-base font-semibold">Start Practicing</span>
                  <ArrowLongRightIcon className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 dark:group-hover:opacity-0 transition-opacity duration-300 -z-0" />
                </Button>

                <Button
                  variant="outlined"
                  size="lg"
                  className="rounded-full border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto text-base"
                  onClick={() => navigate("/auth/sign-up")}
                >
                  Create Account
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Holographic AI Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.3, type: "spring", bounce: 0.4 }}
              className="md:col-span-5 hidden md:block perspective-[1000px]"
            >
              <motion.div variants={floatAnimation} className="relative w-full max-w-md ml-auto">
                {/* Glowing Backdrops */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-40 animate-pulse" />

                <Card className="relative bg-white/60 dark:bg-[#18181b]/80 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl rounded-[2.5rem] p-8 overflow-hidden">

                  {/* Inner scanning line effect */}
                  <motion.div
                    animate={{ top: ["-10%", "110%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent z-20"
                  />

                  <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                          <CodeBracketIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <Typography variant="h6" className="text-slate-900 dark:text-white font-bold leading-none">
                            Algorithm Challenge
                          </Typography>
                          <Typography variant="small" className="text-slate-500 dark:text-slate-400 mt-1">
                            Submitted 2 mins ago
                          </Typography>
                        </div>
                      </div>
                      <Chip value="92/100" className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full" />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <Typography className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                        <span className="text-purple-500">function</span> <span className="text-blue-500">solve</span>(arr) {'{\n'}
                        {'  '}return arr.reduce((a, b) =&gt; a + b, 0);<br />
                        {'}'}
                      </Typography>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm">
                        <SparklesIcon className="h-4 w-4" /> AI Insight
                      </div>
                      <Typography className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-800/30">
                        Excellent approach! Using <code className="bg-white dark:bg-black/50 px-1 rounded text-xs">reduce</code> is optimal here. To make it bulletproof, consider adding a check for empty arrays.
                      </Typography>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS (Bento Style) ================= */}
      <section className="relative py-24 bg-white/50 dark:bg-[#09090b] border-y border-slate-200 dark:border-white/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16 md:mb-20"
          >
            <Typography variant="h2" className="mb-4 text-3xl md:text-5xl font-extrabold tracking-tight">
              The Mastery <span className="text-blue-600 dark:text-blue-500">Loop</span>
            </Typography>
            <Typography className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-2">
              A frictionless system designed to keep you in the flow state.
            </Typography>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {[
              {
                title: "1. Select Domain",
                text: "Target specific weaknesses by choosing exactly what and how hard you want to practice.",
                icon: AcademicCapIcon,
                color: "from-blue-500 to-cyan-500",
                shadow: "shadow-cyan-500/20"
              },
              {
                title: "2. Deep Focus",
                text: "Immerse yourself in a distraction-free environment with high-quality, targeted questions.",
                icon: LightBulbIcon,
                color: "from-purple-500 to-indigo-500",
                shadow: "shadow-indigo-500/20"
              },
              {
                title: "3. Instant Feedback",
                text: "Submit your code or answer and watch the AI dissect it in seconds, offering exact fixes.",
                icon: CheckCircleIcon,
                color: "from-emerald-400 to-teal-500",
                shadow: "shadow-teal-500/20"
              },
              {
                title: "4. Track Growth",
                text: "Visualize your improvement over time with detailed mastery analytics and trend graphs.",
                icon: ChartBarIcon,
                color: "from-orange-400 to-pink-500",
                shadow: "shadow-orange-500/20"
              },
            ].map(({ title, text, icon: Icon, color, shadow }, idx) => (
              <motion.div key={title} variants={fadeInUp} className="group h-full">
                <Card
                  className="h-full rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-xl hover:-translate-y-2 transition-transform duration-300 ease-out overflow-hidden"
                >
                  <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-white dark:via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardBody className="p-8">
                    <div className={`mb-6 inline-flex p-3 rounded-2xl bg-gradient-to-br ${color} ${shadow} shadow-lg text-white`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <Typography variant="h5" className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                      {title}
                    </Typography>
                    <Typography className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      {text}
                    </Typography>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= SUBJECTS & LEVELS ================= */}
      <section className="py-24 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/10 blur-[120px] rounded-full -z-10" />

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Card className="rounded-[2.5rem] border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500" />

              <CardBody className="p-8 md:p-14">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                  <div className="max-w-xl">
                    <Typography variant="h3" className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900 dark:text-white">
                      Curriculum built for <span className="text-blue-600 dark:text-blue-400">scale.</span>
                    </Typography>
                    <Typography className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                      Start with the basics, conquer the complex. Dynamic difficulty adapts to your performance.
                    </Typography>
                  </div>

                  <div className="flex flex-wrap gap-3 bg-slate-100 dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-white/10 w-fit">
                    {["Beginner", "Intermediate", "Advanced"].map((level, i) => (
                      <Chip
                        key={level}
                        value={level}
                        className={`capitalize px-4 py-2 text-sm font-semibold rounded-xl border-0 ${i === 0 ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300" :
                            i === 1 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" :
                              "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { name: "Programming Basics", icon: CodeBracketIcon },
                    { name: "Problem Solving", icon: PuzzlePieceIcon },
                    { name: "Logic & Puzzles", icon: LightBulbIcon },
                    { name: "Math Practice", icon: CalculatorIcon },
                    { name: "Study Skills", icon: AcademicCapIcon },
                    { name: "Quick Quizzes", icon: SparklesIcon },
                    { name: "Data Structures", icon: ChartBarIcon },
                    { name: "Algorithms", icon: CodeBracketIcon }
                  ].map(({ name, icon: Icon }, i) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-white/10 p-5 flex items-center gap-4 text-slate-800 dark:text-slate-200 bg-white/60 dark:bg-[#18181b]/60 backdrop-blur-md hover:bg-slate-50 dark:hover:bg-white/5 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all shadow-sm"
                    >
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-semibold">{name}</span>
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="pb-24 pt-10 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] blur-2xl opacity-20 dark:opacity-40 translate-y-4" />

            <Card className="relative rounded-[3rem] border border-white/20 dark:border-white/10 bg-gradient-to-br from-blue-900 via-[#1e1b4b] to-black overflow-hidden shadow-2xl">

              {/* Ethereal light effects inside CTA */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

              <CardBody className="px-6 py-20 md:p-24 text-center relative z-10 flex flex-col items-center">
                <Typography variant="h2" className="mb-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md">
                  Ready to upgrade your mind?
                </Typography>
                <Typography className="text-blue-100/80 text-lg md:text-xl font-medium mb-10 max-w-2xl">
                  Join a community of forward-thinkers. Set up your learning profile in seconds and execute your first perfect rep today.
                </Typography>
                <Button
                  onClick={() => navigate("/auth/sign-up")}
                  size="lg"
                  className="rounded-full bg-white text-blue-950 hover:bg-slate-100 hover:scale-105 transition-all duration-300 shadow-xl shadow-white/10 text-lg py-4 px-10 border border-white/50"
                >
                  Create Your Free Account
                </Button>
                <Typography variant="small" className="text-white/40 mt-6 font-medium tracking-wide uppercase">
                  No credit card required
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