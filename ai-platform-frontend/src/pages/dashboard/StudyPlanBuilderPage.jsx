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
    SparklesIcon,
    ExclamationTriangleIcon,
    BookOpenIcon,
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
        <div className="mt-12">
            <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <Typography variant="h6" color="blue-gray" className="dark:text-white">
                    AI Study Plan Builder
                </Typography>
            </div>

            <div className="flex flex-col gap-8">
                {/* Builder Form */}
                <Card className="border border-blue-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900/50 backdrop-blur-md">
                    <CardBody className="p-6">
                        <div className="mb-6">
                            <Typography variant="h5" color="blue-gray" className="mb-1 dark:text-white">
                                New Study Plan
                            </Typography>
                            <Typography variant="small" className="font-normal text-blue-gray-600 dark:text-gray-400">
                                Enter a topic and we'll curate a schedule for you.
                            </Typography>
                        </div>

                        <form onSubmit={handleGenerate} className="flex flex-col gap-6">
                            <div>
                                <Typography variant="small" color="blue-gray" className="mb-2 font-medium dark:text-gray-300">
                                    What do you want to learn?
                                </Typography>
                                <Input
                                    size="lg"
                                    placeholder="e.g. React Patterns, Machine Learning"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900 dark:!border-t-gray-700 dark:focus:!border-t-white dark:text-white"
                                    labelProps={{
                                        className: "before:content-none after:content-none",
                                    }}
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium dark:text-gray-300">
                                        Difficulty
                                    </Typography>
                                    <Select
                                        size="lg"
                                        value={difficulty}
                                        onChange={(val) => setDifficulty(val)}
                                        className="border-blue-gray-200 dark:border-gray-700 dark:text-white"
                                        labelProps={{
                                            className: "before:content-none after:content-none",
                                        }}
                                        disabled={loading}
                                        menuProps={{
                                            className: "dark:bg-gray-900 dark:border-gray-800 dark:text-white",
                                        }}
                                    >
                                        <Option value="Beginner">Beginner</Option>
                                        <Option value="Intermediate">Intermediate</Option>
                                        <Option value="Advanced">Advanced</Option>
                                    </Select>
                                </div>
                                <div>
                                    <Typography variant="small" color="blue-gray" className="mb-2 font-medium dark:text-gray-300">
                                        Duration
                                    </Typography>
                                    <Select
                                        size="lg"
                                        value={String(durationDays)}
                                        onChange={(val) => setDurationDays(Number(val))}
                                        className="border-blue-gray-200 dark:border-gray-700 dark:text-white"
                                        labelProps={{
                                            className: "before:content-none after:content-none",
                                        }}
                                        disabled={loading}
                                        menuProps={{
                                            className: "dark:bg-gray-900 dark:border-gray-800 dark:text-white",
                                        }}
                                    >
                                        {durationOptions.map((opt) => (
                                            <Option key={opt.value} value={String(opt.value)}>
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

                            <Button
                                type="submit"
                                disabled={loading}
                                fullWidth
                                className="flex items-center justify-center gap-2 dark:bg-white dark:text-black"
                            >
                                {loading ? <Spinner className="h-4 w-4" /> : <SparklesIcon className="h-4 w-4" />}
                                Generate Plan
                            </Button>
                        </form>
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
                        <Card className="border border-blue-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900/50 backdrop-blur-md">
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
                                    className="cursor-pointer border border-blue-gray-100 dark:border-gray-800 hover:shadow-md transition-all group bg-white dark:bg-gray-900/50 backdrop-blur-md"
                                    onClick={() => navigate(`/dashboard/study-plan/${plan.id}`)}
                                >
                                    <CardBody className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <Chip
                                                size="sm"
                                                variant="ghost"
                                                value={plan.difficulty}
                                                color={plan.difficulty === 'Advanced' ? 'red' : plan.difficulty === 'Intermediate' ? 'amber' : 'green'}
                                                className="rounded-full"
                                            />
                                            {plan.completed && (
                                                <Chip
                                                    size="sm"
                                                    value="Completed"
                                                    icon={<CheckCircleIcon />}
                                                    color="green"
                                                    className="rounded-full pl-2"
                                                />
                                            )}
                                        </div>

                                        <Typography variant="h6" color="blue-gray" className="mb-1 group-hover:text-blue-500 transition-colors dark:text-white">
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
