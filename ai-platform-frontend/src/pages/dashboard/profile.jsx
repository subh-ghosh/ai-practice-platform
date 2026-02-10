import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Button,
  Input,
  Tabs,
  TabsHeader,
  Tab,
  Avatar,
  Alert,
  Spinner,
  Radio,
  Tooltip,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

/* ============================ Config ============================ */
const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

/* ============================ Animation Variants ============================ */
// Copied exactly from Notifications.js for uniformity
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

/* ============================ Helper Components ============================ */

const DarkInput = ({ label, ...props }) => (
  <div className="w-full">
    <Typography variant="small" className="mb-2 font-medium text-gray-500 dark:text-gray-400">
      {label}
    </Typography>
    <Input
      {...props}
      className="!border-blue-gray-100 dark:!border-gray-700 bg-white dark:bg-gray-800 text-blue-gray-900 dark:text-white placeholder:text-gray-500 focus:!border-blue-500 transition-colors"
      labelProps={{
        className: "hidden",
      }}
      containerProps={{
        className: "!min-w-0",
      }}
    />
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <motion.div 
    variants={itemVariants}
    className="flex items-center gap-4 p-4 rounded-lg border border-blue-gray-50 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
  >
    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <Typography variant="small" className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">
        {label}
      </Typography>
      <Typography variant="h6" className="text-blue-gray-900 dark:text-gray-200 text-sm font-medium">
        {value}
      </Typography>
    </div>
  </motion.div>
);

