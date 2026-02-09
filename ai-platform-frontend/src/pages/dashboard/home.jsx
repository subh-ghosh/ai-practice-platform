import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Chip,
  Button,
} from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { chartsConfig } from "@/configs";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  ChartBarIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrophyIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

/* ---------- helpers ---------- */

function formatDateTime(isoString) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
}

function formatDuration(seconds) {
  if (!seconds) return "0s";
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(0);
  return `${m}m ${s}s`;
}

const lineChartOptions = {
  ...chartsConfig,
  chart: { ...chartsConfig.chart, type: "line" },
  stroke: { lineCap: "round", curve: "smooth" },
  markers: { size: 5 },
  xaxis: {
    ...chartsConfig.xaxis,
    type: "category",
    labels: {
      ...chartsConfig.xaxis.labels,
      style: { ...chartsConfig.xaxis.labels.style, colors: "#37474f", fontSize: "10px" },
    },
  },
  yaxis: {
    ...chartsConfig.yaxis,
    labels: {
      ...chartsConfig.yaxis.labels,
      style: { ...chartsConfig.yaxis.labels.style, colors: "#37474f", fontSize: "10px" },
    },
  },
  grid: { ...chartsConfig.grid, borderColor: "#e0e0e0" },
  tooltip: { ...chartsConfig.tooltip, theme: "dark" },
};

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

/* ---------- main ---------- */

