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
    VideoCameraIcon,
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
            fetchPlan(); // Refresh to get updated progress
        } catch (err) {
            console.error("Failed to mark item complete:", err);
        }
    };

    const handleStartPractice = (item) => {
        // Navigate to practice page with pre-filled params via URL search params
        const params = new URLSearchParams({
            subject: item.practiceSubject || '',
            topic: item.practiceTopic || '',
            difficulty: item.practiceDifficulty || 'Beginner',
        });
        navigate(`/dashboard/practice?${params.toString()}`);
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

    return (
        <div className="max-w-5xl mx-auto p-6">
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
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold">{plan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
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
                            title="YouTube Player"
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
                            .map((item) => (
                                item.itemType === 'VIDEO' ? (
                                    <VideoCard
                                        key={item.id}
                                        item={item}
                                        onPlay={() => setActiveVideo(item.videoId)}
                                        onComplete={() => handleMarkComplete(item.id)}
                                    />
                                ) : (
                                    <PracticeCard
                                        key={item.id}
                                        item={item}
                                        onStartPractice={() => handleStartPractice(item)}
                                        onComplete={() => handleMarkComplete(item.id)}
                                    />
                                )
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Video Card Component ---
const VideoCard = ({ item, onPlay, onComplete }) => (
    <div className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${item.completed ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
        }`}>
        <div className="flex flex-col sm:flex-row">
            {/* Thumbnail */}
            <div className="relative sm:w-48 flex-shrink-0 cursor-pointer group" onClick={onPlay}>
                <img
                    src={item.thumbnailUrl || 'https://via.placeholder.com/320x180?text=Video'}
                    alt={item.title}
                    className="w-full sm:w-48 h-28 object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
                    <PlayIcon className="h-10 w-10 text-white drop-shadow-lg" />
                </div>
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
                        {item.completed && (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.channelName}</p>
                    {item.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                    )}
                </div>
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
            </div>
        </div>
    </div>
);

// --- Practice Card Component ---
const PracticeCard = ({ item, onStartPractice, onComplete }) => (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all hover:shadow-md ${item.completed
            ? 'border-green-300 bg-green-50/30'
            : 'border-dashed border-purple-300 bg-purple-50/20'
        }`}>
        <div className="p-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.completed ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                        <BookOpenIcon className={`h-4 w-4 ${item.completed ? 'text-green-600' : 'text-purple-600'
                            }`} />
                    </div>
                    <div className="ml-3">
                        <h3 className="font-semibold text-sm text-gray-800">
                            {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {item.practiceSubject} • {item.practiceDifficulty}
                        </p>
                    </div>
                </div>
                {item.completed && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
            </div>
            {item.description && (
                <p className="text-xs text-gray-600 mt-2 ml-11">{item.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3 ml-11">
                <button
                    onClick={onStartPractice}
                    className="flex items-center text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors font-medium"
                >
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    Start Practice
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
        </div>
    </div>
);

export { StudyPlanViewerPage };
export default StudyPlanViewerPage;
