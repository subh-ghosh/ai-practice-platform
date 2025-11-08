import React from "react";
import { Button, Typography } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLongRightIcon,
  PuzzlePieceIcon,
  AcademicCapIcon,
  ChartBarIcon
} from "@heroicons/react/24/solid";

export function Landing() {
  const navigate = useNavigate();

  return (
    // Use a fragment (<>) to hold both sections
    <>
      {/* --- HERO SECTION --- */}
      <div className="relative flex h-[70vh] content-center items-center justify-center">
        {/* ... (Hero section content - no changes) ... */}
        <div className="absolute top-0 h-full w-full bg-gray-900" />
        <div className="container relative mx-auto">
          <div className="flex flex-wrap items-center">
            <div className="ml-auto mr-auto w-full px-4 text-left lg:w-7/12">
              <Typography
                variant="h1"
                color="white"
                className="mb-6 font-black"
              >
                Your Smart Self-Practice Platform
              </Typography>
              <Typography variant="lead" color="white" className="opacity-80">
                Our platform uses generative AI to dynamically create unique
                questions and provides immediate, context-aware feedback on your answers.
                Practice any subject, at any difficulty, anytime.
              </Typography>
              <div className="mt-10 flex gap-4">
                <Button
                  variant="gradient"
                  color="white"
                  size="lg"
                  className="flex items-center justify-center gap-2"
                  onClick={() => navigate("/auth/sign-in")}
                >
                  Get Started
                  <ArrowLongRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="ml-auto mr-auto hidden w-full px-4 lg:flex lg:w-4/12 items-center justify-center">
               <img
                  src="/img/logo-ct.png"
                  alt="AI Practice Platform Logo"
                  className="w-full max-w-[200px] opacity-80"
               />
            </div>
          </div>
        </div>
      </div>

      {/* --- CORE FEATURES SECTION --- */}
      <section className="bg-white py-6 px-4 dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            {/* --- 👇 THIS IS THE CHANGE --- 👇 */}
            <Typography variant="h2" color="blue-gray" className="mb-4 dark:text-gray-100">
              Core Features
            </Typography>
            <Typography variant="lead" color="blue-gray" className="mx-auto w-full max-w-3xl dark:text-gray-300">
              Our platform is built from the ground up to provide a seamless,
              intelligent learning experience.
            </Typography>
            {/* --- 👆 END OF CHANGE --- 👆 */}
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">

            {/* Feature 1 */}
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-blue-500 text-white shadow-lg">
                <PuzzlePieceIcon className="h-8 w-8" />
              </div>
              <Typography variant="h5" color="blue-gray" className="mb-2 dark:text-gray-100">
                Dynamic Questions
              </Typography>
              {/* --- 👇 THIS IS THE CHANGE --- 👇 */}
              <Typography color="blue-gray" className="font-normal dark:text-gray-300">
                Questions are generated on-demand by the Gemini API based on your
                chosen subject and difficulty level.
              </Typography>
              {/* --- 👆 END OF CHANGE --- 👆 */}
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-blue-500 text-white shadow-lg">
                <AcademicCapIcon className="h-8 w-8" />
              </div>
              <Typography variant="h5" color="blue-gray" className="mb-2 dark:text-gray-100">
                AI-Powered Evaluation
              </Typography>
              {/* --- 👇 THIS IS THE CHANGE --- 👇 */}
              <Typography color="blue-gray" className="font-normal dark:text-gray-300">
                Submitted answers are sent to the AI for a detailed,
                context-aware evaluation, not just "Correct/Incorrect".
              </Typography>
              {/* --- 👆 END OF CHANGE --- 👆 */}
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-blue-500 text-white shadow-lg">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <Typography variant="h5" color="blue-gray" className="mb-2 dark:text-gray-100">
                Progress Tracking
              </Typography>
              {/* --- 👇 THIS IS THE CHANGE --- 👇 */}
              <Typography color="blue-gray" className="font-normal dark:text-gray-300">
                View a complete history of all questions asked, your answers,
                and all the AI-generated feedback you've received.
              </Typography>
              {/* --- 👆 END OF CHANGE --- 👆 */}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default Landing;