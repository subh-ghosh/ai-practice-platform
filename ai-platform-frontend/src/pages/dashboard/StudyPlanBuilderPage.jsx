import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import {
    Typography,
    Card,
    CardHeader,
    CardBody,
    Input,
    Button,
    Chip,
    Spinner,
    Alert,
    Select,
    Option,
    IconButton,
} from "@material-tailwind/react";
import {
    SparklesIcon,
    ExclamationTriangleIcon,
    BookOpenIcon,
    CheckCircleIcon,
    TrashIcon,
} from '@heroicons/react/24/solid';
import { useTheme } from "@/context/ThemeContext.jsx";

const StudyPlanBuilderPage = () => {
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Beginner');
    const [durationDays, setDurationDays] = useState(7);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [loadingStage, setLoadingStage] = useState(0);

    // Fusion Feature: Smart Suggestions
    const [recommendations, setRecommendations] = useState(null);

    useEffect(() => {
        let interval;
        if (loading) {
            interval = setInterval(() => {
                setLoadingStage((prev) => (prev + 1) % 4);
            }, 2000);
        } else {
            setLoadingStage(0);
        }
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        fetchHistory();
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const res = await api.get('/stats/recommendations');
            setRecommendations(res.data);
        } catch (err) {
            console.error("Failed to load recommendations:", err);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await api.get('/study-plans');
            setHistory(response.data);
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleDelete = async (planId, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this study plan?")) return;

        try {
            await api.delete(`/study-plans/${planId}`);
            setHistory(history.filter(p => p.id !== planId));
        } catch (err) {
            console.error("Failed to delete study plan:", err);
            alert("Failed to delete study plan. Please try again.");
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!topic.trim()) {
            setError("Please enter a topic.");
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/study-plans/generate', {
                topic,
                difficulty,
                durationDays,
            });
            navigate(`/dashboard/study-plan/${response.data.id}`);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to generate study plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const durationOptions = [
        { value: 3, label: '3 Days', sub: 'Quick Sprint' },
        { value: 7, label: '1 Week', sub: 'Standard' },
        { value: 14, label: '2 Weeks', sub: 'Deep Dive' },
        { value: 30, label: '1 Month', sub: 'Mastery' },
    ];

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div className="mt-12 space-y-8">
            {/* Header hidden as it is integrated into the card now, matching Practice page style */}

            <div className="flex flex-col gap-8">
                {/* Builder Form Card - Matching Practice.jsx style */}
                <Card className="overflow-visible relative z-20 border border-blue-100/60 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
                    <CardHeader floated={false} shadow={false} className="rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-4 m-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg shadow-inner">
                                <SparklesIcon className="h-6 w-6 text-white animate-pulse" />
                            </div>
                            <div>
                                <Typography variant="h5" color="white" className="font-bold tracking-tight">AI Study Plan Builder</Typography>
                                <Typography variant="small" color="white" className="opacity-90 font-normal">Enter a topic and we'll curate a schedule for you.</Typography>
                            </div>
                        </div>
                    </CardHeader>

                    <CardBody className="p-6 md:p-8 overflow-visible">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                                    <Spinner className="h-16 w-16 text-blue-500" />
                                </div>
                                <div className="text-center space-y-2">
                                    <Typography variant="h5" color="blue-gray" className="dark:text-white animate-pulse">
                                        Generating your personalized plan...
                                    </Typography>
                                    <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-normal">
                                        {["Analyzing your topic...", "Curating best YouTube videos...", "Drafting practice quizzes...", "Finalizing your schedule..."][loadingStage]}
                                    </Typography>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleGenerate} className="flex flex-col gap-6">
                                <div>
                                    <Input
                                        size="lg"
                                        label="What do you want to learn?"
                                        placeholder="e.g. React Patterns, Machine Learning"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        color="blue"
                                        className="!text-blue-gray-900 dark:!text-white !bg-white dark:!bg-gray-800/80 !border-blue-gray-200 focus:!border-blue-500 placeholder:text-blue-gray-300 dark:placeholder:text-gray-500"
                                        labelProps={{
                                            className: "!text-blue-gray-500 dark:!text-gray-300",
                                        }}
                                        disabled={loading}
                                    />
                                    {/* Smart Suggestions */}
                                    <div className="mt-2 flex flex-wrap gap-2 animate-fade-in">
                                        {recommendations && (
                                            <>
                                                {recommendations.weakTopics.map(t => (
                                                    <Chip
                                                        key={`weak-${t}`}
                                                        value={`Improve: ${t}`}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="cursor-pointer hover:bg-red-100 bg-red-50 text-red-900 border border-red-200"
                                                        onClick={() => setTopic(t)}
                                                    />
                                                ))}
                                                {recommendations.recentTopics.slice(0, 3).map(t => (
                                                    <Chip
                                                        key={`recent-${t}`}
                                                        value={t}
                                                        size="sm"
                                                        variant="ghost"
                                                        className="cursor-pointer hover:bg-blue-100 bg-blue-50 text-blue-900 border border-blue-200"
                                                        onClick={() => setTopic(t)}
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="w-full relative">
                                        <Select
                                            size="lg"
                                            label="Difficulty"
                                            value={difficulty}
                                            onChange={(val) => setDifficulty(val)}
                                            color="blue"
                                            className="!text-blue-gray-900 dark:!text-white !bg-white dark:!bg-gray-800 !border-blue-gray-200 focus:!border-blue-500"
                                            labelProps={{
                                                className: "!text-blue-gray-500 dark:!text-gray-400",
                                            }}
                                            disabled={loading}
                                            menuProps={{
                                                className: "p-2 bg-white dark:bg-gray-900 border border-blue-gray-50 dark:border-gray-800 shadow-lg shadow-blue-gray-500/10 dark:shadow-black/50 rounded-xl min-w-[200px] max-h-[300px] overflow-y-auto z-[9999]",
                                                animate: {
                                                    mount: { y: 0, scale: 1, opacity: 1 },
                                                    unmount: { y: 10, scale: 0.95, opacity: 0 },
                                                },
                                            }}
                                        >
                                            <Option value="Beginner" className="mb-1 rounded-lg py-2.5 px-3 text-sm font-medium transition-all hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300 dark:focus:bg-gray-800">Beginner</Option>
                                            <Option value="Intermediate" className="mb-1 rounded-lg py-2.5 px-3 text-sm font-medium transition-all hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300 dark:focus:bg-gray-800">Intermediate</Option>
                                            <Option value="Advanced" className="mb-1 rounded-lg py-2.5 px-3 text-sm font-medium transition-all hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300 dark:focus:bg-gray-800">Advanced</Option>
                                        </Select>
                                    </div>
                                    <div className="w-full relative">
                                        <Select
                                            size="lg"
                                            label="Duration"
                                            value={String(durationDays)}
                                            onChange={(val) => setDurationDays(Number(val))}
                                            color="blue"
                                            className="!text-blue-gray-900 dark:!text-white !bg-white dark:!bg-gray-800 !border-blue-gray-200 focus:!border-blue-500"
                                            labelProps={{
                                                className: "!text-blue-gray-500 dark:!text-gray-400",
                                            }}
                                            disabled={loading}
                                            menuProps={{
                                                className: "p-2 bg-white dark:bg-gray-900 border border-blue-gray-50 dark:border-gray-800 shadow-lg shadow-blue-gray-500/10 dark:shadow-black/50 rounded-xl min-w-[200px] max-h-[300px] overflow-y-auto z-[9999]",
                                                animate: {
                                                    mount: { y: 0, scale: 1, opacity: 1 },
                                                    unmount: { y: 10, scale: 0.95, opacity: 0 },
                                                },
                                            }}
                                        >
                                            {durationOptions.map((opt) => (
                                                <Option key={opt.value} value={String(opt.value)} className="mb-1 rounded-lg py-2.5 px-3 text-sm font-medium transition-all hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300 dark:focus:bg-gray-800">
                                                    {opt.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                {error && (
                                    <Alert color="red" icon={<ExclamationTriangleIcon className="h-5 w-5" />}>
                                        {error}
                                    </Alert>
                                )}

                                <div className="mt-2 text-left">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        fullWidth
                                        className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 active:scale-95 hover:scale-[1.02] flex items-center justify-center gap-2"
                                    >
                                        <SparklesIcon className="h-4 w-4" /> GENERATE PLAN
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardBody>
                </Card>

                {/* History Section - Moved to Bottom */}
                <div className="space-y-6">
                    <div>
                        <Typography variant="h5" color="blue-gray" className="mb-1 dark:text-white">
                            Your Plans
                        </Typography>
                        <Typography variant="small" className="font-normal text-blue-gray-600 dark:text-gray-400">
                            Continue where you left off
                        </Typography>
                    </div>

                    {historyLoading ? (
                        <div className="flex justify-center py-12">
                            <Spinner className="h-8 w-8 text-blue-gray-900 dark:text-white" />
                        </div>
                    ) : history.length === 0 ? (
                        <Card className="border border-blue-gray-100 dark:border-gray-700 shadow-sm bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
                            <CardBody className="text-center py-12">
                                <BookOpenIcon className="h-12 w-12 text-blue-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                <Typography color="blue-gray" variant="h6" className="dark:text-white">
                                    No plans yet
                                </Typography>
                                <Typography color="gray" className="font-normal mt-1 dark:text-gray-400">
                                    Create your first study plan to get started!
                                </Typography>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {history.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className="cursor-pointer border border-blue-gray-100 dark:border-gray-700 hover:shadow-md transition-all group bg-white/80 dark:bg-gray-900/80 backdrop-blur-md"
                                    onClick={() => navigate(`/dashboard/study-plan/${plan.id}`)}
                                >
                                    <CardBody className="p-5 relative">
                                        <div className="absolute top-4 right-4 z-10">
                                            <IconButton
                                                variant="text"
                                                color="red"
                                                size="sm"
                                                className="hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => handleDelete(plan.id, e)}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </IconButton>
                                        </div>

                                        <div className="flex justify-between items-start mb-3">
                                            <Chip
                                                size="sm"
                                                variant="ghost"
                                                value={plan.difficulty}
                                                className={`rounded-full ${plan.difficulty === 'Advanced'
                                                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                                                    : plan.difficulty === 'Intermediate'
                                                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                                                        : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                                    }`}
                                            />
                                            {plan.completed && (
                                                <Chip
                                                    size="sm"
                                                    value="Completed"
                                                    icon={<CheckCircleIcon />}
                                                    className="rounded-full pl-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                                                    variant="ghost"
                                                />
                                            )}
                                        </div>

                                        <Typography variant="h6" color="blue-gray" className="mb-1 group-hover:text-blue-500 transition-colors dark:text-white line-clamp-1 pr-8">
                                            {plan.title}
                                        </Typography>

                                        <Typography className="font-normal text-gray-600 dark:text-gray-400 line-clamp-2 text-sm mb-4">
                                            {plan.description}
                                        </Typography>

                                        <div className="pt-4 border-t border-blue-gray-50 dark:border-gray-800">
                                            <div className="flex items-center justify-between mb-2">
                                                <Typography variant="small" className="font-medium text-blue-gray-600 dark:text-gray-300">
                                                    {plan.progress}% Complete
                                                </Typography>
                                                <Typography variant="small" className="text-gray-500 dark:text-gray-500">
                                                    {formatDate(plan.createdAt)}
                                                </Typography>
                                            </div>
                                            <div className="w-full bg-blue-gray-50 dark:bg-gray-800 rounded-full h-1.5">
                                                <div
                                                    className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
                                                    style={{ width: `${plan.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export { StudyPlanBuilderPage };
export default StudyPlanBuilderPage;
