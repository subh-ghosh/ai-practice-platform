import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Typography,
  Card,
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
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel,
  IconButton
} from "@material-tailwind/react";
import { 
  InformationCircleIcon, 
  SparklesIcon, 
  ClockIcon, 
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  EyeIcon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/context/ThemeContext.jsx"; // Assuming context exists
import { usePaywall } from "@/context/PaywallContext.jsx"; // Assuming context exists

// --- Constants & Helpers ---

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

const formatMarkdownText = (text) => text ? text.replace(/\\n/g, '\n') : "";

const getStatusChip = (status) => {
  const baseClasses = "py-0.5 px-2.5 text-[10px] font-bold uppercase tracking-wide w-fit rounded-full border";
  if (!status) return <Chip variant="ghost" className={`${baseClasses} border-blue-gray-100 text-blue-gray-500`} value="N/A" />;
  
  const style = STATUS_STYLES[status?.toUpperCase()] || STATUS_STYLES.INCORRECT;
  return (
    <div className={`flex items-center gap-1.5 ${baseClasses} ${style.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot.split(' ')[0]}`} />
      {status === "REVEALED" ? "Revealed" : style.label}
    </div>
  );
};

// --- Animations ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

// --- Sub-Components ---

function DynamicFeedbackTitle({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.INCORRECT;
  const Icon = status === 'CORRECT' ? CheckCircleIcon : status === 'INCORRECT' ? XCircleIcon : ExclamationCircleIcon;

  return (
    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
      <Icon className={`h-5 w-5 ${style.text}`} />
      <Typography variant="h6" className={`font-bold tracking-tight uppercase text-sm ${style.text}`}>
        {style.label}
      </Typography>
    </div>
  );
}

// --- Main Component ---

export function Practice() {
  const { user, decrementFreeActions } = useAuth();
  const { showPaywall } = usePaywall();

  // State
  const [activeTab, setActiveTab] = useState("practice");
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

  // Question State
  const [question, setQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [textareaRows, setTextareaRows] = useState(4);
  const [hint, setHint] = useState(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);

  const actionsRemaining = Math.max(0, FREE_ACTION_LIMIT - (user?.freeActionsUsed || 0));

  // --- API Logic ---

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { headers: { "Authorization": `Bearer ${token}` } };
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/practice/history`, getAuthHeaders());
      const raw = Array.isArray(res?.data?.history) ? res.data.history : [];
      setAllHistory([...raw].sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)));
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user, fetchHistory]);

  const handleGenerateQuestion = async () => {
    if (!localStorage.getItem("token")) {
      setError("You must be logged in.");
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
      setActiveTab("practice"); // Ensure we are on the right tab
      await fetchHistory();
    } catch (err) {
      setError("Failed to generate question. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const pollForResult = async (qId) => {
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 3000));
        try {
            const res = await axios.get(`${BASE_URL}/api/practice/history`, getAuthHeaders());
            const found = res.data.history.find(item => item.questionId === qId && item.evaluationStatus);
            if (found) return found;
        } catch(e) { console.log(e); }
    }
    return null;
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
      // Fallback polling
      const foundItem = await pollForResult(question.id);
      setIsPolling(false);
      if (foundItem) {
        setFeedback(foundItem);
        await fetchHistory();
        if (user?.subscriptionStatus === "FREE") decrementFreeActions();
      } else {
        setError("Connection timeout. Please check history shortly.");
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
    try {
      const res = await axios.post(`${BASE_URL}/api/ai/get-hint`, { questionId: question.id }, getAuthHeaders());
      setHint(res.data);
    } catch (err) {
      setError("Failed to get hint.");
    } finally {
      setLoadingHint(false);
    }
  };

  // --- Filter Logic ---

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return allHistory;
    const q = searchTerm.toLowerCase();
    return allHistory.filter((item) => 
      [item.questionText, item.subject, item.topic].some(str => String(str).toLowerCase().includes(q))
    );
  }, [allHistory, searchTerm]);

  const visibleHistory = useMemo(() => filteredHistory.slice(0, itemsToShow), [filteredHistory, itemsToShow]);

  // --- Render ---

  return (
    <div className="relative mt-6 mb-8 w-full h-[calc(100vh-175px)] overflow-hidden rounded-xl border border-blue-gray-50 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 flex flex-col">
      
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/5 blur-[100px]"
        />
      </div>

      {/* Header Section */}
      <div className="relative z-10 px-6 pt-6 pb-2 shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Typography variant="h5" color="blue-gray" className="dark:text-white font-bold tracking-tight flex items-center gap-2">
            <PencilSquareIcon className="h-6 w-6 text-blue-500" />
            AI Practice Lab
          </Typography>
          <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-normal mt-1">
            Generate questions, write code, and get instant feedback.
          </Typography>
        </div>

        <div className="w-full md:w-auto">
          <Tabs value={activeTab} className="bg-transparent">
            <TabsHeader
              className="bg-gray-100/50 dark:bg-gray-800/70 p-1 border border-gray-200 dark:border-gray-700 min-w-[200px]"
              indicatorProps={{ className: "bg-white dark:bg-gray-700 shadow-sm" }}
            >
              <Tab value="practice" onClick={() => setActiveTab("practice")} className="text-xs font-bold py-2 px-4">
                Workspace
              </Tab>
              <Tab value="history" onClick={() => setActiveTab("history")} className="text-xs font-bold py-2 px-4">
                History
              </Tab>
            </TabsHeader>
          </Tabs>
        </div>
      </div>

      {/* Content Area (Scrollable) */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full flex flex-col">
          <TabsBody 
            className="flex-1 overflow-y-auto p-6 pt-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
            animate={{ initial: { y: 250 }, mount: { y: 0 }, unmount: { y: 250 } }}
          >
            
            {/* --- TAB 1: PRACTICE WORKSPACE --- */}
            <TabPanel value="practice" className="p-0 h-full max-w-5xl mx-auto">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-6 pb-10">
                
                {/* Generator Config */}
                <motion.div variants={itemVariants}>
                  <Card className="border border-blue-gray-50 dark:border-gray-800 bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
                    <CardBody className="p-4 md:p-5 flex flex-col md:flex-row gap-4 items-end">
                      <div className="w-full md:flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input 
                          label="Subject" 
                          value={subject} 
                          onChange={(e) => setSubject(e.target.value)} 
                          className="!bg-white dark:!bg-gray-900"
                          containerProps={{ className: "min-w-[100px]" }}
                        />
                        <Input 
                          label="Topic" 
                          value={topic} 
                          onChange={(e) => setTopic(e.target.value)} 
                          className="!bg-white dark:!bg-gray-900"
                        />
                        <Select 
                          label="Difficulty" 
                          value={difficulty} 
                          onChange={(val) => setDifficulty(val)}
                          className="!bg-white dark:!bg-gray-900"
                          menuProps={{ className: "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200" }}
                        >
                          {["School", "High School", "Graduation", "Post Graduation", "Research"].map(l => (
                            <Option key={l} value={l}>{l}</Option>
                          ))}
                        </Select>
                      </div>
                      
                      <Button
                        onClick={handleGenerateQuestion}
                        disabled={generating || (user?.subscriptionStatus === "FREE" && actionsRemaining <= 0)}
                        className="w-full md:w-auto min-w-[140px] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500"
                      >
                        {generating ? <Spinner className="h-4 w-4" /> : <><SparklesIcon className="h-4 w-4" /> Generate</>}
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>

                {user?.subscriptionStatus === "FREE" && (
                   <motion.div variants={itemVariants} className="flex justify-center">
                     <div className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                        Free Plan: {actionsRemaining} generations left today
                     </div>
                   </motion.div>
                )}

                {/* Question & Answer Area */}
                <AnimatePresence mode="wait">
                  {question ? (
                    <motion.div 
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      {/* Question Card */}
                      <Card className="border border-blue-100 dark:border-gray-700 bg-blue-50/30 dark:bg-gray-800/40 backdrop-blur-sm shadow-none">
                        <CardBody className="p-5">
                          <Typography variant="small" className="font-bold text-blue-500 uppercase tracking-wider mb-2">
                             Question
                          </Typography>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-blue-gray-800 dark:text-gray-200">
                             <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatMarkdownText(question.questionText)}</ReactMarkdown>
                          </div>
                        </CardBody>
                      </Card>

                      {/* Hint Display */}
                      <AnimatePresence>
                        {hint && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <Alert icon={<InformationCircleIcon className="mt-px h-5 w-5" />} className="bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100 rounded-lg">
                               <Typography variant="small" className="font-bold uppercase">Hint</Typography>
                               <div className="prose prose-sm max-w-none text-amber-900/90 dark:text-amber-100/90 mt-1">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatMarkdownText(hint)}</ReactMarkdown>
                               </div>
                            </Alert>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Answer Input */}
                      <form onSubmit={handleSubmitAnswer} className="flex flex-col gap-4">
                        <div className="relative">
                          <Textarea
                            label="Your Answer"
                            value={currentAnswer}
                            onChange={(e) => {
                                setCurrentAnswer(e.target.value);
                                const rows = (e.target.value.match(/\n/g) || []).length + 1;
                                setTextareaRows(Math.min(Math.max(4, rows), 15));
                            }}
                            rows={textareaRows}
                            className="!bg-white dark:!bg-gray-900"
                            disabled={submitting || isPolling}
                          />
                        </div>

                        <div className="flex flex-wrap gap-3 items-center justify-between">
                           <div className="flex gap-2">
                             <Button type="submit" disabled={submitting || isPolling} className="bg-blue-600 w-32 justify-center">
                               {submitting || isPolling ? <Spinner className="h-4 w-4" /> : "Submit"}
                             </Button>
                           </div>
                           
                           <div className="flex gap-2">
                             <Button variant="outlined" size="sm" onClick={handleGetHint} disabled={submitting || isPolling} className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300">
                                {loadingHint ? <Spinner className="h-3 w-3" /> : "Hint"}
                             </Button>
                             
                             <Popover open={openPopover} handler={setOpenPopover} placement="top">
                                <PopoverHandler>
                                  <Button variant="text" size="sm" color="red" disabled={submitting || isPolling}>
                                    {loadingAnswer ? <Spinner className="h-3 w-3" /> : "Reveal"}
                                  </Button>
                                </PopoverHandler>
                                <PopoverContent className="z-50 p-4 border-blue-gray-100 dark:bg-gray-800 dark:border-gray-700">
                                  <Typography color="blue-gray" className="mb-2 font-bold dark:text-white text-xs uppercase">Confirm Reveal</Typography>
                                  <Typography variant="small" className="mb-4 text-gray-500">Counts as an attempt.</Typography>
                                  <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="text" onClick={() => setOpenPopover(false)} className="dark:text-gray-300">Cancel</Button>
                                    <Button size="sm" color="red" onClick={confirmGetAnswer}>Confirm</Button>
                                  </div>
                                </PopoverContent>
                             </Popover>
                           </div>
                        </div>
                      </form>

                      {/* Feedback Result */}
                      {feedback && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                           <DynamicFeedbackTitle status={feedback.evaluationStatus} />
                           <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 overflow-x-auto">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {feedback.evaluationStatus === "REVEALED" ? formatMarkdownText(feedback.answerText) : formatMarkdownText(feedback.feedback)}
                              </ReactMarkdown>
                           </div>
                        </motion.div>
                      )}

                    </motion.div>
                  ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        className="flex flex-col items-center justify-center h-[40vh] text-center opacity-50"
                    >
                        <SparklesIcon className="h-16 w-16 text-gray-300 mb-4" />
                        <Typography variant="h6" className="text-gray-400 font-normal">
                          Configure the generator above to start practicing.
                        </Typography>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {isPolling && (
                   <div className="flex justify-center p-4">
                      <div className="flex items-center gap-2 text-blue-500 animate-pulse">
                         <Spinner className="h-4 w-4" /> <span className="text-sm font-medium">Analyzing...</span>
                      </div>
                   </div>
                )}
              </motion.div>
            </TabPanel>

            {/* --- TAB 2: HISTORY --- */}
            <TabPanel value="history" className="p-0 h-full">
              <div className="flex flex-col h-full gap-4">
                 <div className="w-full md:w-72 self-end">
                    <Input
                       label="Search History"
                       icon={<i className="fas fa-search" />}
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="!bg-white dark:!bg-gray-900"
                    />
                 </div>
                 
                 <div className="flex-1 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <table className="w-full min-w-[700px] table-auto text-left">
                       <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                          <tr>
                             {["Topic", "Difficulty", "Status", "Date", "Action"].map((h) => (
                               <th key={h} className="border-b border-gray-200 dark:border-gray-700 p-4">
                                  <Typography variant="small" className="font-bold text-gray-500 leading-none opacity-70 uppercase text-[10px]">
                                    {h}
                                  </Typography>
                               </th>
                             ))}
                          </tr>
                       </thead>
                       <tbody>
                          {loadingHistory ? (
                             <tr><td colSpan="5" className="p-8 text-center"><Spinner className="h-6 w-6 mx-auto" /></td></tr>
                          ) : visibleHistory.length === 0 ? (
                             <tr><td colSpan="5" className="p-8 text-center text-gray-500 text-sm">No history found.</td></tr>
                          ) : (
                             visibleHistory.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
                                   <td className="p-4">
                                      <Typography variant="small" className="font-medium dark:text-white">{item.topic}</Typography>
                                      <Typography variant="small" className="text-[10px] text-gray-500">{item.subject}</Typography>
                                   </td>
                                   <td className="p-4">
                                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{item.difficulty}</span>
                                   </td>
                                   <td className="p-4">{getStatusChip(item.evaluationStatus)}</td>
                                   <td className="p-4">
                                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                                         <ClockIcon className="h-3 w-3" />
                                         {new Date(item.submittedAt || item.generatedAt).toLocaleDateString()}
                                      </div>
                                   </td>
                                   <td className="p-4">
                                      <IconButton size="sm" variant="text" onClick={() => setSelectedHistory(item)}>
                                         <EyeIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                      </IconButton>
                                   </td>
                                </tr>
                             ))
                          )}
                       </tbody>
                    </table>
                    {filteredHistory.length > visibleHistory.length && (
                      <div className="p-4 text-center border-t dark:border-gray-700">
                         <Button size="sm" variant="text" onClick={() => setItemsToShow(p => p + 10)}>Load More</Button>
                      </div>
                    )}
                 </div>
              </div>
            </TabPanel>

          </TabsBody>
        </Tabs>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedHistory} handler={() => setSelectedHistory(null)} size="lg" className="dark:bg-gray-900 border dark:border-gray-800 outline-none">
        <DialogHeader className="dark:text-white border-b dark:border-gray-800 flex justify-between items-center text-lg p-5">
           Practice Details
           <IconButton variant="text" color="gray" onClick={() => setSelectedHistory(null)}><XCircleIcon className="h-6 w-6" /></IconButton>
        </DialogHeader>
        <DialogBody className="dark:border-gray-800 overflow-y-auto max-h-[70vh] p-6 custom-scroll">
           {selectedHistory && (
              <div className="space-y-6">
                 <div>
                    <Typography variant="small" className="font-bold text-blue-500 uppercase tracking-wider mb-2 text-xs">Question</Typography>
                    <div className="p-4 border rounded-xl bg-gray-50/50 dark:bg-gray-800/30 dark:border-gray-700 text-sm dark:text-gray-200">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatMarkdownText(selectedHistory.questionText)}</ReactMarkdown>
                    </div>
                 </div>
                 
                 <div>
                    <Typography variant="small" className="font-bold text-gray-500 uppercase tracking-wider mb-2 text-xs">
                       {selectedHistory.evaluationStatus === "REVEALED" ? "Action Taken" : "Your Answer"}
                    </Typography>
                    <div className="p-4 border rounded-xl bg-white dark:bg-gray-900 dark:border-gray-700 text-sm dark:text-gray-300">
                       {selectedHistory.evaluationStatus === "REVEALED" ? (
                          <span className="italic text-gray-500">Answer revealed.</span>
                       ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatMarkdownText(selectedHistory.answerText || "No answer.")}</ReactMarkdown>
                       )}
                    </div>
                 </div>

                 <div>
                    <DynamicFeedbackTitle status={selectedHistory.evaluationStatus} />
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {selectedHistory.evaluationStatus === "REVEALED" ? formatMarkdownText(selectedHistory.answerText) : formatMarkdownText(selectedHistory.feedback)}
                       </ReactMarkdown>
                    </div>
                 </div>
              </div>
           )}
        </DialogBody>
      </Dialog>

    </div>
  );
}

export default Practice;