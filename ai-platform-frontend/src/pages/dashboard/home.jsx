import React, { useState, useEffect, useMemo } from "react";
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
} from "@material-tailwind/react";
import { useAuth } from "@/context/AuthContext";
import api from "@/api";

// --- HELPER FUNCTIONS ---

// Helper for the feedback title (e.g., "Feedback: Correct!")
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

// Helper to format the date and time
function formatDateTime(isoString) {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}

// Helper to get the correct status chip
const getStatusChip = (status) => {
  if (!status) {
    return <Chip variant="gradient" color="blue-gray" value="N/A" className="py-0.5 px-2 text-[11px] font-medium w-fit" />;
  }
  switch (status.toUpperCase()) {
    case "CORRECT":
      return <Chip variant="gradient" color="green" value="Correct" className="py-0.5 px-2 text-[11px] font-medium w-fit" />;
    case "CLOSE":
      return <Chip variant="gradient" color="orange" value="Close" className="py-0.5 px-2 text-[11px] font-medium w-fit" />;
    case "REVEALED":
      return <Chip variant="gradient" color="blue" value="Revealed" className="py-0.5 px-2 text-[11px] font-medium w-fit" />;
    case "INCORRECT":
    default:
      return <Chip variant="gradient" color="red" value="Incorrect" className="py-0.5 px-2 text-[11px] font-medium w-fit" />;
  }
};

// --- MAIN COMPONENT ---

