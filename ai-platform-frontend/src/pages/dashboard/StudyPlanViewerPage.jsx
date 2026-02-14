import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
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
    // Legacy items without quiz questions are NOT treated as gates
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
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                    <p className="text-red-700">{error || "Study plan not found."}</p>
                </div>
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
        <div className="max-w-5xl mx-auto p-6 relative">

            {/* XP Animation Overlay */}
            {xpAnimation && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <div className="animate-bounce text-center">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-2xl flex items-center gap-2">
                            <StarIcon className="h-6 w-6" />
                            +{xpAnimation.amount} XP
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <button
                onClick={() => navigate('/dashboard/study-plan-builder')}
                className="flex items-center text-purple-600 hover:text-purple-800 mb-4 transition-colors"
            >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Builder
            </button>

            <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                            <AcademicCapIcon className="h-7 w-7 text-purple-600 mr-2" />
                            {plan.title}
                        </h1>
                        <p className="text-gray-500 mt-1">{plan.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {plan.durationDays} days
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {plan.difficulty}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {plan.items?.length || 0} items
                            </span>
                        </div>
                    </div>
                    {/* XP Badge */}
                    <div className="flex flex-col items-center bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl px-4 py-3">
                        <TrophyIcon className="h-6 w-6 text-yellow-500 mb-1" />
                        <span className="text-lg font-bold text-yellow-700">{earnedXpInPlan}</span>
                        <span className="text-xs text-yellow-600">/ {totalXpInPlan} XP</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ${plan.progress === 100
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                                }`}
                            style={{ width: `${plan.progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Embedded Video Player */}
            {activeVideo && (
                <div className="bg-black rounded-xl overflow-hidden mb-6 shadow-xl">
                    <div className="relative" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${activeVideo}`}
                            title="Video Player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <button
                        onClick={() => setActiveVideo(null)}
                        className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        Close Player
                    </button>
                </div>
            )}

            {/* ===== QUIZ MODAL ===== */}
            {activeQuiz && (
                <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                        <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                                        Knowledge Check
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        Answer all questions correctly to earn <span className="font-semibold text-yellow-600">{activeQuiz.item.xpReward} XP</span>
                                    </p>
                                </div>
                                <button onClick={closeQuiz} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                            </div>
                        </div>

                        <div className="px-6 py-4 space-y-6">
                            {activeQuiz.noQuestions ? (
                                /* Legacy item with no quiz questions */
                                <div className="text-center py-8">
                                    <BookOpenIcon className="h-12 w-12 text-purple-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Quiz Available</h3>
                                    <p className="text-gray-500 text-sm mb-6">
                                        This checkpoint was created before quizzes were available. You can mark it as complete manually.
                                    </p>
                                    <button
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
                                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all"
                                    >
                                        <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                                        Mark as Complete
                                    </button>
                                </div>
                            ) : !quizResult ? (
                                <>
                                    {activeQuiz.questions.map((q, idx) => (
                                        <div key={q.id} className="bg-gray-50 rounded-xl p-4">
                                            <p className="font-medium text-gray-800 mb-3">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mr-2">
                                                    {idx + 1}
                                                </span>
                                                {q.questionText}
                                            </p>
                                            <div className="space-y-2">
                                                {['A', 'B', 'C', 'D'].map((opt) => (
                                                    <label
                                                        key={opt}
                                                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${quizAnswers[q.id] === opt
                                                            ? 'border-purple-500 bg-purple-50 shadow-sm'
                                                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
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
                                                        <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold mr-3 ${quizAnswers[q.id] === opt
                                                            ? 'border-purple-500 bg-purple-500 text-white'
                                                            : 'border-gray-300 text-gray-500'
                                                            }`}>
                                                            {opt}
                                                        </span>
                                                        <span className="text-sm text-gray-700">
                                                            {q[`option${opt}`]}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleSubmitQuiz}
                                        disabled={quizLoading || Object.keys(quizAnswers).length < activeQuiz.questions.length}
                                        className={`w-full py-3 rounded-xl text-white font-bold text-lg transition-all ${quizLoading || Object.keys(quizAnswers).length < activeQuiz.questions.length
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {quizLoading ? 'Checking...' : `Submit Answers (${Object.keys(quizAnswers).length}/${activeQuiz.questions.length})`}
                                    </button>
                                </>
                            ) : (
                                /* ===== QUIZ RESULTS ===== */
                                <div className="text-center">
                                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${quizResult.passed ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                        {quizResult.passed ? (
                                            <TrophyIcon className="h-10 w-10 text-green-500" />
                                        ) : (
                                            <XCircleIcon className="h-10 w-10 text-red-500" />
                                        )}
                                    </div>
                                    <h3 className={`text-2xl font-bold mb-2 ${quizResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                                        {quizResult.passed ? 'Perfect Score!' : 'Keep Trying!'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        You got <span className="font-bold">{quizResult.correctCount}/{quizResult.totalQuestions}</span> correct
                                    </p>

                                    {quizResult.xpEarned > 0 && (
                                        <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold mb-4">
                                            <StarIcon className="h-5 w-5 mr-1" />
                                            +{quizResult.xpEarned} XP earned!
                                        </div>
                                    )}

                                    {/* Question Results */}
                                    <div className="mt-4 space-y-2 text-left">
                                        {quizResult.results.map((r, idx) => (
                                            <div key={r.questionId} className={`flex items-center p-3 rounded-lg ${r.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                                }`}>
                                                {r.isCorrect ? (
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                                ) : (
                                                    <XCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                                                )}
                                                <span className="text-sm text-gray-700">
                                                    Question {idx + 1}: {r.isCorrect ? 'Correct' : `Incorrect — Answer was ${r.correctOption}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex gap-3 justify-center">
                                        {!quizResult.passed && (
                                            <button
                                                onClick={() => {
                                                    setQuizResult(null);
                                                    setQuizAnswers({});
                                                }}
                                                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        )}
                                        <button
                                            onClick={closeQuiz}
                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                        >
                                            {quizResult.passed ? 'Continue' : 'Close'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Day-by-Day Timeline */}
            {dayNumbers.map((dayNum) => (
                <div key={dayNum} className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {dayNum}
                        </div>
                        <h2 className="ml-3 text-lg font-semibold text-gray-700">
                            Day {dayNum}
                        </h2>
                        <div className="flex-grow ml-4 h-px bg-gray-200"></div>
                    </div>

                    <div className="ml-5 border-l-2 border-purple-200 pl-6 space-y-4">
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
    );
};

// --- Video Card Component ---
const VideoCard = ({ item, locked, onPlay, onComplete }) => (
    <div className={`bg-white rounded-lg shadow-sm border transition-all ${locked ? 'opacity-50 border-gray-200' :
        item.completed ? 'border-green-200 bg-green-50/30 hover:shadow-md' :
            'border-gray-200 hover:shadow-md'
        }`}>
        <div className="flex flex-col sm:flex-row">
            {/* Thumbnail */}
            <div className={`relative sm:w-48 flex-shrink-0 ${locked ? 'cursor-not-allowed' : 'cursor-pointer'} group`} onClick={onPlay}>
                <img
                    src={item.thumbnailUrl || 'https://via.placeholder.com/320x180?text=Video'}
                    alt={item.title}
                    className="w-full sm:w-48 h-28 object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                />
                {locked ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
                        <LockClosedIcon className="h-8 w-8 text-white" />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
                        <PlayIcon className="h-10 w-10 text-white drop-shadow-lg" />
                    </div>
                )}
                {item.videoDuration && (
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                        {formatDuration(item.videoDuration)}
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">
                            {item.title}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                            {item.completed && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                            <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                                {item.xpReward} XP
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.channelName}</p>
                    {item.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                    )}
                </div>
                {!locked && (
                    <div className="flex items-center gap-2 mt-3">
                        <button
                            onClick={onPlay}
                            className="flex items-center text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-medium"
                        >
                            <PlayIcon className="h-3 w-3 mr-1" />
                            Watch
                        </button>
                        {!item.completed && (
                            <button
                                onClick={onComplete}
                                className="flex items-center text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors font-medium"
                            >
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Mark Done
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
);

// --- Practice Card Component ---
const PracticeCard = ({ item, locked, onStartQuiz }) => (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all ${locked ? 'opacity-50 border-gray-300' :
        item.completed ? 'border-green-300 bg-green-50/30 hover:shadow-md' :
            'border-dashed border-purple-300 bg-purple-50/20 hover:shadow-md'
        }`}>
        <div className="p-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${locked ? 'bg-gray-100' :
                        item.completed ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                        {locked ? (
                            <LockClosedIcon className="h-4 w-4 text-gray-400" />
                        ) : item.completed ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        ) : (
                            <BookOpenIcon className="h-4 w-4 text-purple-600" />
                        )}
                    </div>
                    <div className="ml-3">
                        <h3 className="font-semibold text-sm text-gray-800">
                            {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {item.practiceSubject} • {item.practiceDifficulty} • {item.quizQuestions?.length || 0} Questions
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {item.completed && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                    <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                        {item.xpReward} XP
                    </span>
                </div>
            </div>
            {item.description && (
                <p className="text-xs text-gray-600 mt-2 ml-11">{item.description}</p>
            )}
            {!locked && !item.completed && (
                <div className="flex items-center gap-2 mt-3 ml-11">
                    <button
                        onClick={onStartQuiz}
                        className="flex items-center text-xs px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all font-medium shadow-sm"
                    >
                        <SparklesIcon className="h-3.5 w-3.5 mr-1.5" />
                        Take Quiz to Unlock
                    </button>
                </div>
            )}
            {locked && (
                <div className="flex items-center gap-2 mt-3 ml-11 text-xs text-gray-400">
                    <LockClosedIcon className="h-3 w-3" />
                    Complete previous checkpoint to unlock
                </div>
            )}
        </div>
    </div>
);

export { StudyPlanViewerPage };
export default StudyPlanViewerPage;
