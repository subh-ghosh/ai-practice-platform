import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  Avatar,
  Typography,
  Tooltip,
  Button,
  Input,
  Radio,
  Alert,
  Spinner,
  Tabs,
  TabsHeader,
  Tab,
} from "@material-tailwind/react";
import {
  PencilIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileInfoCard } from "@/widgets/cards";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider.jsx";

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

/* ============================ Sub-Components ============================ */

function EditForm({
  firstName,
  lastName,
  email,
  gender,
  setFirstName,
  setLastName,
  setGender,
  onSubmit,
  saving,
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
      {/* Personal Details Card */}
      <motion.div variants={itemVariants}>
        <div className="relative flex flex-col bg-white dark:bg-gray-800 border border-blue-gray-50 dark:border-blue-900/30 shadow-sm rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700/50 pb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <UserCircleIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div>
                <Typography variant="h6" color="blue-gray" className="dark:text-white">
                  Personal Details
                </Typography>
                <Typography variant="small" className="text-gray-500 font-normal">
                   Update your public identity.
                </Typography>
            </div>
          </div>
          
          <div className="flex flex-col gap-5">
             <Input
               label="First Name"
               value={firstName}
               onChange={(e) => setFirstName(e.target.value)}
               color="blue"
               className="dark:text-white"
               labelProps={{ className: "dark:text-gray-400" }}
             />
             <Input
               label="Last Name"
               value={lastName}
               onChange={(e) => setLastName(e.target.value)}
               color="blue"
               className="dark:text-white"
               labelProps={{ className: "dark:text-gray-400" }}
             />
          </div>
        </div>
      </motion.div>

      {/* Preferences Card */}
      <motion.div variants={itemVariants} className="h-full">
         <div className="relative flex flex-col h-full bg-white dark:bg-gray-800 border border-blue-gray-50 dark:border-blue-900/30 shadow-sm rounded-xl p-6">
           <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700/50 pb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <PencilIcon className="h-5 w-5 text-purple-500" />
            </div>
            <div>
                <Typography variant="h6" color="blue-gray" className="dark:text-white">
                  Account Data
                </Typography>
                 <Typography variant="small" className="text-gray-500 font-normal">
                   System information & gender.
                </Typography>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col flex-1 gap-5">
            <Input
              label="Email Address"
              value={email || ""}
              disabled
              className="!border-t-blue-gray-200 focus:!border-t-gray-900 dark:text-gray-400"
              labelProps={{ className: "before:content-none after:content-none" }}
              containerProps={{ className: "opacity-70 cursor-not-allowed" }}
            />

            <div>
              <Typography variant="small" className="font-semibold text-blue-gray-700 dark:text-gray-300 mb-3">
                Gender
              </Typography>
              <div className="flex gap-6">
                <Radio
                  name="gender"
                  label="Male"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                  color="blue"
                  labelProps={{ className: "dark:text-gray-300" }}
                />
                <Radio
                  name="gender"
                  label="Female"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                  color="pink"
                  labelProps={{ className: "dark:text-gray-300" }}
                />
              </div>
            </div>

            {/* Alerts */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert color="red" variant="ghost" className="text-xs py-2 px-4 flex items-center gap-2">
                             <ExclamationTriangleIcon className="h-4 w-4" /> {error}
                        </Alert>
                    </motion.div>
                )}
                {success && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                         <Alert color="green" variant="ghost" className="text-xs py-2 px-4 flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4" /> {success}
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-auto pt-4">
              <Button
                type="submit"
                variant="gradient"
                color="blue"
                fullWidth
                disabled={saving}
                className="flex items-center justify-center gap-2"
              >
                {saving ? <Spinner className="h-4 w-4" /> : "Save Changes"}
              </Button>
            </div>
          </form>
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
      {/* Password Change */}
      <motion.div variants={itemVariants}>
         <div className="relative flex flex-col h-full bg-white dark:bg-gray-800 border border-blue-gray-50 dark:border-blue-900/30 shadow-sm rounded-xl p-6">
           <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700/50 pb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <ShieldCheckIcon className="h-5 w-5 text-green-500" />
            </div>
            <div>
                <Typography variant="h6" color="blue-gray" className="dark:text-white">
                  Security
                </Typography>
                 <Typography variant="small" className="text-gray-500 font-normal">
                   Update your password.
                </Typography>
            </div>
          </div>

          <form onSubmit={onChangePassword} className="flex flex-col flex-1 gap-5">
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
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert color="red" variant="ghost" className="text-xs py-2 px-4 flex items-center gap-2">
                             <ExclamationTriangleIcon className="h-4 w-4" /> {error}
                        </Alert>
                    </motion.div>
                )}
                {success && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                         <Alert color="green" variant="ghost" className="text-xs py-2 px-4 flex items-center gap-2">
                            <CheckCircleIcon className="h-4 w-4" /> {success}
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-auto pt-4">
               <Button
                  type="submit"
                  variant="gradient"
                  color="gray"
                  fullWidth
                  disabled={changing}
                  className="flex items-center justify-center gap-2"
                >
                  {changing ? <Spinner className="h-4 w-4" /> : "Update Password"}
                </Button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants}>
         <div className="relative flex flex-col h-full bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6">
           <div className="flex items-center gap-3 mb-6 border-b border-red-100 dark:border-red-900/30 pb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div>
                <Typography variant="h6" color="red" className="font-bold">
                  Danger Zone
                </Typography>
                 <Typography variant="small" className="text-red-400 font-normal">
                   Irreversible actions.
                </Typography>
            </div>
          </div>

          <div className="flex flex-col gap-4 flex-1">
             <div className="bg-white/80 dark:bg-black/20 rounded-lg p-4 border border-red-50">
                <Typography variant="small" className="font-bold text-red-900 dark:text-red-200 mb-2">
                  Warning:
                </Typography>
                <ul className="list-disc pl-4 text-xs text-red-800/80 dark:text-red-300/80 space-y-1">
                  <li>History will be deleted immediately.</li>
                  <li>Subscriptions will be cancelled.</li>
                  <li>You cannot recover this data.</li>
                </ul>
             </div>

             <div className="mt-auto pt-4">
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
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================================ Page ================================ */

