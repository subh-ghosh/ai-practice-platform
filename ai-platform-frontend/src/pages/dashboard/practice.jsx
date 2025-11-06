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
  Popover,
  PopoverHandler,
  PopoverContent,
} from "@material-tailwind/react";
import { useAuth } from "@/context/AuthContext";
import api from "@/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/context/ThemeContext";

// --- HELPER FUNCTIONS ---

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
export function Practice() {
  const { user } = useAuth();
  const { theme } = useTheme();
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
const [openPopover, setOpenPopover] = useState(false);

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
// This function runs when "Confirm" is clicked in the popover
  const confirmGetAnswer = async () => {
    setOpenPopover(false);
if (!currentQuestion) return;

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
      <Card className="mb-12 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            AI Question Generator
          </Typography>
        </CardHeader>
        <CardBody className="p-6">
          <div
className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* --- THIS IS THE FIX --- */}
            <Input
              label="Subject (e.g., JAVA, DBMS, Math)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              color={theme === 'dark' ? 'white' : 'gray'}
            />
            <Input
              label="Topic (e.g., Inheritance, SQL Joins)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              color={theme === 'dark' ? 'white' : 'gray'}
            />
            <Select
              label="Difficulty"
              value={difficulty}
              onChange={(val) => setDifficulty(val)}
              color={theme === 'dark' ? 'white' : 'gray'}
            >
            {/* --- END OF FIX --- */}
              <Option value="School">School</Option>
              <Option value="High School">High School</Option>
              <Option value="Graduation">Graduation</Option>
              <Option value="Post Graduation">Post Graduation</Option>
              <Option value="Research">Research</Option>

      </Select>
          </div>
          <div className="mt-6 flex justify-start">
            <Button onClick={handleGenerateQuestion} disabled={generating} className="w-full md:w-1/3">
              {generating ?
<Spinner className="h-4 w-4" /> : "Generate New Question"}
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
              <div className="p-4 border rounded-lg bg-blue-gray-50 mb-4 whitespace-pre-wrap prose prose-sm max-w-none">

     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentQuestion.questionText}
                </ReactMarkdown>
              </div>

              {/* --- THIS IS THE FIX (color prop removed) --- */}
              <Textarea
                label="Your Answer"
                value={currentAnswer}
                onChange={handleAnswerChange}
                rows={textareaRows}
                required
              />
              {/* --- END OF FIX --- */}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button

               type="submit"
                  disabled={submitting ||
loadingHint || loadingAnswer}
                >
                  {submitting ?
<Spinner className="h-4 w-4" /> : "Submit Answer"}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleGetHint}

          disabled={submitting || loadingHint ||
loadingAnswer}
                >
                  {loadingHint ?
<Spinner className="h-4 w-4" /> : "Get Hint"}
                </Button>

                <Popover open={openPopover} handler={setOpenPopover} placement="top">
                  <PopoverHandler>
                    <Button

 type="button"
                      color="red"
                      variant="outlined"
                      disabled={submitting ||
loadingHint || loadingAnswer}
                      loading={loadingAnswer}
                    >
                      Get Answer
                    </Button>

     </PopoverHandler>
                  <PopoverContent className="w-64 z-50">
                    <Typography variant="h6" color="blue-gray" className="mb-2">
                      Confirm
                    </Typography>

          <Typography variant="small" color="blue-gray" className="mb-4">
                      Reveal the answer?
This will be saved to your history.
                    </Typography>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="text"

size="sm"
                        onClick={() => setOpenPopover(false)}
                      >
                        Cancel
                      </Button>

                <Button
                        variant="gradient"
                        color="red"
                        size="sm"

            onClick={confirmGetAnswer}
                      >
                        Confirm
                      </Button>

