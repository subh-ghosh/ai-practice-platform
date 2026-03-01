import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Chip,
  Button,
} from "@material-tailwind/react";
import { StatisticsCard, RecommendationsCard } from "@/widgets/cards";
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
  AcademicCapIcon,
  StarIcon,
  TrophyIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import DailyChallengesCard from "../../components/gamification/DailyChallengesCard";
import TodaysFocus from "./TodaysFocus";
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

// --- Animation Variants (Refined) ---

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
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 }
  })
};

/* ---------- main ---------- */

export function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [studyPlanStats, setStudyPlanStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        setStats(null);
        setTimeSeriesData(null);
        setStudyPlanStats(null);

        const token = localStorage.getItem("token");

        const config = {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        };

        const [summaryRes, timeSeriesRes, spStatsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/stats/summary`, config),
          axios.get(`${API_BASE_URL}/stats/timeseries`, config),
          axios.get(`${API_BASE_URL}/study-plans/stats`, config).catch(() => ({ data: null })),
        ]);

        if (summaryRes.data && timeSeriesRes.data) {
          setStats(summaryRes.data);
          setTimeSeriesData(timeSeriesRes.data);
          if (spStatsRes.data) setStudyPlanStats(spStatsRes.data);
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
        <Spinner className="h-12 w-12 text-blue-500" />
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
    height: 220,
    series: [{ name: "Accuracy", data: timeSeriesData.map((d) => d.accuracy.toFixed(1)) }],
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
    series: [{ name: "Avg. Speed", data: timeSeriesData.map((d) => d.averageSpeedSeconds.toFixed(1)) }],
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

  /* ---------- UI ---------- */

  return (
    <div className="relative isolate -mx-4 md:-mx-4 lg:-mx-6 px-4 md:px-6 lg:px-8 pb-8 min-h-[calc(100vh-4rem)] overflow-hidden">

      {/* Animated Background Gradient */}
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
        {/* Welcome header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="rounded-3xl border border-blue-100/60 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-md px-6 py-5 shadow-sm">
            <div className="flex flex-wrap items-baseline gap-3">
              <Typography variant="h4" color="blue-gray" className="font-normal">
                Welcome,
              </Typography>
              <Typography variant="h1" color="blue-gray" className="font-bold">
                {user.firstName}
              </Typography>
              <Chip
                variant="ghost"
                color={user.subscriptionStatus === "PREMIUM" ? "green" : "blue-gray"}
                value={user.subscriptionStatus === "PREMIUM" ? "Premium User" : "Free User"}
                className="self-center"
              />
            </div>
          </div>
        </motion.div>

        {/* Section Header: Study Progress */}
        <motion.div variants={itemVariants} className="mb-6">
          <Typography variant="h4" color="blue-gray" className="font-bold flex items-center">
            <ChartBarIcon className="h-7 w-7 mr-3 text-blue-500" />
            Study Progress
          </Typography>
        </motion.div>

        {/* Row 1: Study Plan Stats (Moved from 1.5) */}
        {studyPlanStats && (
          <motion.div variants={itemVariants} className="mb-12">
            <Typography variant="h6" color="blue-gray" className="mb-4 font-semibold flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-purple-500" />
              Study Plan Progress
            </Typography>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4"
            >
              {[
                { title: "Active Plans", icon: BookOpenIcon, color: "purple", value: studyPlanStats.activePlans, label: "in progress" },
                { title: "Completed Plans", icon: CheckCircleIcon, color: "green", value: studyPlanStats.completedPlans, label: "finished" },
                { title: "XP Earned", icon: StarIcon, color: "amber", value: studyPlanStats.totalXp, label: "total experience" },
                { title: "Items Completed", icon: TrophyIcon, color: "blue", value: studyPlanStats.totalItemsCompleted, label: "videos & quizzes" },
              ].map(({ icon, title, color, value, label }) => (
                <motion.div
                  key={title}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm"
                >
                  <StatisticsCard
                    color={color}
                    title={title}
                    value={String(value)}
                    icon={React.createElement(icon, { className: "w-6 h-6 text-white" })}
                    footer={<Typography className="font-normal text-blue-gray-600">{label}</Typography>}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Row 2: General Stat cards (Moved from Row 1) */}
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

        {/* Row 2: Charts */}
        <motion.div variants={itemVariants} className="mb-8 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <StatisticsChart
              key="accuracy-chart"
              chart={accuracyChart}
              color="transparent"
              title="Daily Accuracy"
              description="Percentage of correct answers over time."
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                  &nbsp;Updated just now
                </Typography>
              }
            />
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <StatisticsChart
              key="speed-chart"
              chart={speedChart}
              color="transparent"
              title="Average Answer Speed"
              description="Average time to a correct submission."
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                  &nbsp;Updated just now
                </Typography>
              }
            />
          </motion.div>

          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <StatisticsChart
              key="breakdown-chart"
              chart={breakdownChart}
              color="transparent"
              className="flex flex-col justify-between h-full"
              title={<div className="mt-12">Answer Breakdown</div>}
              description="Summary of all practice attempts."
              footer={
                <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                  <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                  &nbsp;Updated just now
                </Typography>
              }
            />
          </motion.div>
        </motion.div>

        {/* Row 3: 3 equal-height cards */}
        <motion.div variants={itemVariants} className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
          <TodaysFocus user={user} />
          <DailyChallengesCard />

          {/* Submission Overview */}
          <Card className="h-full border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Submission Overview
              </Typography>
              <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-600">
                Your latest 5 attempts.
              </Typography>
            </CardHeader>
            <CardBody className="pt-0">
              {stats.recentActivity.map((item, key) => {
                const { Icon, color } = getOverviewIcon(item.evaluationStatus);
                const uniqueKey = `${item.questionId}-${item.submittedAt}-${key}`;
                return (
                  <motion.div
                    key={uniqueKey}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (key * 0.1), type: "spring", stiffness: 100 }}
                    className="flex items-start gap-4 py-3"
                  >
                    <div
                      className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${key === stats.recentActivity.length - 1 ? "after:h-0" : "after:h-4/6"
                        }`}
                    >
                      <Icon className={`!w-5 !h-5 ${color}`} />
                    </div>
                    <div>
                      <Typography variant="small" color="blue-gray" className="block font-medium">
                        {item.subject}: {item.topic.substring(0, 20)}...
                      </Typography>
                      <Typography as="span" variant="small" className="text-xs font-medium text-blue-gray-500">
                        {formatDateTime(item.submittedAt)}
                      </Typography>
                    </div>
                  </motion.div>
                );
              })}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-4">
          <Card className="overflow-hidden border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm">
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
                  <PencilIcon className="h-4 w-4" />
                  Start Practice
                </Button>
              </Link>
            </CardHeader>

            <CardBody className="overflow-x-auto hide-scrollbar px-0 pt-0 pb-0">
              <table className="w-full table-auto">
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
                  {stats.recentActivity.map((item, key) => {
                    const className = `py-3 px-5 ${key === stats.recentActivity.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                    const uniqueKey = `${item.questionId}-${item.submittedAt}`;
                    return (
                      <motion.tr
                        key={uniqueKey}
                        custom={key}
                        variants={tableRowVariants}
                        initial="hidden"
                        animate="visible"
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {item.questionText.substring(0, 40)}...
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
                            color={
                              item.evaluationStatus === "CORRECT"
                                ? "green"
                                : item.evaluationStatus === "REVEALED"
                                  ? "blue"
                                  : item.evaluationStatus === "CLOSE"
                                    ? "orange"
                                    : "red"
                            }
                            value={item.evaluationStatus.toLowerCase()}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                          />
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
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
        </motion.div>

      </motion.div>
    </div>
  );
}

export default Home;