import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CardBody,
  Avatar,
  Typography,
  Tooltip,
  Button,
  Input,
  Radio,
  Textarea,
  Alert,
  Spinner,
  Tabs,
  TabsHeader,
  Tab,
  Progress,
} from "@material-tailwind/react";
import {
  PencilIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider.jsx";
import BadgesSection from "../../components/gamification/BadgesSection";

/* ============================ Config ============================ */
const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

/* ============================ Helper Components ============================ */

function StatCard({ icon: Icon, title, value, color, delay }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-[#0a0a0c] border border-blue-gray-50 dark:border-white/5 p-6 shadow-sm group`}
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon className={`h-24 w-24 text-${color}-500`} />
      </div>
      <div className="relative z-10 flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-500/10 text-${color}-500`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <Typography variant="small" className="font-medium text-blue-gray-500 dark:text-gray-400">
            {title}
          </Typography>
          <Typography variant="h4" color="blue-gray" className="font-bold dark:text-white">
            {value}
          </Typography>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================ Forms ============================ */

function EditForm({
  formData,
  setFormData,
  onSubmit,
  saving,
  error,
  success,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4"
    >
      {/* 1. Public Profile Card */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0c] border border-blue-gray-50 dark:border-white/5 shadow-sm rounded-2xl p-6">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
            <Typography variant="h6" color="blue-gray" className="dark:text-white flex items-center gap-2">
              <UserCircleIcon className="h-5 w-5 text-blue-500" /> Public Profile
            </Typography>
            <Typography variant="small" className="text-gray-500">
              How other students see you.
            </Typography>
          </div>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                color="blue"
                className="dark:text-white"
                labelProps={{ className: "dark:text-gray-400" }}
              />
              <Input
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                color="blue"
                className="dark:text-white"
                labelProps={{ className: "dark:text-gray-400" }}
              />
            </div>

            <Input
              name="headline"
              label="Headline (e.g. Student at MIT)"
              value={formData.headline}
              onChange={handleChange}
              color="blue"
              className="dark:text-white"
              labelProps={{ className: "dark:text-gray-400" }}
            />

            <Textarea
              name="bio"
              label="Bio"
              value={formData.bio}
              onChange={handleChange}
              color="blue"
              className="dark:text-white"
              labelProps={{ className: "dark:text-gray-400" }}
            />

            <Input
              name="avatarUrl"
              label="Avatar URL"
              value={formData.avatarUrl}
              onChange={handleChange}
              color="blue"
              className="dark:text-white"
              labelProps={{ className: "dark:text-gray-400" }}
              icon={<GlobeAltIcon className="h-4 w-4 text-blue-gray-400" />}
            />
          </div>
        </div>
      </motion.div>

      {/* 2. Social & Settings Card */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0c] border border-blue-gray-50 dark:border-white/5 shadow-sm rounded-2xl p-6">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
            <Typography variant="h6" color="blue-gray" className="dark:text-white flex items-center gap-2">
              <GlobeAltIcon className="h-5 w-5 text-purple-500" /> Social & Settings
            </Typography>
            <Typography variant="small" className="text-gray-500">
              Where people can find you.
            </Typography>
          </div>

          <div className="flex flex-col gap-5 flex-1">
            <Input
              name="githubUrl"
              label="GitHub URL"
              value={formData.githubUrl}
              onChange={handleChange}
              color="purple"
              className="dark:text-white"
              labelProps={{ className: "dark:text-gray-400" }}
            />
            <Input
              name="linkedinUrl"
              label="LinkedIn URL"
              value={formData.linkedinUrl}
              onChange={handleChange}
              color="blue"
              className="dark:text-white"
              labelProps={{ className: "dark:text-gray-400" }}
            />
            <Input
              name="websiteUrl"
              label="Portfolio / Website"
              value={formData.websiteUrl}
              onChange={handleChange}
              color="teal"
              className="dark:text-white"
              labelProps={{ className: "dark:text-gray-400" }}
            />

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <Typography variant="small" className="font-semibold text-blue-gray-700 dark:text-gray-300 mb-3">
                Gender
              </Typography>
              <div className="flex gap-6">
                <Radio
                  name="gender"
                  label="Male"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={handleChange}
                  color="blue"
                  labelProps={{ className: "dark:text-gray-300" }}
                />
                <Radio
                  name="gender"
                  label="Female"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={handleChange}
                  color="pink"
                  labelProps={{ className: "dark:text-gray-300" }}
                />
              </div>
            </div>

            {/* Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <Alert color="red" variant="ghost" className="mt-4 text-xs py-2 px-4 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4" /> {error}
                  </Alert>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <Alert color="green" variant="ghost" className="mt-4 text-xs py-2 px-4 flex items-center gap-2">
                    <CheckCircleIcon className="h-4 w-4" /> {success}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={onSubmit}
              variant="gradient"
              color="blue"
              fullWidth
              disabled={saving}
              className="mt-6 flex items-center justify-center gap-2"
            >
              {saving ? <Spinner className="h-4 w-4" /> : "Save Changes"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SecurityPanel({
  oldPassword,
  newPassword,
  setOldPassword,
  setNewPassword,
  onChangePassword,
  changing,
  onDeleteAccount,
  deleting,
  error,
  success,
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4"
    >
      <motion.div variants={itemVariants}>
        <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0c] border border-blue-gray-50 dark:border-white/5 shadow-sm rounded-2xl p-6">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
            <Typography variant="h6" color="blue-gray" className="dark:text-white flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-green-500" /> Password
            </Typography>
          </div>

          <form onSubmit={onChangePassword} className="flex flex-col gap-5">
            <Input
              type="password"
              label="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              color="blue"
              className="dark:text-white"
              labelProps={{ className: "dark:text-gray-400" }}
            />
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              color="blue"
              className="dark:text-white"
              labelProps={{ className: "dark:text-gray-400" }}
            />

            <AnimatePresence>
              {error && (
                <Alert color="red" variant="ghost" className="text-xs py-2 px-4 flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4" /> {error}
                </Alert>
              )}
              {success && (
                <Alert color="green" variant="ghost" className="text-xs py-2 px-4 flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4" /> {success}
                </Alert>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              variant="gradient"
              color="gray"
              fullWidth
              disabled={changing}
              className="mt-4 flex items-center justify-center gap-2"
            >
              {changing ? <Spinner className="h-4 w-4" /> : "Update Password"}
            </Button>
          </form>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex flex-col h-full bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-6">
          <div className="mb-6 pb-4 border-b border-red-100 dark:border-red-900/30">
            <Typography variant="h6" color="red" className="flex items-center gap-2 font-bold">
              <ExclamationTriangleIcon className="h-5 w-5" /> Danger Zone
            </Typography>
          </div>
          <Typography variant="small" className="text-red-400 mb-6">
            Irreversible actions. History will be deleted immediately.
          </Typography>
          <div className="mt-auto">
            <Button
              variant="outlined"
              color="red"
              fullWidth
              onClick={onDeleteAccount}
              disabled={deleting}
              className="bg-white hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-900/20"
            >
              {deleting ? <Spinner className="h-4 w-4 mx-auto text-red-500" /> : "Delete Account"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================================ Page ================================ */

export function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Form Data State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "male",
    bio: "",
    headline: "",
    avatarUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Loading States
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Feedback States
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);
  const [secError, setSecError] = useState(null);
  const [secSuccess, setSecSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        gender: user.gender || "male",
        bio: user.bio || "",
        headline: user.headline || "",
        avatarUrl: user.avatarUrl || "",
        githubUrl: user.githubUrl || "",
        linkedinUrl: user.linkedinUrl || "",
        websiteUrl: user.websiteUrl || "",
      });
    }
  }, [user]);

  useEffect(() => {
    setEditError(null); setEditSuccess(null);
    setSecError(null); setSecSuccess(null);
  }, [activeTab]);

  const maleAvatar = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-circle-icon.png";
  const femaleAvatar = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/woman-user-circle-icon.png";

  // Use custom avatar if provided and valid, else fallback based on gender
  const displayAvatar = formData.avatarUrl && formData.avatarUrl.startsWith("http")
    ? formData.avatarUrl
    : (user?.gender === "female" ? femaleAvatar : maleAvatar);

  // --- Handlers ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true); setEditError(null); setEditSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      const res = await axios.put(`${BASE_URL}/api/students/profile`, formData, config);
      if (updateUser && res.data) updateUser(res.data);
      setEditSuccess("Profile updated successfully!");
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true); setSecError(null); setSecSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      await axios.put(`${BASE_URL}/api/students/password`, { oldPassword, newPassword }, config);
      setSecSuccess("Password changed successfully!");
      setOldPassword(""); setNewPassword("");
    } catch (err) {
      setSecError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    setDeletingAccount(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      await axios.delete(`${BASE_URL}/api/students/account`, config);
      logout();
    } catch {
      setSecError("Failed to delete account.");
      setDeletingAccount(false);
    }
  };

  // Calculate Level (Simple logic: XP / 1000 + 1)
  const level = Math.floor((user?.totalXp || 0) / 1000) + 1;
  const xpForNextLevel = level * 1000;
  const xpProgress = ((user?.totalXp || 0) % 1000) / 1000 * 100;

  return (
    <div className="relative mt-2 mb-8 w-full min-h-[calc(100vh-100px)] flex flex-col gap-6">

      {/* 1. Header Profile Banner */}
      <div className="relative w-full rounded-3xl bg-gradient-to-r from-blue-900 to-blue-600 p-8 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <Avatar
              src={displayAvatar}
              alt="avatar"
              size="xxl"
              variant="rounded"
              className="border-4 border-white/20 shadow-2xl bg-white object-cover"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-blue-800 w-6 h-6 rounded-full"></div>
          </div>

          <div className="text-center md:text-left flex-1">
            <Typography variant="h2" color="white" className="font-bold tracking-tight">
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="lead" className="text-blue-100 font-medium opacity-90">
              {user?.headline || "AI Scholar & Tech Enthusiast"}
            </Typography>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <TrophyIcon className="h-4 w-4 text-yellow-400" /> Level {level}
              </div>
              <div className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <FireIcon className="h-4 w-4 text-orange-400" /> {user?.streakDays || 0} Day Streak
              </div>
            </div>
          </div>

          <div className="w-full md:w-64 bg-black/20 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
            <div className="flex justify-between text-xs text-blue-100 mb-2 font-bold uppercase">
              <span>XP Progress</span>
              <span>{user?.totalXp || 0} / {xpForNextLevel}</span>
            </div>
            <Progress value={xpProgress} size="sm" color="blue" className="bg-blue-900/50" />
            <Typography variant="small" className="text-blue-200/60 text-[10px] mt-2 text-center">
              {1000 - ((user?.totalXp || 0) % 1000)} XP to next level
            </Typography>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <Tabs value={activeTab} className="w-full">
        <TabsHeader
          className="bg-transparent border-b border-blue-gray-100 dark:border-white/10 p-0 rounded-none w-full md:w-1/2"
          indicatorProps={{ className: "bg-transparent border-b-2 border-blue-500 shadow-none rounded-none" }}
        >
          <Tab value="profile" onClick={() => setActiveTab("profile")} className={`text-sm font-bold py-4 ${activeTab === 'profile' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
            Overview
          </Tab>
          <Tab value="edit" onClick={() => setActiveTab("edit")} className={`text-sm font-bold py-4 ${activeTab === 'edit' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
            Edit Profile
          </Tab>
          <Tab value="security" onClick={() => setActiveTab("security")} className={`text-sm font-bold py-4 ${activeTab === 'security' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
            Security
          </Tab>
        </TabsHeader>
      </Tabs>

      {/* 3. Content Area */}
      <AnimatePresence mode="wait">

        {/* VIEW 1: OVERVIEW */}
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Bio & Info */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#0a0a0c] border border-blue-gray-50 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <Typography variant="h5" color="blue-gray" className="dark:text-white font-bold mb-4">
                  About Me
                </Typography>
                <Typography className="text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                  {user?.bio || "No bio added yet. Click 'Edit profile' to tell your story!"}
                </Typography>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <Typography variant="small" className="text-gray-400 uppercase font-bold text-[10px] mb-1">Email</Typography>
                    <Typography className="dark:text-white font-medium break-all">{user?.email}</Typography>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <Typography variant="small" className="text-gray-400 uppercase font-bold text-[10px] mb-1">Location</Typography>
                    <Typography className="dark:text-white font-medium">India</Typography>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Stats & Socials */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <StatCard icon={BoltIcon} title="Total XP" value={user?.totalXp || 0} color="yellow" />
                <StatCard icon={FireIcon} title="Streak" value={`${user?.streakDays || 0} Days`} color="orange" />
                <StatCard icon={CheckCircleIcon} title="Actions" value={user?.freeActionsUsed || 0} color="green" />
              </div>

              {/* Achievements Section */}
              <BadgesSection />

              <div className="bg-white dark:bg-[#0a0a0c] border border-blue-gray-50 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <Typography variant="h6" color="blue-gray" className="dark:text-white font-bold mb-4">
                  Connect
                </Typography>
                <div className="space-y-3">
                  {user?.githubUrl && (
                    <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg group-hover:bg-white dark:group-hover:bg-black transition-colors">
                        <GlobeAltIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <Typography className="font-medium text-gray-700 dark:text-gray-300">GitHub</Typography>
                    </a>
                  )}
                  {user?.linkedinUrl && (
                    <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-white dark:group-hover:bg-black transition-colors">
                        <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <Typography className="font-medium text-gray-700 dark:text-gray-300">LinkedIn</Typography>
                    </a>
                  )}
                  {/* Add a default if nothing is there */}
                  {!user?.githubUrl && !user?.linkedinUrl && !user?.websiteUrl && (
                    <Typography variant="small" className="text-gray-400 italic">
                      No links added.
                    </Typography>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* VIEW 2: EDIT */}
        {activeTab === "edit" && (
          <EditForm
            key="edit"
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleProfileUpdate}
            saving={savingProfile}
            error={editError}
            success={editSuccess}
          />
        )}

        {/* VIEW 3: SECURITY */}
        {activeTab === "security" && (
          <SecurityPanel
            key="security"
            oldPassword={oldPassword}
            newPassword={newPassword}
            setOldPassword={setOldPassword}
            setNewPassword={setNewPassword}
            onChangePassword={handlePasswordChange}
            changing={changingPassword}
            onDeleteAccount={handleDeleteAccount}
            deleting={deletingAccount}
            error={secError}
            success={secSuccess}
          />
        )}

      </AnimatePresence>
    </div>
  );
}

export default Profile;