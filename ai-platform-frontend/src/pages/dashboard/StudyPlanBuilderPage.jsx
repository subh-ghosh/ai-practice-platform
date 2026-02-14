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
        <section className="relative isolate -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pb-10 min-h-[calc(100vh-4rem)]">
            {/* Styles & Animations */}
            <style>{`
            /* Custom Scrollbar */
            .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
            .custom-scroll::-webkit-scrollbar-track { background: transparent; }
            .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
            .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
            .dark .custom-scroll::-webkit-scrollbar-track { background: #111827; }
            .dark .custom-scroll::-webkit-scrollbar-thumb { background-color: #374151; border: 2px solid #111827; border-radius: 4px; }
            .dark .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #4b5563; }
            
            /* Animations */
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
            @keyframes pulseSoft { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
            
            .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
            .animate-slide-up { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-pop-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            .animate-fade-in-scale { animation: scaleIn 0.4s ease-out forwards; }
            .animate-pulse-soft { animation: pulseSoft 2s infinite ease-in-out; }
            .delay-100 { animation-delay: 100ms; }
            .delay-200 { animation-delay: 200ms; }
          `}</style>

            {/* Background Layer */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-sky-100 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 transition-colors duration-700" />
            <div className="pointer-events-none absolute -top-10 right-[8%] h-64 w-64 rounded-full bg-sky-300/30 dark:bg-sky-600/30 blur-3xl animate-pulse-soft" />
            <div className="pointer-events-none absolute top-36 -left-10 h-72 w-72 rounded-full bg-blue-300/25 dark:bg-blue-700/25 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />

            <div className="mt-6 page has-fixed-navbar space-y-8 max-w-5xl mx-auto">

                {/* ===== BUILDER FORM ===== */}
                <Card className="overflow-visible relative z-20 border border-blue-100/60 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm animate-slide-up">
                    <div className="rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-4 m-0 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg shadow-inner">
                                <AcademicCapIcon className="h-6 w-6 text-white animate-pulse" />
                            </div>
                            <div>
                                <Typography variant="h5" color="white" className="font-bold tracking-tight">AI Study Plan Builder</Typography>
                                <Typography variant="small" color="white" className="opacity-90 font-normal">Enter a topic and let AI curate your perfect study schedule.</Typography>
                            </div>
                        </div>
                    </div>

                    <CardBody className="p-6 md:p-8 overflow-visible">
                        <form onSubmit={handleGenerate} className="space-y-8">

                            {/* Topic Input */}
                            <div className="space-y-2">
                                <Typography variant="small" className={`font-bold uppercase tracking-wider ${isDark ? 'text-blue-300' : 'text-blue-700'} flex items-center gap-2`}>
                                    <BookOpenIcon className="h-4 w-4" />
                                    What do you want to learn?
                                </Typography>
                                <Input
                                    size="lg"
                                    placeholder="e.g., React Hooks, Machine Learning, Data Structures"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    disabled={loading}
                                    className="!text-blue-gray-900 dark:!text-white !bg-white dark:!bg-gray-800 !border-blue-gray-200 focus:!border-blue-500"
                                    labelProps={{ className: "hidden" }}
                                    containerProps={{ className: "min-w-0" }}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Difficulty */}
                                <div className="space-y-2">
                                    <Typography variant="small" className={`font-bold uppercase tracking-wider ${isDark ? 'text-blue-300' : 'text-blue-700'} flex items-center gap-2`}>
                                        <SparklesIcon className="h-4 w-4" />
                                        Difficulty Level
                                    </Typography>
                                    <div className="flex gap-2">
                                        {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => setDifficulty(level)}
                                                disabled={loading}
                                                className={`flex-1 py-3 px-2 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95 ${difficulty === level
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                    : `bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700`
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="space-y-2">
                                    <Typography variant="small" className={`font-bold uppercase tracking-wider ${isDark ? 'text-blue-300' : 'text-blue-700'} flex items-center gap-2`}>
                                        <ClockIcon className="h-4 w-4" />
                                        Study Duration
                                    </Typography>
                                    <div className="grid grid-cols-4 gap-2">
                                        {durationOptions.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setDurationDays(opt.value)}
                                                disabled={loading}
                                                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-300 active:scale-95 border ${durationDays === opt.value
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                                    : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <span className={`text-sm font-bold ${durationDays === opt.value ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {opt.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Feature Preview */}
                            <div className={`rounded-xl p-5 border ${isDark ? 'bg-blue-900/10 border-blue-800/30' : 'bg-gradient-to-br from-blue-50 to-sky-50 border-blue-100'} animate-fade-in`}>
                                <Typography variant="small" className={`font-bold mb-3 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                                    THIS PLAN WILL INCLUDE:
                                </Typography>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { icon: VideoCameraIcon, text: 'Curated Video Lessons', desc: 'Hand-picked tutorials' },
                                        { icon: BookOpenIcon, text: 'Practice Checkpoints', desc: 'AI-generated quizzes' },
                                        { icon: ClockIcon, text: 'Daily Schedule', desc: 'Structured learning path' },
                                    ].map(({ icon: Icon, text, desc }) => (
                                        <div key={text} className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20">
                                                <Icon className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                            </div>
                                            <div>
                                                <Typography variant="small" className="font-semibold text-gray-800 dark:text-gray-200 leading-tight">{text}</Typography>
                                                <Typography variant="small" className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wide">{desc}</Typography>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <Alert color="red" variant="ghost" icon={<ExclamationTriangleIcon className="h-5 w-5" />} className="animate-pop-in">
                                    {error}
                                </Alert>
                            )}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                fullWidth
                                size="lg"
                                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 active:scale-95 hover:scale-[1.01] text-md"
                            >
                                {loading ? (
                                    <>
                                        <Spinner className="h-5 w-5 text-white" />
                                        Building Your Study Plan...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="h-5 w-5" />
                                        Build My Customized Plan
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardBody>
                </Card>

                {/* ===== STUDY PLAN HISTORY ===== */}
                <div className="mt-12 animate-slide-up delay-200 relative z-10">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <Typography variant="h5" className={`font-bold ${isDark ? 'text-white' : 'text-blue-gray-900'}`}>
                            Your Study Plans
                        </Typography>
                    </div>

                    {historyLoading ? (
                        <div className="flex justify-center py-12">
                            <Spinner className="h-8 w-8 text-blue-500" />
                        </div>
                    ) : history.length === 0 ? (
                        <Card className="border border-dashed border-gray-300 dark:border-gray-700 bg-transparent shadow-none">
                            <CardBody className="text-center py-12">
                                <AcademicCapIcon className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                                <Typography className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                    No study plans yet. Create your first one above!
                                </Typography>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {history.map((plan, index) => (
                                <Card
                                    key={plan.id}
                                    onClick={() => navigate(`/dashboard/study-plan/${plan.id}`)}
                                    className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group border ${isDark ? 'bg-gray-800/80 border-gray-700 hover:border-blue-500/50' : 'bg-white/80 border-blue-100 hover:border-blue-300'} backdrop-blur-sm`}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <CardBody className="p-5 flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-2">
                                            <Chip
                                                size="sm"
                                                value={plan.difficulty}
                                                className={`rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                                            />
                                            {plan.completed && (
                                                <Chip
                                                    size="sm"
                                                    value="Completed"
                                                    icon={<CheckCircleIcon />}
                                                    className="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-full pl-2"
                                                />
                                            )}
                                        </div>

                                        <Typography variant="h6" className={`font-bold py-1 transition-colors ${isDark ? 'text-gray-100 group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-600'}`}>
                                            {plan.title}
                                        </Typography>

                                        <Typography variant="small" className={`line-clamp-2 flex-grow ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {plan.description}
                                        </Typography>

                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <Typography variant="small" className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {plan.progress}% Complete
                                                </Typography>
                                                <Typography variant="small" className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                                                    {formatDate(plan.createdAt)}
                                                </Typography>
                                            </div>
                                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-1000 ${plan.progress === 100
                                                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                                                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                                        }`}
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

                <div className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p>Powered by Smart Learning Engine</p>
                </div>
            </div>
        </section>
    );
};

export { StudyPlanBuilderPage };
export default StudyPlanBuilderPage;
