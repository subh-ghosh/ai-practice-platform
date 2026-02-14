import React from "react";
import { Typography } from "@material-tailwind/react";
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
      content: "If the smart system malfunctions, let us know.",
      action: "Open a GitHub issue",
      href: "https://github.com/subh-ghosh/ai-practice-platform/issues",
    },
    {
      title: "Request a feature",
      icon: LightBulbIcon,
      color: "amber",
      content: "Want a new subject, levels, or smart feature?",
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
                Contact & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Support</span>
              </Typography>
              <Typography className="text-slate-400 font-medium text-lg md:text-xl max-w-2xl mx-auto">
                Questions, ideas, or issues — I’d love to hear from you.
              </Typography>
            </motion.div>

            {/* Support policy - Glass Panel */}
            <motion.div variants={fadeInUp}>
              <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-2xl p-6 md:p-8 mb-10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Typography variant="h6" className="mb-4 text-white font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                  Support Policy
                </Typography>
                <ul className="list-disc pl-5 space-y-2 text-slate-400 font-medium">
                  <li>Designed for students who want quick, clear practice.</li>
                  <li>Inquiries are typically addressed within 48 hours (Mon–Fri, IST).</li>
                  <li>Please include steps to reproduce, expected results, and screenshots if applicable.</li>
                </ul>
              </div>
            </motion.div>

            {/* Cards Grid */}
            <motion.div
              variants={staggerContainer}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              {contactCards.map((item, index) => (
                <motion.div key={index} variants={fadeInUp} whileHover={{ y: -5, scale: 1.02 }}>
                  <div className="h-full rounded-2xl border border-white/5 bg-[#0a0a0c]/90 backdrop-blur-xl p-6 flex flex-col shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/20 transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className={`p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className={`h-6 w-6 text-blue-500`} />
                      </div>
                      <Typography variant="h6" className="text-white font-bold">
                        {item.title}
                      </Typography>
                    </div>

                    <Typography className="text-sm text-slate-400 font-medium mb-6 flex-grow relative z-10 leading-relaxed">
                      {item.content}
                    </Typography>

                    <div className="relative z-10">
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm hover:text-blue-300 transition-colors group/link"
                        >
                          {item.action}
                          <ArrowRightIcon className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                        </a>
                      ) : (
                        <button
                          onClick={item.onClick}
                          className="inline-flex items-center gap-2 text-blue-400 font-bold text-sm hover:text-blue-300 transition-colors group/link"
                        >
                          {item.action}
                          <ArrowRightIcon className="h-3.5 w-3.5 group-hover/link:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <div className="relative z-20 mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default Contact;