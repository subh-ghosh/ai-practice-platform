import React, { useState, useEffect } from "react";
import api from "@/api"; // From your original logic
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
  Spinner, // From your original logic
  Chip,    // From your original logic
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { chartsConfig } from "@/configs"; // From your original logic
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,  // From your original logic
  EyeIcon,      // From your original logic
  ChartBarIcon, // From your original logic
  ArrowPathIcon,// From your original logic
  CheckIcon,    // From your original logic
  XMarkIcon,    // From your original logic
} from "@heroicons/react/24/solid";
import { useAuth } from "@/context/AuthContext"; // <-- ADDED THIS IMPORT

// --- HELPER FUNCTIONS (From original logic) ---

function formatDateTime(isoString) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return "Invalid Date";
  }
}

function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(0);
  return `${minutes}m ${remainingSeconds}s`;
}

// Base config for our line charts
const lineChartOptions = {
  ...chartsConfig,
  chart: {
    ...chartsConfig.chart,
    type: "line",
  },
  // colors: ["#fff"], // Line color - Will be set in individual charts
  stroke: {
    lineCap: "round",
    curve: 'smooth',
  },
  markers: {
    size: 5,
  },
  xaxis: {
    ...chartsConfig.xaxis,
    type: "category",
    labels: {
      ...chartsConfig.xaxis.labels,
      style: { colors: "#37474f" }, // CHANGED: X-axis labels dark
    },
  },
  yaxis: {
    ...chartsConfig.yaxis,
    labels: {
      ...chartsConfig.yaxis.labels,
      style: { colors: "#37474f" }, // CHANGED: Y-axis labels dark
    }
  },
  grid: {
    ...chartsConfig.grid,
    borderColor: "#e0e0e0", // CHANGED: Lighter grid lines for white bg
  },
  tooltip: {
    theme: "dark",
    x: {
      format: "dd MMM yyyy",
    },
  },
};

