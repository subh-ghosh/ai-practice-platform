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
        <div className="mt-12">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <Typography variant="h6" color="blue-gray" className="dark:text-white">
                        Leaderboard
                    </Typography>
                    <Typography variant="small" className="font-normal text-blue-gray-600 dark:text-gray-400">
                        Top learners of the week
                    </Typography>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner className="h-10 w-10 text-blue-500" />
                </div>
            ) : leaders.length === 0 ? (
                <Card className="border border-blue-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900/50 backdrop-blur-md">
                    <CardBody className="text-center py-12">
                        <TrophyIcon className="h-16 w-16 mx-auto mb-4 text-blue-gray-200 dark:text-gray-700" />
                        <Typography color="blue-gray" className="font-medium dark:text-white">
                            No learners on the leaderboard yet. Be the first!
                        </Typography>
                    </CardBody>
                </Card>
            ) : (
                <Card className="border border-blue-gray-100 dark:border-gray-800 shadow-sm overflow-hidden bg-white dark:bg-gray-900/50 backdrop-blur-md">
                    <CardBody className="px-0 pt-0 pb-0">
                        <table className="w-full min-w-[640px] table-auto text-left">
                            <thead>
                                <tr>
                                    {["Rank", "Student", "XP", "Streak"].map((el) => (
                                        <th key={el} className="border-b border-blue-gray-50 dark:border-gray-800 py-3 px-6 text-left">
                                            <Typography variant="small" className="text-[11px] font-medium uppercase text-blue-gray-400 dark:text-gray-500">
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {leaders.map((student, index) => {
                                    const rank = getRankStyle(index);
                                    const isCurrentUser = user?.email === student.email;
                                    const className = `py-3 px-5 ${index === leaders.length - 1 ? "" : "border-b border-blue-gray-50 dark:border-gray-800"} ${isCurrentUser ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}`;

                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className={className}>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{rank.medal}</span>
                                                </div>
                                            </td>
                                            <td className={className}>
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.firstName || 'U')}&background=random&color=fff&bold=true`}
                                                        alt={student.firstName}
                                                        size="sm"
                                                        className="border border-blue-gray-50 dark:border-gray-700"
                                                    />
                                                    <div>
                                                        <Typography variant="small" color="blue-gray" className="font-semibold dark:text-white">
                                                            {student.firstName} {student.lastName}
                                                        </Typography>
                                                        {isCurrentUser && (
                                                            <Typography variant="small" className="text-[10px] text-blue-500 font-medium">
                                                                (You)
                                                            </Typography>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={className}>
                                                <div className="flex items-center gap-1">
                                                    <Typography variant="small" color="blue-gray" className="font-bold dark:text-white">
                                                        {student.totalXp?.toLocaleString()}
                                                    </Typography>
                                                    <StarIcon className="h-3.5 w-3.5 text-amber-500" />
                                                </div>
                                            </td>
                                            <td className={className}>
                                                {student.streakDays > 0 ? (
                                                    <div className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                                                        <FireIcon className="h-3.5 w-3.5" />
                                                        {student.streakDays} Days
                                                    </div>
                                                ) : (
                                                    <Typography variant="small" className="text-blue-gray-400 text-xs dark:text-gray-600">
                                                        -
                                                    </Typography>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export { Leaderboard };
export default Leaderboard;
