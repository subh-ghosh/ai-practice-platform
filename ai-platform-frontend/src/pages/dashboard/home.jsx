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
      style: { ...chartsConfig.xaxis.labels.style, colors: "#64748b", fontSize: "11px" },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    ...chartsConfig.yaxis,
    labels: {
      ...chartsConfig.yaxis.labels,
      style: { ...chartsConfig.yaxis.labels.style, colors: "#64748b", fontSize: "11px" },
    },
  },
  grid: { ...chartsConfig.grid, borderColor: "#f1f5f9", strokeDashArray: 2 },
  tooltip: { ...chartsConfig.tooltip, theme: "light" },
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
      legend: { show: true, position: "bottom", itemMargin: { horizontal: 10, vertical: 0 } },
      labels: ["Correct", "Incorrect", "Revealed"],
      stroke: { width: 0 },
    },
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-2rem)] pb-8 mt-4">
      
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
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
        className="flex flex-col gap-6 relative z-10 px-2 md:px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-md px-6 py-5 shadow-sm">
            <div className="flex flex-wrap items-baseline gap-3">
              <Typography variant="h5" color="blue-gray" className="font-normal">
                Welcome,
              </Typography>
              <Typography variant="h4" color="blue-gray" className="font-bold">
                {user.firstName}
              </Typography>
              <Chip
                variant="ghost"
                color={user.subscriptionStatus === "PREMIUM" ? "green" : "blue-gray"}
                value={user.subscriptionStatus === "PREMIUM" ? "Premium" : "Free"}
                className="rounded-full py-0.5 px-3 text-[10px]"
              />
            </div>
          </div>
        </motion.div>

        {/* 1. Stat Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
            <motion.div key={title} whileHover={{ y: -3 }}>
              <StatisticsCard
                {...rest}
                title={title}
                icon={React.createElement(icon, { className: "w-6 h-6 text-white" })}
                footer={<Typography className="font-normal text-blue-gray-600 text-xs">{footer.label}</Typography>}
                className="border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm rounded-2xl p-4" 
              />
            </motion.div>
          ))}
        </motion.div>

        {/* 2. Charts */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm p-4">
             <StatisticsChart
              chart={accuracyChart}
              title="Daily Accuracy"
              description="Performance trend."
              footer={null}
            />
          </div>
          <div className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm p-4">
             <StatisticsChart
              chart={speedChart}
              title="Avg Speed"
              description="Time per question."
              footer={null}
            />
          </div>
          <div className="rounded-2xl border border-blue-100/60 dark:border-gray-800 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md shadow-sm p-4 flex flex-col justify-between">
             <div className="px-2 pt-2">
                <Typography variant="h6" color="blue-gray">Breakdown</Typography>
                <Typography variant="small" className="text-gray-600 font-normal">Distribution of answers</Typography>
             </div>
             <div className="flex-1 flex items-center justify-center">
                 <StatisticsChart
                    chart={breakdownChart}
                    title=""
                    description=""
                    footer={null}
                    className="shadow-none"
                 />
             </div>
          </div>
        </motion.div>

        {/* 3. Recent Activity & Overview */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Table Card */}
          <Card className="xl:col-span-2 overflow-hidden rounded-2xl border border-blue-100/60 dark:border-gray-800 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur-md">
            <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <Typography variant="h6" color="blue-gray">Recent Activity</Typography>
                <Typography variant="small" className="text-gray-500 font-normal mt-1">
                  Latest detailed attempts
                </Typography>
              </div>
              <Link to="/dashboard/practice">
                <Button size="sm" variant="text" className="flex items-center gap-2 text-blue-600 hover:bg-blue-50">
                   <PencilIcon className="h-4 w-4" /> Start Practice
                </Button>
              </Link>
            </CardHeader>
            <CardBody className="overflow-x-auto px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {["Question", "Subject", "Status", "Date"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-6 text-left">
                        <Typography variant="small" className="text-[10px] font-bold uppercase text-blue-gray-400">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity.map((item, key) => {
                    const isLast = key === stats.recentActivity.length - 1;
                    const className = `py-3 px-6 ${isLast ? "" : "border-b border-blue-gray-50"}`;
                    return (
                      <tr key={`${item.questionId}-${item.submittedAt}`} className="hover:bg-gray-50/50 transition-colors">
                        <td className={className}>
                          <div className="flex flex-col">
                              <Typography variant="small" color="blue-gray" className="font-semibold text-xs truncate max-w-[200px] lg:max-w-[280px]">
                                {item.questionText}
                              </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-xs font-medium text-blue-gray-500">
                            {item.subject}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="ghost"
                            size="sm"
                            value={item.evaluationStatus.toLowerCase()}
                            color={
                              item.evaluationStatus === "CORRECT" ? "green" :
                              item.evaluationStatus === "CLOSE" ? "orange" :
                              item.evaluationStatus === "REVEALED" ? "blue" : "red"
                            }
                            className="font-medium capitalize w-fit rounded-full px-2 py-0.5"
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
                  {stats.recentActivity.length === 0 && (
                     <tr>
                         <td colSpan={4} className="text-center py-8 text-sm text-gray-500">No activity found.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>

          {/* Timeline / Overview Card */}
          <Card className="rounded-2xl border border-blue-100/60 dark:border-gray-800 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur-md h-fit">
             <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6 pb-2">
                <Typography variant="h6" color="blue-gray">Overview</Typography>
                <Typography variant="small" className="text-gray-500 font-normal">Timeline of last 5 attempts</Typography>
             </CardHeader>
             <CardBody className="p-6 pt-4">
                <div className="flex flex-col gap-1">
                   {stats.recentActivity.slice(0, 5).map((item, key, arr) => {
                       const { Icon, color } = getOverviewIcon(item.evaluationStatus);
                       const isLast = key === arr.length - 1;
                       
                       return (
                           <div key={`timeline-${key}`} className="flex gap-4 relative">
                               {/* Timeline connector */}
                               <div className="flex flex-col items-center">
                                   <div className={`mt-1 z-10 rounded-full p-1 bg-white border border-gray-100 shadow-sm`}>
                                       <Icon className={`w-4 h-4 ${color}`} />
                                   </div>
                                   {!isLast && (
                                     <div className="w-[2px] bg-blue-gray-50 absolute top-8 bottom-[-4px] left-[11px] -z-0" />
                                   )}
                               </div>
                               
                               <div className="pb-6">
                                   <Typography variant="small" color="blue-gray" className="font-semibold text-xs leading-none mb-1">
                                       {item.subject}
                                   </Typography>
                                   <Typography variant="small" className="text-[11px] text-gray-500 leading-tight line-clamp-2">
                                       {item.topic}
                                   </Typography>
                                    <Typography variant="small" className="text-[10px] text-gray-400 mt-1">
                                       {formatDateTime(item.submittedAt)}
                                   </Typography>
                               </div>
                           </div>
                       )
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