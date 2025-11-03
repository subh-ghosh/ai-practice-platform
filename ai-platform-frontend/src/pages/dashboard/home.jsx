import React, { useState, useEffect } from "react";
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
} from "@material-tailwind/react";
import { useAuth } from "@/context/AuthContext";
import api from "@/api";

export function Home() {
  const { user } = useAuth(); // Get the logged-in user
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);

  // State for new question
  const [subject, setSubject] = useState("Algebra");
  const [difficulty, setDifficulty] = useState("High School");
  const [generating, setGenerating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null); // Will hold { id, questionText }
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // Will hold { isCorrect, feedback }

  // Fetch practice history
  const fetchHistory = async () => {
    setLoadingHistory(true);
    setError(null);
    if (!user) return; // Don't fetch if user isn't loaded yet

    try {
      // Use the studentId from the authenticated user
      const response = await api.get(`/api/practice/history?studentId=${user.id}`);
      setHistory(response.data.questions || []);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Could not load practice history.");
    }
    setLoadingHistory(false);
  };

  // Fetch history on component load
  useEffect(() => {
    if (user) { // Only fetch history if the user is loaded
      fetchHistory();
    }
  }, [user]); // Re-run when user becomes available

  // Handle generating a new question
  const handleGenerateQuestion = async () => {
    setGenerating(true);
    setCurrentQuestion(null);
    setCurrentAnswer("");
    setFeedback(null);
    setError(null);

    try {
      const response = await api.post("/api/ai/generate-question", {
        subject,
        difficulty,
        studentId: user.id, // Send student ID
      });
      // The backend now returns the saved Question object
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
    setError(null);

    try {
      const response = await api.post("/api/practice/submit", {
        questionId: currentQuestion.id,
        answerText: currentAnswer,
        studentId: user.id, // Send student ID
      });
      // The backend returns the Answer object with feedback
      setFeedback({
        isCorrect: response.data.isCorrect,
        feedback: response.data.feedback,
      });
      // Refresh history to show the new answer
      fetchHistory();
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError("Failed to submit your answer. Please try again.");
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
          <div className="flex flex-col gap-6 md:flex-row">
            <Input
              label="Subject (e.g., Algebra)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Input
              label="Difficulty (e.g., High School)"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            />
            <Button onClick={handleGenerateQuestion} disabled={generating} fullWidth>
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
              <div className="p-4 border rounded-lg bg-blue-gray-50 mb-4">
                <Typography>{currentQuestion.questionText}</Typography>
              </div>
              <Textarea
                label="Your Answer"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={5}
                required
              />
              <Button type="submit" className="mt-4" disabled={submitting}>
                {submitting ? <Spinner className="h-4 w-4" /> : "Submit Answer"}
              </Button>
            </form>
          )}

          {feedback && (
            <div className="mt-6 p-4 border rounded-lg">
              <Typography variant="h5" color={feedback.isCorrect ? "green" : "red"}>
                Feedback: {feedback.isCorrect ? "Correct!" : "Incorrect"}
              </Typography>
              <Typography className="mt-2 p-4 bg-blue-gray-50 rounded-lg">
                {feedback.feedback}
              </Typography>
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
                  {["Subject", "Status", "Question", "Your Answer"].map((el) => (
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
                  ({ id, subject, questionText, answerDto }) => {
                    const className = "py-3 px-5 border-b border-blue-gray-50";
                    return (
                      <tr key={id}>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {subject}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={answerDto ? (answerDto.isCorrect ? "green" : "red") : "blue-gray"}
                            value={answerDto ? (answerDto.isCorrect ? "Correct" : "Incorrect") : "N/A"}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                          />
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {questionText.substring(0, 50)}...
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {answerDto ? `${answerDto.answerText.substring(0, 50)}...` : "Not Answered"}
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
