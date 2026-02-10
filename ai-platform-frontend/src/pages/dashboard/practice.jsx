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
import { InformationCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";

/* =========================
   Constants & Helpers
========================= */

const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";
const FREE_ACTION_LIMIT = 3;

const STATUS_STYLES = {
  CORRECT: {
    dot: "bg-green-500 shadow-green-500/50",
    text: "text-green-500",
    label: "Correct!",
    chip: "border-green-200 bg-green-50/50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300"
  },
  CLOSE: {
    dot: "bg-orange-500 shadow-orange-500/50",
    text: "text-orange-500",
    label: "Close!",
    chip: "border-orange-200 bg-orange-50/50 text-orange-800 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-300"
  },
  REVEALED: {
    dot: "bg-blue-500 shadow-blue-500/50",
    text: "text-blue-500",
    label: "Solution Revealed",
    chip: "border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300"
  },
  INCORRECT: {
    dot: "bg-red-500 shadow-red-500/50",
    text: "text-red-500",
    label: "Incorrect",
    chip: "border-red-200 bg-red-50/50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300"
  }
};

function DynamicFeedbackTitle({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.INCORRECT;
  return (
    <div className="flex items-center gap-2 mb-2 animate-fade-in-scale">
      <div className={`w-3 h-3 rounded-full shadow-[0_0_8px] ${style.dot} transition-all duration-500`}></div>
      <Typography variant="h6" className={`font-bold tracking-tight uppercase text-sm ${style.text}`}>
        {style.label}
      </Typography>
    </div>
  );
}

const formatMarkdownText = (text) => text ? text.replace(/\\n/g, '\n') : "";

const getStatusChip = (status) => {
  const baseClasses = "py-0.5 px-2.5 text-[11px] font-bold uppercase tracking-wide w-fit rounded-full border transition-all duration-300 hover:scale-105";
  if (!status) return <Chip variant="ghost" className={`${baseClasses} border-blue-gray-100 text-blue-gray-500`} value="N/A" />;
  const style = STATUS_STYLES[status?.toUpperCase()] || STATUS_STYLES.INCORRECT;
  return <Chip variant="ghost" className={`${baseClasses} ${style.chip}`} value={status === "REVEALED" ? "Revealed" : style.label} />;
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
      const sorted = [...raw].sort((a, b) => new Date(b.submittedAt || b.generatedAt || 0) - new Date(a.submittedAt || a.generatedAt || 0));
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
      const response = await axios.post(`${BASE_URL}/api/ai/generate-question`, { subject, topic, difficulty }, getAuthHeaders());
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
      axios.post(`${BASE_URL}/api/practice/submit`, { questionId: question.id, answerText: currentAnswer }, config)
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

  // --- Filtering ---
  const filteredHistory = useMemo(() => {
    if (!searchTerm) return allHistory;
    const q = searchTerm.toLowerCase();
    return allHistory.filter((item) => {
      const fields = [item.questionText, item.subject, item.topic, item.difficulty, item.answerText].filter(Boolean).map((x) => String(x).toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [allHistory, searchTerm]);

  const visibleHistory = useMemo(() => filteredHistory.slice(0, itemsToShow), [filteredHistory, itemsToShow]);

  return (
    <section className="relative isolate -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pb-10 min-h-[calc(100vh-4rem)]">
      
      {/* Styles & Animations */}
      <style>{`
        /* Custom Scrollbar */
        .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        .dark .custom-scroll::-webkit-scrollbar-track { background: #111827; }
        .dark .custom-scroll::-webkit-scrollbar-thumb { background-color: #374151; border: 2px solid #111827; border-radius: 4px; }
        .dark .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #4b5563; }
        
        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulseSoft { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-slide-up { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pop-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-fade-in-scale { animation: scaleIn 0.4s ease-out forwards; }
        .animate-pulse-soft { animation: pulseSoft 2s infinite ease-in-out; }
        .delay-100 { animation-delay: 100ms; }
      `}</style>

      {/* Background Layer */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-sky-100 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 transition-colors duration-700" />
      <div className="pointer-events-none absolute -top-10 right-[8%] h-64 w-64 rounded-full bg-sky-300/30 dark:bg-sky-600/30 blur-3xl animate-pulse-soft" />
      <div className="pointer-events-none absolute top-36 -left-10 h-72 w-72 rounded-full bg-blue-300/25 dark:bg-blue-700/25 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />

      <div className="mt-6 page has-fixed-navbar space-y-8 max-w-7xl mx-auto">
        
        {/* --- Generator Card (Top) --- 
            Z-INDEX FIX: z-20 keeps this card (and the dropdowns inside it) above the history card below.
            OVERFLOW FIX: overflow-visible allows the dropdown to hang outside the card.
        */}
        <Card className="overflow-visible relative z-20 border border-blue-100/60 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm animate-slide-up">
          <CardHeader floated={false} shadow={false} className="rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-4 m-0">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg shadow-inner">
                    <SparklesIcon className="h-6 w-6 text-white animate-pulse" />
                </div>
                <div>
                    <Typography variant="h5" color="white" className="font-bold tracking-tight">AI Question Generator</Typography>
                    <Typography variant="small" color="white" className="opacity-90 font-normal">Select a topic and let AI craft a question for you.</Typography>
                </div>
            </div>
          </CardHeader>

          <CardBody className="p-6 md:p-8 overflow-visible">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Subject Input */}
              <div className="w-full">
                <Input
                  size="lg"
                  label="Subject"
                  placeholder="e.g. Java, DBMS"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  color="blue"
                  className="!text-blue-gray-900 dark:!text-white !bg-white dark:!bg-gray-800 !border-blue-gray-200 focus:!border-blue-500 placeholder:opacity-50"
                  labelProps={{ className: "!text-blue-gray-500 dark:!text-gray-400" }}
                />
              </div>

              {/* Topic Input */}
              <div className="w-full">
                <Input
                  size="lg"
                  label="Topic"
                  placeholder="e.g. Inheritance"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  color="blue"
                  className="!text-blue-gray-900 dark:!text-white !bg-white dark:!bg-gray-800 !border-blue-gray-200 focus:!border-blue-500 placeholder:opacity-50"
                  labelProps={{ className: "!text-blue-gray-500 dark:!text-gray-400" }}
                />
              </div>

              {/* Difficulty Select - Modernized & Fixed Z-Index */}
              <div className="w-full relative">
                <Select
                  size="lg"
                  label="Difficulty"
                  value={difficulty}
                  onChange={(val) => setDifficulty(val)}
                  color="blue"
                  className="!text-blue-gray-900 dark:!text-white !bg-white dark:!bg-gray-800 !border-blue-gray-200 focus:!border-blue-500"
                  labelProps={{ className: "!text-blue-gray-500 dark:!text-gray-400" }}
                  menuProps={{
                    className: "p-2 bg-white dark:bg-gray-900 border border-blue-gray-50 dark:border-gray-800 shadow-lg shadow-blue-gray-500/10 dark:shadow-black/50 rounded-xl min-w-[200px] max-h-[300px] overflow-y-auto z-[9999]",
                    animate: {
                      mount: { y: 0, scale: 1, opacity: 1 },
                      unmount: { y: 10, scale: 0.95, opacity: 0 },
                    },
                  }}
                >
                  {["School", "High School", "Graduation", "Post Graduation", "Research"].map(lvl => (
                    <Option 
                      key={lvl} 
                      value={lvl} 
                      className="mb-1 rounded-lg py-2.5 px-3 text-sm font-medium transition-all hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-300 dark:focus:bg-gray-800"
                    >
                      {lvl}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            {user?.subscriptionStatus === "FREE" && (
              <Alert className="mt-6 border border-blue-100 bg-blue-50/80 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100 rounded-lg animate-fade-in">
                <div className="flex items-center gap-3">
                    <InformationCircleIcon className="w-5 h-5" />
                    <Typography className="text-sm font-medium">Free Plan: You have <strong>{actionsRemaining}</strong> generations left today.</Typography>
                </div>
              </Alert>
            )}

            <div className="mt-8 flex justify-start">
              <Button
                onClick={handleGenerateQuestion}
                disabled={generating || (user?.subscriptionStatus === "FREE" && actionsRemaining <= 0)}
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 active:scale-95 hover:scale-[1.02]"
              >
                {generating ? <Spinner className="h-4 w-4" /> : "Generate Question"}
              </Button>
            </div>

            {error && (
                <div className="mt-4 animate-pop-in">
                    <Typography color="red" className="text-sm font-medium text-center">{error}</Typography>
                </div>
            )}

            {isPolling && (
              <div className="mt-6 flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800 animate-pulse">
                <Spinner className="h-5 w-5 text-blue-500" />
                <Typography className="text-sm font-semibold text-blue-600 dark:text-blue-300">AI is analyzing your answer...</Typography>
              </div>
            )}

            {question && (
              <div className="mt-10 animate-slide-up">
                <div className="mb-6">
                    <Typography variant="small" className="font-bold text-blue-500 uppercase tracking-wider mb-1">Question</Typography>
                    <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700 transition-all hover:border-blue-200 dark:hover:border-blue-900">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-blue-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatMarkdownText(question.questionText)}</ReactMarkdown>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmitAnswer}>
                  {/* Textarea Wrapper */}
                  <div className="group">
                    <Textarea
                        label="Write your answer here..."
                        value={currentAnswer}
                        onChange={handleAnswerChange}
                        rows={textareaRows}
                        color="blue"
                        className="!text-blue-gray-900 dark:!text-white bg-white dark:bg-gray-900 !border-blue-gray-200 focus:!border-blue-500"
                        containerProps={{ className: "min-w-0" }}
                        labelProps={{ className: "!text-blue-gray-500 dark:!text-gray-400" }}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button type="submit" disabled={submitting || isPolling} className="rounded-lg bg-blue-600 transition-all active:scale-95 hover:shadow-lg hover:shadow-blue-500/20">
                      {submitting || isPolling ? <Spinner className="h-4 w-4" /> : "Submit Answer"}
                    </Button>
                    <Button variant="outlined" onClick={handleGetHint} disabled={submitting || isPolling} className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-all active:scale-95">
                      {loadingHint ? <Spinner className="h-4 w-4" /> : "Get Hint"}
                    </Button>
                    <Popover open={openPopover} handler={setOpenPopover} placement="top" animate={{ mount: { scale: 1, y: 0 }, unmount: { scale: 0, y: 25 } }}>
                      <PopoverHandler>
                        <Button variant="text" color="red" disabled={submitting || isPolling} className="rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95">
                          {loadingAnswer ? <Spinner className="h-4 w-4" /> : "Reveal Answer"}
                        </Button>
                      </PopoverHandler>
                      <PopoverContent className="z-50 border-blue-gray-100 dark:bg-gray-800 dark:border-gray-700 shadow-xl">
                        <Typography color="blue-gray" className="mb-2 font-bold dark:text-white">Confirm Reveal?</Typography>
                        <Typography variant="small" className="mb-4 font-normal text-blue-gray-500 dark:text-gray-400">This will count as an attempt.</Typography>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="text" onClick={() => setOpenPopover(false)} className="dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</Button>
                          <Button size="sm" color="red" onClick={confirmGetAnswer} className="hover:shadow-red-500/20">Confirm</Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </form>
              </div>
            )}

            {hint && (
              <div className="mt-6 p-5 border border-blue-200 bg-blue-50/50 rounded-2xl dark:bg-blue-900/10 dark:border-blue-800 animate-slide-up">
                <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
                    <InformationCircleIcon className="h-5 w-5" />
                    <span className="font-bold text-sm uppercase">Hint</span>
                </div>
                <div className="prose prose-sm dark:prose-invert text-blue-gray-700 dark:text-blue-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatMarkdownText(hint)}</ReactMarkdown>
                </div>
              </div>
            )}

            {feedback && (
              <div className="mt-8 p-6 border rounded-2xl bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm animate-pop-in">
                <DynamicFeedbackTitle status={feedback.evaluationStatus} />
                <div className="mt-3 prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed overflow-x-auto custom-scroll">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback.evaluationStatus === "REVEALED" ? formatMarkdownText(feedback.answerText) : formatMarkdownText(feedback.feedback)}</ReactMarkdown>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* --- History Card (Bottom) ---
            Z-INDEX FIX: z-0 ensures this sits BELOW the card above it.
        */}
        <Card className="relative z-0 border border-blue-100/60 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm animate-slide-up delay-100">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6 flex flex-col md:flex-row gap-4 justify-between items-center rounded-t-xl">
            <Typography variant="h6" color="blue-gray" className="dark:text-white">Practice History</Typography>
            <div className="w-full md:w-72">
              <Input
                label="Search"
                icon={<i className="fas fa-search" />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!text-blue-gray-900 dark:!text-white"
                labelProps={{ className: "!text-blue-gray-500 dark:!text-gray-400" }}
              />
            </div>
          </CardHeader>

          <CardBody className="px-0 pt-0 pb-4 overflow-x-auto custom-scroll">
            <table className="w-full min-w-[640px] table-auto text-left">
              <thead>
                <tr>
                  {["#", "Question", "Subject", "Difficulty", "Status", "Date"].map((head) => (
                    <th key={head} className="border-b border-blue-gray-50 bg-blue-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <Typography variant="small" color="blue-gray" className="font-bold leading-none opacity-70 dark:text-gray-300">{head}</Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                    <tr><td colSpan="6" className="p-8 text-center"><Spinner className="h-8 w-8 mx-auto" /></td></tr>
                ) : visibleHistory.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No history found.</td></tr>
                ) : (
                    visibleHistory.map((item, index) => (
                        <tr key={`${item.questionId}-${index}`} onClick={() => setSelectedHistory(item)} className="cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors duration-200 group">
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800"><Typography variant="small" color="blue-gray" className="font-normal dark:text-gray-400">{index + 1}</Typography></td>
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800 max-w-xs truncate"><Typography variant="small" color="blue-gray" className="font-medium dark:text-gray-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{item.questionText}</Typography></td>
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800"><Typography variant="small" className="font-normal text-gray-600 dark:text-gray-400">{item.subject}</Typography></td>
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800"><Typography variant="small" className="font-normal text-gray-600 dark:text-gray-400">{item.difficulty}</Typography></td>
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800">{getStatusChip(item.evaluationStatus)}</td>
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800"><Typography variant="small" className="font-normal text-gray-500 dark:text-gray-500">{new Date(item.submittedAt || item.generatedAt).toLocaleDateString()}</Typography></td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
            {filteredHistory.length > visibleHistory.length && (
                <div className="mt-4 text-center">
                    <Button variant="text" size="sm" onClick={() => setItemsToShow(prev => prev + 10)} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-all">Load More</Button>
                </div>
            )}
          </CardBody>
        </Card>

        {/* History Detail Modal */}
        <Dialog open={!!selectedHistory} handler={() => setSelectedHistory(null)} size="lg" className="bg-white dark:bg-gray-900 border dark:border-gray-800" animate={{ mount: { scale: 1, y: 0, opacity: 1 }, unmount: { scale: 0.9, y: -100, opacity: 0 } }}>
            <DialogHeader className="dark:text-white border-b dark:border-gray-800 flex justify-between items-center">Practice Details</DialogHeader>
            <DialogBody divider className="dark:border-gray-800 overflow-y-auto max-h-[70vh] p-6 custom-scroll">
                {selectedHistory && (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <Typography variant="small" className="font-bold text-blue-500 uppercase tracking-wider mb-2">Question</Typography>
                            <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700">
                                <div className="prose prose-sm dark:prose-invert max-w-none text-blue-gray-800 dark:text-gray-200 font-medium leading-relaxed overflow-x-auto custom-scroll">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatMarkdownText(selectedHistory.questionText)}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Typography variant="small" className="font-bold text-gray-500 uppercase tracking-wider mb-2">{selectedHistory.evaluationStatus === "REVEALED" ? "Action" : "Your Answer"}</Typography>
                            <div className={`p-5 border rounded-2xl text-sm transition-all duration-300 ${selectedHistory.evaluationStatus === "REVEALED" ? "border-blue-100 bg-blue-50/30 text-blue-600 italic dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-300" : "border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-700 dark:text-gray-300"}`}>
                                {selectedHistory.evaluationStatus === "REVEALED" ? "You chose to reveal the answer." : <div className="prose prose-sm dark:prose-invert max-w-none overflow-x-auto custom-scroll"><ReactMarkdown remarkPlugins={[remarkGfm]}>{formatMarkdownText(selectedHistory.answerText || "No answer submitted.")}</ReactMarkdown></div>}
                            </div>
                        </div>
                        <div className="animate-slide-up delay-100">
                            <DynamicFeedbackTitle status={selectedHistory.evaluationStatus} />
                            <div className={`p-6 rounded-2xl prose prose-sm dark:prose-invert max-w-none overflow-x-auto leading-relaxed shadow-sm custom-scroll transition-all duration-500 ${selectedHistory.evaluationStatus === "CORRECT" ? "bg-green-50/50 border border-green-100 dark:bg-green-900/10 dark:border-green-800" : selectedHistory.evaluationStatus === "CLOSE" ? "bg-orange-50/50 border border-orange-100 dark:bg-orange-900/10 dark:border-orange-800" : selectedHistory.evaluationStatus === "REVEALED" ? "bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800" : "bg-red-50/50 border border-red-100 dark:bg-red-900/10 dark:border-red-800"}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedHistory.evaluationStatus === "REVEALED" ? formatMarkdownText(selectedHistory.answerText) : formatMarkdownText(selectedHistory.feedback)}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </DialogBody>
            <DialogFooter className="border-t dark:border-gray-800">
                <Button variant="gradient" color="blue" onClick={() => setSelectedHistory(null)} className="hover:scale-105 transition-transform">Close</Button>
            </DialogFooter>
        </Dialog>
      </div>
    </section>
  );
}

export default Practice;