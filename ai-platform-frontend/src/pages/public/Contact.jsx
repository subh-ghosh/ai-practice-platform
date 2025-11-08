import React from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { PhoneIcon, EnvelopeIcon, BugAntIcon, LightBulbIcon } from "@heroicons/react/24/solid";

export function Contact() {
  return (
    <section className="relative overflow-hidden min-h-[calc(100vh-80px)] flex items-start md:items-center">
      {/* Background gradient + subtle glow blobs */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900" />
      <div className="pointer-events-none absolute -top-16 right-[-10%] h-72 w-72 rounded-full bg-blue-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 left-[-10%] h-72 w-72 rounded-full bg-indigo-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 left-[28%] h-52 w-52 rounded-full bg-fuchsia-500/20 blur-[90px]" />

      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
        {/* Header */}
        <div className="mb-5 text-center">
          <Typography variant="h2" className="mb-2 text-gray-900 dark:text-gray-100">
            Contact & Support
          </Typography>
          <Typography variant="lead" className="text-blue-gray-700 dark:text-gray-300">
            Questions, ideas, or issues — I’d love to hear from you.
          </Typography>
        </div>

        {/* Support policy — compact, glassy */}
        <Card className="rounded-2xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl mb-5">
          <CardBody className="px-6 py-4">
            <Typography variant="h6" className="mb-1 text-gray-900 dark:text-gray-100">
              Support policy
            </Typography>
            <ul className="list-disc pl-5 space-y-1 text-sm text-blue-gray-700 dark:text-gray-300">
              <li>Made for students who want quick, clear practice.</li>
              <li>We usually reply within 48 hours (Mon–Fri, IST).</li>
              <li>Please share what you tried, what you saw, and a screenshot if you can.</li>
            </ul>
          </CardBody>
        </Card>

        {/* Four cards on one row (desktop) */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Email */}
          <Card className="rounded-2xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow">
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <EnvelopeIcon className="h-6 w-6 text-blue-500" />
                <Typography variant="h6" className="text-gray-900 dark:text-gray-100">Email</Typography>
              </div>
              <Typography className="text-sm text-blue-gray-700 dark:text-gray-300">
                subartaghosh6@gmail.com
              </Typography>
              <Button
                variant="text"
                onClick={() => (window.location.href = "mailto:subartaghosh6@gmail.com")}
                className="mt-2 text-blue-600 dark:text-blue-300 underline text-sm px-0"
              >
                Write an email
              </Button>
            </CardBody>
          </Card>

          {/* Phone */}
          <Card className="rounded-2xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow">
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <PhoneIcon className="h-6 w-6 text-blue-500" />
                <Typography variant="h6" className="text-gray-900 dark:text-gray-100">Phone</Typography>
              </div>
              <Typography className="text-sm text-blue-gray-700 dark:text-gray-300">
                +91 73195 91361
              </Typography>
              <Button
                variant="text"
                onClick={() => (window.location.href = "tel:+917319591361")}
                className="mt-2 text-blue-600 dark:text-blue-300 underline text-sm px-0"
              >
                Call now
              </Button>
            </CardBody>
          </Card>

          {/* Report a bug */}
          <Card className="rounded-2xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow">
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <BugAntIcon className="h-6 w-6 text-red-500" />
                <Typography variant="h6" className="text-gray-900 dark:text-gray-100">Report a bug</Typography>
              </div>
              <Typography className="text-sm text-blue-gray-700 dark:text-gray-300">
                If something doesn’t work, tell us what happened and how we can see it too.
              </Typography>
              <a
                href="https://github.com/subh-ghosh/ai-practice-platform/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 dark:text-blue-300 underline text-sm"
              >
                Open a GitHub issue
              </a>
            </CardBody>
          </Card>

          {/* Request a feature */}
          <Card className="rounded-2xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow">
            <CardBody className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <LightBulbIcon className="h-6 w-6 text-amber-500" />
                <Typography variant="h6" className="text-gray-900 dark:text-gray-100">Request a feature</Typography>
              </div>
              <Typography className="text-sm text-blue-gray-700 dark:text-gray-300">
                Want a new subject, levels, or a better way to review? Tell us.
              </Typography>
              <a
                href="https://github.com/subh-ghosh/ai-practice-platform/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 dark:text-blue-300 underline text-sm"
              >
                Start a discussion
              </a>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default Contact;
