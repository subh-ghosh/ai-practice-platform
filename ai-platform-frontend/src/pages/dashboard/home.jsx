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
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

/* ---------- Helpers ---------- */

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

// Chart Options - Styled for Dark/Glass Theme
const lineChartOptions = {
  ...chartsConfig,
  chart: { ...chartsConfig.chart, type: "line", background: "transparent" },
  stroke: { lineCap: "round", curve: "smooth", width: 3 },
  markers: { size: 5, strokeWidth: 0, hover: { size: 8 } },
  xaxis: {
    ...chartsConfig.xaxis,
    type: "category",
    labels: {
      ...chartsConfig.xaxis.labels,
      style: { ...chartsConfig.xaxis.labels.style, colors: "#9ca3af" }, // gray-400
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    ...chartsConfig.yaxis,
    labels: {
      ...chartsConfig.yaxis.labels,
      style: { ...chartsConfig.yaxis.labels.style, colors: "#9ca3af" }, // gray-400
    },
  },
  grid: { ...chartsConfig.grid, borderColor: "rgba(255,255,255,0.05)" },
  tooltip: { 
    theme: "dark", 
    style: { fontSize: "12px", fontFamily: "inherit" },
    x: { show: false },
    marker: { show: false },
  },
};

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

// --- Animations ---
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
    transition: { type: "spring", stiffness: 260, damping: 20 }
  }
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