/* ============================ Main Page ============================ */
export function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // Form States
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setGender(user.gender || "male");
    }
  }, [user]);

  useEffect(() => {
    setStatus({ type: "", message: "" });
  }, [activeTab]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BASE_URL}/api/students/profile`,
        { firstName, lastName, gender },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (updateUser) updateUser(res.data);
      setStatus({ type: "success", message: "Profile updated successfully." });
    } catch (error) {
      setStatus({ type: "error", message: "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/api/students/password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus({ type: "success", message: "Password changed successfully." });
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      setStatus({ type: "error", message: "Failed to change password." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("This action is irreversible. Delete account?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/students/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
    } catch (error) {
      setStatus({ type: "error", message: "Could not delete account." });
      setLoading(false);
    }
  };

  const avatarSrc =
    gender === "female"
      ? "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/woman-user-circle-icon.png"
      : "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-circle-icon.png";

  return (
    // UNIFORM WRAPPER: Matches Notifications.js exactly
    <div className="relative mt-6 mb-8 w-full h-[calc(100vh-175px)] overflow-hidden rounded-xl border border-blue-gray-50 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/5 blur-[100px]"
        />
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 p-6 flex flex-col gap-5 h-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <Typography variant="h5" color="blue-gray" className="dark:text-white font-bold tracking-tight">
              Profile
            </Typography>
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-normal mt-1">
              Manage your personal information and security.
            </Typography>
          </div>

          {/* User Badge (Moved here to match Notification Action Button placement) */}
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-gray-800/50 py-1.5 px-3 rounded-full border border-blue-100 dark:border-gray-700">
            <Avatar src={avatarSrc} variant="circular" size="xs" className="border border-gray-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-900 dark:text-white leading-none">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[9px] text-gray-500 leading-none">
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-4 flex-1 min-h-0">
            
          {/* Tabs */}
          <div className="w-full md:w-96 shrink-0">
            <Tabs value={activeTab} className="w-full">
              <TabsHeader
                className="bg-gray-100/50 dark:bg-gray-800/70 p-1 border border-gray-200 dark:border-gray-700"
                indicatorProps={{ className: "bg-white dark:bg-gray-700 shadow-sm" }}
              >
                <Tab value="profile" onClick={() => setActiveTab("profile")} className="w-1/3 text-xs font-semibold py-2 transition-colors">
                  Overview
                </Tab>
                <Tab value="edit" onClick={() => setActiveTab("edit")} className="w-1/3 text-xs font-semibold py-2 transition-colors">
                  Edit
                </Tab>
                <Tab value="security" onClick={() => setActiveTab("security")} className="w-1/3 text-xs font-semibold py-2 transition-colors">
                  Security
                </Tab>
              </TabsHeader>
            </Tabs>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700">
            <AnimatePresence mode="wait">
              
              {/* 1. OVERVIEW TAB */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-6"
                >
                  <InfoRow icon={UserCircleIcon} label="Full Name" value={`${user?.firstName} ${user?.lastName}`} />
                  <InfoRow icon={EnvelopeIcon} label="Email Address" value={user?.email} />
                  <InfoRow icon={IdentificationIcon} label="Account Type" value="Student" />
                  <InfoRow icon={MapPinIcon} label="Region" value="India" />
                  <InfoRow icon={UserCircleIcon} label="Gender" value={user?.gender || "Male"} />
                  
                  {/* Status Card */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex items-center gap-4 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10"
                  >
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <CheckCircleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <Typography variant="small" className="font-bold text-blue-400 uppercase text-[10px] tracking-wider">Status</Typography>
                      <Typography variant="h6" className="text-blue-900 dark:text-blue-100 text-sm font-medium">Active Member</Typography>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* 2. EDIT TAB */}
              {activeTab === "edit" && (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-2xl flex flex-col gap-6 pt-2"
                >
                  {status.message && (
                    <Alert color={status.type === "error" ? "red" : "green"} variant="ghost" className="text-xs py-2 px-4 flex items-center gap-2 border border-current">
                      {status.type === "error" ? <ExclamationTriangleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                      {status.message}
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <DarkInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    <DarkInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>

                  <div className="p-4 rounded-lg border border-blue-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
                    <Typography variant="small" className="mb-3 font-medium text-gray-500">Gender Selection</Typography>
                    <div className="flex gap-6">
                      <Radio name="gender" label="Male" value="male" checked={gender === "male"} onChange={(e) => setGender(e.target.value)} color="blue" labelProps={{ className: "text-gray-600 dark:text-gray-300" }} />
                      <Radio name="gender" label="Female" value="female" checked={gender === "female"} onChange={(e) => setGender(e.target.value)} color="pink" labelProps={{ className: "text-gray-600 dark:text-gray-300" }} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={handleUpdateProfile} disabled={loading} color="blue" className="normal-case w-40 flex justify-center items-center">
                      {loading ? <Spinner className="h-4 w-4" /> : "Save Changes"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* 3. SECURITY TAB */}
              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-2xl flex flex-col gap-6 pt-2"
                >
                  {status.message && (
                    <Alert color={status.type === "error" ? "red" : "green"} variant="ghost" className="text-xs py-2 px-4 flex items-center gap-2 border border-current">
                      {status.type === "error" ? <ExclamationTriangleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                      {status.message}
                    </Alert>
                  )}

                  {/* Password Section */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-1 border-b border-gray-200 dark:border-gray-800 pb-2">
                      <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                      <Typography className="font-semibold text-gray-900 dark:text-white">Password Update</Typography>
                    </div>
                    <DarkInput type="password" label="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                    <DarkInput type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <div className="flex justify-end">
                      <Button onClick={handleChangePassword} disabled={loading} variant="outlined" className="normal-case border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-0">
                        {loading ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="mt-4 p-5 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <Typography color="red" className="font-bold flex items-center gap-2 text-sm">
                        <ExclamationTriangleIcon className="h-4 w-4" /> Delete Account
                      </Typography>
                      <Typography variant="small" className="text-red-300 dark:text-red-200/60 mt-1 max-w-sm">
                        All your data will be permanently erased. This action cannot be undone.
                      </Typography>
                    </div>
                    <Button color="red" variant="gradient" className="shrink-0" onClick={handleDeleteAccount} disabled={loading}>
                      {loading ? "Deleting..." : "Delete Account"}
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
        
        {/* Footer (Optional, aligns with Notifications style if needed, or hidden) */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
           <Typography variant="small" className="text-center text-gray-400 font-normal text-[10px]">
             &copy; 2026, made by Subarta Ghosh
           </Typography>
        </div>

      </div>
    </div>
  );
}

export default Profile;