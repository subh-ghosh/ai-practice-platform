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
import { InformationCircleIcon } from "@heroicons/react/24/solid";

/* =========================
   Helpers
========================= */

function DynamicFeedbackTitle({ status }) {
  let title = "Feedback: Incorrect";
  let color = "red";
  if (status === "CORRECT") {
    title = "Feedback: Correct!";
    color = "green";
  } else if (status === "CLOSE") {
    title = "Feedback: Close!";
    color = "orange";
  } else if (status === "REVEALED") {
    title = "Answer Revealed";
    color = "blue";
  }
  return (
    <Typography variant="h5" color={color}>
      {title}
    </Typography>
  );
}

function formatDateTime(isoString) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: "numeric",
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
  const base = { variant: "gradient", className: "py-0.5 px-2 text-[11px] font-medium w-fit" };
  if (!status) return <Chip {...base} color="blue-gray" value="N/A" />;
  switch (status.toUpperCase()) {
    case "CORRECT":
      return <Chip {...base} color="green" value="Correct" />;
    case "CLOSE":
      return <Chip {...base} color="orange" value="Close" />;
    case "REVEALED":
      return <Chip {...base} color="blue" value="Revealed" />;
    case "INCORRECT":
    default:
      return <Chip {...base} color="red" value="Incorrect" />;
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

  const [allHistory, setAllHistory] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(10);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [subject, setSubject] = useState("Java");
  const [topic, setTopic] = useState("Object Oriented Programming");
  const [difficulty, setDifficulty] = useState("High School");

  // 👇 THIS WAS MISSING
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
      const fields = [
        item.questionText,
        item.subject,
        item.topic,
        item.difficulty,
        item.answerText,
      ]
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

  // 2. Generate Question
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
        {
          subject: subject,
          topic: topic,
          difficulty: difficulty
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setQuestion(response.data);
      // Refresh history
      await fetchHistory(); 

    } catch (err) {
      console.error("Error generating question:", err);
      setError("Failed to generate question. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // 3. Submit Answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!question || !currentAnswer) return;
    
    setSubmitting(true);
    setFeedback(null);
    setHint(null);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };

      const res = await axios.post(`${BASE_URL}/api/practice/submit`, {
        questionId: question.id,
        answerText: currentAnswer,
      }, config);

      setFeedback(res.data);
      await fetchHistory();
      
      if (user?.subscriptionStatus === "FREE") {
        decrementFreeActions();
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      if (err.response?.status === 402) {
        showPaywall();
      } else {
        setError("Failed to submit your answer. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Get Hint
  const handleGetHint = async () => {
    if (!question) return;
    setLoadingHint(true);
    setHint(null);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };

      const res = await axios.post(`${BASE_URL}/api/ai/get-hint`, {
        questionId: question.id,
      }, config);
      
      setHint(res.data);
    } catch (err) {
      console.error("Error getting hint:", err);
      setError("Failed to get a hint. Please try again.");
    } finally {
      setLoadingHint(false);
    }
  };

  // 5. Get Answer
  const confirmGetAnswer = async () => {
    setOpenPopover(false);
    if (!question) return;
    setLoadingAnswer(true);
    setFeedback(null);
    setHint(null);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };

      const res = await axios.post(`${BASE_URL}/api/practice/get-answer`, {
        questionId: question.id,
      }, config);

      setFeedback(res.data);
      await fetchHistory();
    } catch (err) {
      console.error("Error getting answer:", err);
      setError("Failed to get the answer. Please try again.");
    } finally {
      setLoadingAnswer(false);
    }
  };

  return (
    <section className="relative isolate -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pb-8 min-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-sky-100 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 transition-all duration-700" />
      <div className="pointer-events-none absolute -top-10 right-[8%] h-64 w-64 rounded-full bg-sky-300/30 dark:bg-sky-600/30 blur-3xl" />
      <div className="pointer-events-none absolute top-36 -left-10 h-72 w-72 rounded-full bg-blue-300/25 dark:bg-blue-700/25 blur-3xl" />

      <div className="mt-6 page has-fixed-navbar space-y-6">
        {/* --- AI Question Generator --- */}
        <Card className="mb-12 rounded-3xl border border-blue-100/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
          <CardHeader variant="gradient" color="gray" className="mb-6 p-6 rounded-t-3xl">
            <Typography variant="h6" color="white">
              AI Question Generator
            </Typography>
          </CardHeader>

          <CardBody className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Input
                label="Subject (e.g., JAVA, DBMS, Math)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                color="gray"
                className="dark:!text-white"
                labelProps={{ className: "dark:!text-white" }}
              />

              <Input
                label="Topic (e.g., Inheritance, SQL Joins)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                color="gray"
                className="dark:!text-white"
                labelProps={{ className: "dark:!text-white" }}
              />

              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(val) => setDifficulty(val)}
                color="gray"
                className="dark:!text-white"
                labelProps={{ className: "dark:!text-white" }}
                menuProps={{
                  className:
                    "rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200",
                }}
              >
                <Option className="dark:!text-gray-100 dark:hover:!bg-gray-700" value="School">
                  School
                </Option>
                <Option className="dark:!text-gray-100 dark:hover:!bg-gray-700" value="High School">
                  High School
                </Option>
                <Option className="dark:!text-gray-100 dark:hover:!bg-gray-700" value="Graduation">
                  Graduation
                </Option>
                <Option className="dark:!text-gray-100 dark:hover:!bg-gray-700" value="Post Graduation">
                  Post Graduation
                </Option>
                <Option className="dark:!text-gray-100 dark:hover:!bg-gray-700" value="Research">
                  Research
                </Option>
              </Select>
            </div>

            {user?.subscriptionStatus === "FREE" && (
              <Alert color="blue" icon={<InformationCircleIcon className="w-6 h-6" />} className="mt-6">
                <Typography variant="h6" color="white" className="mb-1">
                  Free Plan Details
                </Typography>
                <Typography color="white" className="font-normal">
                  You have <strong>{actionsRemaining}</strong> free actions remaining.
                </Typography>
              </Alert>
            )}

            <div className="mt-6 flex justify-start">
              <Button
                onClick={handleGenerateQuestion}
                disabled={generating || (user?.subscriptionStatus === "FREE" && actionsRemaining <= 0)}
                className="w-full md:w-1/3"
              >
                {generating ? <Spinner className="h-4 w-4" /> : "Generate New Question"}
              </Button>
            </div>

            {error && (
              <Typography color="red" className="mt-4 text-sm">
                {error}
              </Typography>
            )}

            {question && (
              <form onSubmit={handleSubmitAnswer} className="mt-6">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Your Question:
                </Typography>
                <div className="p-4 border rounded-xl bg-blue-gray-50/70 mb-4 whitespace-pre-wrap prose prose-sm max-w-none dark:bg-gray-700 dark:border-gray-600">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {question.questionText}
                  </ReactMarkdown>
                </div>

                <Textarea
                  label="Your Answer"
                  value={currentAnswer}
                  onChange={handleAnswerChange}
                  rows={textareaRows}
                  required
                  color="gray"
                  className="dark:!text-white"
                  labelProps={{ className: "dark:!text-white" }}
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="submit" disabled={submitting || loadingHint || loadingAnswer}>
                    {submitting ? <Spinner className="h-4 w-4" /> : "Submit Answer"}
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleGetHint}
                    disabled={submitting || loadingHint || loadingAnswer}
                    className="border border-gray-800 text-gray-900 hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-white/10"
                  >
                    {loadingHint ? <Spinner className="h-4 w-4" /> : "Get Hint"}
                  </Button>

                  <Popover open={openPopover} handler={setOpenPopover} placement="top">
                    <PopoverHandler>
                      <Button
                        type="button"
                        color="red"
                        variant="outlined"
                        disabled={submitting || loadingHint || loadingAnswer}
                      >
                        {loadingAnswer ? <Spinner className="h-4 w-4" /> : "Get Answer"}
                      </Button>
                    </PopoverHandler>
                    <PopoverContent className="w-64 z-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                      <Typography variant="h6" color="blue-gray" className="mb-2 dark:text-gray-100">
                        Confirm
                      </Typography>
                      <Typography variant="small" color="blue-gray" className="mb-4 dark:text-gray-300">
                        Reveal the answer? This will be saved to your history.
                      </Typography>
                      <div className="flex justify-end gap-2">
                        <Button variant="text" size="sm" onClick={() => setOpenPopover(false)}>
                          Cancel
                        </Button>
                        <Button variant="gradient" color="red" size="sm" onClick={confirmGetAnswer}>
                          Confirm
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </form>
            )}

            {/* Hint */}
            {hint && (
              <div className="mt-4 p-4 border border-blue-500 rounded-xl bg-blue-50 dark:bg-gray-700 dark:border-blue-400">
                <Typography variant="h6" color="blue" className="mb-2 flex items-center gap-2">
                  <InformationCircleIcon className="h-5 w-5" />
                  Hint
                </Typography>
                <div className="whitespace-pre-wrap prose prose-sm max-w-none ml-7">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{hint}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className="mt-6 p-4 border rounded-xl dark:border-gray-600">
                <DynamicFeedbackTitle status={feedback.evaluationStatus} />
                <div className="mt-2 p-4 bg-blue-gray-50/70 rounded-lg whitespace-pre-wrap prose prose-sm max-w-none dark:bg-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {feedback.evaluationStatus === "REVEALED"
                      ? feedback.answerText
                      : feedback.feedback}
                  </ReactMarkdown>
                </div>

                {feedback.hint && feedback.evaluationStatus !== "REVEALED" && (
                  <div className="mt-4 p-4 border border-blue-500 rounded-xl bg-blue-50 dark:bg-gray-700 dark:border-blue-400">
                    <Typography variant="h6" color="blue" className="mb-2 flex items-center gap-2">
                       <InformationCircleIcon className="h-5 w-5" />
                      Hint
                    </Typography>
                    <div className="whitespace-pre-wrap prose prose-sm max-w-none ml-7">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {feedback.hint}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Practice History */}
        <Card className="rounded-3xl border border-blue-100/60 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
          <CardHeader variant="gradient" color="gray" className="mb-6 p-6 rounded-t-3xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <Typography variant="h6" color="white">
                Practice History
              </Typography>
              <div className="w-full md:w-72">
                <Input
                  label="Search History"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color="white"
                  className="!text-white !bg-gray-800 placeholder:!text-gray-400
                             !border !border-gray-700 focus:!border-gray-500
                             focus:!ring-0 rounded-lg pl-2"
                  labelProps={{
                    className:
                      "!text-gray-300 before:content-none after:content-none pl-2",
                  }}
                  containerProps={{ className: "min-w-[240px]" }}
                />
              </div>
            </div>
          </CardHeader>

          <CardBody className="px-0 pt-0 pb-2">
            {loadingHistory ? (
              <div className="flex justify-center p-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : visibleHistory.length === 0 ? (
              <Typography className="p-6 text-center">
                {searchTerm
                  ? "No history items match your search."
                  : "You haven't completed any questions yet."}
              </Typography>
            ) : (
              <>
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full min-w-[640px] table-auto">
                    <thead>
                      <tr>
                        {[
                          "SL",
                          "Question",
                          "Subject",
                          "Topic",
                          "Difficulty",
                          "Status",
                          "Your Answer",
                          "Submitted At",
                        ].map((el) => (
                          <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                            <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                              {el}
                            </Typography>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleHistory.map((item, index) => {
                        const {
                          questionId,
                          questionText,
                          subject,
                          topic,
                          difficulty,
                          evaluationStatus,
                          answerText,
                          submittedAt,
                        } = item;
                        const className = "py-3 px-5 border-b border-blue-gray-50";
                        const uniqueKey = `${questionId}-${submittedAt || index}`;
                        return (
                          <tr
                            key={uniqueKey}
                            onClick={() => handleOpenModal(item)}
                            className="cursor-pointer hover:bg-blue-gray-50 dark:hover:bg-gray-700/70"
                          >
                            <td className={className}>
                              <Typography className="text-xs font-normal text-blue-gray-500">
                                {index + 1}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-normal text-blue-gray-500">
                                {String(questionText || "").substring(0, 40)}...
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-normal text-blue-gray-500">{subject}</Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-normal text-blue-gray-500">{topic}</Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-normal text-blue-gray-500">{difficulty}</Typography>
                            </td>
                            <td className={className}>{getStatusChip(evaluationStatus)}</td>
                            <td className={className}>
                              <Typography className="text-xs font-normal text-blue-gray-500">
                                {answerText ? `${String(answerText).substring(0, 40)}...` : "Not Answered"}
                              </Typography>
                            </td>
                            <td className={className}>
                              <Typography className="text-xs font-normal text-blue-gray-500">
                                {formatDateTime(submittedAt)}
                              </Typography>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredHistory.length > visibleHistory.length && (
                  <div className="mt-4 flex justify-center p-4">
                    <Button variant="text" onClick={handleLoadMore}>
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>

        {/* History Detail Modal */}
        <Dialog open={selectedHistory !== null} handler={handleCloseModal} size="lg" className="dark:bg-gray-800">
          <DialogHeader className="dark:text-gray-200">Practice Result</DialogHeader>

          <DialogBody divider className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto dark:border-gray-700">
            {selectedHistory && (
              <>
                <div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                    <Typography variant="small" className="dark:text-gray-300">
                      <span className="font-semibold text-blue-gray-600 dark:text-gray-400">Subject:</span>{" "}
                      {selectedHistory.subject}
                    </Typography>
                    <Typography variant="small" className="dark:text-gray-300">
                      <span className="font-semibold text-blue-gray-600 dark:text-gray-400">Topic:</span>{" "}
                      {selectedHistory.topic}
                    </Typography>
                    <Typography variant="small" className="dark:text-gray-300">
                      <span className="font-semibold text-blue-gray-600 dark:text-gray-400">Difficulty:</span>{" "}
                      {selectedHistory.difficulty}
                    </Typography>
                  </div>

                  <Typography variant="small" color="blue-gray" className="dark:text-gray-300">
                    <span className="font-semibold">Question Generated:</span> {formatDateTime(selectedHistory.generatedAt)}
                  </Typography>
                  <Typography variant="small" color="blue-gray" className="font-semibold dark:text-gray-300">
                    Answer Submitted: {formatDateTime(selectedHistory.submittedAt)}
                  </Typography>

                  <Typography variant="h6" color="blue-gray" className="mt-2 dark:text-gray-200">
                    Question
                  </Typography>
                  <div className="mt-2 p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap prose prose-sm max-w-none dark:bg-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedHistory.questionText}
                    </ReactMarkdown>
                  </div>
                </div>

                <div>
                  <Typography variant="h6" color="blue-gray" className="dark:text-gray-200">
                    Your Answer
                  </Typography>
                  <div className="mt-2 p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap prose prose-sm max-w-none dark:bg-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedHistory.answerText || "No answer submitted."}
                    </ReactMarkdown>
                  </div>
                </div>

                <div>
                  <DynamicFeedbackTitle status={selectedHistory.evaluationStatus} />
                  <div className="mt-2 p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap prose prose-sm max-w-none dark:bg-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedHistory.evaluationStatus === "REVEALED"
                        ? selectedHistory.answerText
                        : selectedHistory.feedback}
                    </ReactMarkdown>
                  </div>
                </div>

                {selectedHistory.hint && selectedHistory.evaluationStatus !== "REVEALED" && (
                  <div className="mt-2 p-4 border border-blue-500 rounded-lg bg-blue-50 dark:bg-gray-700 dark:border-blue-400">
                    <Typography variant="h6" color="blue" className="mb-2 flex items-center gap-2">
                       <InformationCircleIcon className="h-5 w-5" />
                      Hint
                    </Typography>
                    <div className="whitespace-pre-wrap prose prose-sm max-w-none ml-7">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedHistory.hint}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </>
            )}
          </DialogBody>

          <DialogFooter className="dark:border-t dark:border-gray-700">
            <Button variant="text" color="blue-gray" onClick={handleCloseModal} className="dark:text-gray-200">
              <span>Close</span>
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </section>
  );
}

export default Practice;