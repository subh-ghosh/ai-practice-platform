import React from "react";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { PhoneIcon, EnvelopeIcon, BugAntIcon, LightBulbIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { Footer } from "@/widgets/layout";

// --- Animations ---
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

export function Contact() {
  const contactCards = [
    {
      title: "Email",
      icon: EnvelopeIcon,
      color: "blue",
      content: "subartaghosh6@gmail.com",
      action: "Write an email",
      onClick: () => (window.location.href = "mailto:subartaghosh6@gmail.com"),
    },
    {
      title: "Phone",
      icon: PhoneIcon,
      color: "blue",
      content: "+91 73195 91361",
      action: "Call now",
      onClick: () => (window.location.href = "tel:+917319591361"),
    },
    {
      title: "Report a bug",
      icon: BugAntIcon,
      color: "red",
      content: "If something doesn’t work, tell us what happened.",
      action: "Open a GitHub issue",
      href: "https://github.com/subh-ghosh/ai-practice-platform/issues",
    },
    {
      title: "Request a feature",
      icon: LightBulbIcon,
      color: "amber",
      content: "Want a new subject, levels, or feature? Tell us.",
      action: "Start a discussion",
      href: "https://github.com/subh-ghosh/ai-practice-platform/discussions",
    },
  ];

  return (
    // ✨ FIX: Main Wrapper holding everything (Content + Footer)
    <div className="relative w-full overflow-hidden flex flex-col min-h-screen">

      {/* === Animated Background (Now covers everything) === */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900 transition-colors duration-500" />

      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"
      />
      <div className="absolute top-1/3 left-[28%] h-52 w-52 rounded-full bg-fuchsia-500/15 blur-[90px] pointer-events-none" />

      {/* Main Content Section */}
      <section className="flex-1 w-full flex items-start md:items-center py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Header */}
            <motion.div variants={fadeInUp} className="mb-8 md:mb-10 text-center">
              <Typography variant="h2" className="mb-3 text-gray-900 dark:text-gray-100 font-bold text-2xl md:text-4xl">
                Contact & Support
              </Typography>
              <Typography variant="lead" className="text-blue-gray-700 dark:text-gray-300 font-normal text-base md:text-xl">
                Questions, ideas, or issues — I’d love to hear from you.
              </Typography>
            </motion.div>

            {/* Support policy */}
            <motion.div variants={fadeInUp}>
              <Card className="rounded-2xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl mb-6 md:mb-8">
                <CardBody className="px-5 py-4 md:px-6 md:py-5">
                  <Typography variant="h6" className="mb-2 text-gray-900 dark:text-gray-100 font-bold">
                    Support policy
                  </Typography>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-blue-gray-700 dark:text-gray-300">
                    <li>Made for students who want quick, clear practice.</li>
                    <li>We usually reply within 48 hours (Mon–Fri, IST).</li>
                    <li>Please share what you tried, what you saw, and a screenshot if you can.</li>
                  </ul>
                </CardBody>
              </Card>
            </motion.div>

            {/* Cards Grid */}
            <motion.div
              variants={staggerContainer}
              className="grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-4"
            >
              {contactCards.map((item, index) => (
                <motion.div key={index} variants={fadeInUp} whileHover={{ y: -5 }}>
                  <Card className="h-full rounded-2xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                    <CardBody className="p-5 md:p-6 flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-${item.color}-50 dark:bg-${item.color}-900/20`}>
                          <item.icon className={`h-5 w-5 text-${item.color}-500`} />
                        </div>
                        <Typography variant="h6" className="text-gray-900 dark:text-gray-100">
                          {item.title}
                        </Typography>
                      </div>
                      <Typography className="text-sm text-blue-gray-600 dark:text-gray-400 mb-4 flex-grow">
                        {item.content}
                      </Typography>

                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-block text-${item.color === 'red' || item.color === 'amber' ? 'blue' : item.color}-600 dark:text-blue-400 font-medium text-sm hover:underline`}
                        >
                          {item.action}
                        </a>
                      ) : (
                        <Button
                          variant="text"
                          onClick={item.onClick}
                          className={`p-0 text-${item.color}-600 dark:text-blue-400 font-medium text-sm normal-case hover:bg-transparent justify-start`}
                          ripple={false}
                        >
                          <span className="hover:underline">{item.action}</span>
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer is now INSIDE the wrapper */}
      <Footer />
    </div>
  );
}

export default Contact;