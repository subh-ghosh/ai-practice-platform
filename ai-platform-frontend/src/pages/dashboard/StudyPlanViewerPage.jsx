import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import {
    Typography,
    Card,
    CardBody,
    Button,
    Chip,
    Spinner,
    Alert,
    Dialog,
    DialogBody,
    DialogHeader,
    Progress,
} from "@material-tailwind/react";
import {
    PlayIcon,
    CheckCircleIcon,
    AcademicCapIcon,
    BookOpenIcon,
    ClockIcon,
    ArrowLeftIcon,
    SparklesIcon,
    LockClosedIcon,
    TrophyIcon,
    XCircleIcon,
    StarIcon,
} from '@heroicons/react/24/solid';

// Helper: convert ISO 8601 duration to readable string
const formatDuration = (iso) => {
    if (!iso) return '';
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return iso;
    const h = match[1] ? `${match[1]}h ` : '';
    const m = match[2] ? `${match[2]}m ` : '';
    const s = match[3] ? `${match[3]}s` : '';
    return (h + m + s).trim();
};

const StudyPlanViewerPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);

    // Quiz state
    const [activeQuiz, setActiveQuiz] = useState(null); // { itemId, questions }
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [quizLoading, setQuizLoading] = useState(false);
    const [xpAnimation, setXpAnimation] = useState(null);

    useEffect(() => {
        fetchPlan();
    }, [id]);

    const fetchPlan = async () => {
        try {
            const response = await api.get(`/study-plans/${id}`);
            setPlan(response.data);
        } catch (err) {
            setError("Failed to load study plan.");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async (itemId) => {
        try {
            await api.patch(`/study-plans/${id}/items/${itemId}/complete`);
            // Show XP animation
            setXpAnimation({ amount: 10, x: 0, y: 0 });
            setTimeout(() => setXpAnimation(null), 2000);
            fetchPlan();
        } catch (err) {
            console.error("Failed to mark item complete:", err);
        }
    };

    // ===== QUIZ FUNCTIONS =====
    const handleStartQuiz = async (item) => {
        setQuizLoading(true);
        setQuizResult(null);
        setQuizAnswers({});
        try {
            const response = await api.get(`/study-plans/${id}/items/${item.id}/quiz`);
            const questions = response.data || [];
            if (questions.length === 0) {
                // Legacy item with no pre-generated quiz — allow manual completion
                setActiveQuiz({ itemId: item.id, questions: [], item, noQuestions: true });
            } else {
                setActiveQuiz({ itemId: item.id, questions, item, noQuestions: false });
            }
        } catch (err) {
            console.error("Failed to load quiz:", err);
            // Fallback: allow manual completion for legacy items
            setActiveQuiz({ itemId: item.id, questions: [], item, noQuestions: true });
        } finally {
            setQuizLoading(false);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!activeQuiz) return;
        setQuizLoading(true);
        try {
            const response = await api.post(
                `/study-plans/${id}/items/${activeQuiz.itemId}/quiz/submit`,
                { answers: quizAnswers }
            );
            setQuizResult(response.data);
            if (response.data.passed && response.data.xpEarned > 0) {
                setXpAnimation({ amount: response.data.xpEarned });
                setTimeout(() => setXpAnimation(null), 3000);
            }
            fetchPlan();
        } catch (err) {
            console.error("Quiz submission failed:", err);
        } finally {
            setQuizLoading(false);
        }
    };

    const closeQuiz = () => {
        setActiveQuiz(null);
        setQuizResult(null);
        setQuizAnswers({});
    };

    // Check if an item is locked (items after incomplete PRACTICE checkpoints)
    const isItemLocked = (item) => {
        if (!plan?.items) return false;
        const sorted = [...plan.items].sort((a, b) => a.orderIndex - b.orderIndex);
        for (const prev of sorted) {
            if (prev.orderIndex >= item.orderIndex) break;
            if (prev.itemType === 'PRACTICE' && !prev.completed) {
                // Only lock if the practice item has quiz questions
                const hasQuiz = prev.quizQuestions && prev.quizQuestions.length > 0;
                if (hasQuiz) return true;
            }
        }
        return false;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spinner className="h-10 w-10 text-blue-500" />
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="mt-12">
                <Alert color="red" icon={<XCircleIcon className="h-6 w-6" />}>
                    {error || "Study plan not found."}
                </Alert>
            </div>
        );
    }

    // Group items by day
    const dayGroups = {};
    plan.items?.forEach((item) => {
        const day = item.dayNumber;
        if (!dayGroups[day]) dayGroups[day] = [];
        dayGroups[day].push(item);
    });

    const dayNumbers = Object.keys(dayGroups).map(Number).sort((a, b) => a - b);

    // Calculate total XP in plan
    const totalXpInPlan = plan.items?.reduce((sum, item) => sum + (item.xpReward || 0), 0) || 0;
    const earnedXpInPlan = plan.items?.filter(i => i.completed).reduce((sum, item) => sum + (item.xpReward || 0), 0) || 0;

    return (
        <div className="mt-12">

            {/* XP Animation Overlay */}
            {xpAnimation && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <div className="animate-bounce text-center">
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-2xl flex items-center gap-2">
                            <StarIcon className="h-6 w-6" />
                            +{xpAnimation.amount} XP
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="text"
                    color="blue-gray"
                    className="flex items-center gap-2 pl-0 hover:bg-transparent mb-2 dark:text-gray-300 dark:hover:text-white"
                    onClick={() => navigate('/dashboard/study-plan-builder')}
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Builder
                </Button>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                        <Typography variant="h4" color="blue-gray" className="mb-1 flex items-center gap-2 dark:text-white">
                            {plan.title}
                        </Typography>
                        <Typography variant="paragraph" className="font-normal text-blue-gray-600 dark:text-gray-400 max-w-2xl">
                            {plan.description}
                        </Typography>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            <Chip size="sm" variant="ghost" value={`${plan.durationDays} days`} icon={<ClockIcon />} className="rounded-full dark:text-gray-300" />
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
                            <Chip size="sm" variant="ghost" value={`${plan.items?.length || 0} items`} icon={<BookOpenIcon />} className="rounded-full dark:text-gray-300" />
                        </div>
                    </div>

                    <Card className="border border-amber-100 bg-amber-50/50 dark:bg-amber-900/20 dark:border-amber-900/50 shadow-none w-fit min-w-[140px]">
                        <CardBody className="p-3 text-center">
                            <Typography variant="small" className="font-bold text-amber-700 dark:text-amber-500 uppercase text-[10px] mb-1">
                                Total XP
                            </Typography>
                            <div className="flex items-center justify-center gap-1 text-amber-900 dark:text-amber-400">
                                <TrophyIcon className="h-5 w-5 text-amber-500" />
                                <span className="text-xl font-black">{earnedXpInPlan}</span>
                                <span className="text-xs text-amber-700 dark:text-amber-500 font-medium">/ {totalXpInPlan}</span>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Progress */}
            <Card className="mb-8 border border-blue-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900/50 backdrop-blur-md">
                <CardBody className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <Typography variant="small" className="font-bold text-blue-gray-700 dark:text-gray-300">
                            Overall Progress
                        </Typography>
                        <Typography variant="small" className="font-bold text-blue-500">
                            {plan.progress}%
                        </Typography>
                    </div>
                    <Progress value={plan.progress} size="lg" color="blue" className="bg-blue-gray-50 dark:bg-gray-800 h-2.5" />
                </CardBody>
            </Card>

            {/* Embedded Video Player */}
            {activeVideo && (
                <div className="bg-black rounded-xl overflow-hidden mb-8 shadow-lg ring-4 ring-blue-gray-900/5">
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${activeVideo}`}
                            title="Video Player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div className="bg-blue-gray-900 p-2 flex justify-end">
                        <Button size="sm" color="white" variant="text" onClick={() => setActiveVideo(null)} className="text-white hover:bg-white/10">
                            Close Player
                        </Button>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="space-y-8">
                {dayNumbers.map((dayNum) => (
                    <div key={dayNum}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20">
                                {dayNum}
                            </div>
                            <Typography variant="h6" color="blue-gray" className="dark:text-white">
                                Day {dayNum}
                            </Typography>
                            <div className="h-px flex-grow bg-blue-gray-50 dark:bg-gray-800"></div>
                        </div>

                        <div className="ml-5 border-l-2 border-blue-gray-50 dark:border-gray-800 pl-6 space-y-4">
                            {dayGroups[dayNum]
                                .sort((a, b) => a.orderIndex - b.orderIndex)
                                .map((item) => {
                                    const locked = isItemLocked(item);
                                    return item.itemType === 'VIDEO' ? (
                                        <VideoCard
                                            key={item.id}
                                            item={item}
                                            locked={locked}
                                            onPlay={() => !locked && setActiveVideo(item.videoId)}
                                            onComplete={() => !locked && handleMarkComplete(item.id)}
                                            onPractice={() => navigate(`/dashboard/practice?subject=${encodeURIComponent(plan.title)}&topic=${encodeURIComponent(item.title)}&difficulty=${encodeURIComponent(plan.difficulty)}`)}
                                        />
                                    ) : (
                                        <PracticeCard
                                            key={item.id}
                                            item={item}
                                            locked={locked}
                                            onStartQuiz={() => !locked && handleStartQuiz(item)}
                                        />
                                    );
                                })
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* Quiz Dialog */}
            <Dialog open={!!activeQuiz} handler={closeQuiz} size="lg" className="dark:bg-gray-900 border dark:border-gray-800">
                <DialogHeader className="flex justify-between items-center border-b border-blue-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-purple-500" />
                        <Typography variant="h5" color="blue-gray" className="dark:text-white">
                            Knowledge Check
                        </Typography>
                    </div>
                    <Button variant="text" color="blue-gray" onClick={closeQuiz} size="sm" className="!px-2 dark:text-gray-400 dark:hover:text-white">
                        x
                    </Button>
                </DialogHeader>
                <DialogBody className="p-6 overflow-y-auto max-h-[70vh]">
                    {activeQuiz && (
                        <>
                            {activeQuiz.noQuestions ? (
                                <div className="text-center py-8">
                                    <BookOpenIcon className="h-16 w-16 text-blue-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                    <Typography variant="h6" color="blue-gray" className="mb-2 dark:text-white">
                                        No Quiz Available
                                    </Typography>
                                    <Typography className="mb-6 font-normal text-blue-gray-500 dark:text-gray-400">
                                        This checkpoint was created before quizzes were available. You can mark it as complete manually.
                                    </Typography>
                                    <Button
                                        onClick={async () => {
                                            try {
                                                await api.patch(`/study-plans/${id}/items/${activeQuiz.itemId}/complete`);
                                                setXpAnimation({ amount: activeQuiz.item.xpReward || 0 });
                                                setTimeout(() => setXpAnimation(null), 2000);
                                                closeQuiz();
                                                fetchPlan();
                                            } catch (err) {
                                                console.error("Failed to mark complete:", err);
                                            }
                                        }}
                                        color="green"
                                        className="flex items-center justify-center gap-2 mx-auto"
                                    >
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Mark Custom Complete
                                    </Button>
                                </div>
                            ) : !quizResult ? (
                                <div className="space-y-6">
                                    <Typography variant="small" className="text-blue-gray-500 dark:text-gray-400 font-normal">
                                        Answer all questions correctly to earn <span className="font-bold text-amber-600 dark:text-amber-500">{activeQuiz.item.xpReward} XP</span>.
                                    </Typography>
                                    {activeQuiz.questions.map((q, idx) => (
                                        <div key={q.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-blue-gray-50 dark:border-gray-700">
                                            <Typography variant="h6" color="blue-gray" className="mb-3 flex gap-2 dark:text-white">
                                                <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-100 text-xs text-blue-900 dark:bg-blue-900 dark:text-blue-100">
                                                    {idx + 1}
                                                </span>
                                                {q.questionText}
                                            </Typography>
                                            <div className="space-y-2 pl-8">
                                                {['A', 'B', 'C', 'D'].map((opt) => (
                                                    <label
                                                        key={opt}
                                                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${quizAnswers[q.id] === opt
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                                                            : 'border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 hover:border-blue-200'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`q-${q.id}`}
                                                            value={opt}
                                                            checked={quizAnswers[q.id] === opt}
                                                            onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                                            className="sr-only"
                                                        />
                                                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold mr-3 ${quizAnswers[q.id] === opt
                                                            ? 'border-blue-500 bg-blue-500 text-white'
                                                            : 'border-blue-gray-200 dark:border-gray-600 text-blue-gray-400 dark:text-gray-400'
                                                            }`}>
                                                            {opt}
                                                        </div>
                                                        <Typography className="text-sm font-medium text-blue-gray-700 dark:text-gray-300">
                                                            {q[`option${opt}`]}
                                                        </Typography>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        onClick={handleSubmitQuiz}
                                        disabled={quizLoading || Object.keys(quizAnswers).length < activeQuiz.questions.length}
                                        fullWidth
                                        color="blue"
                                        className="mt-4"
                                    >
                                        {quizLoading ? 'Checking...' : 'Submit Answers'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${quizResult.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                        {quizResult.passed ? (
                                            <TrophyIcon className="h-10 w-10 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="h-10 w-10 text-red-500" />
                                        )}
                                    </div>
                                    <Typography variant="h4" color={quizResult.passed ? "green" : "red"} className="mb-2">
                                        {quizResult.passed ? 'Perfect Score!' : 'Keep Trying!'}
                                    </Typography>
                                    <Typography className="mb-6 font-normal text-blue-gray-500 dark:text-gray-400">
                                        You got <span className="font-bold text-blue-gray-900 dark:text-white">{quizResult.correctCount}/{quizResult.totalQuestions}</span> correct
                                    </Typography>

                                    {/* Question Breakdown */}
                                    <div className="mb-6 space-y-2 text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        {quizResult.results.map((r, idx) => (
                                            <div key={r.questionId} className="flex items-start gap-2 text-sm dark:text-gray-300">
                                                {r.isCorrect ? (
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" />
                                                ) : (
                                                    <XCircleIcon className="h-5 w-5 text-red-500 shrink-0" />
                                                )}
                                                <div>
                                                    <span className="font-bold">Q{idx + 1}:</span> {r.isCorrect ? 'Correct' : `Incorrect (Answer: ${r.correctOption})`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 justify-center">
                                        {!quizResult.passed && (
                                            <Button onClick={() => { setQuizResult(null); setQuizAnswers({}); }} variant="outlined" color="blue-gray" className="dark:text-white dark:border-gray-600">
                                                Try Again
                                            </Button>
                                        )}
                                        <Button onClick={closeQuiz} color="blue">
                                            {quizResult.passed ? 'Continue' : 'Close'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </DialogBody>
            </Dialog>
        </div>
    );
};

// --- Video Card Component ---
const VideoCard = ({ item, locked, onPlay, onComplete, onPractice }) => (
    <Card className={`border shadow-sm transition-all bg-white dark:bg-gray-900/50 backdrop-blur-md ${locked ? 'opacity-50 grayscale border-gray-200 dark:border-gray-800' : 'hover:shadow-md border-blue-gray-100 dark:border-gray-800'}`}>
        <CardBody className="p-0 flex flex-col sm:flex-row">
            {/* Thumbnail */}
            <div className="relative sm:w-48 shrink-0 cursor-pointer group" onClick={onPlay}>
                {locked && <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50" />}
                <img
                    src={item.thumbnailUrl || 'https://via.placeholder.com/320x180?text=Video'}
                    alt={item.title}
                    className="h-32 w-full object-cover sm:h-full sm:rounded-l-xl sm:rounded-tr-none rounded-t-xl"
                />
                {!locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayIcon className="h-10 w-10 text-white drop-shadow-md" />
                    </div>
                )}
                {item.videoDuration && (
                    <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] font-bold text-white">
                        {formatDuration(item.videoDuration)}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col justify-between p-4 grow">
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <Typography variant="h6" color="blue-gray" className="text-sm leading-tight line-clamp-2 dark:text-white">
                            {item.title}
                        </Typography>
                        {item.completed && <CheckCircleIcon className="h-5 w-5 text-green-500 shrink-0" />}
                    </div>
                    <Typography variant="small" className="mt-1 font-normal text-blue-gray-500 dark:text-gray-400">
                        {item.channelName}
                    </Typography>
                </div>

                {!locked && (
                    <div className="mt-3 flex items-center gap-2">
                        <Button size="sm" variant="outlined" className="flex items-center gap-1 py-1 px-2 border-red-100 text-red-500 hover:border-red-500 dark:border-red-900/50 dark:text-red-400" onClick={onPlay}>
                            <PlayIcon className="h-3 w-3" /> Watch
                        </Button>
                        {!item.completed && (
                            <Button size="sm" variant="text" color="green" className="flex items-center gap-1 py-1 px-2" onClick={onComplete}>
                                <CheckCircleIcon className="h-3 w-3" /> Mark Done
                            </Button>
                        )}
                        {item.xpReward > 0 && !item.completed && (
                            <Chip value={`${item.xpReward} XP`} size="sm" variant="ghost" color="amber" className="ml-auto rounded-full" />
                        )}
                        <Button size="sm" variant="outlined" color="blue" className="flex items-center gap-1 py-1 px-2 border-blue-100 text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-400" onClick={onPractice}>
                            <SparklesIcon className="h-3 w-3" /> Practice
                        </Button>
                    </div>
                )}
            </div>
        </CardBody>
    </Card>
);

// --- Practice Card Component ---
const PracticeCard = ({ item, locked, onStartQuiz }) => (
    <Card className={`border shadow-sm transition-all bg-white dark:bg-gray-900/50 backdrop-blur-md ${locked ? 'opacity-50 grayscale border-gray-200 dark:border-gray-800' : 'hover:shadow-md border-purple-100 dark:border-purple-900/30 bg-purple-50/10 dark:bg-purple-900/10'}`}>
        <CardBody className="p-4">
            <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${locked ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600' : item.completed ? 'bg-green-100 dark:bg-green-900/20 text-green-500' : 'bg-purple-100 dark:bg-purple-900/20 text-purple-500'}`}>
                    {locked ? <LockClosedIcon className="h-5 w-5" /> : item.completed ? <CheckCircleIcon className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />}
                </div>

                <div className="grow">
                    <div className="flex items-start justify-between">
                        <div>
                            <Typography variant="h6" color="blue-gray" className="text-sm dark:text-white">
                                {item.title}
                            </Typography>
                            <Typography variant="small" className="font-normal text-blue-gray-500 dark:text-gray-400">
                                {item.practiceSubject} • {item.quizQuestions?.length || 0} Questions
                            </Typography>
                        </div>
                        {item.xpReward > 0 && (
                            <Chip value={`${item.xpReward} XP`} size="sm" variant="ghost" color="amber" className="rounded-full" />
                        )}
                    </div>

                    {!locked && !item.completed && (
                        <div className="mt-3">
                            <Button size="sm" color="purple" className="flex items-center gap-2" onClick={onStartQuiz}>
                                <SparklesIcon className="h-3 w-3" />
                                Start Quiz
                            </Button>
                        </div>
                    )}
                    {locked && (
                        <Typography variant="small" className="mt-2 flex items-center gap-1 font-normal text-gray-400 dark:text-gray-600">
                            <LockClosedIcon className="h-3 w-3" /> Locked
                        </Typography>
                    )}
                </div>
            </div>
        </CardBody>
    </Card>
);

export { StudyPlanViewerPage };
export default StudyPlanViewerPage;
