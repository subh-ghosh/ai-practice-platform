import React from "react";
import { Typography, Button } from "@material-tailwind/react";
import { PhoneIcon, EnvelopeIcon, BugAntIcon, LightBulbIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { Footer } from "@/widgets/layout";

// --- Animations ---
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
    <div className="relative w-full overflow-hidden bg-[#050505] min-h-screen flex flex-col font-sans selection:bg-blue-500/30 -mt-24">

      {/* Background Gradients & Grid (Matches Landing/About) */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
      <div className="absolute top-0 z-0 h-screen w-screen bg-transparent bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,163,255,0.15),transparent)] pointer-events-none" />

      {/* Main Content Section */}
      <section className="relative z-10 flex-1 w-full flex items-center justify-center pt-40 pb-16 min-h-[103vh]">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Header */}
            <motion.div variants={fadeInUp} className="mb-12 text-center">
              <Typography variant="h2" className="mb-4 text-white font-black text-4xl md:text-6xl tracking-tight">
                Contact & Support
              </Typography>
              <Typography className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto">
                Questions, ideas, or technical issues — I’d love to hear from you.
              </Typography>
            </motion.div>

            {/* Support policy Glass Card */}
            <motion.div variants={fadeInUp}>
              <div className="rounded-[2rem] border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-2xl mb-10 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="p-6 md:p-8 relative z-10">
                  <Typography variant="h5" className="mb-4 text-white font-bold flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    Support Policy
                  </Typography>
                  <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-400">
                    <li className="flex gap-3">
                      <span className="text-blue-500 font-bold">01</span>
                      <span>Designed for students who want fast, intelligent practice.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-500 font-bold">02</span>
                      <span>Average response time within 48 hours (Mon–Fri, IST).</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-blue-500 font-bold">03</span>
                      <span>Include logs or screenshots for complex technical issues.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Cards Grid */}
            <motion.div
              variants={staggerContainer}
              className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
            >
              {contactCards.map((item, index) => (
                <motion.div key={index} variants={fadeInUp} whileHover={{ y: -8 }}>
                  <div className="h-full rounded-[2rem] border border-white/5 bg-[#0a0a0c]/90 backdrop-blur-2xl p-6 md:p-8 flex flex-col shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/20 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-2xl bg-${item.color === 'blue' ? 'blue' : item.color === 'red' ? 'red' : 'amber'}-500/10 border border-${item.color === 'blue' ? 'blue' : item.color === 'red' ? 'red' : 'amber'}-500/20`}>
                        <item.icon className={`h-6 w-6 text-${item.color === 'blue' ? 'blue' : item.color === 'red' ? 'red' : 'amber'}-500`} />
                      </div>
                      <Typography variant="h6" className="text-white font-bold">
                        {item.title}
                      </Typography>
                    </div>

                    <Typography className="text-sm text-slate-400 mb-6 flex-grow leading-relaxed font-medium">
                      {item.content}
                    </Typography>

                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm hover:text-blue-300 transition-colors group"
                      >
                        {item.action}
                        <ArrowRightIcon className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <Button
                        variant="text"
                        onClick={item.onClick}
                        className="p-0 text-blue-400 font-bold text-sm normal-case hover:bg-transparent justify-start flex items-center gap-2 group"
                        ripple={false}
                      >
                        {item.action}
                        <ArrowRightIcon className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer stays at the bottom */}
      <div className="relative z-20 mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default Contact;