</div>
                  </PopoverContent>
                </Popover>
              </div>
            </form>
          )}

          {/* Standalone Hint Display */}
          {hint && (

        <div className="mt-4 p-4 border border-blue-500 rounded-lg bg-blue-50">
              <Typography variant="h6" color="blue" className="mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0M8.94 6.94a.75.75 0 1 1-1.06-1.06l.85-.85a.75.75 0 0 1 1.06
0l.85.85a.75.75 0 1 1-1.06 1.06L10 5.81V9.25a.75.75 0 0 1-1.5 0V5.81l-.56.56Zm1.06 6.56a.75.75 0 1 0-1.06 1.06l.85.85a.75.75 0 0 0 1.06 0l.85-.85a.75.75 0 1 0-1.06-1.06l-.56.56Z" clipRule="evenodd" />
                </svg>
                Hint
              </Typography>
              <div className="whitespace-pre-wrap prose prose-sm max-w-none ml-7">

     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {hint}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {feedback
&& (
            <div className="mt-6 p-4 border rounded-lg">
              <DynamicFeedbackTitle status={feedback.evaluationStatus} />

              <div className="mt-2 p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {feedback.evaluationStatus === 'REVEALED'

            ?
feedback.answerText
                    : feedback.feedback
                  }
                </ReactMarkdown>
              </div>

              {feedback.hint && feedback.evaluationStatus !== 'REVEALED' && (

     <div className="mt-4 p-4 border border-blue-500 rounded-lg bg-blue-50">
                  <Typography variant="h6" color="blue" className="mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16
0M8.94 6.94a.75.75 0 1 1-1.06-1.06l.85-.85a.75.75 0 0 1 1.06 0l.85.85a.75.75 0 1 1-1.06 1.06L10 5.81V9.25a.75.75 0 0 1-1.5 0V5.81l-.56.56Zm1.06 6.56a.75.75 0 1 0-1.06 1.06l.85.85a.75.75 0 0 0 1.06 0l.85-.85a.75.75 0 1 0-1.06-1.06l-.56.56Z" clipRule="evenodd" />
                    </svg>
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

      {/* Practice History Card */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div
className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
          ) : visibleHistory.length === 0 ?
(
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
                      "Status", "Your Answer", "Submitted At"
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

        generatedAt
                      } = item;
const className = "py-3 px-5 border-b border-blue-gray-50";

                      const uniqueKey = `${questionId}-${submittedAt}`;
return (
                        <tr
                          key={uniqueKey}
                          onClick={() => handleOpenModal(item)}

     className="cursor-pointer hover:bg-blue-gray-50"
                        >
                          <td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">

                  {index + 1}
                            </Typography>
                          </td>

<td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {questionText.substring(0, 40)}...
                            </Typography>

                 </td>
                          <td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">

     {subject}
                            </Typography>
                          </td>
                          <td className={className}>

              <Typography className="text-xs font-normal text-blue-gray-500">
                              {topic}
                            </Typography>

 </td>
                          <td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {difficulty}

                 </Typography>
                          </td>
                          <td className={className}>
                            {getStatusChip(evaluationStatus)}

                        </td>
                          <td className={className}>
                            <Typography className="text-xs font-normal text-blue-gray-500">

            {answerText ?
`${answerText.substring(0, 40)}...` : "Not Answered"}
                            </Typography>
                          </td>
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
      <Dialog open={selectedHistory !== null} handler={handleCloseModal} size="lg" className="dark:bg-gray-800">
        <DialogHeader className="dark:text-gray-200">Practice Result</DialogHeader>

        <DialogBody divider className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto dark:border-gray-700">
          {selectedHistory && (
            <>
              <div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                  <Typography variant="small" className="dark:text-gray-300">
                    <span className="font-semibold text-blue-gray-600 dark:text-gray-400">Subject:</span> {selectedHistory.subject}
                  </Typography>
                  <Typography variant="small" className="dark:text-gray-300">
              <span className="font-semibold text-blue-gray-600 dark:text-gray-400">Topic:</span> {selectedHistory.topic}
                  </Typography>
                  <Typography variant="small" className="dark:text-gray-300">
                    <span className="font-semibold text-blue-gray-600 dark:text-gray-400">Difficulty:</span> {selectedHistory.difficulty}
                  </Typography>
           </div>

                <Typography variant="small" color="blue-gray" className="dark:text-gray-300">
                  <span className="font-semibold">Question Generated:</span> {formatDateTime(selectedHistory.generatedAt)}
                </Typography>
                <Typography variant="small" color="blue-gray" className="font-semibold dark:text-gray-300">
   Answer Submitted: {formatDateTime(selectedHistory.submittedAt)}
                </Typography>

                <Typography variant="h6" color="blue-gray" className="mt-2 dark:text-gray-200">Question</Typography>
                <div className="mt-2 p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap prose prose-sm max-w-none dark:bg-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
   {selectedHistory.questionText}
                  </ReactMarkdown>
                </div>
              </div>
              <div>
                <Typography variant="h6" color="blue-gray" className="dark:text-gray-200">Your Answer</Typography>
<div className="mt-2 p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap prose prose-sm max-w-none dark:bg-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedHistory.answerText ||
"No answer submitted."}
                  </ReactMarkdown>
                </div>
              </div>
              <div>
                <DynamicFeedbackTitle status={selectedHistory.evaluationStatus} />

                <div className="mt-2
p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap prose prose-sm max-w-none dark:bg-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedHistory.evaluationStatus === 'REVEALED'
                      ?
selectedHistory.answerText
                      : selectedHistory.feedback
                    }
                  </ReactMarkdown>
                </div>
              </div>

     {selectedHistory.hint && selectedHistory.evaluationStatus !== 'REVEALED' && (
                <div className="mt-2 p-4 border border-blue-500 rounded-lg bg-blue-50 dark:bg-gray-700 dark:border-blue-400">
                  <Typography variant="h6" color="blue" className="mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
       <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0M8.94 6.94a.75.75 0 1 1-1.06-1.06l.85-.85a.75.75 0 0 1 1.06 0l.85.85a.75.75 0 1 1-1.06 1.06L10 5.81V9.25a.75.75 0 0 1-1.5 0V5.81l-.56.56Zm1.06 6.56a.75.75 0 1 0-1.06 1.06l.85.85a.75.75 0 0 0 1.06 0l.85-.85a.75.75 0 1 0-1.06-1.06l-.56.56Z" clipRule="evenodd" />
                    </svg>
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
          <Button
       variant="text"
            color="blue-gray"
            onClick={handleCloseModal}
            className="dark:text-gray-200"
          >
            <span>Close</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Practice;