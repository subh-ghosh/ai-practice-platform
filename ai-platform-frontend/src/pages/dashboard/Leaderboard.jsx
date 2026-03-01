import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
    Typography,
    Card,
    CardBody,
    Spinner,
    Avatar,
    Tooltip,
} from "@material-tailwind/react";
import {
    TrophyIcon,
    StarIcon,
    FireIcon,
    UserCircleIcon,
    BoltIcon,
} from '@heroicons/react/24/solid';
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await api.get('/students/leaderboard');
            setLeaders(response.data);
        } catch (err) {
            console.error("Failed to load leaderboard:", err);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Level Calculation
    const getLevel = (xp) => Math.floor((xp || 0) / 1000) + 1;

    // Helper: Avatar Logic
    const getAvatar = (student) => {
        if (student.avatarUrl && student.avatarUrl.startsWith("http")) return student.avatarUrl;
        const gender = student.gender || "male";
        return gender === "female"
            ? "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/woman-user-circle-icon.png"
            : "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-circle-icon.png";
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <div className="mt-8 mb-8 flex flex-col gap-8">
            {/* Header */}
            <div>
                <Typography variant="h4" color="blue-gray" className="dark:text-white font-bold tracking-tight">
                    Leaderboard
                </Typography>
                <Typography variant="lead" className="text-gray-500 dark:text-gray-400 font-normal mt-1">
                    Compete with top learners and climb the ranks!
                </Typography>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <Spinner className="h-12 w-12 text-blue-500" />
                </div>
            ) : leaders.length === 0 ? (
                <Card className="border border-blue-100/60 dark:border-gray-800 shadow-sm bg-white/90 dark:bg-gray-900/60 backdrop-blur-md">
                    <CardBody className="text-center py-16">
                        <TrophyIcon className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                        <Typography variant="h6" color="blue-gray" className="dark:text-white">
                            No champions yet. Be the first to rise!
                        </Typography>
                    </CardBody>
                </Card>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-6"
                >
                    {/* Top 3 Podium (Visible on larger screens) */}
                    <div className="hidden lg:flex justify-center items-end gap-6 mb-8 px-4">
                        {/* 2nd Place */}
                        {leaders[1] && (
                            <motion.div variants={itemVariants} className="flex flex-col items-center">
                                <Avatar
                                    src={getAvatar(leaders[1])}
                                    alt="2nd"
                                    size="xl"
                                    className="border-4 border-gray-300 shadow-lg mb-[-16px] z-10 bg-white"
                                />
                                <div className="bg-white/70 dark:bg-gray-500/10 backdrop-blur-md w-32 h-40 rounded-t-2xl flex flex-col justify-start pt-6 items-center shadow-md border border-blue-100/60 dark:border-gray-800">
                                    <Typography variant="h4" className="font-bold text-gray-500 dark:text-gray-300">2</Typography>
                                    <Typography variant="small" className="font-bold text-blue-gray-900 dark:text-white mt-1 text-center px-2 truncate w-full">{leaders[1].firstName}</Typography>
                                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                        <BoltIcon className="h-3 w-3" /> {leaders[1].totalXp} XP
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {leaders[0] && (
                            <motion.div variants={itemVariants} className="flex flex-col items-center">
                                <div className="relative">
                                    <TrophyIcon className="h-8 w-8 text-yellow-400 absolute -top-10 left-1/2 -translate-x-1/2 drop-shadow-lg animate-bounce" />
                                    <Avatar
                                        src={getAvatar(leaders[0])}
                                        alt="1st"
                                        size="xxl"
                                        className="border-4 border-yellow-400 shadow-xl mb-[-20px] z-10 bg-white ring-4 ring-yellow-400/20"
                                    />
                                </div>
                                <div className="bg-white/70 dark:bg-yellow-500/10 backdrop-blur-md w-40 h-52 rounded-t-2xl flex flex-col justify-start pt-8 items-center shadow-lg border border-yellow-200/50 dark:border-yellow-700/50">
                                    <Typography variant="h3" className="font-bold text-yellow-600 dark:text-yellow-400">1</Typography>
                                    <Typography variant="h6" className="font-bold text-blue-gray-900 dark:text-white mt-1 text-center px-2 truncate w-full">{leaders[0].firstName}</Typography>
                                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-400/20 px-3 py-1 rounded-full">
                                        <BoltIcon className="h-3.5 w-3.5" /> {leaders[0].totalXp} XP
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {leaders[2] && (
                            <motion.div variants={itemVariants} className="flex flex-col items-center">
                                <Avatar
                                    src={getAvatar(leaders[2])}
                                    alt="3rd"
                                    size="xl"
                                    className="border-4 border-orange-300 shadow-lg mb-[-16px] z-10 bg-white"
                                />
                                <div className="bg-white/70 dark:bg-orange-500/10 backdrop-blur-md w-32 h-32 rounded-t-2xl flex flex-col justify-start pt-6 items-center shadow-md border border-orange-200/50 dark:border-orange-700/50">
                                    <Typography variant="h4" className="font-bold text-orange-500 dark:text-orange-300">3</Typography>
                                    <Typography variant="small" className="font-bold text-blue-gray-900 dark:text-white mt-1 text-center px-2 truncate w-full">{leaders[2].firstName}</Typography>
                                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-orange-500 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                                        <BoltIcon className="h-3 w-3" /> {leaders[2].totalXp} XP
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* List View */}
                    <Card className="border border-blue-100/60 dark:border-gray-800 shadow-sm overflow-hidden bg-white/90 dark:bg-gray-900/60 backdrop-blur-md">
                        <CardBody className="p-0">
                            <table className="w-full min-w-[640px] table-auto text-left">
                                <thead className="bg-gray-50/50 dark:bg-white/5">
                                    <tr>
                                        {["Rank", "Learner", "Level & Stats", "Streak"].map((el) => (
                                            <th key={el} className="border-b border-blue-gray-50 dark:border-white/10 py-4 px-6">
                                                <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400 dark:text-gray-500">
                                                    {el}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaders.map((student, index) => {
                                        const isCurrentUser = user?.email === student.email;
                                        const isTop3 = index < 3;
                                        const rankColor = index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-500" : index === 2 ? "text-orange-500" : "text-blue-gray-900 dark:text-gray-400";

                                        return (
                                            <motion.tr
                                                key={student.id}
                                                variants={itemVariants}
                                                className={`hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors border-b border-blue-gray-50 dark:border-white/5 last:border-none ${isCurrentUser ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                                            >
                                                <td className="py-4 px-6 w-16 text-center">
                                                    <Typography variant="h6" className={`font-bold ${rankColor}`}>
                                                        {index + 1}
                                                    </Typography>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar
                                                            src={getAvatar(student)}
                                                            alt={student.firstName}
                                                            size="md"
                                                            className={`border-2 ${isTop3 ? "border-" + (index === 0 ? "yellow" : index === 1 ? "gray" : "orange") + "-400" : "border-transparent"} shadow-sm bg-white`}
                                                        />
                                                        <div>
                                                            <Typography variant="small" color="blue-gray" className="font-bold dark:text-white flex items-center gap-2">
                                                                {student.firstName} {student.lastName}
                                                                {isCurrentUser && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">You</span>}
                                                            </Typography>
                                                            <Typography variant="small" className="text-gray-400 text-xs font-medium">
                                                                {student.headline || "Aspiring AI Engineer"}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                                                                Lvl {getLevel(student.totalXp)}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-sm font-bold text-blue-gray-700 dark:text-gray-300">
                                                                <BoltIcon className="h-4 w-4 text-yellow-500" />
                                                                {student.totalXp?.toLocaleString()} XP
                                                            </div>
                                                        </div>
                                                        <div className="w-24 h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 rounded-full"
                                                                style={{ width: `${((student.totalXp % 1000) / 1000) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {student.streakDays > 0 ? (
                                                        <Tooltip content={`${student.streakDays} Day Streak!`}>
                                                            <div className="flex items-center gap-1.5 font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 px-3 py-1.5 rounded-full w-fit border border-orange-100 dark:border-orange-800/30">
                                                                <FireIcon className="h-4 w-4 animate-pulse" />
                                                                {student.streakDays}
                                                            </div>
                                                        </Tooltip>
                                                    ) : (
                                                        <Typography variant="small" className="text-gray-400 italic">No streak</Typography>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </CardBody>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export { Leaderboard };
export default Leaderboard;
