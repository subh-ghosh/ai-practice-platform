import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Typography, Card, CardHeader, CardBody, Button,
  Input, Textarea, Spinner, Chip, Select, Option,
  Dialog, DialogHeader, DialogBody, DialogFooter,
  Popover, PopoverHandler, PopoverContent, Alert,
} from "@material-tailwind/react";

import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "@/context/ThemeContext.jsx";
import { usePaywall } from "@/context/PaywallContext.jsx";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

/* ================= HELPERS ================= */

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

  return <Typography variant="h5" color={color}>{title}</Typography>;
}

function formatDateTime(iso) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleString();
}

const getStatusChip = (status) => {
  const base = { variant:"gradient", className:"py-0.5 px-2 text-[11px]" };
  if (!status) return <Chip {...base} color="blue-gray" value="N/A" />;
  switch (status) {
    case "CORRECT": return <Chip {...base} color="green" value="Correct"/>;
    case "CLOSE": return <Chip {...base} color="orange" value="Close"/>;
    case "REVEALED": return <Chip {...base} color="blue" value="Revealed"/>;
    default: return <Chip {...base} color="red" value="Incorrect"/>;
  }
};

/* ================= COMPONENT ================= */

export function Practice() {

  const { user, decrementFreeActions } = useAuth();
  const { showPaywall } = usePaywall();

  const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

  const [error,setError]=useState(null);
  const [question,setQuestion]=useState(null);
  const [feedback,setFeedback]=useState(null);
  const [hint,setHint]=useState(null);

  const [subject,setSubject]=useState("Java");
  const [topic,setTopic]=useState("OOP");
  const [difficulty,setDifficulty]=useState("High School");

  const [currentAnswer,setCurrentAnswer]=useState("");
  const [textareaRows,setTextareaRows]=useState(5);

  const [generating,setGenerating]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [loadingHint,setLoadingHint]=useState(false);
  const [loadingAnswer,setLoadingAnswer]=useState(false);

  const [allHistory,setAllHistory]=useState([]);
  const [loadingHistory,setLoadingHistory]=useState(true);

  const tokenConfig = () => ({
    headers:{ Authorization:`Bearer ${localStorage.getItem("token")}` }
  });

  /* ================= FETCH HISTORY ================= */

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try{
      const res = await axios.get(`${BASE_URL}/api/practice/history`, tokenConfig());
      setAllHistory(res.data.history || []);
    }catch(e){
      console.log("History error",e);
    }finally{
      setLoadingHistory(false);
    }
  };

  useEffect(()=>{ if(user) fetchHistory(); },[user]);

  /* ================= ACTIONS ================= */

  const handleGenerateQuestion = async () => {
    setGenerating(true);
    setError(null);

    try{
      const res = await axios.post(
        `${BASE_URL}/api/ai/generate-question`,
        {subject,topic,difficulty},
        tokenConfig()
      );

      setQuestion(res.data);

      // RESET UI
      setFeedback(null);
      setHint(null);
      setCurrentAnswer("");

      await fetchHistory();

    }catch(e){
      setError("Failed to generate question.");
    }finally{
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async (e)=>{
    e.preventDefault();
    if(!question) return;

    setSubmitting(true);
    setFeedback(null);
    setHint(null);

    try{
      const res = await axios.post(
        `${BASE_URL}/api/practice/submit`,
        {questionId:question.id,answerText:currentAnswer},
        tokenConfig()
      );

      setFeedback(res.data);
      await fetchHistory();

      if(user?.subscriptionStatus==="FREE") decrementFreeActions();

    }catch(err){
      if(err.response?.status===402) showPaywall();
      else setError("Submit failed.");
    }finally{
      setSubmitting(false);
    }
  };

  const handleGetHint = async ()=>{
    setLoadingHint(true);
    setHint(null);

    try{
      const res = await axios.post(
        `${BASE_URL}/api/ai/get-hint`,
        {questionId:question.id},
        tokenConfig()
      );
      setHint(res.data);
    }catch{
      setError("Hint failed.");
    }finally{
      setLoadingHint(false);
    }
  };

  const handleGetAnswer = async ()=>{
    setLoadingAnswer(true);
    setFeedback(null);

    try{
      const res = await axios.post(
        `${BASE_URL}/api/practice/get-answer`,
        {questionId:question.id},
        tokenConfig()
      );

      setFeedback(res.data);
      await fetchHistory();

    }catch{
      setError("Get answer failed.");
    }finally{
      setLoadingAnswer(false);
    }
  };

  const handleAnswerChange=(e)=>{
    const val=e.target.value;
    setCurrentAnswer(val);
    setTextareaRows(Math.min(15,(val.match(/\n/g)||[]).length+1));
  };

  /* ================= UI ================= */

  return (
  <section className="p-6 space-y-6">

    <Card>
      <CardBody className="space-y-4">

        <Input label="Subject" value={subject} onChange={e=>setSubject(e.target.value)}/>
        <Input label="Topic" value={topic} onChange={e=>setTopic(e.target.value)}/>

        <Select label="Difficulty" value={difficulty} onChange={setDifficulty}>
          <Option value="School">School</Option>
          <Option value="High School">High School</Option>
        </Select>

        <Button onClick={handleGenerateQuestion} disabled={generating}>
          {generating?<Spinner/>:"Generate"}
        </Button>

        {error && <Typography color="red">{error}</Typography>}

        {question && (
          <>
            <Typography variant="h6">Question</Typography>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {question.questionText}
            </ReactMarkdown>

            <Textarea
              label="Your Answer"
              value={currentAnswer}
              onChange={handleAnswerChange}
              rows={textareaRows}
            />

            <div className="flex gap-2">
              <Button onClick={handleSubmitAnswer} disabled={submitting}>
                {submitting?<Spinner/>:"Submit"}
              </Button>

              <Button onClick={handleGetHint} variant="outlined">
                {loadingHint?<Spinner/>:"Hint"}
              </Button>

              <Button onClick={handleGetAnswer} color="red" variant="outlined">
                {loadingAnswer?<Spinner/>:"Answer"}
              </Button>
            </div>
          </>
        )}

        {hint && <Alert color="blue">{hint}</Alert>}

        {feedback && (
          <>
            <DynamicFeedbackTitle status={feedback.evaluationStatus}/>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {feedback.evaluationStatus==="REVEALED"
                ? feedback.answerText
                : feedback.feedback}
            </ReactMarkdown>
          </>
        )}

      </CardBody>
    </Card>

    {/* HISTORY */}
    <Card>
      <CardHeader><Typography>Practice History</Typography></CardHeader>
      <CardBody>
        {loadingHistory
          ? <Spinner/>
          : allHistory.map((h,i)=>(
              <div key={i} className="border-b py-2">
                <Typography>{h.questionText}</Typography>
                {getStatusChip(h.evaluationStatus)}
                <Typography>{formatDateTime(h.submittedAt)}</Typography>
              </div>
            ))
        }
      </CardBody>
    </Card>

  </section>
  );
}

export default Practice;
