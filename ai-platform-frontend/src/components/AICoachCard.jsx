import React, { useState, useEffect } from 'react';
import { Typography, Button, Spinner } from "@material-tailwind/react";
import { SparklesIcon } from '@heroicons/react/24/solid';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const AICoachCard = () => {
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInsight = async () => {
            try {
                const res = await api.get('/recommendations/ai-coach');
                setInsight(res.data);
            } catch (err) {
                setInsight({
                    insight: "Keep going! Every practice session makes you stronger.",
                    suggestedTopic: "",
                    suggestedAction: "PRACTICE"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchInsight();
    }, []);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 dark:border-blue-500/20
            bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10
            dark:from-blue-500/15 dark:via-purple-500/10 dark:to-indigo-500/15
            backdrop-blur-xl p-5 shadow-sm">

            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-indigo-400/15 to-blue-400/15 rounded-full blur-xl" />

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3 relative z-10">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl shadow-sm">
                    <SparklesIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>
                <div>
                    <Typography variant="small" className="font-bold text-blue-900 dark:text-blue-200 tracking-tight">
                        AI Coach
                    </Typography>
                    <Typography variant="small" className="font-normal text-[10px] text-blue-700/60 dark:text-blue-400/60 leading-tight">
                        Personalized insight
                    </Typography>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {loading ? (
                    <div className="flex items-center gap-3 py-3">
                        <Spinner className="h-4 w-4 text-blue-500" />
                        <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-normal animate-pulse">
                            Analyzing your progress...
                        </Typography>
                    </div>
                ) : (
                    <>
                        <Typography variant="small" className="text-gray-700 dark:text-gray-300 font-normal leading-relaxed mb-3">
                            "{insight?.insight}"
                        </Typography>

                        {insight?.suggestedTopic && (
                            <Button
                                size="sm"
                                onClick={() => navigate(`/dashboard/practice?topic=${encodeURIComponent(insight.suggestedTopic)}`)}
                                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/20
                                    hover:shadow-blue-500/40 transition-all duration-200 capitalize text-xs font-semibold py-2"
                            >
                                Practice {insight.suggestedTopic} →
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AICoachCard;
