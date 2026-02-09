import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Button,
} from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { chartsConfig } from "@/configs";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

/* ---------- helpers ---------- */

function formatDateTime(isoString) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
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
  chart: { ...chartsConfig.chart, type: "line", toolbar: { show: false } },
  stroke: { lineCap: "round", curve: "smooth", width: 2 },
  markers: { size: 4 },
  xaxis: {
    ...chartsConfig.xaxis,
    type: "category",
    labels: {
      ...chartsConfig.xaxis.labels,
      style: { ...chartsConfig.xaxis.labels.style, colors: "#64748b", fontSize: "11px", fontFamily: "inherit" },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    ...chartsConfig.yaxis,
    labels: {
      ...chartsConfig.yaxis.labels,
      style: { ...chartsConfig.yaxis.labels.style, colors: "#64748b", fontSize: "11px", fontFamily: "inherit" },
    },
  },
  grid: { ...chartsConfig.grid, borderColor: "#f1f5f9", strokeDashArray: 2 },
  tooltip: { ...chartsConfig.tooltip, theme: "light" },
};

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
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
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Spinner className="h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Typography color="red" className="text-center mt-12 font-medium text-sm">
        {error}
      </Typography>
    );
  }

  if (!stats || !timeSeriesData) {
    return <Typography color="gray" className="text-center mt-12 text-sm">No data available.</Typography>;
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
    height: 240,
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
    height: 240,
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
    <div className="relative mt-6 mb-8 w-full min-h-[calc(100vh-175px)]">
      
      {/* Background blobs to match Notification page style */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/5 blur-[100px]" 
        />
      </div>

      <motion.div 
        className="relative z-10 flex flex-col gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header - Aligned with Notification Page Layout */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div>
            <Typography variant="h5" color="blue-gray" className="dark:text-white font-bold tracking-tight">
              Dashboard
            </Typography>
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-normal mt-1">
              Welcome back, {user.firstName}. Here is your daily overview.
            </Typography>
          </div>
          <Link to="/dashboard/practice">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="sm" className="flex items-center gap-2 bg-blue-600 shadow-blue-500/20 hover:shadow-blue-500/40">
                <PencilIcon className="h-4 w-4" /> Start Practice
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* 1. Stat Cards - Same rounded-xl and shadows as Notification container */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
            <motion.div key={title} whileHover={{ y: -3 }}>
              <StatisticsCard
                {...rest}
                title={title}
                icon={React.createElement(icon, { className: "w-5 h-5 text-white" })}
                footer={<Typography className="font-normal text-blue-gray-600 text-xs">{footer.label}</Typography>}
                className="border border-blue-gray-50 dark:border-gray-800 shadow-sm rounded-xl p-4 bg-white dark:bg-gray-900" 
              />
            </motion.div>
          ))}
        </motion.div>

        {/* 2. Charts */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
             <StatisticsChart
              chart={accuracyChart}
              title="Daily Accuracy"
              description="Performance trend over time."
              footer={null}
            />
          </div>
          <div className="rounded-xl border border-blue-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
             <StatisticsChart
              chart={speedChart}
              title="Speed Trend"
              description="Average time per question."
              footer={null}
            />
          </div>
        </motion.div>

        {/* 3. Recent Activity & Overview - Uniform Spacing */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main Activity Feed - Matches Notification Container Style */}
          <Card className="xl:col-span-2 overflow-hidden rounded-xl border border-blue-gray-50 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6 pb-2">
               <Typography variant="h6" color="blue-gray" className="dark:text-white">Recent Activity</Typography>
               <Typography variant="small" className="text-gray-500 font-normal mt-1">Latest practice sessions</Typography>
            </CardHeader>
            <CardBody className="p-6 pt-2 flex flex-col gap-2">
              {stats.recentActivity.map((item) => {
                const isCorrect = item.evaluationStatus === "CORRECT";
                const isWrong = item.evaluationStatus === "INCORRECT" || item.evaluationStatus === "CLOSE";
                
                // EXACT same styling logic as Notification Items
                return (
                  <motion.div
                    key={`${item.questionId}-${item.submittedAt}`}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className={`group relative flex items-start gap-3 p-3 rounded-lg border transition-colors duration-200 
                      ${isCorrect ? "bg-white dark:bg-gray-800 border-green-100 dark:border-green-900/30 shadow-sm" 
                      : isWrong ? "bg-white dark:bg-gray-800 border-red-100 dark:border-red-900/30 shadow-sm"
                      : "bg-transparent border-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30"}`}
                  >
                    {/* Icon Box */}
                    <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                      isCorrect ? "bg-green-50 text-green-500 dark:bg-green-900/20" 
                      : isWrong ? "bg-red-50 text-red-500 dark:bg-red-900/20" 
                      : "bg-blue-50 text-blue-500 dark:bg-blue-900/20"
                    }`}>
                      {isCorrect ? <CheckCircleIcon className="h-4 w-4" /> : isWrong ? <XCircleIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className={`text-xs font-bold ${isCorrect ? "text-gray-900 dark:text-gray-100" : "text-gray-600"}`}>
                           {item.subject}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                           {formatDateTime(item.submittedAt)}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${isCorrect ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-500"}`}>
                         {item.questionText}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              
              {stats.recentActivity.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-xs">No activity recorded yet.</div>
              )}
            </CardBody>
          </Card>

          {/* Submission Overview (Right Side) */}
          <Card className="rounded-xl border border-blue-gray-50 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 h-fit">
             <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6 pb-2">
                <Typography variant="h6" color="blue-gray" className="dark:text-white">Overview</Typography>
             </CardHeader>
             <CardBody className="p-6 pt-4">
                <Typography variant="small" className="mb-6 text-gray-500 font-normal text-xs">
                  Distribution of your last {stats.recentActivity.length} attempts.
                </Typography>
                
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-2.5 rounded-full bg-green-50 text-green-500 dark:bg-green-900/20">
                        <CheckIcon className="h-4 w-4" />
                    </div>
                    <div>
                        <Typography variant="h6" color="blue-gray" className="text-sm dark:text-gray-200">{stats.correctCount}</Typography>
                        <Typography variant="small" className="text-gray-500 text-[10px] uppercase font-bold tracking-wide">Correct</Typography>
                    </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-6">
                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(stats.correctCount / (stats.totalAttempts || 1)) * 100}%` }}></div>
                </div>

                <div className="flex items-center gap-4 mb-2">
                    <div className="p-2.5 rounded-full bg-red-50 text-red-500 dark:bg-red-900/20">
                        <XMarkIcon className="h-4 w-4" />
                    </div>
                    <div>
                        <Typography variant="h6" color="blue-gray" className="text-sm dark:text-gray-200">{stats.incorrectCount}</Typography>
                        <Typography variant="small" className="text-gray-500 text-[10px] uppercase font-bold tracking-wide">Incorrect</Typography>
                    </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-2">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(stats.incorrectCount / (stats.totalAttempts || 1)) * 100}%` }}></div>
                </div>
             </CardBody>
          </Card>

        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;