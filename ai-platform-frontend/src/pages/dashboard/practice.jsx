import React, { useState, useEffect, useMemo } from "react";
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
import { InformationCircleIcon, SparklesIcon, ClockIcon } from "@heroicons/react/24/solid";

/* =========================
   Helpers
========================= */

function DynamicFeedbackTitle({ status }) {
  let title = "Incorrect";
  let color = "red";
  if (status === "CORRECT") {
    title = "Correct!";
    color = "green";
  } else if (status === "CLOSE") {
    title = "Close!";
    color = "orange";
  } else if (status === "REVEALED") {
    title = "Answer Revealed";
    color = "blue";
  }
  return (
    <div className={`flex items-center gap-2 mb-2`}>
        <div className={`w-3 h-3 rounded-full bg-${color}-500 shadow-[0_0_8px] shadow-${color}-500/50`}></div>
        <Typography variant="h5" color={color} className="font-bold tracking-tight">
        {title}
        </Typography>
    </div>
  );
}

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

const getStatusChip = (status) => {
  const base = { variant: "ghost", className: "py-0.5 px-2.5 text-[11px] font-bold uppercase tracking-wide w-fit rounded-full border" };
  if (!status) return <Chip {...base} className={`${base.className} border-blue-gray-100 text-blue-gray-500`} value="N/A" />;
  
  switch (status.toUpperCase()) {
    case "CORRECT":
      return <Chip {...base} className={`${base.className} border-green-200 bg-green-50/50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300`} value="Correct" />;
    case "CLOSE":
      return <Chip {...base} className={`${base.className} border-orange-200 bg-orange-50/50 text-orange-800 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-300`} value="Close" />;
    case "REVEALED":
      return <Chip {...base} className={`${base.className} border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300`} value="Revealed" />;
    case "INCORRECT":
    default:
      return <Chip {...base} className={`${base.className} border-red-200 bg-red-50/50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300`} value="Incorrect" />;
  }
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

  const [allHistory, setAllHistory] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(10);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [subject, setSubject] = useState("Java");
  const [topic, setTopic] = useState("Object Oriented Programming");
  const [difficulty, setDifficulty] = useState("High School");

  const [generating, setGenerating] = useState(false);

  const [question, setQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [textareaRows, setTextareaRows] = useState(5);
  const [hint, setHint] = useState(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const [selectedHistory, setSelectedHistory] = useState(null);
  const [openPopover, setOpenPopover] = useState(false);

  const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";
  const FREE_ACTION_LIMIT = 3;
  const actionsRemaining = Math.max(0, FREE_ACTION_LIMIT - (user?.freeActionsUsed || 0));

  const handleOpenModal = (historyItem) => setSelectedHistory(historyItem);
  const handleCloseModal = () => setSelectedHistory(null);

  // 1. Fetch Practice History
  const fetchHistory = async () => {
    setLoadingHistory(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      const res = await axios.get(`${BASE_URL}/api/practice/history`, config);
      const raw = Array.isArray(res?.data?.history) ? res.data.history : [];
      const sorted = [...raw].sort((a, b) => {
        const aDate = new Date(a.submittedAt || a.generatedAt || 0);
        const bDate = new Date(b.submittedAt || b.generatedAt || 0);
        return bDate - aDate;
      });
      setAllHistory(sorted);
      setItemsToShow(10);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

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

  const handleLoadMore = () => setItemsToShow((prev) => prev + 10);

  const handleAnswerChange = (e) => {
    const value = e.target.value;
    setCurrentAnswer(value);
    const rows = (value.match(/\n/g) || []).length + 1;
    setTextareaRows(Math.min(Math.max(5, rows), 15));
  };

  /* 2. POLLING HELPER */
  const pollForAnswer = async (qId) => {
    const token = localStorage.getItem("token");
    const config = { headers: { "Authorization": `Bearer ${token}` } };
    for (let i = 0; i < 10; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const res = await axios.get(`${BASE_URL}/api/practice/history`, config);
        const found = res.data.history.find(item => item.questionId === qId);
        if (found && found.evaluationStatus) return found;
      } catch (err) {
        console.warn("Polling check failed...", err);
      }
    }
    return null;
  };

  // 3. Generate Question
  const handleGenerateQuestion = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to generate questions.");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const response = await axios.post(
        `${BASE_URL}/api/ai/generate-question`,
        { subject, topic, difficulty },
        { headers: { "Authorization": `Bearer ${token}` } }
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

  // 4. Submit Answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!question || !currentAnswer) return;
    setSubmitting(true);
    setFeedback(null);
    setHint(null);
    setError(null);
    setIsPolling(true);

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` }, timeout: 90000 };
      const res = await axios.post(`${BASE_URL}/api/practice/submit`, {
        questionId: question.id,
        answerText: currentAnswer,
      }, config);

      setFeedback(res.data);
      await fetchHistory();
      setIsPolling(false);
      if (user?.subscriptionStatus === "FREE") decrementFreeActions();
    } catch (err) {
      if (err.response?.status === 402) {
        showPaywall();
        setIsPolling(false);
      } else {
        const foundItem = await pollForAnswer(question.id);
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
            setError("We couldn't verify your answer due to a connection timeout. Please check your history shortly.");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Get Hint
  const handleGetHint = async () => {
    if (!question) return;
    setLoadingHint(true);
    setHint(null);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      const res = await axios.post(`${BASE_URL}/api/ai/get-hint`, { questionId: question.id }, config);
      setHint(res.data);
    } catch (err) {
      console.error("Error getting hint:", err);
      setError("Failed to get a hint. Please try again.");
    } finally {
      setLoadingHint(false);
    }
  };

  // 6. Get Answer
  const confirmGetAnswer = async () => {
    setOpenPopover(false);
    if (!question) return;
    setLoadingAnswer(true);
    setFeedback(null);
    setHint(null);
    setError(null);
    setIsPolling(true); 

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` }, timeout: 90000 };
      const res = await axios.post(`${BASE_URL}/api/practice/get-answer`, { questionId: question.id }, config);
      setFeedback(res.data);
      await fetchHistory();
      setIsPolling(false);
    } catch (err) {
      console.error("Initial request failed or timed out:", err);
      const foundItem = await pollForAnswer(question.id);
      setIsPolling(false);
      if (foundItem) {
        setFeedback({
            evaluationStatus: foundItem.evaluationStatus,
            answerText: foundItem.answerText,
            feedback: foundItem.feedback,
            hint: foundItem.hint
        });
        await fetchHistory();
      } else {
        setError("The server timed out. Please check your history table below in a few moments.");
      }
    } finally {
      setLoadingAnswer(false);
    }
  };

  return (
    <section className="relative isolate -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pb-10 min-h-[calc(100vh-4rem)]">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-sky-100 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 transition-all duration-700" />
      <div className="pointer-events-none absolute -top-10 right-[8%] h-64 w-64 rounded-full bg-sky-300/30 dark:bg-sky-600/30 blur-3xl" />
      <div className="pointer-events-none absolute top-36 -left-10 h-72 w-72 rounded-full bg-blue-300/25 dark:bg-blue-700/25 blur-3xl" />

      <div className="mt-6 page has-fixed-navbar space-y-8 max-w-7xl mx-auto">
        
        {/* --- Generator Card --- */}
        <Card className="overflow-visible border border-blue-100/60 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            className="rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-4 m-0"
          >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                    <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                    <Typography variant="h5" color="white" className="font-bold tracking-tight">
                    AI Question Generator
                    </Typography>
                    <Typography variant="small" color="white" className="opacity-90 font-normal">
                    Select a topic and let AI craft a question for you.
                    </Typography>
                </div>
            </div>
          </CardHeader>

          <CardBody className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Input
                label="Subject"
                placeholder="e.g. Java, DBMS"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                color="blue"
                className="!text-blue-gray-900 dark:!text-white"
                labelProps={{ className: "!text-blue-gray-500 dark:!text-gray-400" }}
              />

              <Input
                label="Topic"
                placeholder="e.g. Inheritance"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                color="blue"
                className="!text-blue-gray-900 dark:!text-white"
                labelProps={{ className: "!text-blue-gray-500 dark:!text-gray-400" }}
              />

              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(val) => setDifficulty(val)}
                color="blue"
                className="!text-blue-gray-900 dark:!text-white"
                labelProps={{ className: "!text-blue-gray-500 dark:!text-gray-400" }}
                menuProps={{ className: "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200" }}
              >
                {["School", "High School", "Graduation", "Post Graduation", "Research"].map(lvl => (
                    <Option key={lvl} value={lvl} className="dark:hover:bg-gray-700 dark:focus:bg-gray-700">{lvl}</Option>
                ))}
              </Select>
            </div>

            {user?.subscriptionStatus === "FREE" && (
              <Alert className="mt-6 border border-blue-100 bg-blue-50/80 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100 rounded-lg">
                <div className="flex items-center gap-3">
                    <InformationCircleIcon className="w-5 h-5" />
                    <Typography className="text-sm font-medium">
                        Free Plan: You have <strong>{actionsRemaining}</strong> generations left today.
                    </Typography>
                </div>
              </Alert>
            )}

            <div className="mt-8 flex justify-start">
              <Button
                onClick={handleGenerateQuestion}
                disabled={generating || (user?.subscriptionStatus === "FREE" && actionsRemaining <= 0)}
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40"
              >
                {generating ? <Spinner className="h-4 w-4" /> : "Generate Question"}
              </Button>
            </div>

            {error && <Typography color="red" className="mt-4 text-sm font-medium text-center">{error}</Typography>}

            {/* Polling Indicator */}
            {isPolling && (
              <div className="mt-6 flex items-center justify-center gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800 animate-pulse">
                <Spinner className="h-5 w-5 text-blue-500" />
                <Typography className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                  AI is analyzing your answer...
                </Typography>
              </div>
            )}

            {/* Active Question Area */}
            {question && (
              <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                    <Typography variant="small" className="font-bold text-blue-500 uppercase tracking-wider mb-1">
                        Question
                    </Typography>
                    <div className="p-5 border border-gray-200 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-blue-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.questionText}</ReactMarkdown>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmitAnswer}>
                  <Textarea
                    label="Write your answer here..."
                    value={currentAnswer}
                    onChange={handleAnswerChange}
                    rows={textareaRows}
                    color="blue"
                    className="!text-blue-gray-900 dark:!text-white bg-white dark:bg-gray-900"
                    containerProps={{ className: "min-w-0" }}
                    labelProps={{ className: "!text-blue-gray-500 dark:!text-gray-400" }}
                  />

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button type="submit" disabled={submitting || isPolling} className="rounded-lg bg-blue-600">
                      {submitting || isPolling ? <Spinner className="h-4 w-4" /> : "Submit Answer"}
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={handleGetHint}
                      disabled={submitting || isPolling}
                      className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      {loadingHint ? <Spinner className="h-4 w-4" /> : "Get Hint"}
                    </Button>

                    <Popover open={openPopover} handler={setOpenPopover} placement="top">
                      <PopoverHandler>
                        <Button variant="text" color="red" disabled={submitting || isPolling} className="rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                          {loadingAnswer ? <Spinner className="h-4 w-4" /> : "Reveal Answer"}
                        </Button>
                      </PopoverHandler>
                      <PopoverContent className="z-50 border-blue-gray-100 dark:bg-gray-800 dark:border-gray-700">
                        <Typography color="blue-gray" className="mb-2 font-bold dark:text-white">Confirm Reveal?</Typography>
                        <Typography variant="small" className="mb-4 font-normal text-blue-gray-500 dark:text-gray-400">
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

            {/* Hint Box */}
            {hint && (
              <div className="mt-6 p-5 border border-blue-200 bg-blue-50/50 rounded-2xl dark:bg-blue-900/10 dark:border-blue-800 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
                    <InformationCircleIcon className="h-5 w-5" />
                    <span className="font-bold text-sm uppercase">Hint</span>
                </div>
                <div className="prose prose-sm dark:prose-invert text-blue-gray-700 dark:text-blue-100">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{hint}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Feedback Box */}
            {feedback && (
              <div className="mt-8 p-6 border rounded-2xl bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm animate-in zoom-in-95 duration-300">
                <DynamicFeedbackTitle status={feedback.evaluationStatus} />
                <div className="mt-3 prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {feedback.evaluationStatus === "REVEALED" ? feedback.answerText : feedback.feedback}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* --- History Card --- */}
        <Card className="border border-blue-100/60 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6 flex flex-col md:flex-row gap-4 justify-between items-center rounded-t-xl">
            <Typography variant="h6" color="blue-gray" className="dark:text-white">
              Practice History
            </Typography>
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

          <CardBody className="px-0 pt-0 pb-4 overflow-x-auto">
            <table className="w-full min-w-[640px] table-auto text-left">
              <thead>
                <tr>
                  {["#", "Question", "Subject", "Difficulty", "Status", "Date"].map((head) => (
                    <th key={head} className="border-b border-blue-gray-50 bg-blue-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800">
                      <Typography variant="small" color="blue-gray" className="font-bold leading-none opacity-70 dark:text-gray-300">
                        {head}
                      </Typography>
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
                        <tr 
                            key={`${item.questionId}-${index}`} 
                            onClick={() => handleOpenModal(item)}
                            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800">
                                <Typography variant="small" color="blue-gray" className="font-normal dark:text-gray-400">{index + 1}</Typography>
                            </td>
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800 max-w-xs truncate">
                                <Typography variant="small" color="blue-gray" className="font-medium dark:text-gray-200 truncate">
                                    {item.questionText}
                                </Typography>
                            </td>
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800">
                                <Typography variant="small" className="font-normal text-gray-600 dark:text-gray-400">{item.subject}</Typography>
                            </td>
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800">
                                <Typography variant="small" className="font-normal text-gray-600 dark:text-gray-400">{item.difficulty}</Typography>
                            </td>
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800">
                                {getStatusChip(item.evaluationStatus)}
                            </td>
                            <td className="p-4 border-b border-blue-gray-50 dark:border-gray-800">
                                <Typography variant="small" className="font-normal text-gray-500 dark:text-gray-500">
                                    {new Date(item.submittedAt || item.generatedAt).toLocaleDateString()}
                                </Typography>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
            
            {filteredHistory.length > visibleHistory.length && (
                <div className="mt-4 text-center">
                    <Button variant="text" size="sm" onClick={handleLoadMore}>Load More</Button>
                </div>
            )}
          </CardBody>
        </Card>

        {/* Modal */}
        <Dialog open={!!selectedHistory} handler={handleCloseModal} size="lg" className="dark:bg-gray-900 border dark:border-gray-800">
            <DialogHeader className="dark:text-white border-b dark:border-gray-800">Practice Details</DialogHeader>
            <DialogBody divider className="dark:border-gray-800 overflow-y-auto max-h-[70vh]">
                {selectedHistory && (
                    <div className="space-y-6">
                        <div>
                            <Typography variant="small" className="font-bold text-blue-500 uppercase mb-2">Question</Typography>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedHistory.questionText}</ReactMarkdown>
                            </div>
                        </div>
                        <div>
                            <Typography variant="small" className="font-bold text-gray-500 uppercase mb-2">Your Answer</Typography>
                            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 text-sm">
                                {selectedHistory.answerText || <span className="italic text-gray-400">No answer submitted</span>}
                            </div>
                        </div>
                        <div>
                            <Typography variant="small" className="font-bold text-gray-500 uppercase mb-2">Feedback</Typography>
                            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {selectedHistory.evaluationStatus === "REVEALED" ? "Answer Revealed" : selectedHistory.feedback}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </DialogBody>
            <DialogFooter className="border-t dark:border-gray-800">
                <Button variant="gradient" color="blue" onClick={handleCloseModal}>Close</Button>
            </DialogFooter>
        </Dialog>

      </div>
    </section>
  );
}

export default Practice;