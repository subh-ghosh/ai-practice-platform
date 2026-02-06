// ✅ ONLY LOGIC FIXES APPLIED — UI UNCHANGED

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
  if (status === "CORRECT") { title="Feedback: Correct!"; color="green"; }
  else if (status === "CLOSE") { title="Feedback: Close!"; color="orange"; }
  else if (status === "REVEALED") { title="Answer Revealed"; color="blue"; }

  return <Typography variant="h5" color={color}>{title}</Typography>;
}

function formatDateTime(isoString) {
  if (!isoString) return "N/A";
  return new Date(isoString).toLocaleString();
}

const getStatusChip = (status) => {
  const base={variant:"gradient",className:"py-0.5 px-2 text-[11px]"};
  if(!status) return <Chip {...base} color="blue-gray" value="N/A" />;
  switch(status.toUpperCase()){
    case "CORRECT": return <Chip {...base} color="green" value="Correct"/>;
    case "CLOSE": return <Chip {...base} color="orange" value="Close"/>;
    case "REVEALED": return <Chip {...base} color="blue" value="Revealed"/>;
    default: return <Chip {...base} color="red" value="Incorrect"/>;
  }
};

/* ================= COMPONENT ================= */

export function Practice(){

const { user, decrementFreeActions } = useAuth();
const { showPaywall } = usePaywall();

const BASE_URL="https://ai-platform-backend-vauw.onrender.com";

/* ---------- STATES ---------- */

const [error,setError]=useState(null);
const [allHistory,setAllHistory]=useState([]);
const [itemsToShow,setItemsToShow]=useState(10);
const [loadingHistory,setLoadingHistory]=useState(true);
const [searchTerm,setSearchTerm]=useState("");

const [subject,setSubject]=useState("Java");
const [topic,setTopic]=useState("Object Oriented Programming");
const [difficulty,setDifficulty]=useState("High School");

const [generating,setGenerating]=useState(false);
const [question,setQuestion]=useState(null);
const [currentAnswer,setCurrentAnswer]=useState("");
const [submitting,setSubmitting]=useState(false);
const [feedback,setFeedback]=useState(null);
const [hint,setHint]=useState(null);
const [loadingHint,setLoadingHint]=useState(false);
const [loadingAnswer,setLoadingAnswer]=useState(false);

const [selectedHistory,setSelectedHistory]=useState(null);
const [openPopover,setOpenPopover]=useState(false);

/* ---------- FETCH HISTORY ---------- */

const fetchHistory = async ()=>{
  setLoadingHistory(true);
  try{
    const token=localStorage.getItem("token");
    const res=await axios.get(
      `${BASE_URL}/api/practice/history`,
      {headers:{Authorization:`Bearer ${token}`}}
    );
    const raw=res?.data?.history||[];
    const sorted=[...raw].sort((a,b)=>
      new Date(b.submittedAt||0)-new Date(a.submittedAt||0)
    );
    setAllHistory(sorted);
  }catch(e){ console.log(e); }
  finally{ setLoadingHistory(false); }
};

useEffect(()=>{ if(user) fetchHistory(); },[user]);

/* ---------- ACTIONS ---------- */

const handleGenerateQuestion = async ()=>{
  const token=localStorage.getItem("token");
  setGenerating(true);
  setError(null);

  try{
    const res=await axios.post(
      `${BASE_URL}/api/ai/generate-question`,
      {subject,topic,difficulty},
      {headers:{Authorization:`Bearer ${token}`}}
    );

    setQuestion(res.data);

    // ⭐ RESET OLD DATA
    setFeedback(null);
    setHint(null);
    setCurrentAnswer("");

    await fetchHistory();

  }catch(e){ setError("Failed to generate question"); }
  finally{ setGenerating(false); }
};

const handleSubmitAnswer = async (e)=>{
  e.preventDefault();
  if(!question||!currentAnswer) return;

  setSubmitting(true);
  setFeedback(null);
  setHint(null);

  try{
    const token=localStorage.getItem("token");

    const res=await axios.post(
      `${BASE_URL}/api/practice/submit`,
      {questionId:question.id,answerText:currentAnswer},
      {headers:{Authorization:`Bearer ${token}`}}
    );

    setFeedback(res.data);

    // ⭐ CRITICAL FIX
    await fetchHistory();

    if(user?.subscriptionStatus==="FREE") decrementFreeActions();

  }catch(err){
    if(err.response?.status===402) showPaywall();
    else setError("Submit failed");
  }finally{ setSubmitting(false); }
};

const handleGetHint = async ()=>{
  setLoadingHint(true);
  try{
    const token=localStorage.getItem("token");
    const res=await axios.post(
      `${BASE_URL}/api/ai/get-hint`,
      {questionId:question.id},
      {headers:{Authorization:`Bearer ${token}`}}
    );
    setHint(res.data);
  }catch{ setError("Hint failed"); }
  finally{ setLoadingHint(false); }
};

const confirmGetAnswer = async ()=>{
  setOpenPopover(false);
  setLoadingAnswer(true);
  setFeedback(null);

  try{
    const token=localStorage.getItem("token");

    const res=await axios.post(
      `${BASE_URL}/api/practice/get-answer`,
      {questionId:question.id},
      {headers:{Authorization:`Bearer ${token}`}}
    );

    setFeedback(res.data);

    // ⭐ CRITICAL FIX
    await fetchHistory();

  }catch{ setError("Get answer failed"); }
  finally{ setLoadingAnswer(false); }
};

/* ---------- UI (UNCHANGED) ---------- */

return (
<section>
  {/* KEEP YOUR ORIGINAL JSX BELOW */}
  {/* (UI unchanged to save space here) */}
</section>
);
}

export default Practice;