/* ---------- Main Component ---------- */

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
        const config = {
          headers: { "Authorization": `Bearer ${token}` }
        };

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
      <div className="flex justify-center items-center h-[60vh]">
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
    return (
      <Typography color="gray" className="text-center mt-12">
        No statistics data available.
      </Typography>
    );
  }

  /* ---------- Data Prep ---------- */

  const statisticsCardsData = [
    {
      title: "Total Attempts",
      icon: ArrowPathIcon,
      color: "gray",
      value: stats.totalAttempts,
      footer: { value: "", label: "All time" },
    },
    {
      title: "Correct Answers",
      icon: CheckIcon,
      color: "green",
      value: stats.correctCount,
      footer: { value: "", label: "Keep it up!" },
    },
    {
      title: "Incorrect Answers",
      icon: XMarkIcon,
      color: "red",
      value: stats.incorrectCount,
      footer: { value: "", label: "Opportunities to learn" },
    },
    {
      title: "Overall Accuracy",
      icon: ChartBarIcon,
      color: "blue",
      value: `${stats.accuracyPercentage.toFixed(1)}%`,
      footer: { value: "", label: "Graded attempts" },
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
      colors: ["#22c55e"], // Green
      xaxis: { ...lineChartOptions.xaxis, categories: chartLabels },
      yaxis: {
        ...lineChartOptions.yaxis,
        min: 0,
        max: 100,
        labels: { ...lineChartOptions.yaxis.labels, formatter: (v) => `${v}%` },
      },
    },
  };

  const speedChart = {
    type: "line",
    height: 240,
    series: [{ name: "Avg. Speed", data: timeSeriesData.map((d) => d.averageSpeedSeconds.toFixed(1)) }],
    options: {
      ...lineChartOptions,
      colors: ["#f59e0b"], // Amber
      xaxis: { ...lineChartOptions.xaxis, categories: chartLabels },
      yaxis: {
        ...lineChartOptions.yaxis,
        labels: { ...lineChartOptions.yaxis.labels, formatter: (v) => formatDuration(v) },
      },
    },
  };

  const breakdownChart = {
    type: "pie",
    height: 240,
    series: [stats.correctCount, stats.incorrectCount, stats.revealedCount],
    options: {
      ...chartsConfig,
      chart: { ...chartsConfig.chart, type: "pie", background: "transparent" },
      title: { show: "" },
      dataLabels: { enabled: false },
      colors: ["#22c55e", "#ef4444", "#6b7280"],
      legend: { show: true, position: "bottom", labels: { colors: "#9ca3af" } },
      labels: ["Correct", "Incorrect", "Revealed"],
      stroke: { show: false }, // Cleaner look for glass
    },
  };

  /* ---------- UI ---------- */

  return (
    <div className="relative min-h-screen pb-8 overflow-hidden">
      
      {/* === Shared Animated Background (Matching Landing/Auth) === */}
      <div className="absolute inset-0 -z-10 bg-gray-50 dark:bg-gray-900 transition-colors duration-500" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none" />
      
      <motion.div 
        animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        className="fixed top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
        className="fixed bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-400/10 blur-[120px] pointer-events-none" 
      />

      <motion.div 
        className="mt-6 w-full flex flex-col relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="rounded-3xl border border-white/40 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl px-8 py-6 shadow-sm">
            <div className="flex flex-wrap items-baseline gap-3">
              <Typography variant="h4" className="font-normal text-blue-gray-700 dark:text-gray-300">
                Welcome back,
              </Typography>
              <Typography variant="h1" className="font-bold text-gray-900 dark:text-white">
                {user.firstName}
              </Typography>
              <Chip
                variant="ghost"
                size="sm"
                color={user.subscriptionStatus === "PREMIUM" ? "green" : "blue-gray"}
                value={user.subscriptionStatus === "PREMIUM" ? "PRO" : "FREE"}
                className="self-center ml-2 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Row 1: Stat Cards */}
        <motion.div 
          variants={itemVariants} 
          className="mb-10 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
            <motion.div
              key={title}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              // Consistent Glass Card Style
              className="rounded-2xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-sm relative overflow-hidden"
            >
              <StatisticsCard
                {...rest}
                title={title}
                icon={React.createElement(icon, { className: "w-6 h-6 text-white" })}
                footer={<Typography className="font-normal text-gray-500 dark:text-gray-400 text-xs">{footer.label}</Typography>}
                // Override default classNames if needed by passing className props to StatisticsCard or wrapping
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Row 2: Charts */}
        <motion.div variants={itemVariants} className="mb-8 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
          
          <motion.div 
             whileHover={{ y: -3 }}
             className="rounded-3xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-sm p-1"
          >
            <StatisticsChart
              key="accuracy-chart"
              chart={accuracyChart}
              color="white" // Neutral container for chart
              title="Daily Accuracy"
              description="Your performance trend over time."
              footer={
                <Typography variant="small" className="flex items-center font-normal text-gray-500 dark:text-gray-400">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 mr-1" /> Updated just now
                </Typography>
              }
            />
          </motion.div>

          <motion.div 
             whileHover={{ y: -3 }}
             className="rounded-3xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-sm p-1"
          >
            <StatisticsChart
              key="speed-chart"
              chart={speedChart}
              color="white"
              title="Average Answer Speed"
              description="Time taken per correct submission."
              footer={
                <Typography variant="small" className="flex items-center font-normal text-gray-500 dark:text-gray-400">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 mr-1" /> Updated just now
                </Typography>
              }
            />
          </motion.div>

          <motion.div 
             whileHover={{ y: -3 }}
             className="rounded-3xl border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-sm p-1"
          >
            <StatisticsChart
              key="breakdown-chart"
              chart={breakdownChart}
              color="white"
              title="Answer Breakdown"
              description="Distribution of your attempts."
              footer={
                <Typography variant="small" className="flex items-center font-normal text-gray-500 dark:text-gray-400">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 mr-1" /> Updated just now
                </Typography>
              }
            />
          </motion.div>
        </motion.div>

        {/* Row 3: Activity Table & Feed */}
        <motion.div variants={itemVariants} className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
          
          {/* Recent Activity Table */}
          <Card className="overflow-hidden xl:col-span-2 border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-sm rounded-3xl">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 flex items-center justify-between p-6">
              <div>
                <Typography variant="h6" className="mb-1 text-gray-900 dark:text-white">
                  Recent Activity
                </Typography>
                <Typography variant="small" className="flex items-center gap-1 font-normal text-gray-600 dark:text-gray-400">
                  <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-green-500" />
                  <strong>{stats.totalAttempts} attempts</strong> in total
                </Typography>
              </div>
              <Link to="/dashboard/practice">
                <Button variant="outlined" size="sm" className="flex items-center gap-2 border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5">
                  <PencilIcon className="h-4 w-4" />
                  Practice
                </Button>
              </Link>
            </CardHeader>

            <CardBody className="overflow-x-auto px-0 pt-0 pb-0">
              <table className="w-full table-auto text-left">
                <thead>
                  <tr>
                    {["Question", "Subject", "Status", "Date"].map((el) => (
                      <th key={el} className="border-b border-gray-200 dark:border-gray-800 py-3 px-6 bg-gray-50/50 dark:bg-gray-800/50">
                        <Typography variant="small" className="text-[11px] font-bold uppercase text-gray-500 dark:text-gray-400">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity.map((item, key) => {
                    const isLast = key === stats.recentActivity.length - 1;
                    const classes = isLast ? "p-4" : "p-4 border-b border-gray-100 dark:border-gray-800";
                    const uniqueKey = `${item.questionId}-${item.submittedAt}`;
                    
                    return (
                      <motion.tr 
                        key={uniqueKey} 
                        custom={key}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className={classes}>
                          <Typography variant="small" className="font-medium text-gray-900 dark:text-white">
                            {item.questionText.substring(0, 45)}...
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                            {item.subject}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={item.evaluationStatus.toLowerCase()}
                            color={
                              item.evaluationStatus === "CORRECT" ? "green" :
                              item.evaluationStatus === "INCORRECT" ? "red" :
                              item.evaluationStatus === "CLOSE" ? "amber" : "blue-gray"
                            }
                            className="font-medium w-fit capitalize"
                          />
                        </td>
                        <td className={classes}>
                          <Typography variant="small" className="text-gray-500 dark:text-gray-500">
                            {formatDateTime(item.submittedAt)}
                          </Typography>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </CardBody>
          </Card>

          {/* Submission Overview Feed */}
          <Card className="border border-white/40 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-sm rounded-3xl">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6">
              <Typography variant="h6" className="mb-2 text-gray-900 dark:text-white">
                Submission Overview
              </Typography>
              <Typography variant="small" className="font-normal text-gray-600 dark:text-gray-400">
                Your latest 5 attempts.
              </Typography>
            </CardHeader>
            <CardBody className="pt-0">
              {stats.recentActivity.map((item, key) => {
                const { Icon, color } = getOverviewIcon(item.evaluationStatus);
                const uniqueKey = `${item.questionId}-${item.submittedAt}-${key}`;
                const isLast = key === stats.recentActivity.length - 1;

                return (
                  <motion.div 
                    key={uniqueKey} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (key * 0.1) }}
                    className="flex items-start gap-4 py-3"
                  >
                    <div className={`relative p-1 after:absolute after:left-1/2 after:-translate-x-1/2 after:w-[1px] after:bg-gray-200 dark:after:bg-gray-800 after:content-[''] ${isLast ? "after:h-0" : "after:h-full after:-bottom-full"}`}>
                      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-full p-1 border border-gray-100 dark:border-gray-800 shadow-sm">
                         <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                    </div>
                    <div>
                      <Typography variant="small" className="block font-medium text-gray-900 dark:text-white">
                        {item.subject}: {item.topic.substring(0, 20)}...
                      </Typography>
                      <Typography variant="small" className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDateTime(item.submittedAt)}
                      </Typography>
                    </div>
                  </motion.div>
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