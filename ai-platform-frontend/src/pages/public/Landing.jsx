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
  BellAlertIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";

export function Landing() {
  const navigate = useNavigate();

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800" />
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-[-10%] h-[26rem] w-[26rem] rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="container mx-auto px-4 pt-24 pb-40 md:pt-32 md:pb-56">
          <div className="grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <Typography variant="h1" color="white" className="mb-5 font-black leading-tight">
                Practice smarter. Learn faster.
              </Typography>
              <Typography variant="lead" color="white" className="opacity-80 max-w-2xl">
                Get fresh questions, write your answer, and see clear tips right away.
                No noise — just steady progress built for students.
              </Typography>
              <div className="mt-10 flex gap-4">
                <Button
                  variant="gradient"
                  color="white"
                  size="lg"
                  className="flex items-center gap-2 !text-gray-900"
                  onClick={() => navigate("/auth/sign-in")}
                >
                  Start practicing
                  <ArrowLongRightIcon className="h-5 w-5" />
                </Button>
                <Button
                  variant="text"
                  size="lg"
                  className="text-white/90 hover:text-white underline decoration-white/30 hover:decoration-white"
                  onClick={() => navigate("/auth/sign-up")}
                >
                  Create account
                </Button>
              </div>
            </div>

            <div className="md:col-span-5 hidden md:block">
              <Card className="backdrop-blur bg-white/5 border border-white/10 shadow-2xl rounded-3xl p-6">
                <div className="flex items-center justify-center gap-3">
                  <SparklesIcon className="h-8 w-8 text-white/90" />
                  <Typography color="white" className="font-semibold">
                    Practice with instant feedback
                  </Typography>
                </div>
                <CardBody className="text-center">
                  <Typography color="white" className="opacity-80">
                    Simple, friendly, and made for focused study.
                  </Typography>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white dark:bg-gray-900 relative -mt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <Typography variant="h2" className="mb-3 text-gray-900 dark:text-gray-100">
              How it works
            </Typography>
            <Typography className="text-blue-gray-700 dark:text-gray-300">
              A simple loop: try a question → write your answer → get tips → improve.
            </Typography>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                title: "Pick a subject",
                text:
                  "Choose what you want to practice and the level that feels right.",
                icon: AcademicCapIcon,
              },
              {
                title: "Get a fresh question",
                text:
                  "You’ll see a clear, single question with no distractions.",
                icon: SparklesIcon,
              },
              {
                title: "Submit your answer",
                text:
                  "You’ll be told if it’s right, close, or needs work — with a short tip.",
                icon: CheckCircleIcon,
              },
              {
                title: "See your progress",
                text:
                  "Watch your scores and trends so you know what to focus on.",
                icon: ChartBarIcon,
              },
            ].map(({ title, text, icon: Icon }) => (
              <Card
                key={title}
                className="rounded-2xl border border-blue-gray-50/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 backdrop-blur-md"
              >
                <CardBody className="p-6">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-blue-500 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Typography variant="h5" className="mb-2 text-gray-900 dark:text-gray-100">
                    {title}
                  </Typography>
                  <Typography className="text-blue-gray-700 dark:text-gray-300">{text}</Typography>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SUBJECTS & LEVELS */}
      <section className="bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 pb-4">
          <Card className="rounded-3xl border border-blue-gray-50/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60">
            <CardBody className="p-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <Typography variant="h4" className="text-gray-900 dark:text-gray-100">
                    Subjects & levels
                  </Typography>
                  <Typography className="text-blue-gray-700 dark:text-gray-300">
                    Start easy, move up when you’re ready.
                  </Typography>
                </div>
                <div className="flex gap-2">
                  <Chip value="Beginner" color="green" className="rounded-full" />
                  <Chip value="Medium" color="amber" className="rounded-full" />
                  <Chip value="Tough" color="blue" className="rounded-full" />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {[
                  "Programming Basics",
                  "Problem Solving",
                  "Logic & Puzzles",
                  "Math Practice",
                  "Study Skills",
                  "Quick Quizzes",
                ].map((s) => (
                  <div
                    key={s}
                    className="rounded-xl border border-blue-gray-100 dark:border-gray-800 p-4 text-blue-gray-800 dark:text-gray-200"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 pb-20">
          <Card className="rounded-3xl border border-blue-gray-50/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60">
            <CardBody className="p-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <Typography variant="h4" className="text-gray-900 dark:text-gray-100">
                  Ready to practice smarter?
                </Typography>
                <Typography className="text-blue-gray-700 dark:text-gray-300">
                  Create an account and try your first question now.
                </Typography>
              </div>
              <Button
                onClick={() => navigate("/auth/sign-up")}
                variant="gradient"
                color="blue"
                className="rounded-xl"
              >
                Sign up free
              </Button>
            </CardBody>
          </Card>
        </div>
      </section>
    </>
  );
}

export default Landing;
