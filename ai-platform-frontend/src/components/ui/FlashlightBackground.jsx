import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * FlashlightBackground component that provides an interactive background effect.
 * Wrap your content with this component to apply the effect.
 */
export const FlashlightBackground = ({ children, className = "" }) => {
    const containerRef = useRef(null);

    // Flashlight Effect Tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out the mouse movements for buttery tracking
    const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 25, mass: 0.2 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 25, mass: 0.2 });

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const { clientX, clientY } = e;
        const { left, top } = containerRef.current.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={`relative group ${className}`}
        >
            {/* Checkered Background & Grid */}
            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>

            {/* Static Top Glow */}
            <div className="absolute top-0 z-0 h-screen w-screen bg-transparent bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,163,255,0.15),transparent)] pointer-events-none" />

            {/* Interactive Flashlight Glow (Purple outer) */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-1000"
                style={{
                    background: useTransform(
                        [smoothMouseX, smoothMouseY],
                        ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(124, 58, 237, 0.05), transparent 45%)`
                    )
                }}
            />

            {/* Interactive Second Flashlight Glow (Blue inner) */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-0 mix-blend-screen opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75"
                style={{
                    background: useTransform(
                        [smoothMouseX, smoothMouseY],
                        ([x, y]) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.05), transparent 45%)`
                    )
                }}
            />

            {/* Content wrapper to ensure it stays above the effect */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};
