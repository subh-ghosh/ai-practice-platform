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

// --- Subtle Entry Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
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
      staggerChildren: 0.1
    }
  }
};

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden bg-gray-900">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        
        {/* Subtle Background Gradient (Matches Original) */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800" />
        
        {/* Very subtle glows (toned down) */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" 
        />
        <motion.div 
          animate={{ opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" 
        />

        <div className="container mx-auto px-4 pt-10 relative z-10">
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
                <Typography variant="h1" className="mb-6 font-black leading-tight text-5xl md:text-6xl text-white">
                  Practice smarter. <br />
                  Learn faster.
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Typography variant="lead" className="mb-10 opacity-80 max-w-2xl mx-auto md:mx-0 text-gray-300 text-lg font-normal">
                  Get fresh questions, write your answer, and see clear tips right away.
                  No noise — just steady progress built for students.
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  variant="gradient"
                  color="white"
                  size="lg"
                  className="flex items-center justify-center gap-2 rounded-full !text-gray-900 hover:scale-105 transition-transform"
                  onClick={() => navigate("/auth/sign-in")}
                >
                  Start practicing
                  <ArrowLongRightIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="text"
                  size="lg"
                  className="rounded-full text-white hover:bg-white/10"
                  onClick={() => navigate("/auth/sign-up")}
                >
                  Create account
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Card - Restored to Original "Instant Feedback" design */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-5 hidden md:block"
            >
              <Card className="backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-500">
                <div className="flex flex-col items-center text-center gap-4 py-6">
                  <SparklesIcon className="h-8 w-8 text-white/90" />
                  <div>
                    <Typography variant="h5" color="white" className="font-bold mb-2">
                      Practice with instant feedback
                    </Typography>
                    <Typography className="text-gray-400 font-normal">
                      Simple, friendly, and made for focused study.
                    </Typography>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="relative py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <Typography variant="h2" className="mb-4 text-4xl font-bold text-white">
              How it works
            </Typography>
            <Typography className="text-lg text-gray-400">
              A simple loop: try a question → write your answer → get tips → improve.
            </Typography>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-4"
          >
            {[
              {
                title: "Pick a subject",
                text: "Choose what you want to practice and the level that feels right.",
                icon: AcademicCapIcon,
                color: "blue",
              },
              {
                title: "Get a fresh question",
                text: "You’ll see a clear, single question with no distractions.",
                icon: SparklesIcon,
                color: "blue",
              },
              {
                title: "Submit your answer",
                text: "You’ll be told if it’s right, close, or needs work — with a short tip.",
                icon: CheckCircleIcon,
                color: "blue",
              },
              {
                title: "See your progress",
                text: "Watch your scores and trends so you know what to focus on.",
                icon: ChartBarIcon,
                color: "blue",
              },
            ].map(({ title, text, icon: Icon, color }) => (
              <motion.div key={title} variants={fadeInUp}>
                <Card
                  className="h-full rounded-2xl border border-gray-800 bg-gray-800/50 hover:bg-gray-800 transition-colors duration-300 backdrop-blur-sm"
                >
                  <CardBody className="p-6">
                    <div className={`mb-6 grid h-12 w-12 place-items-center rounded-xl bg-blue-600 text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Typography variant="h5" className="mb-3 text-white font-bold">
                      {title}
                    </Typography>
                    <Typography className="text-gray-400 leading-relaxed font-normal">
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
      <section className="py-10 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="rounded-3xl border border-gray-800 bg-gray-800/40 backdrop-blur-xl">
              <CardBody className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <Typography variant="h3" className="text-white font-bold mb-2">
                      Subjects & levels
                    </Typography>
                    <Typography className="text-gray-400">
                      Start easy, move up when you’re ready.
                    </Typography>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <Chip value="Beginner" className="bg-green-500/10 text-green-400 rounded-full border border-green-500/20 normal-case" />
                    <Chip value="Medium" className="bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20 normal-case" />
                    <Chip value="Tough" className="bg-red-500/10 text-red-400 rounded-full border border-red-500/20 normal-case" />
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
                  ].map((s, i) => (
                    <div
                      key={s}
                      className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-gray-200 font-medium hover:border-gray-600 transition-colors"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="pb-24 pt-10 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.6 }}
             viewport={{ once: true }}
          >
            <Card className="rounded-3xl border border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
              <CardBody className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <Typography variant="h3" className="text-white font-bold mb-2">
                    Ready to practice smarter?
                  </Typography>
                  <Typography className="text-gray-400 text-lg">
                    Create an account and try your first question now.
                  </Typography>
                </div>
                <Button
                  onClick={() => navigate("/auth/sign-up")}
                  size="lg"
                  color="blue"
                  className="rounded-xl flex-shrink-0"
                >
                  Sign up free
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