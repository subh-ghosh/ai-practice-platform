import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
    Typography,
    Card,
    CardBody,
    Spinner,
    Chip,
    Avatar,
} from "@material-tailwind/react";
import {
    TrophyIcon,
    StarIcon,
    FireIcon,
} from '@heroicons/react/24/solid';
import { useTheme } from "@/context/ThemeContext.jsx";
import { useAuth } from "@/context/AuthContext";

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();
    const { user } = useAuth();
    const isDark = theme === 'dark';

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

    const getRankStyle = (index) => {
        if (index === 0) return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-300 dark:border-yellow-700', medal: '🥇' };
        if (index === 1) return { bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-300 dark:border-gray-600', medal: '🥈' };
        if (index === 2) return { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-300 dark:border-orange-700', medal: '🥉' };
        return { bg: '', border: 'border-transparent', medal: `#${index + 1}` };
    };

    return (
        <section className="relative isolate -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pb-10 min-h-[calc(100vh-4rem)]">
            {/* Styles & Animations */}
            <style>{`
            /* Animations */
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            @keyframes pulseSoft { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
            
            .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
            .animate-slide-up { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-pop-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            .animate-pulse-soft { animation: pulseSoft 2s infinite ease-in-out; }
            .delay-100 { animation-delay: 100ms; }
          `}</style>

            {/* Background Layer */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-yellow-50 via-orange-50 to-yellow-100 dark:from-gray-900 dark:via-yellow-950 dark:to-gray-900 transition-colors duration-700" />
            <div className="pointer-events-none absolute -top-10 right-[8%] h-64 w-64 rounded-full bg-yellow-300/30 dark:bg-yellow-600/30 blur-3xl animate-pulse-soft" />
            <div className="pointer-events-none absolute top-36 -left-10 h-72 w-72 rounded-full bg-orange-300/25 dark:bg-orange-700/25 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />

            <div className="mt-6 page has-fixed-navbar space-y-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 animate-slide-up relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100/80 backdrop-blur-sm border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 mb-4 shadow-sm">
                        <TrophyIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                        <Typography variant="small" className="font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-widest text-[10px]">
                            Top Learners
                        </Typography>
                    </div>
                    <Typography variant="h2" className={`font-black tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Leaderboard
                    </Typography>
                    <Typography className={`max-w-md mx-auto font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Climb the ranks, earn XP, and become a master.
                    </Typography>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner className="h-10 w-10 text-yellow-500" />
                    </div>
                ) : leaders.length === 0 ? (
                    <Card className={`backdrop-blur-xl border ${isDark ? 'bg-gray-900/50 border-gray-700/50' : 'bg-white/70 border-gray-200/50'}`}>
                        <CardBody className="text-center py-12">
                            <TrophyIcon className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                            <Typography className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                No learners on the leaderboard yet. Be the first!
                            </Typography>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="space-y-4 relative z-10">
                        {leaders.map((student, index) => {
                            const rank = getRankStyle(index);
                            const isCurrentUser = user?.email === student.email;

                            return (
                                <Card
                                    key={student.id}
                                    className={`backdrop-blur-md border transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-lg ${rank.bg ? rank.bg : 'bg-white/80 dark:bg-gray-900/80'} ${rank.border} ${isCurrentUser ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                                        } animate-slide-up`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <CardBody className="p-4 md:p-5">
                                        <div className="flex items-center gap-4 md:gap-6">
                                            {/* Rank */}
                                            <div className="flex-shrink-0 w-12 text-center flex flex-col items-center justify-center">
                                                <span className="text-3xl filter drop-shadow-sm">{rank.medal}</span>
                                            </div>

                                            {/* Avatar */}
                                            <Avatar
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.firstName || 'U')}&background=random&color=fff&bold=true`}
                                                alt={student.firstName}
                                                size="md"
                                                className="border-2 border-white dark:border-gray-700 shadow-md"
                                            />

                                            {/* Name */}
                                            <div className="flex-grow min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Typography variant="h6" className={`font-bold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                        {student.firstName} {student.lastName ? student.lastName : ''}
                                                    </Typography>
                                                    {isCurrentUser && (
                                                        <Chip size="sm" value="YOU" className="bg-purple-500 text-white border-none py-0.5 px-2 rounded-md text-[10px]" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {student.streakDays > 0 && (
                                                        <div className={`flex items-center gap-1 text-xs font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                                                            <FireIcon className="h-3 w-3" />
                                                            {student.streakDays} Day Streak
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* XP */}
                                            <div className="flex-shrink-0 text-right pl-2">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Typography variant="h5" className={`font-black ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                                        {student.totalXp?.toLocaleString() || 0}
                                                    </Typography>
                                                    <StarIcon className="h-5 w-5 text-yellow-500" />
                                                </div>
                                                <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs uppercase tracking-wide`}>
                                                    Total XP
                                                </Typography>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export { Leaderboard };
export default Leaderboard;