export function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");

  // Form States
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [gender, setGender] = useState(user?.gender || "male");
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
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setGender(user.gender || "male");
    }
  }, [user]);

  // Clear alerts on tab switch
  useEffect(() => {
    setEditError(null); setEditSuccess(null);
    setSecError(null); setSecSuccess(null);
  }, [activeTab]);

  const maleAvatar = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-circle-icon.png";
  const femaleAvatar = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/woman-user-circle-icon.png";
  const avatarSrc = (gender || user?.gender) === "female" ? femaleAvatar : maleAvatar;

  // --- Handlers ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true); setEditError(null); setEditSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      const res = await axios.put(`${BASE_URL}/api/students/profile`, { firstName, lastName, gender }, config);
      if(updateUser && res.data) updateUser(res.data);
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

  // --- Render ---

  return (
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
        
        {/* Header Section (Fixed at top) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
             <Avatar 
                src={avatarSrc} 
                alt="avatar" 
                size="xl" 
                variant="rounded"
                className="border-2 border-white dark:border-gray-800 shadow-md"
             />
             <div>
                <Typography variant="h5" color="blue-gray" className="dark:text-white font-bold tracking-tight">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-normal">
                  {user?.email}
                </Typography>
             </div>
          </div>

          {/* Navigation Tabs */}
          <div className="w-full md:w-80">
            <Tabs value={activeTab} className="w-full">
                <TabsHeader 
                    className="bg-gray-100/50 dark:bg-gray-800/70 p-1 border border-gray-200 dark:border-gray-700"
                    indicatorProps={{ className: "bg-white dark:bg-gray-700 shadow-sm" }}
                >
                    <Tab value="profile" onClick={() => setActiveTab("profile")} className="text-xs font-semibold py-2">
                        Profile
                    </Tab>
                    <Tab value="edit" onClick={() => setActiveTab("edit")} className="text-xs font-semibold py-2">
                        Edit
                    </Tab>
                    <Tab value="security" onClick={() => setActiveTab("security")} className="text-xs font-semibold py-2">
                        Security
                    </Tab>
                </TabsHeader>
            </Tabs>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            <AnimatePresence mode="wait">
                
                {activeTab === "profile" && (
                    <motion.div
                        key="profile"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="mt-8" /* MOVED DOWN */
                    >
                         <motion.div variants={itemVariants} className="w-full">
                            {/* ADDED TOP BORDER ACCENT */}
                            <div className="bg-white dark:bg-gray-800 border border-blue-gray-50 dark:border-blue-900/30 border-t-4 border-t-blue-500 shadow-sm rounded-xl overflow-hidden">
                                <CardBody className="p-0">
                                    <ProfileInfoCard
                                        title="About Me"
                                        description="Student account details and location information."
                                        details={{
                                            "Full Name": `${firstName} ${lastName}`.trim() || "—",
                                            "Email": user?.email || "—",
                                            "Gender": (user?.gender || "male").charAt(0).toUpperCase() + (user?.gender || "male").slice(1),
                                            "Role": "Student",
                                            "Location": "India",
                                        }}
                                        action={
                                            <Tooltip content="Edit Profile">
                                                <PencilIcon 
                                                    className="h-4 w-4 cursor-pointer text-blue-gray-500 hover:text-blue-500 transition-colors" 
                                                    onClick={() => setActiveTab("edit")}
                                                />
                                            </Tooltip>
                                        }
                                    />
                                </CardBody>
                            </div>
                         </motion.div>
                    </motion.div>
                )}

                {activeTab === "edit" && (
                     <EditForm
                        key="edit"
                        firstName={firstName}
                        lastName={lastName}
                        email={user?.email}
                        gender={gender}
                        setFirstName={setFirstName}
                        setLastName={setLastName}
                        setGender={setGender}
                        onSubmit={handleProfileUpdate}
                        saving={savingProfile}
                        error={editError}
                        success={editSuccess}
                    />
                )}

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

      </div>
    </div>
  );
}

export default Profile;