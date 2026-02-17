import React from 'react';
import { Typography, Button } from "@material-tailwind/react";
import {
    ExclamationTriangleIcon,
    ArrowTrendingDownIcon,
    TrophyIcon,
    ArrowUpIcon,
    ClockIcon,
    MapPinIcon,
} from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const typeConfig = {
    WEAKNESS: {
        icon: ExclamationTriangleIcon,
        gradient: 'from-red-500/20 to-red-600/10',
        border: 'border-red-300/50 dark:border-red-500/30',
        iconBg: 'bg-red-500/20',
        iconColor: 'text-red-600 dark:text-red-400',
        chipBg: 'bg-red-50 dark:bg-red-900/20',
        chipText: 'text-red-700 dark:text-red-300',
        label: 'Needs Work',
        accentColor: 'text-red-600 dark:text-red-400',
    },
    DECLINING: {
        icon: ArrowTrendingDownIcon,
        gradient: 'from-amber-500/20 to-amber-600/10',
        border: 'border-amber-300/50 dark:border-amber-500/30',
        iconBg: 'bg-amber-500/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        chipBg: 'bg-amber-50 dark:bg-amber-900/20',
        chipText: 'text-amber-700 dark:text-amber-300',
        label: 'Declining',
        accentColor: 'text-amber-600 dark:text-amber-400',
    },
    MASTERED: {
        icon: TrophyIcon,
        gradient: 'from-emerald-500/20 to-emerald-600/10',
        border: 'border-emerald-300/50 dark:border-emerald-500/30',
        iconBg: 'bg-emerald-500/20',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        chipBg: 'bg-emerald-50 dark:bg-emerald-900/20',
        chipText: 'text-emerald-700 dark:text-emerald-300',
        label: 'Mastered',
        accentColor: 'text-emerald-600 dark:text-emerald-400',
    },
    READY_TO_ADVANCE: {
        icon: ArrowUpIcon,
        gradient: 'from-blue-500/20 to-blue-600/10',
        border: 'border-blue-300/50 dark:border-blue-500/30',
        iconBg: 'bg-blue-500/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        chipBg: 'bg-blue-50 dark:bg-blue-900/20',
        chipText: 'text-blue-700 dark:text-blue-300',
        label: 'Almost There',
        accentColor: 'text-blue-600 dark:text-blue-400',
    },
    STALE: {
        icon: ClockIcon,
        gradient: 'from-purple-500/20 to-purple-600/10',
        border: 'border-purple-300/50 dark:border-purple-500/30',
        iconBg: 'bg-purple-500/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
        chipBg: 'bg-purple-50 dark:bg-purple-900/20',
        chipText: 'text-purple-700 dark:text-purple-300',
        label: 'Needs Review',
        accentColor: 'text-purple-600 dark:text-purple-400',
    },
    PLAN_GAP: {
        icon: MapPinIcon,
        gradient: 'from-indigo-500/20 to-indigo-600/10',
        border: 'border-indigo-300/50 dark:border-indigo-500/30',
        iconBg: 'bg-indigo-500/20',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        chipBg: 'bg-indigo-50 dark:bg-indigo-900/20',
        chipText: 'text-indigo-700 dark:text-indigo-300',
        label: 'Plan Gap',
        accentColor: 'text-indigo-600 dark:text-indigo-400',
    },
};

const trendArrows = {
    IMPROVING: '↗️',
    DECLINING: '↘️',
    STABLE: '→',
};

export const RecommendationCard = ({ recommendation, compact = false, onAction }) => {
    const navigate = useNavigate();
    const config = typeConfig[recommendation.type] || typeConfig.READY_TO_ADVANCE;
    const Icon = config.icon;

    const handleAction = () => {
        if (onAction) {
            onAction(recommendation);
        } else if (recommendation.deepLink) {
            navigate(recommendation.deepLink);
        }
    };

    if (compact) {
        return (
            <button
                onClick={handleAction}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${config.border}
                    bg-gradient-to-r ${config.gradient} backdrop-blur-sm
                    hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer
                    min-w-[200px] shrink-0`}
            >
                <div className={`p-1 rounded-lg ${config.iconBg}`}>
                    <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
                </div>
                <div className="text-left">
                    <Typography variant="small" className={`font-semibold text-xs leading-tight ${config.accentColor}`}>
                        {recommendation.topic}
                    </Typography>
                    <Typography variant="small" className="font-normal text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                        {config.label} {recommendation.accuracy > 0 ? `· ${Math.round(recommendation.accuracy * 100)}%` : ''}
                    </Typography>
                </div>
            </button>
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-2xl border ${config.border}
            bg-gradient-to-br ${config.gradient} backdrop-blur-md
            p-4 min-w-[260px] max-w-[300px] shrink-0
            hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-xl ${config.iconBg} shadow-sm`}>
                        <Icon className={`h-4 w-4 ${config.iconColor}`} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${config.chipText}`}>
                        {config.label}
                    </span>
                </div>
                {recommendation.accuracy > 0 && (
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {trendArrows[recommendation.trend] || '→'}
                        </span>
                        <span className={`text-sm font-bold ${config.accentColor}`}>
                            {Math.round(recommendation.accuracy * 100)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Topic */}
            <Typography variant="h6" className="text-gray-800 dark:text-white mb-1 line-clamp-1 font-bold">
                {recommendation.topic}
            </Typography>

            {/* Reason */}
            <Typography variant="small" className="text-gray-600 dark:text-gray-400 font-normal mb-3 line-clamp-2 text-xs">
                {recommendation.reason}
            </Typography>

            {/* Action */}
            <Button
                size="sm"
                onClick={handleAction}
                className={`w-full rounded-xl bg-gradient-to-r ${config.gradient} border ${config.border}
                    text-gray-800 dark:text-white shadow-none hover:shadow-md
                    transition-all duration-200 capitalize text-xs font-semibold py-2`}
            >
                {recommendation.action}
            </Button>

            {/* Decorative glow */}
            <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-10
                bg-gradient-to-br ${config.gradient} blur-2xl group-hover:opacity-20 transition-opacity`} />
        </div>
    );
};

export default RecommendationCard;
