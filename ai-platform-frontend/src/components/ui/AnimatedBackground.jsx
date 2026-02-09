import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Blob 1: Blue/Purple */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1], 
          rotate: [0, 90, 0],
          x: [0, 100, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-color-dodge"
      />
      
      {/* Blob 2: Cyan/Teal */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1], 
          rotate: [0, -60, 0],
          y: [0, -100, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-400/30 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-color-dodge"
      />

      {/* Blob 3: Pink/Purple Accent */}
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1], 
          x: [0, -100, 0], 
          y: [0, 50, 0] 
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-color-dodge"
      />
    </div>
  );
}