export function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        setStats(null);
        setTimeSeriesData(null);

        const token = localStorage.getItem("token");
        const config = { headers: { "Authorization": `Bearer ${token}` } };
        const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

        const [summaryRes, timeSeriesRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/stats/summary`, config),
          axios.get(`${BASE_URL}/api/stats/timeseries`, config),
        ]);

        if (summaryRes.data && timeSeriesRes.data) {
          setStats(summaryRes.data);
          setTimeSeriesData(timeSeriesRes.data);
        } else {
          throw new Error("Received empty or invalid data from API");
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Could not load statistics.");
      }
      setLoading(false);
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Spinner className="h-10 w-10 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Typography color="red" className="text-center mt-12 font-medium">
        {error}
      </Typography>
    );
  }

  if (!stats || !timeSeriesData) {
    return <Typography color="gray" className="text-center mt-12">No data available.</Typography>;
  }

  /* ---------- data wiring ---------- */

  const statisticsCardsData = [
    {
      title: "Total Attempts",
      icon: ArrowPathIcon,
      color: "gray",
      value: stats.totalAttempts,
      footer: { value: "", label: "lifetime" },
    },
    {
      title: "Accuracy",
      icon: TrophyIcon,
      color: "blue",
      value: `${stats.accuracyPercentage.toFixed(1)}%`,
      footer: { value: "", label: "average" },
    },
    {
      title: "Correct",
      icon: CheckIcon,
      color: "green",
      value: stats.correctCount,
      footer: { value: "", label: "answers" },
    },
    {
      title: "Mistakes",
      icon: XMarkIcon,
      color: "red",
      value: stats.incorrectCount,
      footer: { value: "", label: "to review" },
    },
  ];

  const chartLabels = timeSeriesData.map((d) =>
    new Date(d.date).toLocaleString("en-US", { day: "numeric", month: "short" })
  );

  const accuracyChart = {
    type: "line",
    height: 220,
    series: [{ name: "Accuracy", data: timeSeriesData.map((d) => d.accuracy.toFixed(1)) }],
    options: {
      ...lineChartOptions,
      colors: ["#22c55e"],
      xaxis: { ...lineChartOptions.xaxis, categories: chartLabels },
      yaxis: { ...lineChartOptions.yaxis, min: 0, max: 100, labels: { ...lineChartOptions.yaxis.labels, formatter: (v) => `${v}%` } },
      tooltip: { ...lineChartOptions.tooltip, y: { formatter: (v) => `${v}%` } },
    },
  };

  const speedChart = {
    type: "line",
    height: 220,
    series: [{ name: "Avg. Speed", data: timeSeriesData.map((d) => d.averageSpeedSeconds.toFixed(1)) }],
    options: {
      ...lineChartOptions,
      colors: ["#f59e0b"],
      xaxis: { ...lineChartOptions.xaxis, categories: chartLabels },
      yaxis: { ...lineChartOptions.yaxis, labels: { ...lineChartOptions.yaxis.labels, formatter: (v) => formatDuration(v) } },
      tooltip: { ...lineChartOptions.tooltip, y: { formatter: (v) => formatDuration(v) } },
    },
  };

  return (
    <div className="relative isolate px-4 pb-8 min-h-[calc(100vh-2rem)] overflow-hidden">
      
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-sky-100 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 transition-all duration-700" />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-[100px]" 
        />
      </div>

      <motion.div 
        className="mt-6 w-full flex flex-col gap-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Typography variant="h4" color="blue-gray" className="font-bold">
              Hello, {user.firstName}
            </Typography>
            <Typography variant="small" className="text-gray-500 font-normal">
              Here is what's happening with your progress today.
            </Typography>
          </div>
          <Link to="/dashboard/practice">
             <Button size="sm" className="flex items-center gap-2 bg-blue-600">
               <PencilIcon className="h-4 w-4" /> Start Practice
             </Button>
          </Link>
        </motion.div>

        {/* 1. Stat Cards (Compact) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
            <motion.div key={title} whileHover={{ y: -3 }}>
              <StatisticsCard
                {...rest}
                title={title}
                icon={React.createElement(icon, { className: "w-5 h-5 text-white" })}
                footer={<Typography className="font-normal text-blue-gray-600 text-xs">{footer.label}</Typography>}
                className="border border-blue-gray-50 shadow-sm rounded-xl p-3" 
              />
            </motion.div>
          ))}
        </motion.div>

        {/* 2. Charts */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-gray-50 bg-white dark:bg-gray-900 shadow-sm p-1">
             <StatisticsChart
              chart={accuracyChart}
              title="Daily Accuracy"
              description="Your performance trend."
              footer={null}
            />
          </div>
          <div className="rounded-xl border border-blue-gray-50 bg-white dark:bg-gray-900 shadow-sm p-1">
             <StatisticsChart
              chart={speedChart}
              title="Speed Trend"
              description="Average time per question."
              footer={null}
            />
          </div>
        </motion.div>

        {/* 3. Recent Activity (The "Notification Style" List) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main Activity Feed */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <Typography variant="h6" color="blue-gray">Recent Activity</Typography>
            
            <div className="flex flex-col gap-2">
              {stats.recentActivity.map((item) => {
                const isCorrect = item.evaluationStatus === "CORRECT";
                const isWrong = item.evaluationStatus === "INCORRECT" || item.evaluationStatus === "CLOSE";
                
                return (
                  <motion.div
                    key={`${item.questionId}-${item.submittedAt}`}
                    whileHover={{ x: 4 }}
                    className="group relative flex items-start gap-3 p-3 rounded-lg border border-blue-gray-50 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm transition-all"
                  >
                    {/* Icon Box */}
                    <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${isCorrect ? "bg-green-50 text-green-500" : isWrong ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"}`}>
                      {isCorrect ? <CheckCircleIcon className="h-4 w-4" /> : isWrong ? <XCircleIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <Typography variant="small" color="blue-gray" className="font-semibold text-xs truncate pr-2">
                           {item.questionText}
                        </Typography>
                        <Typography variant="small" className="text-[10px] text-gray-400 whitespace-nowrap">
                           {formatDateTime(item.submittedAt)}
                        </Typography>
                      </div>
                      <Typography variant="small" className="text-gray-500 text-[11px] mt-0.5 font-normal">
                         {item.subject} • {item.topic}
                      </Typography>
                    </div>
                  </motion.div>
                );
              })}
              
              {stats.recentActivity.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">No activity recorded yet.</div>
              )}
            </div>
          </div>

          {/* Submission Overview (Mini List) */}
          <div className="flex flex-col gap-4">
             <Typography variant="h6" color="blue-gray">Overview</Typography>
             <div className="rounded-xl border border-blue-gray-50 bg-white dark:bg-gray-900 shadow-sm p-4 h-fit">
                <Typography variant="small" className="mb-4 text-gray-500 font-normal">
                  Distribution of your last {stats.recentActivity.length} attempts.
                </Typography>
                
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 rounded-full bg-green-50 text-green-500">
                        <CheckIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <Typography variant="h6" color="blue-gray">{stats.correctCount}</Typography>
                        <Typography variant="small" className="text-gray-500 text-xs">Correct</Typography>
                    </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(stats.correctCount / (stats.totalAttempts || 1)) * 100}%` }}></div>
                </div>

                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 rounded-full bg-red-50 text-red-500">
                        <XMarkIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <Typography variant="h6" color="blue-gray">{stats.incorrectCount}</Typography>
                        <Typography variant="small" className="text-gray-500 text-xs">Incorrect</Typography>
                    </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(stats.incorrectCount / (stats.totalAttempts || 1)) * 100}%` }}></div>
                </div>
             </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;