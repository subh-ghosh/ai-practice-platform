import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Chip,
  Button,
  IconButton,
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
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

/* ---------- Constants & Helpers ---------- */

// best practice: move to .env file (import.meta.env.VITE_API_URL)
const API_BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

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

const getOverviewIcon = (status) => {
  switch ((status || "").toUpperCase()) {
    case "CORRECT":
      return { Icon: CheckCircleIcon, color: "text-green-500" };
    case "INCORRECT":
    case "CLOSE":
      return { Icon: XCircleIcon, color: "text-red-500" };
    case "REVEALED":
      return { Icon: EyeIcon, color: "text-blue-500" };
    default:
      return { Icon: ClockIcon, color: "text-gray-500" };
  }
};

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
      style: { ...chartsConfig.xaxis.labels.style, colors: "#37474f" },
    },
  },
  yaxis: {
    ...chartsConfig.yaxis,
    labels: {
      ...chartsConfig.yaxis.labels,
      style: { ...chartsConfig.yaxis.labels.style, colors: "#37474f" },
    },
  },
  grid: { ...chartsConfig.grid, borderColor: "#e0e0e0" },
  tooltip: { ...chartsConfig.tooltip, theme: "dark", x: { format: "dd MMM yyyy" } },
};

/* ---------- Animation Variants ---------- */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

/* ---------- Skeleton Component ---------- */
const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-8 mt-6">
    <div className="h-20 w-1/3 bg-gray-300/50 rounded-xl" />
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-gray-300/50 rounded-2xl" />
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 bg-gray-300/50 rounded-2xl" />
      ))}
    </div>
  </div>
);

/* ---------- Main Component ---------- */