export function Home() {
  const { user } = useAuth();
  const [error, setError] = useState(null);

  const [allHistory, setAllHistory] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(10);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [subject, setSubject] = useState("Java");
  const [topic, setTopic] = useState("Object Oriented Programming");
  const [difficulty, setDifficulty] = useState("High School");

  const [generating, setGenerating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [textareaRows, setTextareaRows] = useState(5);

  const [hint, setHint] = useState(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const [selectedHistory, setSelectedHistory] = useState(null);
  const handleOpenModal = (historyItem) => setSelectedHistory(historyItem);
  const handleCloseModal = () => setSelectedHistory(null);

  // Fetch practice history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    setError(null);
    if (!user) return;
    try {
      const response = await api.get(`/api/practice/history`);
      const sortedHistory = (response.data.history || []).sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.generatedAt)
      );
      setAllHistory(sortedHistory);
      setItemsToShow(10);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Could not load practice history.");
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  // Filtered history
  const filteredHistory = useMemo(() => {
    if (!searchTerm) {
      return allHistory;
    }
    const lowerSearch = searchTerm.toLowerCase();
    return allHistory.filter(item =>
      item.questionText.toLowerCase().includes(lowerSearch) ||
      item.subject.toLowerCase().includes(lowerSearch) ||
      item.topic.toLowerCase().includes(lowerSearch) ||
      item.difficulty.toLowerCase().includes(lowerSearch) ||
      (item.answerText && item.answerText.toLowerCase().includes(lowerSearch))
    );
  }, [allHistory, searchTerm]);

  // Visible history
  const visibleHistory = useMemo(() => {
    return filteredHistory.slice(0, itemsToShow);
  }, [filteredHistory, itemsToShow]);

  // Handle "Load More" click
  const handleLoadMore = () => {
    setItemsToShow(prev => prev + 10);
  };

  // Handle resizing of textarea (with a cap)
  const handleAnswerChange = (e) => {
    const { value } = e.target;
    setCurrentAnswer(value);
    const newRowCount = (value.match(/\n/g) || []).length + 1;
    setTextareaRows(Math.min(Math.max(5, newRowCount), 15));
  };

  // Handle generating a new question
  const handleGenerateQuestion = async () => {
    setGenerating(true);
    setCurrentQuestion(null);
    setCurrentAnswer("");
    setFeedback(null);
    setHint(null);
    setError(null);
    setTextareaRows(5);
    try {
      const response = await api.post("/api/ai/generate-question", {
        subject,
        topic,
        difficulty,
      });
      setCurrentQuestion(response.data);
    } catch (err) {
      console.error("Error generating question:", err);
      setError("Failed to generate a new question. Please try again.");
    }
    setGenerating(false);
  };

  // Handle submitting an answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!currentQuestion || !currentAnswer) return;
    setSubmitting(true);
    setFeedback(null);
    setHint(null);
    setError(null);
    try {
      const response = await api.post("/api/practice/submit", {
        questionId: currentQuestion.id,
        answerText: currentAnswer,
      });
      setFeedback(response.data);
      fetchHistory();
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError("Failed to submit your answer. Please try again.");
    }
    setSubmitting(false);
  };

  // Handle "Get Hint"
  const handleGetHint = async () => {
    if (!currentQuestion) return;
    setLoadingHint(true);
    setHint(null);
    setError(null);
    try {
      const response = await api.post("/api/ai/get-hint", {
        questionId: currentQuestion.id,
      });
      setHint(response.data);
    } catch (err) {
      console.error("Error getting hint:", err);
      setError("Failed to get a hint. Please try again.");
    }
    setLoadingHint(false);
  };

  // Handle "Get Answer"
  const handleGetAnswer = async () => {
    if (!currentQuestion) return;
    if (!window.confirm("Are you sure you want to reveal the answer? This will be saved to your history.")) {
      return;
    }
    setLoadingAnswer(true);
    setFeedback(null);
    setHint(null);
    setError(null);
    try {
      const response = await api.post("/api/practice/get-answer", {
        questionId: currentQuestion.id,
      });
      setFeedback(response.data);
      fetchHistory();
    } catch (err) {
      console.error("Error getting answer:", err);
      setError("Failed to get the answer. Please try again.");
    }
    setLoadingAnswer(false);
  };


  return (
    <div className="mt-12">
      {/* AI Question Generator Card */}
      <Card className="mb-12">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
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
            />
            <Input
              label="Topic (e.g., Inheritance, SQL Joins)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <Select
              label="Difficulty"
              value={difficulty}
              onChange={(val) => setDifficulty(val)}
            >
              <Option value="School">School</Option>
              <Option value="High School">High School</Option>
              <Option value="Graduation">Graduation</Option>
              <Option value="Post Graduation">Post Graduation</Option>
              <Option value="Research">Research</Option>
            </Select>
          </div>
          <div className="mt-6 flex justify-start">
            <Button onClick={handleGenerateQuestion} disabled={generating} className="w-full md:w-1/3">
              {generating ? <Spinner className="h-4 w-4" /> : "Generate New Question"}
            </Button>
          </div>

          {error && (
            <Typography color="red" className="mt-4 text-sm">
              {error}
            </Typography>
          )}

          {currentQuestion && (
            <form onSubmit={handleSubmitAnswer} className="mt-6">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Your Question:
              </Typography>
              <div className="p-4 border rounded-lg bg-blue-gray-50 mb-4 whitespace-pre-wrap">
                <Typography>{currentQuestion.questionText}</Typography>
              </div>

              <Textarea
                label="Your Answer"
                value={currentAnswer}
                onChange={handleAnswerChange}
                rows={textareaRows}
                required
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="submit"
                  disabled={submitting || loadingHint || loadingAnswer}
                >
                  {submitting ? <Spinner className="h-4 w-4" /> : "Submit Answer"}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleGetHint}
                  disabled={submitting || loadingHint || loadingAnswer}
                >
                  {loadingHint ? <Spinner className="h-4 w-4" /> : "Get Hint"}
                </Button>
                <Button
                  type="button"
                  color="red"
                  variant="outlined"
                  onClick={handleGetAnswer}
                  disabled={submitting || loadingHint || loadingAnswer}
                >
                  {loadingAnswer ? <Spinner className="h-4 w-4" /> : "Get Answer"}
                </Button>
              </div>
            </form>
          )}

          {/* Standalone Hint Display */}
          {hint && (
            <div className="mt-4 p-4 border border-blue-500 rounded-lg bg-blue-50">
              <Typography variant="h6" color="blue" className="mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0M8.94 6.94a.75.75 0 1 1-1.06-1.06l.85-.85a.75.75 0 0 1 1.06 0l.85.85a.75.75 0 1 1-1.06 1.06L10 5.81V9.25a.75.75 0 0 1-1.5 0V5.81l-.56.56Zm1.06 6.56a.75.75 0 1 0-1.06 1.06l.85.85a.75.75 0 0 0 1.06 0l.85-.85a.75.75 0 1 0-1.06-1.06l-.56.56Z" clipRule="evenodd" />
                </svg>
                Hint
              </Typography>
              <Typography className="whitespace-pre-wrap ml-7">
                {hint}
              </Typography>
            </div>
          )}

          {/* Feedback Section (now uses feedback object directly) */}
          {feedback && (
            <div className="mt-6 p-4 border rounded-lg">
              <DynamicFeedbackTitle status={feedback.evaluationStatus} />

              {/* --- THIS IS THE FIX --- */}
              <Typography className="mt-2 p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap">
                {feedback.evaluationStatus === 'REVEALED'
                  ? feedback.answerText  // Show the AI-generated answer
                  : feedback.feedback   // Show the evaluation feedback
                }
              </Typography>
              {/* --- END OF FIX --- */}

              {/* Show hint only if it's NOT a revealed answer */}
              {feedback.hint && feedback.evaluationStatus !== 'REVEALED' && (
                <div className="mt-4 p-4 border border-blue-500 rounded-lg bg-blue-50">
                  <Typography variant="h6" color="blue" className="mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0M8.94 6.94a.75.75 0 1 1-1.06-1.06l.85-.85a.75.75 0 0 1 1.06 0l.85.85a.75.75 0 1 1-1.06 1.06L10 5.81V9.25a.75.75 0 0 1-1.5 0V5.81l-.56.56Zm1.06 6.56a.75.75 0 1 0-1.06 1.06l.85.85a.75.75 0 0 0 1.06 0l.85-.85a.75.75 0 1 0-1.06-1.06l-.56.56Z" clipRule="evenodd" />
                    </svg>
                    Hint
                  </Typography>
                  <Typography className="whitespace-pre-wrap ml-7">
                    {feedback.hint}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Practice History Card */}
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Typography variant="h6" color="white">
              Practice History
            </Typography>
            <div className="w-full md:w-72">
              <Input
                label="Search History"
                color="white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {loadingHistory ? (
            <div className="flex justify-center p-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : visibleHistory.length === 0 ? (
            <Typography className="p-6 text-center">
              {searchTerm
                ? "No history items match your search."
                : "You haven't completed any questions yet."
              }
            </Typography>
          ) : (
            <>
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    {[
                      "SL", "Question", "Subject", "Topic", "Difficulty",
                      "Status", "Your Answer", "Submitted At" // Changed from Generated At
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
                  {visibleHistory.map(
                    (item, index) => {
                      const {
                        questionId, questionText, subject, topic, difficulty,
                        evaluationStatus, answerText, submittedAt,
                      } = item;
                      const className = "py-3 px-5 border-b border-blue-gray-50";

                      const uniqueKey = `${questionId}-${submittedAt}`;

                      return (
                        <tr
                          key={uniqueKey}
                          onClick={() => handleOpenModal(item)}
                          className="cursor-pointer hover:bg-blue-gray-50"
                        >
                          {/* SL Number */}
                          <td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {index + 1}
                            </Typography>
                          </td>
                          {/* Question */}
                          <td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {questionText.substring(0, 40)}...
                            </Typography>
                          </td>
                          {/* Subject */}
                          <td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {subject}
                            </Typography>
                          </td>
                          {/* Topic */}
                          <td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {topic}
                            </Typography>
                          </td>
                          {/* Difficulty */}
                          <td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {difficulty}
                            </Typography>
                          </td>
                          {/* Status */}
                          <td className={className}>
                            {getStatusChip(evaluationStatus)}
                          </td>
                          {/* Answer */}
                          <td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {answerText ? `${answerText.substring(0, 40)}...` : "Not Answered"}
                            </Typography>
                          </td>
                          {/* Submitted At */}
                          <td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {formatDateTime(submittedAt)}
                            </Typography>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
              {/* "Load More" Button */}
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

      {/* History Detail Modal (Dialog) */}
      <Dialog open={selectedHistory !== null} handler={handleCloseModal} size="lg">
        <DialogHeader>Practice Result</DialogHeader>
        <DialogBody divider className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {selectedHistory && (
            <>
              <div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                  <Typography variant="small">
                    <span className="font-semibold text-blue-gray-600">Subject:</span> {selectedHistory.subject}
                  </Typography>
                  <Typography variant="small">
                    <span className="font-semibold text-blue-gray-600">Topic:</span> {selectedHistory.topic}
                  </Typography>
                  <Typography variant="small">
                    <span className="font-semibold text-blue-gray-600">Difficulty:</span> {selectedHistory.difficulty}
                  </Typography>
                </div>

                <Typography variant="small" color="blue-gray">
                  <span className="font-semibold">Question Generated:</span> {formatDateTime(selectedHistory.generatedAt)}
                </Typography>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Answer Submitted: {formatDateTime(selectedHistory.submittedAt)}
                </Typography>

                <Typography variant="h6" color="blue-gray" className="mt-2">Question</Typography>
                <Typography className="mt-2 p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap">
                  {selectedHistory.questionText}
                </Typography>
              </div>
              <div>
                <Typography variant="h6" color="blue-gray">Your Answer</Typography>
                <Typography className="mt-2 p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap">
                  {selectedHistory.answerText || "No answer submitted."}
                </Typography>
              </div>
              <div>
                <DynamicFeedbackTitle status={selectedHistory.evaluationStatus} />

                {/* --- THIS IS THE SAME FIX, APPLIED TO THE MODAL --- */}
                <Typography className="mt-2 p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap">
                  {selectedHistory.evaluationStatus === 'REVEALED'
                    ? selectedHistory.answerText  // Show the AI-generated answer
                    : selectedHistory.feedback   // Show the evaluation feedback
                  }
                </Typography>
                {/* --- END OF FIX --- */}
              </div>

              {/* Show hint only if it's NOT a revealed answer */}
              {selectedHistory.hint && selectedHistory.evaluationStatus !== 'REVEALED' && (
                <div className="mt-2 p-4 border border-blue-500 rounded-lg bg-blue-50">
                  <Typography variant="h6" color="blue" className="mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0M8.94 6.94a.75.75 0 1 1-1.06-1.06l.85-.85a.75.75 0 0 1 1.06 0l.85.85a.75.75 0 1 1-1.06 1.06L10 5.81V9.25a.75.75 0 0 1-1.5 0V5.81l-.56.56Zm1.06 6.56a.75.75 0 1 0-1.06 1.06l.85.85a.75.75 0 0 0 1.06 0l.85-.85a.75.75 0 1 0-1.06-1.06l-.56.56Z" clipRule="evenodd" />
                    </svg>
                    Hint
                  </Typography>
                  <Typography className="whitespace-pre-wrap ml-7">
                    {selectedHistory.hint}
                  </Typography>
                </div>
              )}
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={handleCloseModal}
          >
            <span>Close</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Home;