import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { BookOpenIcon, SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const CourseGeneratorPage = () => {
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState('Beginner');
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
            console.log("🚀 Sending generation request...", { topic, level });

            const response = await api.post('/courses/generate', { topic, level });

            console.log("✅ Generation successful:", response.data);
            alert("Course Generated Successfully!");
            navigate('/dashboard/home');

        } catch (err) {
            console.error("❌ Generation failed:", err);
            setError(err.response?.data?.error || "Failed to generate course. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 flex items-center text-gray-800">
                <SparklesIcon className="h-8 w-8 text-indigo-600 mr-2" />
                AI Course Generator
            </h1>

            <div className="bg-white shadow-lg rounded-xl p-8">
                <form onSubmit={handleGenerate} className="space-y-6">

                    {/* Topic Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            What do you want to learn?
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Python Basics, Ancient History, Quantum Physics"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            disabled={loading}
                        />
                    </div>

                    {/* Level Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Difficulty Level
                        </label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            disabled={loading}
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
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
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Course... (This may take a moment)
                            </span>
                        ) : (
                            "Generate Course"
                        )}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>Powered by Smart Learning Engine</p>
            </div>
        </div>
    );
};

export default CourseGeneratorPage;
