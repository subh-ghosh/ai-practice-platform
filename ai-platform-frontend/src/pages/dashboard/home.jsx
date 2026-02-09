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

// Polished Chart Options (Better fonts/spacing)
const lineChartOptions = {
  ...chartsConfig,
  chart: { ...chartsConfig.chart, type: "line", toolbar: { show: false } },
  stroke: { lineCap: "round", curve: "smooth", width: 3 },
  markers: { size: 4, strokeWidth: 0, hover: { size: 6 } },
  xaxis: {
    ...chartsConfig.xaxis,
    type: "category",
    labels: {
      ...chartsConfig.xaxis.labels,
      style: { ...chartsConfig.xaxis.labels.style, fontSize: "12px", fontFamily: "inherit", colors: "#90a4ae" },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    ...chartsConfig.yaxis,
    labels: {
      ...chartsConfig.yaxis.labels,
      style: { ...chartsConfig.yaxis.labels.style, fontSize: "12px", fontFamily: "inherit", colors: "#90a4ae" },
    },
  },
  grid: { 
    ...chartsConfig.grid, 
    borderColor: "rgba(255,255,255,0.05)", 
    strokeDashArray: 4,
    padding: { top: 0, right: 0, bottom: 0, left: 10 } 
  },
  tooltip: { 
    theme: "dark", 
    style: { fontSize: "12px", fontFamily: "inherit" },
    x: { show: false } 
  },
};

const getOverviewIcon = (status) => {
  switch ((status || "").toUpperCase()) {
    case "CORRECT":
      return { Icon: CheckCircleIcon, color: "text-green-500 bg-green-500/10" };
    case "INCORRECT":
    case "CLOSE":
      return { Icon: XCircleIcon, color: "text-red-500 bg-red-500/10" };
    case "REVEALED":
      return { Icon: EyeIcon, color: "text-blue-500 bg-blue-500/10" };
    default:
      return { Icon: ClockIcon, color: "text-blue-gray-500 bg-blue-gray-500/10" };
  }
};

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 }
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
        No statistics data available yet.
      </Typography>
    );
  }

  /* ---------- data wiring ---------- */

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
      value: `${stats.accuracyPercentage.toFixed(1)}%`,
      footer: { value: "", label: "of graded attempts" },
    },
  ];

  const chartLabels = timeSeriesData.map((d) =>
    new Date(d.date).toLocaleString("en-US", { day: "numeric", month: "short" })
  );

  const accuracyChart = {
    type: "line",
    height: 240, // Slightly taller for breathing room
    series: [{ name: "Accuracy", data: timeSeriesData.map((d) => d.accuracy.toFixed(1)) }],
    options: {
      ...lineChartOptions,
      colors: ["#22c55e"],
      xaxis: { ...lineChartOptions.xaxis, categories: chartLabels },
      yaxis: {
        ...lineChartOptions.yaxis,
        min: 0,
        max: 100,
        tickAmount: 5,
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
      colors: ["#f59e0b"],
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
      chart: { ...chartsConfig.chart, type: "pie" },
      title: { show: "" },
      dataLabels: { enabled: false },
      colors: ["#22c55e", "#ef4444", "#6b7280"],
      legend: { 
        show: true, 
        position: "bottom", 
        fontSize: "12px",
        fontFamily: "inherit",
        markers: { radius: 12 },
        itemMargin: { horizontal: 10, vertical: 5 }
      },
      labels: ["Correct", "Incorrect", "Revealed"],
      plotOptions: {
        pie: { donut: { size: "65%" } } // Cleaner look
      }
    },
  };

  /* ---------- UI ---------- */

  return (
    <div className="relative isolate px-4 md:px-6 lg:px-8 pb-8 min-h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* Animated Background (Unchanged) */}
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
        className="mt-8 has-fixed-navbar page w-full flex flex-col relative z-10 max-w-[1600px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome header - Compacted padding */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-md px-6 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Typography variant="h5" color="blue-gray" className="font-medium opacity-80">
                Welcome,
              </Typography>
              <Typography variant="h3" color="blue-gray" className="font-bold tracking-tight">
                {user.firstName}
              </Typography>
              <Chip
                variant="ghost"
                size="sm"
                color={user.subscriptionStatus === "PREMIUM" ? "green" : "blue-gray"}
                value={user.subscriptionStatus === "PREMIUM" ? "Premium" : "Free"}
                className="ml-auto md:ml-2 rounded-full font-bold tracking-wide"
              />
            </div>
          </div>
        </motion.div>

        {/* Row 1: Stat cards - Tighter grid gap */}
        <motion.div 
          variants={itemVariants} 
          className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
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
                footer={<Typography className="font-normal text-blue-gray-500 text-xs">{footer.label}</Typography>}
                className="p-4" // Ensure inner padding is adequate
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Row 2: Charts - Unified Height & Spacing */}
        <motion.div variants={itemVariants} className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-300">
            <StatisticsChart
              key="accuracy-chart"
              chart={accuracyChart}
              color="transparent"
              title="Daily Accuracy"
              description="Percentage of correct answers over time."
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-500 text-xs">
                  <ClockIcon strokeWidth={2} className="h-3.5 w-3.5 text-blue-gray-400" />
                  &nbsp;Updated just now
                </Typography>
              }
            />
          </div>

          <div className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-300">
            <StatisticsChart
              key="speed-chart"
              chart={speedChart}
              color="transparent"
              title="Avg. Answer Speed"
              description="Average time to a correct submission."
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-500 text-xs">
                  <ClockIcon strokeWidth={2} className="h-3.5 w-3.5 text-blue-gray-400" />
                  &nbsp;Updated just now
                </Typography>
              }
            />
          </div>

          <div className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
            <StatisticsChart
              key="breakdown-chart"
              chart={breakdownChart}
              color="transparent"
              className="flex-1 flex flex-col"
              title="Answer Breakdown"
              description="Summary of all practice attempts."
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-500 text-xs mt-auto">
                  <ClockIcon strokeWidth={2} className="h-3.5 w-3.5 text-blue-gray-400" />
                  &nbsp;Updated just now
                </Typography>
              }
            />
          </div>
        </motion.div>

        {/* Row 3: Table & Feed - Tighter Padding */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="overflow-hidden xl:col-span-2 border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm rounded-2xl">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 flex items-center justify-between p-5 border-b border-blue-gray-50 dark:border-gray-800/50">
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-1">
                  Recent Activity
                </Typography>
                <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-500 text-xs">
                  <CheckCircleIcon strokeWidth={3} className="h-3.5 w-3.5 text-blue-gray-300" />
                  <strong>{stats.totalAttempts} attempts</strong> in total
                </Typography>
              </div>
              <Link to="/dashboard/practice">
                <Button variant="outlined" size="sm" className="flex items-center gap-2 border-blue-gray-100 dark:border-gray-700 text-blue-gray-500 hover:text-blue-500 hover:border-blue-500">
                  <PencilIcon className="h-3.5 w-3.5" />
                  Practice
                </Button>
              </Link>
            </CardHeader>

            <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
              <table className="w-full min-w-[600px] table-auto">
                <thead>
                  <tr>
                    {["Question", "Subject", "Status", "Submitted"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 dark:border-gray-800 py-3 px-5 text-left bg-gray-50/30 dark:bg-gray-800/30">
                        <Typography variant="small" className="text-[10px] font-bold uppercase text-blue-gray-400 tracking-wider">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity.map((item, key) => {
                    const className = `py-3 px-5 ${key === stats.recentActivity.length - 1 ? "" : "border-b border-blue-gray-50 dark:border-gray-800"}`;
                    const uniqueKey = `${item.questionId}-${item.submittedAt}`;
                    return (
                      <tr key={uniqueKey} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <td className={className}>
                          <Typography className="text-sm font-medium text-blue-gray-700 dark:text-blue-gray-200 truncate max-w-[200px]">
                            {item.questionText}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-xs font-semibold text-blue-gray-500 uppercase tracking-wide">
                            {item.subject}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="filled"
                            size="sm"
                            color={
                              item.evaluationStatus === "CORRECT" ? "green"
                              : item.evaluationStatus === "REVEALED" ? "blue-gray"
                              : item.evaluationStatus === "CLOSE" ? "amber"
                              : "red"
                            }
                            value={item.evaluationStatus.toLowerCase()}
                            className="py-0.5 px-2 text-[10px] font-bold w-fit rounded-md"
                          />
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-400">
                            {formatDateTime(item.submittedAt)}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardBody>
          </Card>

          <Card className="border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm rounded-2xl">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-5 border-b border-blue-gray-50 dark:border-gray-800/50">
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Submission Overview
              </Typography>
              <Typography variant="small" className="font-normal text-blue-gray-500 text-xs">
                Your latest 5 attempts.
              </Typography>
            </CardHeader>
            <CardBody className="pt-4 px-5 pb-5">
              <div className="flex flex-col gap-0">
                {stats.recentActivity.slice(0, 5).map((item, key, arr) => {
                  const { Icon, color } = getOverviewIcon(item.evaluationStatus);
                  const isLast = key === arr.length - 1;
                  const uniqueKey = `${item.questionId}-${item.submittedAt}-overview`;
                  
                  return (
                    <div key={uniqueKey} className="flex gap-4 relative min-h-[48px]">
                      {/* Timeline Line */}
                      {!isLast && (
                        <span className="absolute left-[11px] top-8 bottom-[-8px] w-[2px] bg-gray-100 dark:bg-gray-800" />
                      )}
                      
                      <div className="relative z-10 mt-1">
                        <div className={`p-1.5 rounded-full ${color}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                      </div>
                      
                      <div className="flex-1 pb-4">
                        <Typography variant="small" color="blue-gray" className="font-semibold text-sm leading-none mb-1">
                          {item.subject}
                        </Typography>
                        <Typography variant="small" className="text-[11px] text-blue-gray-400 font-normal leading-tight">
                           {formatDateTime(item.submittedAt)} • {item.topic ? item.topic.substring(0, 25) + '...' : 'General'}
                        </Typography>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Home;