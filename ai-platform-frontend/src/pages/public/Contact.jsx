import React from "react";
import { motion } from "framer-motion";
import { PhoneIcon, EnvelopeIcon, BugAntIcon, LightBulbIcon } from "@heroicons/react/24/solid";
import { Footer } from "@/widgets/layout";

// --- ANIMATIONS ---
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
      action: "Open GitHub issue",
      href: "https://github.com/subh-ghosh/ai-practice-platform/issues",
    },
    {
      title: "Request a feature",
      icon: LightBulbIcon,
      color: "amber",
      content: "Want new neural paths or features? Tell us.",
      action: "Start discussion",
      href: "https://github.com/subh-ghosh/ai-practice-platform/discussions",
    },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-[#050505] flex flex-col min-h-screen font-sans selection:bg-blue-500/30 -mt-24">

      {/* Background Gradients & Grid (Consistent with Landing/About) */}
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
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Center</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto">
                Questions, neural-engine ideas, or technical issues — I’d love to hear from you.
              </p>
            </motion.div>

            {/* Support Policy Panel */}
            <motion.div variants={fadeInUp} className="max-w-3xl mx-auto mb-12">
              <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h3 className="text-xl font-bold text-white mb-4 relative z-10">Smart Support Policy</h3>
                <ul className="space-y-3 text-slate-400 relative z-10">
                  <li className="flex items-start gap-3 text-sm md:text-base leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    Neural-driven practice for students who want quick, clear growth.
                  </li>
                  <li className="flex items-start gap-3 text-sm md:text-base leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    Inquiries are usually analyzed within 48 hours (Mon–Fri, IST).
                  </li>
                  <li className="flex items-start gap-3 text-sm md:text-base leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    Please share steps to reproduce and screenshots for efficient solving.
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Cards Grid */}
            <motion.div
              variants={staggerContainer}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              {contactCards.map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className="h-full"
                >
                  <div className="h-full rounded-[2rem] border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-2xl p-6 flex flex-col shadow-xl hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden group">
                    {/* Neon Glow on Hover */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-center gap-4 mb-5 relative z-10">
                      <div className="p-2.5 rounded-xl bg-slate-800/50 border border-white/10">
                        <item.icon className="h-6 w-6 text-blue-400" />
                      </div>
                      <h4 className="text-lg font-bold text-white tracking-tight">
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-sm text-slate-400 mb-8 leading-relaxed flex-grow relative z-10">
                      {item.content}
                    </p>

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