import React, { useRef, useState, useEffect } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";

/**
 * Custom Magnetic Button component that reacts to mouse proximity.
 */
export const MagneticButton = ({ children, onClick, className }) => {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPressed, setIsPressed] = useState(false);

    const handleMouse = (e) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
        setIsPressed(false);
    };

    const { x, y } = position;
    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            animate={{ x, y, scale: isPressed ? 0.95 : 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            onClick={onClick}
            className={`magnetic-btn-target ${className}`}
        >
            {children}
        </motion.button>
    );
};

/**
 * Custom Liquid Glass Cursor component with magnetic snapping and text lens effects.
 */
export const CustomCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const trailX = useSpring(cursorX, { stiffness: 400, damping: 28, mass: 0.5 });
    const trailY = useSpring(cursorY, { stiffness: 400, damping: 28, mass: 0.5 });

    const [isHoveringText, setIsHoveringText] = useState(false);
    const [isHoveringMagnetic, setIsHoveringMagnetic] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [velocity, setVelocity] = useState({ x: 0, y: 0 });
    const [accentColor, setAccentColor] = useState({ shadow: "rgba(147,197,253,0.3)", dot: "rgba(147, 197, 253, 0.6)", dotShadow: "rgba(147, 197, 253, 0.4)" }); // Default Blue
    const lastPos = useRef({ x: 0, y: 0 });
    const lastTime = useRef(Date.now());
    const magneticOrigin = useRef({ x: 0, y: 0, width: 0, height: 0, borderRadius: '50%' });

    useEffect(() => {
        let animationFrameId;

        const calculateVelocity = () => {
            const now = Date.now();
            const dt = Math.max(1, now - lastTime.current);

            const dx = cursorX.get() - lastPos.current.x;
            const dy = cursorY.get() - lastPos.current.y;

            // Calculate speed and direction
            const vx = dx / dt;
            const vy = dy / dt;

            // Limit extreme stretching
            setVelocity({
                x: Math.min(Math.max(vx * 15, -30), 30),
                y: Math.min(Math.max(vy * 15, -30), 30)
            });

            lastPos.current = { x: cursorX.get(), y: cursorY.get() };
            lastTime.current = now;

            animationFrameId = requestAnimationFrame(calculateVelocity);
        };

        animationFrameId = requestAnimationFrame(calculateVelocity);

        return () => cancelAnimationFrame(animationFrameId);
    }, [cursorX, cursorY]);

    useEffect(() => {
        const moveCursor = (e) => {
            if (!isHoveringMagnetic) {
                cursorX.set(e.clientX);
                cursorY.set(e.clientY);
            } else {
                // Subtle magnetic pull toward the center of the hovered element
                const { x, y, width, height } = magneticOrigin.current;
                const centerX = x + width / 2;
                const centerY = y + height / 2;

                // Follow mouse but bound tightly to the element
                const boundedX = Math.max(x, Math.min(e.clientX, x + width));
                const boundedY = Math.max(y, Math.min(e.clientY, y + height));

                // Mix actual position with center pull
                cursorX.set(boundedX * 0.4 + centerX * 0.6);
                cursorY.set(boundedY * 0.4 + centerY * 0.6);
            }
        };

        const handleMouseOver = (e) => {
            const el = e.target;
            const tagName = el.tagName?.toLowerCase();

            // Color Adaptation Logic
            if (el.closest('.hover\\:border-purple-500\\/40') || el.closest('.text-purple-500') || el.closest('.bg-purple-600\\/10')) {
                setAccentColor({ shadow: "rgba(192,132,252,0.3)", dot: "rgba(192, 132, 252, 0.6)", dotShadow: "rgba(192, 132, 252, 0.4)" }); // Purple
            } else if (el.closest('.hover\\:border-green-500\\/40') || el.closest('.text-green-500') || el.closest('.bg-green-600\\/10')) {
                setAccentColor({ shadow: "rgba(134,239,172,0.3)", dot: "rgba(134, 239, 172, 0.6)", dotShadow: "rgba(134, 239, 172, 0.4)" }); // Green
            } else if (el.closest('.hover\\:border-amber-500\\/40') || el.closest('.text-amber-500')) {
                setAccentColor({ shadow: "rgba(253,230,138,0.3)", dot: "rgba(253, 230, 138, 0.6)", dotShadow: "rgba(253, 230, 138, 0.4)" }); // Amber
            } else if (el.closest('.hover\\:border-indigo-500\\/40') || el.closest('.text-indigo-400')) {
                setAccentColor({ shadow: "rgba(165,180,252,0.3)", dot: "rgba(165, 180, 252, 0.6)", dotShadow: "rgba(165, 180, 252, 0.4)" }); // Indigo
            } else if (el.closest('.hover\\:border-cyan-500\\/40') || el.closest('.text-cyan-400')) {
                setAccentColor({ shadow: "rgba(34,211,238,0.3)", dot: "rgba(34, 211, 238, 0.6)", dotShadow: "rgba(34, 211, 238, 0.4)" }); // Cyan
            } else {
                setAccentColor({ shadow: "rgba(147,197,253,0.3)", dot: "rgba(147, 197, 253,0.6)", dotShadow: "rgba(147, 197, 253, 0.4)" }); // Default Blue
            }

            // Magnetic snapping for Parallax Icons & Bento Cards
            if (
                (el.classList?.contains('bg-[#121215]') && el.classList?.contains('rounded-3xl')) ||
                el.closest('.group.relative.rounded-\\[2rem\\]') ||
                el.closest('.magnetic-btn-target')
            ) {
                const targetEl = el.closest('.group.relative.rounded-\\[2rem\\]') ||
                    el.closest('.magnetic-btn-target') ||
                    el;

                const rect = targetEl.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(targetEl);

                magneticOrigin.current = {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                    borderRadius: computedStyle.borderRadius || '24px'
                };
                setIsHoveringMagnetic(true);
                setIsHoveringText(false);
            }
            // Text zoom effect
            else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'li'].includes(tagName) || el.closest('.glass-zoom')) {
                setIsHoveringText(true);
                setIsHoveringMagnetic(false);
                el.classList.add('glass-hover-active');
            }
            else {
                setIsHoveringText(false);
                setIsHoveringMagnetic(false);
            }
        };

        const handleMouseOut = (e) => {
            if (e.target.classList?.contains('glass-hover-active')) {
                e.target.classList.remove('glass-hover-active');
            }
            setIsHoveringMagnetic(false); // Reset magnetic state just in case
        };

        const handleMouseDown = () => setIsClicked(true);
        const handleMouseUp = () => setIsClicked(false);

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", handleMouseOver);
        window.addEventListener("mouseout", handleMouseOut);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", handleMouseOver);
            window.removeEventListener("mouseout", handleMouseOut);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isHoveringMagnetic, isHoveringText, cursorX, cursorY]);

    // Calculate dynamic rotation and squash/stretch based on velocity
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    const angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);
    const stretchX = isHoveringText || isHoveringMagnetic ? 1 : 1 + Math.min(speed / 40, 0.4);
    const stretchY = isHoveringText || isHoveringMagnetic ? 1 : 1 - Math.min(speed / 80, 0.2);

    // Determine active state sizing
    let cursorWidth = 70;
    let cursorHeight = 70;
    let cursorRadius = "50%";

    if (isHoveringMagnetic) {
        cursorWidth = magneticOrigin.current.width + 16;
        cursorHeight = magneticOrigin.current.height + 16;
        cursorRadius = magneticOrigin.current.borderRadius;
    } else if (isHoveringText) {
        cursorWidth = 120;
        cursorHeight = 80;
        cursorRadius = "24px";
    } else if (isClicked) {
        // Squish on click
        cursorWidth = 60;
        cursorHeight = 50;
    }

    // Offset calculations to keep cursor centered on mouse
    const xOffset = cursorWidth / 2;
    const yOffset = cursorHeight / 2;

    return (
        <>
            <style>{`
        @keyframes liquidMorph {
          0%   { border-radius: 50%; }
          25%  { border-radius: 55% 45% 40% 60% / 40% 60% 50% 50%; }
          50%  { border-radius: 40% 60% 50% 50% / 55% 45% 40% 60%; }
          75%  { border-radius: 60% 40% 55% 45% / 45% 55% 60% 40%; }
          100% { border-radius: 50%; }
        }
        .animate-liquid {
          animation: liquidMorph 3.5s infinite ease-in-out alternate;
        }
        
        /* The Text Zoom Effect underneath the lens */
        .glass-hover-active {
          transform: scale(1.05); /* Slight physical bulge */
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-shadow: 0 0 15px rgba(255,255,255,0.4);
        }
        
        /* Text elements reset */
        h1, h2, h3, h4, h5, h6, p, span {
          transition: transform 0.3s ease-out, text-shadow 0.3s ease-out;
        }
      `}</style>

            {/* 1. Trailing Glow Dot */}
            <motion.div
                className="fixed hidden md:flex top-0 left-0 pointer-events-none z-[9998] rounded-full mix-blend-screen"
                initial={{ width: 12, height: 12, opacity: 0 }}
                animate={{
                    width: isHoveringMagnetic ? 0 : (isHoveringText ? 24 : 12),
                    height: isHoveringMagnetic ? 0 : (isHoveringText ? 24 : 12),
                    opacity: isHoveringMagnetic ? 0 : (isClicked ? 0.8 : 0.4),
                    backgroundColor: isHoveringText ? "rgba(255, 255, 255, 0.4)" : accentColor.dot,
                    boxShadow: `0 0 20px 5px ${accentColor.dotShadow}`
                }}
                transition={{ type: "spring", stiffness: 500, damping: 25, mass: 0.1 }}
                style={{
                    x: useTransform(trailX, x => x - (isHoveringText ? 12 : 6)),
                    y: useTransform(trailY, y => y - (isHoveringText ? 12 : 6)),
                }}
            />

            {/* 2. Main Liquid / Magnetic Cursor */}
            <motion.div
                className={`fixed hidden md:flex top-0 left-0 pointer-events-none z-[9999] will-change-transform overflow-hidden ${(!isHoveringText && !isHoveringMagnetic && !isClicked && speed < 5) ? 'animate-liquid' : ''}`}
                animate={{
                    width: cursorWidth,
                    height: cursorHeight,
                    borderRadius: cursorRadius,
                    backgroundColor: isHoveringMagnetic ? "transparent" : "transparent",
                    backdropFilter: (isHoveringText || isHoveringMagnetic)
                        ? "saturate(150%) brightness(1.1) contrast(1.1)"
                        : "saturate(140%) brightness(1.2)",
                    WebkitBackdropFilter: (isHoveringText || isHoveringMagnetic)
                        ? "saturate(150%) brightness(1.1) contrast(1.1)"
                        : "saturate(140%) brightness(1.2)",
                    border: isHoveringText
                        ? "2px solid rgba(255, 255, 255, 0.5)"
                        : isHoveringMagnetic
                            ? "1.5px solid rgba(255, 255, 255, 0.3)"
                            : "1.5px solid rgba(255, 255, 255, 0.15)",
                    boxShadow: isHoveringText
                        ? "0 20px 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.2)"
                        : isHoveringMagnetic
                            ? `0 15px 40px rgba(0,0,0,0.6), inset 0 0 30px rgba(255,255,255,0.15), 0 0 20px ${accentColor.shadow}`
                            // Subtle Glow added here (Dynamic color)
                            : `inset 0 0 20px rgba(255,255,255,0.1), inset 10px 0 20px rgba(255,255,255,0.05), 0 0 15px ${accentColor.shadow}, 0 10px 40px rgba(0,0,0,0.5)`,
                    scale: isHoveringText ? 1.5 : (isHoveringMagnetic ? 1.05 : (isClicked ? 0.9 : 1)),
                    // Apply velocity stretching
                    scaleX: isHoveringMagnetic ? 1 : stretchX,
                    scaleY: isHoveringMagnetic ? 1 : stretchY,
                    rotate: isHoveringMagnetic || isHoveringText ? 0 : angle
                }}
                // Faster spring for snappy magnetic feel, softer for liquid feel
                transition={{
                    type: "spring",
                    stiffness: (isHoveringMagnetic || isClicked) ? 400 : 350,
                    damping: (isHoveringMagnetic || isClicked) ? 30 : 25,
                    mass: isHoveringMagnetic ? 0.4 : 0.6
                }}
                style={{
                    // When magnetic, we center the box over the element precisely.
                    x: useTransform(cursorX, x => x - (isHoveringMagnetic ? cursorWidth / 2 : xOffset)),
                    y: useTransform(cursorY, y => y - (isHoveringMagnetic ? cursorHeight / 2 : yOffset)),
                    // Keep origin purely centered so rotation and squashing look correct
                    transformOrigin: "center center"
                }}
            >
                {/* Glass Specular Reflection Highlight */}
                <motion.div
                    className="absolute rounded-full bg-white/60 blur-[3px]"
                    animate={{
                        width: (isHoveringText || isHoveringMagnetic) ? 0 : 20,
                        height: (isHoveringText || isHoveringMagnetic) ? 0 : 14,
                        top: (isHoveringText || isHoveringMagnetic) ? 4 : 10,
                        left: (isHoveringText || isHoveringMagnetic) ? "50%" : 16,
                        x: (isHoveringText || isHoveringMagnetic) ? "-50%" : 0,
                        opacity: (isHoveringText || isHoveringMagnetic || isClicked) ? 0 : 0.6
                    }}
                    transition={{ duration: 0.3 }}
                />
                {/* Chromatic Edge simulation on Text Hover */}
                <motion.div
                    className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-400 via-white to-purple-400 blur-[1px]"
                    animate={{ opacity: isHoveringText ? 0.9 : 0 }}
                />

                {/* Ripple Effect for Click */}
                {isClicked && !isHoveringMagnetic && !isHoveringText && (
                    <motion.div
                        className="absolute inset-0 rounded-full border border-blue-400/50"
                        initial={{ scale: 0.8, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                )}
            </motion.div>
        </>
    );
};
