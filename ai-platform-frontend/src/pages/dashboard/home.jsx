import React, { useState, useEffect, useRef } from "react";
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
  // --- ADDED IMPORTS ---
  Select,
  Option
  // ---------------------
} from "@material-tailwind/react";
import { useAuth } from "@/context/AuthContext";
import api from "@/api";

// Helper component for the feedback title
function DynamicFeedbackTitle({ status }) {
  let title = "Feedback: Incorrect";
  let color = "red";
  if (status === "CORRECT") {
    title = "Feedback: Correct!";
    color = "green";
  } else if (status === "CLOSE") {
    title = "Feedback: Close!";
    color = "orange";
  }
  return (
    <Typography variant="h5" color={color}>
      {title}
    </Typography>
  );
}

// Your main component
export function Home() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);

  // --- UPDATED STATE ---
  const [subject, setSubject] = useState("Java"); // New default
  const [topic, setTopic] = useState("Object Oriented Programming"); // New state
  const [difficulty, setDifficulty] = useState("High School"); // New default
  // ---------------------

  const [generating, setGenerating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [textareaRows, setTextareaRows] = useState(5);

  // Fetch practice history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    setError(null);
    if (!user) return;
    try {
      const response = await api.get(`/api/practice/history`);
      setHistory(response.data.history || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      let errorMsg = "Could not load practice history.";
      if (err.response && err.response.status) {
          errorMsg = `Error loading history: Server responded with status ${err.response.status}`;
      }
      setError(errorMsg);
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  // Handle resizing of textarea based on newlines
  const handleAnswerChange = (e) => {
    const { value } = e.target;
    setCurrentAnswer(value);
    const newRowCount = (value.match(/\n/g) || []).length + 1;
    setTextareaRows(Math.max(5, newRowCount));
  };

  // Handle generating a new question
  const handleGenerateQuestion = async () => {
    setGenerating(true);
    setCurrentQuestion(null);
    setCurrentAnswer("");
    setFeedback(null);
    setError(null);
    setTextareaRows(5);

    try {
      // --- UPDATED TO SEND ALL 3 FIELDS ---
      const response = await api.post("/api/ai/generate-question", {
        subject,
        topic,
        difficulty,
      });
      // -------------------------------------
      setCurrentQuestion(response.data);
    } catch (err) {
      console.error("Error generating question:", err);
      let errorMsg = "Failed to generate a new question. Please try again.";
      if (err.response && err.response.status) {
          errorMsg = `Error: Server responded with status ${err.response.status}`;
      }
      setError(errorMsg);
    }
    setGenerating(false);
  };

  // Handle submitting an answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!currentQuestion || !currentAnswer) return;

    setSubmitting(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await api.post("/api/practice/submit", {
        questionId: currentQuestion.id,
        answerText: currentAnswer,
      });

      setFeedback({
        evaluationStatus: response.data.evaluationStatus,
        feedback: response.data.feedback,
        hint: response.data.hint,
      });
      fetchHistory();
    } catch (err) {
      console.error("Error submitting answer:", err);
      let errorMsg = "Failed to submit your answer. Please try again.";
      if (err.response && err.response.status) {
          errorMsg = `Error: Server responded with status ${err.response.status}`;
      }
      setError(errorMsg);
    }
    setSubmitting(false);
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
          {/* --- THIS IS THE NEW 3-COLUMN FORM --- */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Column 1: Subject */}
            <Input
              label="Subject (e.g., JAVA, DBMS, Math)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            {/* Column 2: Topic */}
            <Input
              label="Topic (e.g., Inheritance, SQL Joins)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            {/* Column 3: Difficulty Dropdown */}
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
          {/* --- END OF NEW FORM --- */}

          <div className="mt-6 flex justify-center">
            <Button onClick={handleGenerateQuestion} disabled={generating} className="w-full md:w-1/3">
              {generating ? <Spinner className="h-4 w-4" /> : "Generate New Question"}
            </Button>
          </div>

          {error && (
            <Typography color="red" className="mt-4">
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

              <Button type="submit" className="mt-4" disabled={submitting}>
                {submitting ? <Spinner className="h-4 w-4" /> : "Submit Answer"}
              </Button>
            </form>
          )}

          {/* Feedback Section */}
          {feedback && (
            <div className="mt-6 p-4 border rounded-lg">
              <DynamicFeedbackTitle status={feedback.evaluationStatus} />
              <Typography className="mt-2 p-4 bg-blue-gray-50 rounded-lg whitespace-pre-wrap">
                {feedback.feedback}
              </Typography>
              {feedback.hint && (
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
          <Typography variant="h6" color="white">
            Practice History
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {loadingHistory ? (
            <div className="flex justify-center p-8">
              <Spinner className="h-8 w-8" />
            </div>
          ) : history.length === 0 ? (
            <Typography className="p-6 text-center">
              You haven't completed any questions yet.
            </Typography>
          ) : (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Question", "Status", "Your Answer"].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-left"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(
                  ({ questionId, questionText, answerText, isCorrect }) => {
                    const className = "py-3 px-5 border-b border-blue-gray-50";
                    return (
                      <tr key={questionId}>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {questionText.substring(0, 50)}...
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={answerText ? (isCorrect ? "green" : "red") : "blue-gray"}
                            value={answerText ? (isCorrect ? "Correct" : "Incorrect") : "N/A"}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                          />
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {answerText ? `${answerText.substring(0, 50)}...` : "Not Answered"}
                          </Typography>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Home;