import React from "react";
import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Button,
  Chip,
} from "@material-tailwind/react";

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

export function About() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center overflow-hidden">
      {/* Background base + glow blobs */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900" />
      <div className="absolute top-[-15%] right-[-10%] h-[340px] w-[340px] rounded-full bg-blue-600/25 blur-[120px]" />
      <div className="absolute bottom-[-15%] left-[-10%] h-[320px] w-[320px] rounded-full bg-indigo-600/25 blur-[120px]" />
      <div className="absolute top-[35%] left-[25%] h-[200px] w-[200px] rounded-full bg-fuchsia-500/20 blur-[90px]" />

      <div className="container mx-auto max-w-4xl px-4 py-10 md:py-14">
        <Card className="rounded-3xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl shadow-2xl">
          <CardBody className="text-center p-6 md:p-10">
            <Avatar
              src="https://avatars.githubusercontent.com/u/176177158?v=4"
              alt="Subarta Ghosh"
              className="mb-6 shadow-lg w-32 h-32 md:w-40 md:h-40 mx-auto ring-4 ring-blue-500/15 rounded-2xl object-cover"
            />

            <Typography
              variant="h2"
              className="mb-2 text-gray-900 dark:text-gray-100 text-3xl md:text-4xl"
            >
              Subarta Ghosh
            </Typography>

            {/* Tags */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
              <Chip
                value="BUILDER"
                className="rounded-full px-3 py-1 text-[11px] font-semibold bg-green-100 text-green-800 dark:bg-green-600/20 dark:text-green-200 dark:ring-1 dark:ring-green-500/30"
              />
              <Chip
                value="CS STUDENT"
                className="rounded-full px-3 py-1 text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-600/20 dark:text-blue-200 dark:ring-1 dark:ring-blue-500/30"
              />
              <Chip
                value="VIT VELLORE"
                className="rounded-full px-3 py-1 text-[11px] font-semibold bg-gray-200 text-gray-800 dark:bg-gray-600/30 dark:text-gray-200 dark:ring-1 dark:ring-gray-400/30"
              />
            </div>

            {/* Bio */}
            <div className="mx-auto max-w-2xl text-left">
              <Typography className="mb-3 text-blue-gray-700 dark:text-gray-300">
                I like building simple tools that help students learn with ease.
                This site focuses on small steps, clear feedback, and steady growth.
              </Typography>
              <Typography className="text-blue-gray-700 dark:text-gray-300">
                Things I enjoy: creating useful products, clean design, and making
                learning feel friendly.
              </Typography>
            </div>

            {/* Links */}
            <div className="mt-8 md:mt-10 flex flex-wrap justify-center gap-3 md:gap-4">
              <a
                href="https://www.linkedin.com/in/subhh/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outlined"
                  color="blue"
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 md:px-6 md:py-3 font-semibold border-blue-400 text-blue-700 hover:bg-blue-50 hover:scale-[1.02] transition-all duration-200 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-500/20"
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
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 md:px-6 md:py-3 font-semibold border-gray-400 text-gray-900 hover:bg-gray-50 hover:scale-[1.02] transition-all duration-200 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700/30"
                >
                  <GithubIcon className="w-5 h-5" />
                  GitHub
                </Button>
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

export default About;