export function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [summaryRes, timeSeriesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/stats/summary`, config),
        axios.get(`${API_BASE_URL}/api/stats/timeseries`, config),
      ]);

      if (summaryRes.data && timeSeriesRes.data) {
        setStats(summaryRes.data);
        setTimeSeriesData(timeSeriesRes.data);
      } else {
        throw new Error("Received empty data.");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Loading & Error States ---

  if (loading) {
    return (
      <div className="min-h-screen px-4 pb-8 pt-4">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mb-4" />
        <Typography variant="h5" color="blue-gray" className="mb-2">
          Oops! Something went wrong.
        </Typography>
        <Typography color="gray" className="mb-6 font-normal">
          {error}
        </Typography>
        <Button variant="gradient" color="blue" onClick={fetchData} className="flex items-center gap-2">
          <ArrowPathIcon className="h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  // Fallback if data is missing despite no error
  if (!stats || !timeSeriesData) return null;

  /* ---------- Data Configuration ---------- */

  const statisticsCardsData = [
    {
      title: "Total Attempts",
      icon: ArrowPathIcon,
      color: "gray",
      value: stats.totalAttempts,
      footer: { value: "", label: "in total" },
    },
    {
      title: "Correct Answers",
      icon: CheckIcon,
      color: "green",
      value: stats.correctCount,
      footer: { value: "", label: "in total" },
    },
    {
      title: "Incorrect Answers",
      icon: XMarkIcon,
      color: "red",
      value: stats.incorrectCount,
      footer: { value: "", label: "in total" },
    },
    {
      title: "Overall Accuracy",
      icon: ChartBarIcon,
      color: "blue",
      value: `${stats.accuracyPercentage?.toFixed(1) || 0}%`,
      footer: { value: "", label: "of graded attempts" },
    },
  ];

  const chartLabels = timeSeriesData.map((d) =>
    new Date(d.date).toLocaleString("en-US", { day: "numeric", month: "short" })
  );

  const accuracyChart = {
    type: "line",
    height: 220,
    series: [{ name: "Accuracy", data: timeSeriesData.map((d) => d.accuracy?.toFixed(1) || 0) }],
    options: {
      ...lineChartOptions,
      colors: ["#22c55e"],
      xaxis: { ...lineChartOptions.xaxis, categories: chartLabels },
      yaxis: {
        ...lineChartOptions.yaxis,
        min: 0,
        max: 100,
        labels: { ...lineChartOptions.yaxis.labels, formatter: (v) => `${v}%` },
      },
      tooltip: { ...lineChartOptions.tooltip, y: { formatter: (v) => `${v}%` } },
    },
  };

  const speedChart = {
    type: "line",
    height: 220,
    series: [{ name: "Avg. Speed", data: timeSeriesData.map((d) => d.averageSpeedSeconds?.toFixed(1) || 0) }],
    options: {
      ...lineChartOptions,
      colors: ["#f59e0b"],
      xaxis: { ...lineChartOptions.xaxis, categories: chartLabels },
      yaxis: {
        ...lineChartOptions.yaxis,
        labels: { ...lineChartOptions.yaxis.labels, formatter: (v) => formatDuration(v) },
      },
      tooltip: { ...lineChartOptions.tooltip, y: { formatter: (v) => formatDuration(v) } },
    },
  };

  const breakdownChart = {
    type: "pie",
    height: 220,
    series: [stats.correctCount, stats.incorrectCount, stats.revealedCount],
    options: {
      ...chartsConfig,
      chart: { ...chartsConfig.chart, type: "pie" },
      title: { show: "" },
      dataLabels: { enabled: false },
      colors: ["#22c55e", "#ef4444", "#6b7280"],
      legend: { show: true, position: "bottom", labels: { colors: "#37474f" } },
      labels: ["Correct", "Incorrect", "Revealed"],
    },
  };

  /* ---------- Render ---------- */

  return (
    <div className="relative isolate -mx-4 md:-mx-4 lg:-mx-6 px-4 md:px-6 lg:px-8 pb-8 min-h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-sky-100 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 transition-all duration-700" />
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
        className="mt-6 has-fixed-navbar page w-full flex flex-col relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8 flex justify-between items-end">
          <div className="rounded-3xl border border-blue-100/60 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-md px-6 py-5 shadow-sm w-full md:w-auto">
            <div className="flex flex-wrap items-baseline gap-3">
              <Typography variant="h4" color="blue-gray" className="font-normal">
                Welcome,
              </Typography>
              <Typography variant="h1" color="blue-gray" className="font-bold">
                {user?.firstName || "User"}
              </Typography>
              <Chip
                variant="ghost"
                size="sm"
                color={user?.subscriptionStatus === "PREMIUM" ? "green" : "blue-gray"}
                value={user?.subscriptionStatus === "PREMIUM" ? "Premium" : "Free"}
                className="self-center ml-2"
              />
            </div>
          </div>
          {/* Refresh Button for Desktop */}
          <div className="hidden md:block">
            <IconButton variant="text" color="blue-gray" onClick={fetchData}>
              <ArrowPathIcon className="h-6 w-6" />
            </IconButton>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          variants={itemVariants}
          className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
            <motion.div
              key={title}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm"
            >
              <StatisticsCard
                {...rest}
                title={title}
                icon={React.createElement(icon, { className: "w-6 h-6 text-white" })}
                footer={<Typography className="font-normal text-blue-gray-600">{footer.label}</Typography>}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <motion.div
          variants={itemVariants}
          className="mb-8 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {[
            { key: "accuracy", chart: accuracyChart, title: "Daily Accuracy", desc: "Percentage of correct answers over time." },
            { key: "speed", chart: speedChart, title: "Average Answer Speed", desc: "Average time to a correct submission." },
            { key: "breakdown", chart: breakdownChart, title: "Answer Breakdown", desc: "Summary of all practice attempts.", customTitle: true },
          ].map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <StatisticsChart
                chart={item.chart}
                color="transparent"
                title={item.customTitle ? <div className="mt-8">{item.title}</div> : item.title}
                description={item.desc}
                footer={
                  <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                    <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                    &nbsp;Updated just now
                  </Typography>
                }
                className={item.key === "breakdown" ? "flex-grow flex flex-col justify-between" : ""}
              />
            </div>
          ))}
        </motion.div>

        {/* Activity & Overview Section */}
        <motion.div variants={itemVariants} className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
          
          {/* Recent Activity Table */}
          <Card className="overflow-hidden xl:col-span-2 border border-blue-100/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 flex items-center justify-between p-6">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-1">
                  Recent Activity
                </Typography>
                <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-600">
                  <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                  <strong>{stats.totalAttempts} attempts</strong> in total
                </Typography>
              </div>
              <Link to="/dashboard/practice">
                <Button variant="text" size="sm" className="flex items-center gap-2 hover:bg-blue-50">
                  <PencilIcon className="h-4 w-4" /> Start Practice
                </Button>
              </Link>
            </CardHeader>

            <CardBody className="overflow-x-auto px-0 pt-0 pb-0">
              <table className="w-full table-auto min-w-[640px]">
                <thead>
                  <tr>
                    {["Question", "Subject", "Status", "Submitted"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-6 text-left">
                        <Typography variant="small" className="text-[11px] font-medium uppercase text-blue-gray-400">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity?.map((item, key) => {
                    const isLast = key === stats.recentActivity.length - 1;
                    const className = `py-3 px-5 ${isLast ? "" : "border-b border-blue-gray-50"}`;
                    const uniqueKey = `${item.questionId}-${item.submittedAt}`;
                    const statusColor =
                      item.evaluationStatus === "CORRECT" ? "green" :
                      item.evaluationStatus === "REVEALED" ? "blue" :
                      item.evaluationStatus === "CLOSE" ? "orange" : "red";

                    return (
                      <tr key={uniqueKey} className="hover:bg-gray-50/50 transition-colors">
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500 line-clamp-1 max-w-[200px]" title={item.questionText}>
                            {item.questionText}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                            {item.subject}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={statusColor}
                            value={item.evaluationStatus?.toLowerCase() || "unknown"}
                            className="py-0.5 px-2 text-[10px] font-medium w-fit"
                          />
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {formatDateTime(item.submittedAt)}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })}
                  {(!stats.recentActivity || stats.recentActivity.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-sm text-gray-500">
                        No activity yet. Start a practice session!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>

          {/* Submission Timeline */}
          <Card className="border border-blue-100/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md shadow-sm h-full">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Submission Timeline
              </Typography>
              <Typography variant="small" className="font-normal text-blue-gray-600">
                Your latest 5 attempts.
              </Typography>
            </CardHeader>
            <CardBody className="pt-0">
              {stats.recentActivity?.slice(0, 5).map((item, key) => {
                const { Icon, color } = getOverviewIcon(item.evaluationStatus);
                const isLast = key === (stats.recentActivity.length < 5 ? stats.recentActivity.length : 5) - 1;
                
                return (
                  <div key={`${item.questionId}-${key}`} className="flex items-start gap-4 py-3">
                    <div className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${isLast ? "after:h-0" : "after:h-4/6"}`}>
                      <Icon className={`!w-5 !h-5 ${color}`} />
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="block font-medium line-clamp-1 max-w-[180px]">
                        {item.subject}: {item.topic}
                      </Typography>
                      <Typography as="span" variant="small" className="text-xs font-medium text-blue-gray-500">
                        {formatDateTime(item.submittedAt)}
                      </Typography>
                    </div>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;