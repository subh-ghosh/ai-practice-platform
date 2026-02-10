import React from "react";
import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Button,
  Chip,
} from "@material-tailwind/react";
import { motion } from "framer-motion";

// --- Icons ---
const GithubIcon = (props) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297 24 5.67 18.627.297 12 .297z"
    />
  </svg>
);

const LinkedInIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.557V9H7.12v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"
    />
  </svg>
);

// --- Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export function About() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden">
      
      {/* === Animated Background === */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900 transition-colors duration-500" />
      
      <motion.div 
        animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-[-10%] right-[-10%] h-[340px] w-[340px] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-[-15%] left-[-10%] h-[320px] w-[320px] rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-[35%] left-[25%] h-[200px] w-[200px] rounded-full bg-fuchsia-500/15 blur-[80px] pointer-events-none" 
      />

      <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          {/* Glass Card - Updated to match new theme */}
          <Card className="rounded-3xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardBody className="text-center p-8 md:p-12">
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Avatar
                  src="https://avatars.githubusercontent.com/u/176177158?v=4"
                  alt="Subarta Ghosh"
                  className="mb-6 shadow-lg w-32 h-32 md:w-40 md:h-40 mx-auto ring-4 ring-blue-500/20 rounded-2xl object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>

              <Typography
                variant="h2"
                className="mb-3 text-gray-900 dark:text-white text-3xl md:text-4xl font-bold"
              >
                Subarta Ghosh
              </Typography>

              {/* Tags */}
              <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
                <Chip
                  value="BUILDER"
                  className="rounded-full px-4 py-1.5 text-[11px] font-bold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-900/50"
                />
                <Chip
                  value="CS STUDENT"
                  className="rounded-full px-4 py-1.5 text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                />
                <Chip
                  value="VIT VELLORE"
                  className="rounded-full px-4 py-1.5 text-[11px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                />
              </div>

              {/* Bio */}
              <div className="mx-auto max-w-2xl text-left space-y-4">
                <Typography className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  I like building simple tools that help students learn with ease.
                  This site focuses on small steps, clear feedback, and steady growth.
                </Typography>
                <Typography className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Things I enjoy: creating useful products, clean design, and making
                  learning feel friendly.
                </Typography>
              </div>

              {/* Links */}
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <a
                  href="https://www.linkedin.com/in/subhh/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outlined"
                    color="blue"
                    className="flex items-center gap-3 rounded-full px-6 py-3 font-semibold border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-500/10 transition-all hover:scale-105"
                  >
                    <LinkedInIcon className="w-5 h-5" />
                    LinkedIn
                  </Button>
                </a>

                <a
                  href="https://github.com/subh-ghosh"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outlined"
                    color="gray"
                    className="flex items-center gap-3 rounded-full px-6 py-3 font-semibold border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5 transition-all hover:scale-105"
                  >
                    <GithubIcon className="w-5 h-5" />
                    GitHub
                  </Button>
                </a>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default About;