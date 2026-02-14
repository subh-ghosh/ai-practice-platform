import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import {
    AcademicCapIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    BookOpenIcon,
    VideoCameraIcon,
} from '@heroicons/react/24/solid';

const StudyPlanBuilderPage = () => {
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Beginner');
    const [durationDays, setDurationDays] = useState(7);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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

            console.log("✅ Study plan generated:", response.data);
            navigate(`/dashboard/study-plan/${response.data.id}`);

        } catch (err) {
            console.error("❌ Generation failed:", err);
            setError(err.response?.data?.error || "Failed to generate study plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const durationOptions = [
        { value: 3, label: '3 Days — Quick Sprint' },
        { value: 7, label: '1 Week — Standard' },
        { value: 14, label: '2 Weeks — Deep Dive' },
        { value: 30, label: '1 Month — Mastery' },
    ];

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center text-gray-800">
                <AcademicCapIcon className="h-8 w-8 text-purple-600 mr-2" />
                AI Study Plan Builder
            </h1>
            <p className="text-gray-500 mb-8">
                Enter a topic and we'll build a personalized study plan with YouTube videos and practice sessions.
            </p>

            <div className="bg-white shadow-lg rounded-xl p-8">
                <form onSubmit={handleGenerate} className="space-y-6">

                    {/* Topic Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <BookOpenIcon className="h-4 w-4 text-purple-500 mr-1" />
                            What do you want to learn?
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., React Hooks, Machine Learning, Data Structures"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            disabled={loading}
                        />
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <SparklesIcon className="h-4 w-4 text-purple-500 mr-1" />
                            Difficulty Level
                        </label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                            disabled={loading}
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <ClockIcon className="h-4 w-4 text-purple-500 mr-1" />
                            Study Duration
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {durationOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setDurationDays(opt.value)}
                                    disabled={loading}
                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${durationDays === opt.value
                                            ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                                            : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50/50'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feature Preview */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                        <h3 className="text-sm font-semibold text-purple-800 mb-2">Your study plan will include:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-purple-700">
                            <div className="flex items-center">
                                <VideoCameraIcon className="h-4 w-4 mr-2 text-purple-500" />
                                Curated YouTube videos
                            </div>
                            <div className="flex items-center">
                                <BookOpenIcon className="h-4 w-4 mr-2 text-purple-500" />
                                Practice checkpoints
                            </div>
                            <div className="flex items-center">
                                <ClockIcon className="h-4 w-4 mr-2 text-purple-500" />
                                Day-by-day schedule
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                            <div className="flex">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg shadow-md transition-all transform hover:-translate-y-1 ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Building Your Study Plan... (This may take a moment)
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                <SparklesIcon className="h-5 w-5 mr-2" />
                                Build My Study Plan
                            </span>
                        )}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>Powered by YouTube Data API & Google Gemini AI</p>
            </div>
        </div>
    );
};

export { StudyPlanBuilderPage };
export default StudyPlanBuilderPage;
