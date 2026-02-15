import React, { useEffect, useState } from 'react';
import { Card, CardBody, Typography, Button, Progress, Tooltip, Spinner } from "@material-tailwind/react";
import { FireIcon, CheckCircleIcon, GiftIcon } from "@heroicons/react/24/solid";
import api from '../../api';
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const DailyChallengesCard = () => {
    const { user, updateUser } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(null);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const response = await api.get('/gamification/daily-challenges');
            setChallenges(response.data);
        } catch (error) {
            console.error("Failed to fetch daily challenges:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (id, xpReward) => {
        setClaiming(id);
        try {
            await api.post(`/gamification/daily-challenges/${id}/claim`);
            // Update local state
            setChallenges(prev => prev.map(c =>
                c.id === id ? { ...c, claimed: true } : c
            ));

            toast.success(`Challenge Claimed! +${xpReward} XP`, { icon: "🎁" });

            // Update user XP locally (optimistic update) or re-fetch user
            if (updateUser && user) {
                updateUser({ ...user, totalXp: (user.totalXp || 0) + xpReward });
            }
        } catch (error) {
            console.error("Failed to claim reward:", error);
        } finally {
            setClaiming(null);
        }
    };

    if (loading) return (
        <Card className="h-full border border-blue-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0c]">
            <CardBody className="flex items-center justify-center p-8">
                <Spinner className="h-6 w-6 text-blue-500" />
            </CardBody>
        </Card>
    );

    return (
        <Card className="h-full border border-blue-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0c] overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full pointer-events-none" />

            <CardBody className="p-6 relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500">
                            <FireIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <Typography variant="h6" color="blue-gray" className="dark:text-white font-bold leading-tight">
                                Daily Quests
                            </Typography>
                            <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-normal text-xs">
                                Resets in 12h 30m
                            </Typography>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 flex-1">
                    {challenges.map((challenge) => (
                        <div key={challenge.id} className="group relative p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-orange-200 dark:hover:border-orange-900/30 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <Typography variant="small" className="font-bold text-blue-gray-900 dark:text-white mb-1">
                                        {challenge.title}
                                    </Typography>
                                    <Typography variant="small" className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">
                                        {challenge.description}
                                    </Typography>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded text-[10px] font-bold text-yellow-600 dark:text-yellow-400 border border-yellow-400/20">
                                    <GiftIcon className="h-3 w-3" />
                                    <span>+{challenge.xpReward} XP</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-2">
                                <div className="flex-1">
                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                        <span>Progress</span>
                                        <span>{challenge.currentAmount} / {challenge.targetAmount}</span>
                                    </div>
                                    <Progress
                                        value={(challenge.currentAmount / challenge.targetAmount) * 100}
                                        size="sm"
                                        color={challenge.isCompleted ? "green" : "orange"}
                                        className="bg-gray-200 dark:bg-gray-700"
                                    />
                                </div>

                                {challenge.claimed ? (
                                    <Tooltip content="Reward Claimed!">
                                        <div className="p-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500">
                                            <CheckCircleIcon className="h-5 w-5" />
                                        </div>
                                    </Tooltip>
                                ) : (
                                    <Button
                                        size="sm"
                                        color="orange"
                                        className={`py-1.5 px-3 rounded-lg text-[10px] normal-case ${!challenge.isCompleted ? 'opacity-50 cursor-not-allowed' : 'animate-pulse'}`}
                                        disabled={!challenge.isCompleted || claiming === challenge.id}
                                        onClick={() => handleClaim(challenge.id, challenge.xpReward)}
                                    >
                                        {claiming === challenge.id ? <Spinner className="h-3 w-3" /> : "Claim"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}

                    {challenges.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                            No active challenges for today. Check back tomorrow!
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

export default DailyChallengesCard;
