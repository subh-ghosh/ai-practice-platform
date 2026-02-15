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
    <div className="relative w-full overflow-hidden bg-[#050505] min-h-screen flex flex-col font-sans selection:bg-blue-500/30 -mt-24">

      {/* Background Gradients & Grid */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
      <div className="absolute top-0 z-0 h-screen w-screen bg-transparent bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,163,255,0.15),transparent)] pointer-events-none" />

      {/* Main Content Section */}
      {/* ADJUSTED: pt-24 (was pt-32) and keep min-h-[103vh] for hero feel */}
      <section className="relative z-10 flex-1 w-full flex items-center justify-center pt-24 pb-12 min-h-[103vh]">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Header */}
            <motion.div variants={fadeInUp} className="mb-8 md:mb-10 text-center max-w-2xl mx-auto">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-bold mb-4 tracking-wide uppercase">
                <EnvelopeIcon className="w-3 h-3" /> Get in Touch
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                Contact & Support
              </h1>
              <p className="text-sm md:text-base text-slate-400 leading-relaxed font-medium">
                Questions, feature requests, or just want to say hi? We're here to help.
              </p>
            </motion.div>

            {/* Support policy */}
            <motion.div variants={fadeInUp} className="max-w-3xl mx-auto mb-8">
              <Card className="rounded-[2rem] border border-white/5 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
                <CardBody className="p-6 md:p-8 text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                    <LightBulbIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <Typography variant="h5" className="mb-2 text-white font-bold">
                    Support Policy
                  </Typography>
                  <div className="space-y-1 text-sm text-slate-400 font-medium">
                    <p>Made for students who want quick, clear practice.</p>
                    <p>We usually reply within 48 hours (Mon–Fri, IST).</p>
                    <p>Please share what you tried, what you saw, and a screenshot if you can.</p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Cards Grid */}
            <motion.div
              variants={staggerContainer}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              {contactCards.map((item, index) => (
                <motion.div key={index} variants={fadeInUp} whileHover={{ y: -5 }}>
                  <Card className="h-full rounded-[2rem] border border-white/5 bg-[#0a0a0c]/60 backdrop-blur-xl hover:bg-[#0a0a0c]/80 transition-all duration-300">
                    <CardBody className="p-5 flex flex-col h-full items-center text-center">
                      <div className={`mb-3 p-2.5 rounded-2xl bg-${item.color}-500/10 border border-${item.color}-500/20`}>
                        <item.icon className={`h-5 w-5 text-${item.color}-400`} />
                      </div>
                      <Typography variant="h6" className="text-white mb-1.5 font-bold">
                        {item.title}
                      </Typography>
                      <Typography className="text-xs text-slate-400 mb-4 flex-grow font-medium leading-relaxed">
                        {item.content}
                      </Typography>

                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-${item.color}-400 text-xs font-bold transition-all border border-white/5 hover:border-white/10`}
                        >
                          {item.action}
                        </a>
                      ) : (
                        <Button
                          variant="text"
                          onClick={item.onClick}
                          className={`w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-${item.color}-400 text-xs font-bold transition-all border border-white/5 hover:border-white/10 normal-case`}
                          ripple={false}
                        >
                          {item.action}
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

      {/* Footer */}
      <div className="relative z-20 mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default Contact;