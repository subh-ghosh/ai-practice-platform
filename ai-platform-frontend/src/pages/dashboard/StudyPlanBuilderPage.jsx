import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import {
    Typography,
    Card,
    CardBody,
    Input,
    Button,
    Chip,
    Spinner,
    Alert,
    Select,
    Option,
} from "@material-tailwind/react";
import {
    AcademicCapIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    BookOpenIcon,
    VideoCameraIcon,
    TrashIcon,
    CheckCircleIcon,
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
    const isDark = theme === 'dark';

    useEffect(() => {
        fetchHistory();
    }, []);

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
        <div className="relative min-h-screen p-4 md:p-6">
            {/* Animated Background Blobs */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-purple-800' : 'bg-purple-300'}`} />
                <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${isDark ? 'bg-indigo-800' : 'bg-indigo-300'}`} style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Typography variant="h3" className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        <AcademicCapIcon className="h-8 w-8 text-purple-500" />
                        Study Plan Builder
                    </Typography>
                    <Typography className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Enter a topic and we'll build a personalized study plan with curated video lessons and practice sessions.
                    </Typography>
                </div>

                {/* ===== BUILDER FORM ===== */}
                <Card className={`backdrop-blur-xl border shadow-xl ${isDark ? 'bg-gray-900/70 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}`}>
                    <CardBody className="p-6 md:p-8">
                        <form onSubmit={handleGenerate} className="space-y-6">

                            {/* Topic Input */}
                            <div>
                                <Typography variant="small" className={`font-semibold mb-2 flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <BookOpenIcon className="h-4 w-4 text-purple-500" />
                                    What do you want to learn?
                                </Typography>
                                <Input
                                    size="lg"
                                    placeholder="e.g., React Hooks, Machine Learning, Data Structures"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    disabled={loading}
                                    className={`!border-gray-300 focus:!border-purple-500 ${isDark ? '!border-gray-600 text-white' : ''}`}
                                    labelProps={{ className: "hidden" }}
                                    containerProps={{ className: "min-w-0" }}
                                />
                            </div>

                            {/* Difficulty */}
                            <div>
                                <Typography variant="small" className={`font-semibold mb-2 flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <SparklesIcon className="h-4 w-4 text-purple-500" />
                                    Difficulty Level
                                </Typography>
                                <div className="flex gap-3">
                                    {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setDifficulty(level)}
                                            disabled={loading}
                                            className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${difficulty === level
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-400'
                                                    : `border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 ${isDark ? 'border-gray-600 text-gray-300 hover:border-purple-600 hover:bg-purple-900/20' : 'text-gray-600'}`
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <Typography variant="small" className={`font-semibold mb-2 flex items-center gap-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <ClockIcon className="h-4 w-4 text-purple-500" />
                                    Study Duration
                                </Typography>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {durationOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setDurationDays(opt.value)}
                                            disabled={loading}
                                            className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${durationDays === opt.value
                                                    ? 'border-purple-500 bg-purple-50 shadow-sm dark:bg-purple-900/30 dark:border-purple-400'
                                                    : `border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 ${isDark ? 'border-gray-600 hover:border-purple-600 hover:bg-purple-900/20' : ''}`
                                                }`}
                                        >
                                            <span className={`block text-sm font-bold ${durationDays === opt.value ? 'text-purple-700 dark:text-purple-300' : isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                                {opt.label}
                                            </span>
                                            <span className={`block text-xs ${durationDays === opt.value ? 'text-purple-500 dark:text-purple-400' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {opt.sub}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feature Preview */}
                            <div className={`rounded-xl p-4 border ${isDark ? 'bg-purple-900/20 border-purple-800/50' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100'}`}>
                                <Typography variant="small" className={`font-semibold mb-2 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                                    Your study plan will include:
                                </Typography>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { icon: VideoCameraIcon, text: 'Curated video lessons' },
                                        { icon: BookOpenIcon, text: 'Practice checkpoints' },
                                        { icon: ClockIcon, text: 'Day-by-day schedule' },
                                    ].map(({ icon: Icon, text }) => (
                                        <div key={text} className={`flex items-center text-sm ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>
                                            <Icon className={`h-4 w-4 mr-2 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <Alert color="red" variant="ghost" icon={<ExclamationTriangleIcon className="h-5 w-5" />}>
                                    {error}
                                </Alert>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                fullWidth
                                size="lg"
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 normal-case text-base"
                            >
                                {loading ? (
                                    <>
                                        <Spinner className="h-5 w-5" />
                                        Building Your Study Plan... (This may take a moment)
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="h-5 w-5" />
                                        Build My Study Plan
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardBody>
                </Card>

                {/* ===== STUDY PLAN HISTORY ===== */}
                <div className="mt-10">
                    <Typography variant="h5" className={`font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        <ClockIcon className="h-6 w-6 text-purple-500" />
                        Your Study Plans
                    </Typography>

                    {historyLoading ? (
                        <div className="flex justify-center py-8">
                            <Spinner className="h-8 w-8 text-purple-500" />
                        </div>
                    ) : history.length === 0 ? (
                        <Card className={`backdrop-blur-xl border ${isDark ? 'bg-gray-900/50 border-gray-700/50' : 'bg-white/70 border-gray-200/50'}`}>
                            <CardBody className="text-center py-8">
                                <AcademicCapIcon className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                <Typography className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                    No study plans yet. Create your first one above!
                                </Typography>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {history.map((plan) => (
                                <Card
                                    key={plan.id}
                                    onClick={() => navigate(`/dashboard/study-plan/${plan.id}`)}
                                    className={`backdrop-blur-xl border cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-lg group ${isDark ? 'bg-gray-900/50 border-gray-700/50 hover:border-purple-600/50' : 'bg-white/70 border-gray-200/50 hover:border-purple-300'}`}
                                >
                                    <CardBody className="p-5">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-grow">
                                                <Typography variant="h6" className={`font-semibold transition-colors ${isDark ? 'text-white group-hover:text-purple-300' : 'text-gray-800 group-hover:text-purple-700'}`}>
                                                    {plan.title}
                                                </Typography>
                                                <Typography variant="small" className={`mt-1 line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {plan.description}
                                                </Typography>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <Chip
                                                        size="sm"
                                                        value={plan.difficulty}
                                                        className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 normal-case"
                                                    />
                                                    <Typography variant="small" className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        <ClockIcon className="h-3 w-3" />
                                                        {plan.durationDays} days
                                                    </Typography>
                                                    <Typography variant="small" className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                                        {formatDate(plan.createdAt)}
                                                    </Typography>
                                                </div>
                                            </div>

                                            {/* Progress */}
                                            <div className="flex-shrink-0 ml-4 text-right">
                                                <Typography variant="h6" className={`font-bold ${plan.progress === 100 ? 'text-green-500' : 'text-purple-500'}`}>
                                                    {plan.progress}%
                                                </Typography>
                                                <div className={`w-20 rounded-full h-1.5 mt-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all ${plan.progress === 100
                                                            ? 'bg-green-500'
                                                            : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                                                            }`}
                                                        style={{ width: `${plan.progress}%` }}
                                                    />
                                                </div>
                                                {plan.completed && (
                                                    <div className="flex items-center gap-1 mt-1 justify-end">
                                                        <CheckCircleIcon className="h-3 w-3 text-green-500" />
                                                        <Typography variant="small" className="text-green-500 font-medium text-xs">
                                                            Completed
                                                        </Typography>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`mt-8 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p>Powered by Smart Learning Engine</p>
                </div>
            </div>
        </div>
    );
};

export { StudyPlanBuilderPage };
export default StudyPlanBuilderPage;
