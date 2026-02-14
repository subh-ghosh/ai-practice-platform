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
  SparklesIcon,
  AcademicCapIcon,
  ChartBarIcon,
  FireIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { Footer } from "@/widgets/layout";

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden bg-[#0b0f1a] text-white">

      {/* ================= GLOBAL AURORA BACKGROUND ================= */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[180px] top-[-20%] left-[-10%]" />
        <div className="absolute w-[700px] h-[700px] bg-fuchsia-600/20 rounded-full blur-[160px] bottom-[-20%] right-[-10%]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_40%)]" />
      </div>

      {/* ================= HERO ================= */}
      <section className="min-h-[90vh] flex items-center">

        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .8 }}
          >
            <Chip
              value="⚡ AI-Powered Learning"
              className="bg-white/10 text-cyan-400 border border-white/20 rounded-full mb-6"
            />

            <Typography className="text-5xl md:text-7xl font-black leading-tight mb-6">
              Practice smarter.
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 bg-clip-text text-transparent">
                {" "}Dominate faster.
              </span>
            </Typography>

            <Typography className="text-lg text-gray-400 max-w-xl mb-8">
              An AI-powered training ground where students sharpen
              problem-solving with instant feedback and real progress tracking.
            </Typography>

            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/auth/sign-up")}
                size="lg"
                className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 hover:scale-105 transition"
              >
                Start Free
              </Button>

              <Button
                onClick={() => navigate("/auth/sign-in")}
                variant="outlined"
                size="lg"
                className="rounded-full border-white/30 text-white"
              >
                Login
              </Button>
            </div>
          </motion.div>

          {/* RIGHT — FLOATING GLASS CARD */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
              <CardBody className="p-10 text-center">

                <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 w-fit mx-auto mb-6">
                  <SparklesIcon className="h-10 w-10 text-white" />
                </div>

                <Typography variant="h4" className="mb-4">
                  Real-Time AI Feedback
                </Typography>

                <Typography className="text-gray-400 mb-6">
                  “Great logic! Try reducing time complexity using a hashmap.”
                </Typography>

                <div className="bg-white/10 h-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "82%" }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-600"
                  />
                </div>

                <p className="mt-3 text-cyan-400 font-semibold">
                  82% Mastery
                </p>

              </CardBody>
            </Card>
          </motion.div>

        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-24 container mx-auto px-6">

        <Typography className="text-center text-4xl font-bold mb-16">
          How it works
        </Typography>

        <div className="grid md:grid-cols-4 gap-8">

          {[
            { icon: AcademicCapIcon, title: "Pick Topic" },
            { icon: SparklesIcon, title: "Get Question" },
            { icon: FireIcon, title: "Solve & Submit" },
            { icon: ChartBarIcon, title: "Track Growth" },
          ].map(({ icon: Icon, title }) => (
            <motion.div whileHover={{ y: -8 }}>
              <Card className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl">
                <CardBody className="p-8 text-center">

                  <div className="p-4 bg-white/10 rounded-xl w-fit mx-auto mb-4">
                    <Icon className="h-8 w-8 text-cyan-400" />
                  </div>

                  <Typography variant="h6">{title}</Typography>

                </CardBody>
              </Card>
            </motion.div>
          ))}

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20 text-center">

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-cyan-600/30 to-fuchsia-600/30 border border-white/20 backdrop-blur-2xl rounded-3xl">
            <CardBody className="p-16">

              <Typography className="text-4xl font-bold mb-4">
                Ready to level up?
              </Typography>

              <Typography className="text-gray-300 mb-8">
                Join thousands already training smarter with AI.
              </Typography>

              <Button
                onClick={() => navigate("/auth/sign-up")}
                size="lg"
                className="rounded-full bg-white text-black"
              >
                Create Free Account
              </Button>

            </CardBody>
          </Card>
        </motion.div>

      </section>

      <Footer />
    </div>
  );
}

export default Landing;