// Helper for the new overview feed
const getOverviewIcon = (status) => {
  switch (status?.toUpperCase()) {
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

// --- MAIN COMPONENT ---

export function Home() {
  const { user } = useAuth(); // <-- ADDED THIS LINE
  const [stats, setStats] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [summaryRes, timeSeriesRes] = await Promise.all([
          api.get("/api/stats/summary"),
          api.get("/api/stats/timeseries")
        ]);

        setStats(summaryRes.data);
        setTimeSeriesData(timeSeriesRes.data);

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
      <div className="flex justify-center items-center h-64 mt-12">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Typography color="red" className="text-center mt-12">
        {error || "Statistics data is unavailable."}
      </Typography>
    );
  }

  // --- DYNAMIC DATA CONFIGURATIONS (From original logic) ---

  // --- Statistics Card Data (Dynamic) ---
  const statisticsCardsData = [
    {
      title: "Total Attempts",
      icon: ArrowPathIcon,
      color: "gray",
      value: stats.totalAttempts,
      footer: { value: "", label: "in total" }, // Adapted to new footer style
    },
    {
      title: "Correct Answers",
      icon: CheckIcon,
      color: "green",
      value: stats.correctCount,
      footer: { value: "", label: "in total" }, // Adapted to new footer style
    },
    {
      title: "Incorrect Answers",
      icon: XMarkIcon,
      color: "red",
      value: stats.incorrectCount,
      footer: { value: "", label: "in total" }, // Adapted to new footer style
    },
    {
      title: "Overall Accuracy",
      icon: ChartBarIcon,
      color: "blue",
      value: `${stats.accuracyPercentage.toFixed(1)}%`,
      footer: { value: "", label: "of graded attempts" }, // Adapted to new footer style
    },
  ];

  // --- Chart Configurations (Dynamic) ---
  const chartLabels = timeSeriesData.map(d => new Date(d.date).toLocaleString('en-US', { day: 'numeric', month: 'short' }));

  const accuracyChart = {
    ...lineChartOptions,
    colors: ["#28a745"], // CHANGED: Set line color to green
    series: [
      {
        name: "Accuracy",
        data: timeSeriesData.map(d => d.accuracy.toFixed(1)),
      },
    ],
    options: {
      ...lineChartOptions.options,
      xaxis: { ...lineChartOptions.xaxis, categories: chartLabels },
      yaxis: {
        ...lineChartOptions.yaxis, min: 0, max: 100,
        labels: { ...lineChartOptions.yaxis.labels, formatter: (value) => `${value}%` },
      },
      tooltip: { ...lineChartOptions.tooltip, y: { formatter: (value) => `${value}%` } },
    },
  };

  const speedChart = {
    ...lineChartOptions,
    colors: ["#fbbf24"], // CHANGED: Set line color to amber
    series: [
      {
        name: "Avg. Speed",
        data: timeSeriesData.map(d => d.averageSpeedSeconds.toFixed(1)),
      },
    ],
    options: {
      ...lineChartOptions.options,
      xaxis: { ...lineChartOptions.xaxis, categories: chartLabels },
      yaxis: { ...lineChartOptions.yaxis, labels: { ...lineChartOptions.yaxis.labels, formatter: (value) => formatDuration(value) } },
      tooltip: { ...lineChartOptions.tooltip, y: { formatter: (value) => formatDuration(value) } },
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
      colors: ["#28a745", "#dc3545", "#6b7280"], // Green, Red, Gray
      legend: { show: true, position: 'bottom', labels: { colors: "#37474f" } },
      labels: ["Correct", "Incorrect", "Revealed"],
    },
  };

  // --- JSX RENDER (Using new layout with original logic) ---

  return (
    <div className="mt-12">
      {/* --- ADDED THIS WELCOME BLOCK --- */}
      <div className="mb-12 flex items-baseline gap-2">
        <Typography variant="h5" color="blue-gray" className="font-normal">
          Welcome,
        </Typography>
        <Typography variant="h2" color="blue-gray" className="font-bold">
          {user.firstName}
        </Typography>
      </div>
      {/* --- END OF WELCOME BLOCK --- */}


      {/* --- ROW 1: STATS CARDS (Dynamic) --- */}
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                {/* Adapted to new footer style (no strong tag needed) */}
                {footer.label}
              </Typography>
            }
          />
        ))}
      </div>

      {/* --- ROW 2: CHARTS (Dynamic) --- */}
      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        <StatisticsChart
          key="accuracy-chart"
          chart={accuracyChart}
          color="white" // CHANGED
          title="Daily Accuracy"
          description="Percentage of correct answers over time."
          footer={
            <Typography
              variant="small"
              className="flex items-center font-normal text-blue-gray-600"
            >
              <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
              &nbsp;Updated just now
            </Typography>
          }
        />
        <StatisticsChart
          key="speed-chart"
          chart={speedChart}
          color="white" // CHANGED
          title="Average Answer Speed"
          description="Average time to a correct submission."
          footer={
            <Typography
              variant="small"
              className="flex items-center font-normal text-blue-gray-600"
            >
              <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
              &nbsp;Updated just now
            </Typography>
          }
        />
        <StatisticsChart
          key="breakdown-chart"
          chart={breakdownChart}
          color="white" // CHANGED
          title="Answer Breakdown"
          description="Summary of all practice attempts."
          footer={
            <Typography
              variant="small"
              className="flex items-center font-normal text-blue-gray-600"
            >
              <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
              &nbsp;Updated just now
            </Typography>
          }
        />
      </div>

      {/* --- ROW 3: TABLE & FEED (Dynamic) --- */}
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Activity Table (col-span-2) */}
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Recent Activity
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                <strong>{stats.totalAttempts} attempts</strong> in total
              </Typography>
            </div>
            {/* Removed the Menu/Ellipsis icon from the new style to match your original */}
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Question", "Subject", "Status", "Submitted"].map(
                    (el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-6 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-medium uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map(
                  (item, key) => {
                    const className = `py-3 px-5 ${
                      key === stats.recentActivity.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;
                    const uniqueKey = `${item.questionId}-${item.submittedAt}`;

                    return (
                      <tr key={uniqueKey}>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {/* Using substring logic from original */}
                            {item.questionText.substring(0, 40)}...
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600"
                          >
                            {item.subject}
                          </Typography>
                        </td>
                        <td className={className}>
                           {/* Using Chip logic from original */}
                          <Chip
                            variant="gradient"
                            color={
                              item.evaluationStatus === "CORRECT" ? "green" :
                              item.evaluationStatus === "REVEALED" ? "blue" :
                              item.evaluationStatus === "CLOSE" ? "orange" : "red"
                            }
                            value={item.evaluationStatus.toLowerCase()}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                          />
                        </td>
                        <td className={className}>
                           <Typography className="text-xs font-normal text-blue-gray-500">
                            {/* Using formatDateTime helper from original */}
                            {formatDateTime(item.submittedAt)}
                          </Typography>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Submission Overview (col-span-1) */}
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Submission Overview
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              {/* Using text from original */}
              Your latest 5 attempts.
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {/* Using map and helper logic from original */}
            {stats.recentActivity.map(
              (item, key) => {
                const { Icon, color } = getOverviewIcon(item.evaluationStatus);
                const uniqueKey = `${item.questionId}-${item.submittedAt}-${key}`;
                return (
                  <div key={uniqueKey} className="flex items-start gap-4 py-3">
                    <div
                      className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                        key === stats.recentActivity.length - 1
                          ? "after:h-0"
                          : "after:h-4/6"
                      }`}
                    >
                      <Icon className={`!w-5 !h-5 ${color}`} />
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="block font-medium"
                      >
                        {item.subject}: {item.topic.substring(0, 20)}...
                      </Typography>
                      <Typography
                        as="span"
                        variant="small"
                        className="text-xs font-medium text-blue-gray-500"
                      >
                        {formatDateTime(item.submittedAt)}
                      </Typography>
                    </div>
                  </div>
                )
              }
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;