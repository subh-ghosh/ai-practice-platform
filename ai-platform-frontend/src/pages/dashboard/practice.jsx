import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Spinner,
  Chip,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Popover,
  PopoverHandler,
  PopoverContent,
  Alert,
} from "@material-tailwind/react";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/context/ThemeContext.jsx";
import { usePaywall } from "@/context/PaywallContext.jsx";
import { InformationCircleIcon, SparklesIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from "@heroicons/react/24/solid";

/* =========================
   Constants & Helpers
========================= */

const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";
const FREE_ACTION_LIMIT = 3;

// Refined Status Styles with Modern Colors and Shadows
const STATUS_STYLES = {
  CORRECT: {
    dot: "bg-emerald-500 shadow-emerald-500/50",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "Correct!",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
  },
  CLOSE: {
    dot: "bg-amber-500 shadow-amber-500/50",
    text: "text-amber-600 dark:text-amber-400",
    label: "Close!",
    chip: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    icon: <InformationCircleIcon className="w-5 h-5 text-amber-500" />
  },
  REVEALED: {
    dot: "bg-indigo-500 shadow-indigo-500/50",
    text: "text-indigo-600 dark:text-indigo-400",
    label: "Solution Revealed",
    chip: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    icon: <EyeIcon className="w-5 h-5 text-indigo-500" />
  },
  INCORRECT: {
    dot: "bg-rose-500 shadow-rose-500/50",
    text: "text-rose-600 dark:text-rose-400",
    label: "Incorrect",
    chip: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    icon: <XCircleIcon className="w-5 h-5 text-rose-500" />
  }
};

function DynamicFeedbackTitle({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.INCORRECT;

  return (
    <div className="flex items-center gap-2 mb-3 animate-in slide-in-from-left-2 duration-500">
      <div className={`p-1 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm`}>
        {style.icon}
      </div>
      <Typography variant="h6" className={`font-bold tracking-tight uppercase text-sm ${style.text}`}>
        {style.label}
      </Typography>
    </div>
  );
}

const formatMarkdownText = (text) => {
  if (!text) return "";
  return text.replace(/\\n/g, '\n');
};

const getStatusChip = (status) => {
  const baseClasses = "py-1 px-3 text-[10px] font-bold uppercase tracking-wider w-fit rounded-full border shadow-sm transition-all hover:scale-105";
  
  if (!status) return <Chip variant="ghost" className={`${baseClasses} border-gray-200 bg-gray-50 text-gray-500`} value="N/A" />;
  
  const style = STATUS_STYLES[status?.toUpperCase()] || STATUS_STYLES.INCORRECT;
  return (
    <div className={`${baseClasses} ${style.chip}`}>
      {status === "REVEALED" ? "Revealed" : style.label}
    </div>
  );
};

/* =========================
   Component
========================= */

export function Practice() {
  const { user, decrementFreeActions } = useAuth();
  const { theme } = useTheme();
  const { showPaywall } = usePaywall();

  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // History State
  const [allHistory, setAllHistory] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(10);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Generator State
  const [subject, setSubject] = useState("Java");
  const [topic, setTopic] = useState("Object Oriented Programming");
  const [difficulty, setDifficulty] = useState("High School");
  const [generating, setGenerating] = useState(false);

  // Question/Answer State
  const [question, setQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [textareaRows, setTextareaRows] = useState(5);
  const [hint, setHint] = useState(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);

  const actionsRemaining = Math.max(0, FREE_ACTION_LIMIT - (user?.freeActionsUsed || 0));

  // --- API Helpers ---

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { headers: { "Authorization": `Bearer ${token}` } };
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/api/practice/history`, getAuthHeaders());
      const raw = Array.isArray(res?.data?.history) ? res.data.history : [];
      const sorted = [...raw].sort((a, b) => {
        const aDate = new Date(a.submittedAt || a.generatedAt || 0);
        const bDate = new Date(b.submittedAt || b.generatedAt || 0);
        return bDate - aDate;
      });
      setAllHistory(sorted);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user, fetchHistory]);

  const pollForResult = async (qId) => {
    for (let i = 0; i < 10; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const res = await axios.get(`${BASE_URL}/api/practice/history`, getAuthHeaders());
        const found = res.data.history.find(item => item.questionId === qId);
        if (found && found.evaluationStatus) return found;
      } catch (err) {
        console.warn("Polling check attempt failed...", err);
      }
    }
    return null;
  };

  // --- Handlers ---

  const handleAnswerChange = (e) => {
    const value = e.target.value;
    setCurrentAnswer(value);
    const rows = (value.match(/\n/g) || []).length + 1;
    setTextareaRows(Math.min(Math.max(5, rows), 15));
  };

  const handleGenerateQuestion = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to generate questions.");
      return;
    }
    
    setGenerating(true);
    setError("");
    setFeedback(null);
    setHint(null);
    setCurrentAnswer(""); 
    setQuestion(null);
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/ai/generate-question`,
        { subject, topic, difficulty },
        getAuthHeaders()
      );
      setQuestion(response.data);
      await fetchHistory();
    } catch (err) {
      console.error("Error generating question:", err);
      setError("Failed to generate question. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmissionLogic = async (apiCall) => {
    setSubmitting(true);
    setFeedback(null);
    setHint(null);
    setError(null);
    setIsPolling(true);

    try {
      const config = { ...getAuthHeaders(), timeout: 90000 };
      const res = await apiCall(config);
      
      setFeedback(res.data);
      await fetchHistory();
      setIsPolling(false);
      
      if (user?.subscriptionStatus === "FREE") decrementFreeActions();

    } catch (err) {
      if (err.response?.status === 402) {
        showPaywall();
        setIsPolling(false);
        return;
      }
      console.log("Direct response failed, switching to polling...", err);
      const foundItem = await pollForResult(question.id);
      setIsPolling(false);
      
      if (foundItem) {
        setFeedback({
          evaluationStatus: foundItem.evaluationStatus,
          answerText: foundItem.answerText,
          feedback: foundItem.feedback,
          hint: foundItem.hint
        });
        await fetchHistory();
        if (user?.subscriptionStatus === "FREE") decrementFreeActions();
      } else {
        setError("We couldn't verify your result due to a connection timeout. Please check your history shortly.");
      }
    } finally {
      setSubmitting(false);
      setLoadingAnswer(false);
    }
  };

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (!question || !currentAnswer) return;
    
    handleSubmissionLogic((config) => 
      axios.post(`${BASE_URL}/api/practice/submit`, {
        questionId: question.id,
        answerText: currentAnswer,
      }, config)
    );
  };

  const confirmGetAnswer = () => {
    setOpenPopover(false);
    if (!question) return;
    setLoadingAnswer(true);

    handleSubmissionLogic((config) => 
      axios.post(`${BASE_URL}/api/practice/get-answer`, { questionId: question.id }, config)
    );
  };

  const handleGetHint = async () => {
    if (!question) return;
    setLoadingHint(true);
    setHint(null);
    setError(null);
    try {
      const res = await axios.post(`${BASE_URL}/api/ai/get-hint`, { questionId: question.id }, getAuthHeaders());
      setHint(res.data);
    } catch (err) {
      console.error("Error getting hint:", err);
      setError("Failed to get a hint. Please try again.");
    } finally {
      setLoadingHint(false);
    }
  };

  // --- Filtering & Memoization ---

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return allHistory;
    const q = searchTerm.toLowerCase();
    return allHistory.filter((item) => {
      const fields = [item.questionText, item.subject, item.topic, item.difficulty, item.answerText]
        .filter(Boolean)
        .map((x) => String(x).toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [allHistory, searchTerm]);

  const visibleHistory = useMemo(
    () => filteredHistory.slice(0, itemsToShow),
    [filteredHistory, itemsToShow]
  );

  return (
    <section className="relative isolate -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pb-10 min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 -z-10 bg-slate-50 dark:bg-gray-950 transition-colors duration-700" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
         <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
         <div className="absolute top-[40%] left-[60%] h-[300px] w-[300px] rounded-full bg-emerald-300/20 dark:bg-emerald-600/10 blur-[80px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      <div className="mt-8 page has-fixed-navbar space-y-10 max-w-7xl mx-auto">
        
        {/* --- Generator Card --- */}
        <Card className="overflow-visible border border-white/50 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-xl shadow-indigo-900/5 ring-1 ring-black/5">
          <CardHeader
            floated={false}
            shadow={false}
            className="rounded-t-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 px-8 py-6 m-0 relative overflow-hidden group"
          >
            {/* Header shine effect */}
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-1000 ease-in-out" />
            
            <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl shadow-inner border border-white/10">
                    <SparklesIcon className="h-7 w-7 text-white drop-shadow-md" />
                </div>
                <div>
                    <Typography variant="h4" color="white" className="font-bold tracking-tight text-shadow-sm">
                    AI Question Generator
                    </Typography>
                    <Typography variant="small" color="white" className="opacity-90 font-medium text-indigo-50">
                    Select a topic and let AI craft a question for you.
                    </Typography>
                </div>
            </div>
          </CardHeader>

          <CardBody className="p-6 md:p-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Input
                variant="outlined"
                label="Subject"
                placeholder="e.g. Java, DBMS"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                color="indigo"
                className="!text-gray-900 dark:!text-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                labelProps={{ className: "!text-gray-500 dark:!text-gray-400" }}
              />

              <Input
                variant="outlined"
                label="Topic"
                placeholder="e.g. Inheritance"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                color="indigo"
                className="!text-gray-900 dark:!text-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                labelProps={{ className: "!text-gray-500 dark:!text-gray-400" }}
              />

              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(val) => setDifficulty(val)}
                color="indigo"
                className="!text-gray-900 dark:!text-white"
                labelProps={{ className: "!text-gray-500 dark:!text-gray-400" }}
                menuProps={{ className: "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 shadow-xl" }}
              >
                {["School", "High School", "Graduation", "Post Graduation", "Research"].map(lvl => (
                    <Option key={lvl} value={lvl} className="dark:hover:bg-gray-700 dark:focus:bg-gray-700">{lvl}</Option>
                ))}
              </Select>
            </div>

            {user?.subscriptionStatus === "FREE" && (
              <Alert className="mt-8 border border-indigo-100 bg-indigo-50/80 text-indigo-900 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-100 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-indigo-500" />
                    <Typography className="text-sm font-medium">
                        Free Plan: You have <strong>{actionsRemaining}</strong> generations left today.
                    </Typography>
                </div>
              </Alert>
            )}

            <div className="mt-10 flex justify-start">
              <Button
                onClick={handleGenerateQuestion}
                disabled={generating || (user?.subscriptionStatus === "FREE" && actionsRemaining <= 0)}
                className="w-full md:w-auto px-10 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                {generating ? <Spinner className="h-4 w-4 text-white" /> : "Generate Question"}
              </Button>
            </div>

            {error && <Typography color="red" className="mt-6 text-sm font-medium text-center animate-pulse">{error}</Typography>}

            {isPolling && (
              <div className="mt-8 flex items-center justify-center gap-3 p-6 rounded-xl bg-indigo-50/50 border border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800 animate-pulse">
                <Spinner className="h-5 w-5 text-indigo-500" />
                <Typography className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                  AI is analyzing your answer...
                </Typography>
              </div>
            )}

            {question && (
              <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                        <Typography variant="small" className="font-bold text-indigo-500 uppercase tracking-widest text-xs">
                            Current Question
                        </Typography>
                    </div>
                    
                    <div className="p-6 md:p-8 border border-indigo-50 rounded-2xl bg-indigo-50/30 dark:bg-gray-800/50 dark:border-gray-700 shadow-sm relative group">
                         {/* Subtle decor */}
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <SparklesIcon className="w-16 h-16 text-indigo-900 dark:text-white" />
                         </div>
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 font-medium leading-relaxed relative z-10">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatMarkdownText(question.questionText)}</ReactMarkdown>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmitAnswer}>
                  <Textarea
                    label="Write your answer here..."
                    value={currentAnswer}
                    onChange={handleAnswerChange}
                    rows={textareaRows}
                    color="indigo"
                    className="!text-gray-900 dark:!text-white bg-white dark:bg-gray-950/50 !border-gray-300 dark:!border-gray-700 focus:!border-indigo-500"
                    containerProps={{ className: "min-w-0" }}
                    labelProps={{ className: "!text-gray-500 dark:!text-gray-400" }}
                  />

                  <div className="mt-6 flex flex-wrap gap-4">
                    <Button type="submit" disabled={submitting || isPolling} 
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                    >
                      {submitting || isPolling ? <Spinner className="h-4 w-4" /> : "Submit Answer"}
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={handleGetHint}
                      disabled={submitting || isPolling}
                      className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    >
                      {loadingHint ? <Spinner className="h-4 w-4" /> : "Get Hint"}
                    </Button>

                    <Popover open={openPopover} handler={setOpenPopover} placement="top">
                      <PopoverHandler>
                        <Button variant="text" color="red" disabled={submitting || isPolling} className="rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600">
                          {loadingAnswer ? <Spinner className="h-4 w-4" /> : "Reveal Answer"}
                        </Button>
                      </PopoverHandler>
                      <PopoverContent className="z-50 border-gray-200 shadow-xl dark:bg-gray-800 dark:border-gray-700">
                        <Typography color="blue-gray" className="mb-2 font-bold dark:text-white">Confirm Reveal?</Typography>
                        <Typography variant="small" className="mb-4 font-normal text-gray-500 dark:text-gray-400">
                          This will count as an attempt.
                        </Typography>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="text" onClick={() => setOpenPopover(false)} className="dark:text-gray-300">Cancel</Button>
                          <Button size="sm" color="red" onClick={confirmGetAnswer}>Confirm</Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </form>
              </div>
            )}

            {hint && (
              <div className="mt-8 p-6 border-l-4 border-l-amber-400 bg-amber-50/50 rounded-r-xl dark:bg-amber-900/10 dark:border-l-amber-600 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-2 mb-3 text-amber-700 dark:text-amber-400">
                    <InformationCircleIcon className="h-5 w-5" />
                    <span className="font-bold text-sm uppercase tracking-wide">Helpful Hint</span>
                </div>
                <div className="prose prose-sm dark:prose-invert text-gray-700 dark:text-gray-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatMarkdownText(hint)}</ReactMarkdown>
                </div>
              </div>
            )}

            {feedback && (
              <div className="mt-10 p-1 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out">
                  <div className={`p-6 md:p-8 rounded-xl h-full ${
                      feedback.evaluationStatus === "CORRECT" ? "bg-emerald-50/30 dark:bg-emerald-900/10" :
                      feedback.evaluationStatus === "CLOSE" ? "bg-amber-50/30 dark:bg-amber-900/10" :
                      feedback.evaluationStatus === "REVEALED" ? "bg-indigo-50/30 dark:bg-indigo-900/10" :
                      "bg-rose-50/30 dark:bg-rose-900/10"
                  }`}>
                    <DynamicFeedbackTitle status={feedback.evaluationStatus} />
                    <div className="mt-4 prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed overflow-x-auto custom-scroll">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {feedback.evaluationStatus === "REVEALED" 
                            ? formatMarkdownText(feedback.answerText) 
                            : formatMarkdownText(feedback.feedback)
                        }
                    </ReactMarkdown>
                    </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* --- History Card --- */}
        <Card className="border border-white/50 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6 flex flex-col md:flex-row gap-4 justify-between items-center rounded-t-xl border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                <Typography variant="h6" color="blue-gray" className="dark:text-white font-bold">
                Practice History
                </Typography>
            </div>
            <div className="w-full md:w-72">
              <Input
                label="Search Questions"
                icon={<i className="fas fa-search" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!text-gray-900 dark:!text-white"
                labelProps={{ className: "!text-gray-500 dark:!text-gray-400" }}
                color="indigo"
              />
            </div>
          </CardHeader>

          <CardBody className="px-0 pt-0 pb-4 overflow-x-auto custom-scroll">
            <table className="w-full min-w-[640px] table-auto text-left border-collapse">
              <thead>
                <tr>
                  {["#", "Question", "Subject", "Difficulty", "Status", "Date"].map((head) => (
                    <th key={head} className="border-b border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10">
                      <Typography variant="small" color="blue-gray" className="font-bold leading-none opacity-70 dark:text-gray-300 uppercase text-xs tracking-wider">
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                    <tr><td colSpan="6" className="p-12 text-center"><Spinner className="h-8 w-8 mx-auto text-indigo-500" /></td></tr>
                ) : visibleHistory.length === 0 ? (
                    <tr><td colSpan="6" className="p-12 text-center text-gray-500 italic">No history found.</td></tr>
                ) : (
                    visibleHistory.map((item, index) => (
                        <tr 
                            key={`${item.questionId}-${index}`} 
                            onClick={() => setSelectedHistory(item)}
                            className="cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors duration-200 group border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                            <td className="p-4">
                                <Typography variant="small" className="font-normal text-gray-500 dark:text-gray-400">{index + 1}</Typography>
                            </td>
                            <td className="p-4 max-w-xs truncate">
                                <Typography variant="small" className="font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {item.questionText}
                                </Typography>
                            </td>
                            <td className="p-4">
                                <Chip variant="ghost" value={item.subject} className="rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] py-0.5 px-2" />
                            </td>
                            <td className="p-4">
                                <Typography variant="small" className="font-normal text-gray-500 dark:text-gray-400 text-xs">{item.difficulty}</Typography>
                            </td>
                            <td className="p-4">
                                {getStatusChip(item.evaluationStatus)}
                            </td>
                            <td className="p-4">
                                <Typography variant="small" className="font-normal text-gray-400 dark:text-gray-500 text-xs">
                                    {new Date(item.submittedAt || item.generatedAt).toLocaleDateString()}
                                </Typography>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
            
            {filteredHistory.length > visibleHistory.length && (
                <div className="mt-6 text-center">
                    <Button variant="text" size="sm" color="indigo" onClick={() => setItemsToShow(prev => prev + 10)} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20">Load More</Button>
                </div>
            )}
          </CardBody>
        </Card>

        {/* History Detail Modal */}
        <Dialog 
            open={!!selectedHistory} 
            handler={() => setSelectedHistory(null)} 
            size="lg" 
            className="dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
            animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0.9, y: -100 },
            }}
        >
            <DialogHeader className="bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800 flex justify-between items-center p-6">
                <Typography variant="h5" className="text-gray-900 dark:text-white font-bold">Practice Details</Typography>
                <div className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => setSelectedHistory(null)}>
                     <XCircleIcon className="h-6 w-6 text-gray-500" />
                </div>
            </DialogHeader>
            <DialogBody divider className="dark:border-gray-800 overflow-y-auto max-h-[70vh] p-8 custom-scroll bg-white dark:bg-gray-900">
                {selectedHistory && (
                    <div className="space-y-10">
                        {/* 1. QUESTION SECTION */}
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <Typography variant="small" className="font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Question
                            </Typography>
                            <div className="p-6 border border-gray-200 rounded-2xl bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                                <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 font-medium leading-relaxed overflow-x-auto custom-scroll">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {formatMarkdownText(selectedHistory.questionText)}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>

                        {/* 2. USER ANSWER SECTION */}
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                            <Typography variant="small" className="font-bold text-gray-500 uppercase tracking-wider mb-2">
                                {selectedHistory.evaluationStatus === "REVEALED" ? "Action Taken" : "Your Answer"}
                            </Typography>
                            <div className={`p-6 border rounded-2xl text-sm transition-colors ${
                                selectedHistory.evaluationStatus === "REVEALED" 
                                ? "border-indigo-100 bg-indigo-50/50 text-indigo-600 italic dark:bg-indigo-900/10 dark:border-indigo-800 dark:text-indigo-300"
                                : "border-gray-200 bg-white dark:bg-gray-950 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                            }`}>
                                {selectedHistory.evaluationStatus === "REVEALED" ? (
                                    <div className="flex items-center gap-2">
                                        <EyeIcon className="h-4 w-4" /> You chose to reveal the answer.
                                    </div>
                                ) : (
                                    <div className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto custom-scroll">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {formatMarkdownText(selectedHistory.answerText || "No answer submitted.")}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. FEEDBACK / SOLUTION SECTION */}
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                            <DynamicFeedbackTitle status={selectedHistory.evaluationStatus} />
                            
                            {(() => {
                                // Need to extract just the bg/border logic here or reuse the map
                                const containerClass = selectedHistory.evaluationStatus === "CORRECT" ? "bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800" :
                                                    selectedHistory.evaluationStatus === "CLOSE" ? "bg-amber-50/50 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-800" :
                                                    selectedHistory.evaluationStatus === "REVEALED" ? "bg-indigo-50/50 border border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800" :
                                                    "bg-rose-50/50 border border-rose-100 dark:bg-rose-900/10 dark:border-rose-800";
                                
                                return (
                                    <div className={`p-6 rounded-2xl prose prose-sm dark:prose-invert max-w-none overflow-x-auto leading-relaxed shadow-sm custom-scroll ${containerClass}`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {selectedHistory.evaluationStatus === "REVEALED" 
                                                ? formatMarkdownText(selectedHistory.answerText) 
                                                : formatMarkdownText(selectedHistory.feedback)
                                            }
                                        </ReactMarkdown>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}
            </DialogBody>
            <DialogFooter className="border-t dark:border-gray-800 p-4">
                <Button variant="text" color="gray" onClick={() => setSelectedHistory(null)} className="mr-2">Close</Button>
            </DialogFooter>
        </Dialog>

      </div>
    </section>
  );
}

export default Practice;