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
        <div className="mt-12">
            <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <Typography variant="h6" color="blue-gray">
                    AI Course Generator
                </Typography>
            </div>

            <Card className="border border-blue-gray-100 shadow-sm">
                <CardBody className="p-6">
                    <div className="mb-6">
                        <Typography variant="h5" color="blue-gray" className="mb-1">
                            Generate a New Course
                        </Typography>
                        <Typography variant="small" className="font-normal text-blue-gray-600">
                            Enter a topic and let AI create a personalized verified course for you.
                        </Typography>
                    </div>

                    <form onSubmit={handleGenerate} className="flex flex-col gap-6">
                        <div>
                            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                What do you want to learn?
                            </Typography>
                            <Input
                                size="lg"
                                placeholder="e.g., Python Basics, Ancient History, Quantum Physics"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                                labelProps={{
                                    className: "before:content-none after:content-none",
                                }}
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                Difficulty Level
                            </Typography>
                            <Select
                                size="lg"
                                value={level}
                                onChange={(val) => setLevel(val)}
                                className="border-blue-gray-200"
                                labelProps={{
                                    className: "before:content-none after:content-none",
                                }}
                                disabled={loading}
                            >
                                <Option value="Beginner">Beginner</Option>
                                <Option value="Intermediate">Intermediate</Option>
                                <Option value="Advanced">Advanced</Option>
                            </Select>
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
                            className="flex items-center justify-center gap-2"
                        >
                            {loading ? <Spinner className="h-4 w-4" /> : <SparklesIcon className="h-4 w-4" />}
                            Generate Course
                        </Button>
                    </form>
                </CardBody>
            </Card>

            <div className="mt-8 text-center text-blue-gray-500 text-sm">
                <p>Powered by Smart Learning Engine</p>
            </div>
        </div>
    );
};

export default CourseGeneratorPage;
