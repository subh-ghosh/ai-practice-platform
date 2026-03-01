import React, { useEffect, useState } from 'react';
import { Card, CardBody, Typography, Tooltip, Spinner } from "@material-tailwind/react";
import api from '../../api';

const BadgesSection = () => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            const response = await api.get('/gamification/badges');
            setBadges(response.data);
        } catch (error) {
            console.error("Failed to fetch badges:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-4"><Spinner className="h-6 w-6 text-blue-500" /></div>;

    const earnedCount = badges.filter(b => b.earned).length;

    return (
        <Card className="border border-blue-100/60 dark:border-gray-800 shadow-sm bg-white/90 dark:bg-gray-900/60 backdrop-blur-md">
            <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Typography variant="h5" color="blue-gray" className="dark:text-white font-bold">
                            Achievements
                        </Typography>
                        <Typography variant="small" className="text-gray-600 dark:text-gray-400 font-normal">
                            You've earned {earnedCount} out of {badges.length} badges
                        </Typography>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {badges.map((badge) => (
                        <Tooltip
                            key={badge.code}
                            content={
                                <div className="text-center">
                                    <Typography color="white" className="font-bold text-xs">{badge.displayName}</Typography>
                                    <Typography color="white" className="font-normal text-xs opacity-80">{badge.description}</Typography>
                                </div>
                            }
                            placement="top"
                            className="bg-gray-900 dark:bg-gray-800 px-4 py-3 rounded-xl shadow-xl z-50 pointer-events-none"
                        >
                            <div
                                className={`
                                    relative group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300
                                    ${badge.earned
                                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md hover:scale-105 cursor-pointer'
                                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-80'
                                    }
                                `}
                            >
                                <div className={`text-4xl mb-2 transition-transform duration-300 ${badge.earned ? 'group-hover:scale-110' : ''}`}>
                                    {badge.icon}
                                </div>
                                <Typography
                                    variant="small"
                                    className={`text-xs font-bold text-center ${badge.earned ? 'text-blue-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500'}`}
                                >
                                    {badge.displayName}
                                </Typography>
                                {badge.earned && (
                                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                                )}
                            </div>
                        </Tooltip>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
};

export default BadgesSection;
