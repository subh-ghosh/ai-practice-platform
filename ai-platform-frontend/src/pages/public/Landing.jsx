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
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 -z-10 bg-gray-50 dark:bg-gray-900 transition-colors duration-500" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/20" />
        
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-400/20 blur-[120px] pointer-events-none" 
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid items-center gap-12 md:grid-cols-12">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="md:col-span-7 text-center md:text-left"
            >
              <motion.div variants={fadeInUp}>
                 <Chip 
                    value="New: AI Feedback" 
                    className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-6 inline-block rounded-full px-4"
                 />
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <Typography variant="h1" className="mb-6 font-black leading-tight text-5xl md:text-6xl text-gray-900 dark:text-white">
                  Practice smarter.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    Learn faster.
                  </span>
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Typography variant="lead" className="mb-8 opacity-80 max-w-2xl mx-auto md:mx-0 text-gray-700 dark:text-gray-300 text-lg">
                  Get fresh questions, write your answer, and see clear tips right away.
                  No noise — just steady progress built for students.
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  variant="gradient"
                  color="blue"
                  size="lg"
                  className="flex items-center justify-center gap-2 rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
                  onClick={() => navigate("/auth/sign-in")}
                >
                  Start practicing
                  <ArrowLongRightIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="text"
                  size="lg"
                  className="rounded-full text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                  onClick={() => navigate("/auth/sign-up")}
                >
                  Create account
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Glass Card (Desktop Only) */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="md:col-span-5 hidden md:block"
            >
              <div className="relative">
                  {/* Decorative blobs behind card */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 animate-pulse"></div>
                  
                  <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/60 border border-white/40 dark:border-white/10 shadow-2xl rounded-3xl p-8 relative">
                    <div className="flex flex-col items-center text-center gap-6">
                      <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30">
                        <SparklesIcon className="h-10 w-10 text-white" />
                      </div>
                      <div>
                        <Typography variant="h4" color="blue-gray" className="dark:text-white font-bold mb-2">
                          Instant AI Feedback
                        </Typography>
                        <Typography className="text-gray-600 dark:text-gray-400">
                          "Your answer is correct, but try using a loop for better efficiency."
                        </Typography>
                      </div>
                      
                      {/* Fake Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 mt-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          whileInView={{ width: "75%" }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="bg-blue-600 h-2.5 rounded-full" 
                        />
                      </div>
                      <Typography variant="small" className="text-gray-500 font-medium">
                        75% Mastery
                      </Typography>
                    </div>
                  </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="relative py-24 bg-white dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Typography variant="h2" className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              How it works
            </Typography>
            <Typography className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A simple loop: try a question → write your answer → get tips → improve.
            </Typography>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid gap-8 md:grid-cols-4"
          >
            {[
              {
                title: "Pick a subject",
                text: "Choose what you want to practice and the level that feels right.",
                icon: AcademicCapIcon,
                color: "blue",
              },
              {
                title: "Get a question",
                text: "You’ll see a clear, single question with no distractions.",
                icon: SparklesIcon,
                color: "purple",
              },
              {
                title: "Submit answer",
                text: "You’ll be told if it’s right, close, or needs work — with a short tip.",
                icon: CheckCircleIcon,
                color: "green",
              },
              {
                title: "See progress",
                text: "Watch your scores and trends so you know what to focus on.",
                icon: ChartBarIcon,
                color: "orange",
              },
            ].map(({ title, text, icon: Icon, color }, index) => (
              <motion.div key={title} variants={fadeInUp}>
                <Card
                  className="h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/40 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300"
                >
                  <CardBody className="p-6 text-center">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`mb-6 mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-500 shadow-lg shadow-${color}-500/10`}
                    >
                      <Icon className="h-8 w-8" />
                    </motion.div>
                    <Typography variant="h5" className="mb-3 text-gray-900 dark:text-white font-bold">
                      {title}
                    </Typography>
                    <Typography className="text-gray-600 dark:text-gray-400 leading-relaxed">
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
      <section className="py-20 relative overflow-hidden">
        {/* Background glow for this section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full -z-10" />

        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="rounded-3xl border border-white/20 dark:border-gray-700 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
              <CardBody className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                  <div>
                    <Typography variant="h3" className="text-gray-900 dark:text-white font-bold mb-2">
                      Subjects & levels
                    </Typography>
                    <Typography className="text-lg text-gray-600 dark:text-gray-400">
                      Start easy, move up when you’re ready.
                    </Typography>
                  </div>
                  <div className="flex gap-3">
                    <Chip value="Beginner" className="bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300 rounded-full border-0" />
                    <Chip value="Medium" className="bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300 rounded-full border-0" />
                    <Chip value="Tough" className="bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300 rounded-full border-0" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {[
                    "Programming Basics",
                    "Problem Solving",
                    "Logic & Puzzles",
                    "Math Practice",
                    "Study Skills",
                    "Quick Quizzes",
                    "Data Structures",
                    "Algorithms"
                  ].map((s, i) => (
                    <motion.div
                      key={s}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.03, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                      className="cursor-default rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center font-semibold text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-colors"
                    >
                      {s}
                    </motion.div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="pb-24 pt-10">
        <div className="container mx-auto px-4">
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative"
          >
            {/* CTA Glass Card */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-lg opacity-30 transform translate-y-4"></div>
            <Card className="relative rounded-3xl border border-white/20 dark:border-white/10 bg-gradient-to-br from-blue-900 to-gray-900 text-white overflow-hidden">
              
              {/* Background patterns */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

              <CardBody className="p-10 md:p-16 text-center">
                <Typography variant="h2" className="mb-4 font-bold tracking-tight">
                  Ready to practice smarter?
                </Typography>
                <Typography className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of students improving their skills every day. Create an account and try your first question now.
                </Typography>
                <Button
                  onClick={() => navigate("/auth/sign-up")}
                  size="lg"
                  color="white"
                  className="rounded-full text-blue-900 hover:scale-105 transition-transform"
                >
                  Sign up for free
                </Button>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section>

    </div>
  );
}

export default Landing;