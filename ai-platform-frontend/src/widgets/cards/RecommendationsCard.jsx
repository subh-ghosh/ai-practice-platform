import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Chip
} from "@material-tailwind/react";
import { LightBulbIcon, ExclamationTriangleIcon, FireIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from 'react-router-dom';

export function RecommendationsCard() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = { headers: { "Authorization": `Bearer ${token}` } };
                const res = await axios.get(`${API_BASE_URL}/recommendations/dashboard`, config);
                setRecommendations(res.data);
            } catch (err) {
                console.error("Failed to load recommendations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecs();
    }, []);

    if (loading || recommendations.length === 0) return null;

    return (
        <Card className="border border-purple-100/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md shadow-sm h-full">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6 flex items-center gap-2">
                <LightBulbIcon className="h-6 w-6 text-purple-500" />
                <div>
                    <Typography variant="h6" color="blue-gray" className="mb-1">
                        AI Recommendations
                    </Typography>
                    <Typography variant="small" className="font-normal text-blue-gray-600">
                        Personalized for you based on performance.
                    </Typography>
                </div>
            </CardHeader>
            <CardBody className="pt-0 px-4 pb-4 flex flex-col gap-4">
                {recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                {rec.type === 'WEAKNESS' && <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />}
                                {rec.type === 'STRENGTH' && <FireIcon className="h-5 w-5 text-orange-500" />}
                                {rec.type === 'START' && <LightBulbIcon className="h-5 w-5 text-blue-500" />}

                                <Typography className="font-bold text-sm text-blue-gray-800 dark:text-gray-200">
                                    {rec.type === 'WEAKNESS' ? 'Focus Area' : rec.type === 'STRENGTH' ? 'Mastered Topic' : 'Suggestion'}
                                </Typography>
                            </div>
                            <Chip size="sm" value={rec.topic} variant="ghost" className="rounded-full" />
                        </div>

                        <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                            {rec.reason}
                        </Typography>

                        <Button
                            size="sm"
                            variant="text"
                            className="flex items-center gap-2 text-purple-600 hover:bg-purple-50 self-start mt-1 p-1"
                            onClick={() => navigate(`/dashboard/practice?subject=${encodeURIComponent(rec.topic === 'New Topic' ? 'Java' : rec.topic)}&topic=${encodeURIComponent(rec.topic)}&difficulty=${encodeURIComponent(rec.difficulty)}`)}
                        >
                            {rec.action} <ArrowRightIcon className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
            </CardBody>
        </Card>
    );
}

export default RecommendationsCard;
