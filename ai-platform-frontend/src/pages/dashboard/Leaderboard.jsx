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
        <div className="relative min-h-screen p-4 md:p-6">
            {/* Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-yellow-800' : 'bg-yellow-200'}`} />
                <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-purple-800' : 'bg-purple-200'}`} style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                        <TrophyIcon className="h-5 w-5 text-yellow-600" />
                        <Typography variant="small" className="font-bold text-yellow-700 dark:text-yellow-400">
                            TOP LEARNERS
                        </Typography>
                    </div>
                    <Typography variant="h3" className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Leaderboard
                    </Typography>
                    <Typography className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Climb the ranks by earning XP through quizzes and practice sessions.
                    </Typography>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner className="h-10 w-10 text-purple-500" />
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
                    <div className="space-y-3">
                        {leaders.map((student, index) => {
                            const rank = getRankStyle(index);
                            const isCurrentUser = user?.email === student.email;

                            return (
                                <Card
                                    key={student.id}
                                    className={`backdrop-blur-xl border-2 transition-all duration-300 hover:scale-[1.01] ${rank.bg} ${rank.border} ${isCurrentUser ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900' : ''
                                        } ${isDark && !rank.bg ? 'bg-gray-900/50 border-gray-700/50' : !rank.bg ? 'bg-white/70' : ''}`}
                                >
                                    <CardBody className="p-4">
                                        <div className="flex items-center gap-4">
                                            {/* Rank */}
                                            <div className="flex-shrink-0 w-10 text-center">
                                                <span className="text-2xl">{rank.medal}</span>
                                            </div>

                                            {/* Avatar */}
                                            <Avatar
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.firstName || 'U')}&background=7c3aed&color=fff&bold=true`}
                                                alt={student.firstName}
                                                size="sm"
                                                className="border-2 border-purple-200 dark:border-purple-700"
                                            />

                                            {/* Name */}
                                            <div className="flex-grow">
                                                <Typography variant="h6" className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                    {student.firstName} {student.lastName ? student.lastName.charAt(0) + '.' : ''}
                                                    {isCurrentUser && (
                                                        <Chip size="sm" value="You" className="ml-2 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 normal-case inline-block" />
                                                    )}
                                                </Typography>
                                            </div>

                                            {/* Streak */}
                                            {student.streakDays > 0 && (
                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                                                    🔥 {student.streakDays}
                                                </div>
                                            )}

                                            {/* XP */}
                                            <div className="flex-shrink-0 text-right">
                                                <div className="flex items-center gap-1">
                                                    <StarIcon className="h-4 w-4 text-yellow-500" />
                                                    <Typography variant="h6" className={`font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                                                        {student.totalXp?.toLocaleString() || 0}
                                                    </Typography>
                                                </div>
                                                <Typography variant="small" className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                                    XP
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
        </div>
    );
};

export { Leaderboard };
export default Leaderboard;
