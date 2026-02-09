import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  CardHeader,
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
  CheckCircleIcon
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
      // COMPACT: Reduced gap
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full"
    >
      {/* LEFT: Name */}
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full w-full border border-blue-gray-50 dark:border-gray-800 bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm flex flex-col">
          {/* COMPACT: Reduced Padding p-3 */}
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-3 border-b border-blue-gray-50 dark:border-gray-700/50">
            <Typography variant="h6" color="blue-gray" className="dark:text-gray-100 flex items-center gap-2 text-sm">
              <UserCircleIcon className="h-4 w-4 text-blue-500" />
              Personal Details
            </Typography>
          </CardHeader>
          {/* COMPACT: Reduced Padding p-4, Reduced Gap gap-3 */}
          <CardBody className="p-4 flex flex-col gap-3 flex-1">
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert color="red" className="py-2 px-3 text-xs" icon={<ExclamationTriangleIcon className="h-4 w-4" />}>{error}</Alert>
                    </motion.div>
                )}
                {success && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert color="green" className="py-2 px-3 text-xs" icon={<CheckCircleIcon className="h-4 w-4" />}>{success}</Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <Input
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
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
          </CardBody>
        </Card>
      </motion.div>

      {/* RIGHT: Contact + Gender */}
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full w-full border border-blue-gray-50 dark:border-gray-800 bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm flex flex-col">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-3 border-b border-blue-gray-50 dark:border-gray-700/50">
            <Typography variant="h6" color="blue-gray" className="dark:text-gray-100 flex items-center gap-2 text-sm">
               <PencilIcon className="h-4 w-4 text-purple-500" />
               Preferences
            </Typography>
          </CardHeader>

          <form onSubmit={onSubmit} className="flex flex-col h-full flex-1">
            <CardBody className="p-4 flex flex-col gap-3 flex-1">
              <Input
                label="Email Address"
                value={email || ""}
                disabled
                className="!border-t-blue-gray-200 focus:!border-t-gray-900 dark:text-gray-400"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                containerProps={{ className: "opacity-70 cursor-not-allowed" }}
              />

              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold dark:text-gray-200 mb-2">
                  Gender
                </Typography>
                <div className="flex gap-4">
                  <Radio
                    name="gender"
                    label="Male"
                    value="male"
                    checked={gender === "male"}
                    onChange={(e) => setGender(e.target.value)}
                    color="blue"
                    labelProps={{ className: "dark:text-gray-300 font-medium text-sm" }}
                  />
                  <Radio
                    name="gender"
                    label="Female"
                    value="female"
                    checked={gender === "female"}
                    onChange={(e) => setGender(e.target.value)}
                    color="pink"
                    labelProps={{ className: "dark:text-gray-300 font-medium text-sm" }}
                  />
                </div>
              </div>
            </CardBody>
            
            <div className="p-4 pt-0 mt-auto">
                <Button
                    type="submit"
                    variant="gradient"
                    color="blue"
                    fullWidth
                    size="sm"
                    disabled={saving}
                    className="flex items-center justify-center gap-2"
                >
                    {saving ? <Spinner className="h-3 w-3" /> : "Save Changes"}
                </Button>
            </div>
          </form>
        </Card>
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
      className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full"
    >
      {/* LEFT: Password Change */}
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full w-full border border-blue-gray-50 dark:border-gray-800 bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm flex flex-col">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-3 border-b border-blue-gray-50 dark:border-gray-700/50">
              <Typography variant="h6" color="blue-gray" className="dark:text-gray-100 flex items-center gap-2 text-sm">
                <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                Password & Security
            </Typography>
          </CardHeader>

          <form onSubmit={onChangePassword} className="flex flex-col h-full flex-1">
            <CardBody className="p-4 flex flex-col gap-3 flex-1">
               <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert color="red" className="py-2 px-3 text-xs" icon={<ExclamationTriangleIcon className="h-4 w-4" />}>{error}</Alert>
                    </motion.div>
                )}
                {success && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert color="green" className="py-2 px-3 text-xs" icon={<CheckCircleIcon className="h-4 w-4" />}>{success}</Alert>
                    </motion.div>
                )}
               </AnimatePresence>

              <Input
                type="password"
                label="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                disabled={changing}
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
                disabled={changing}
                color="blue"
                className="dark:text-white"
                labelProps={{ className: "dark:text-gray-400" }}
              />
            </CardBody>
            <div className="p-4 pt-0 mt-auto">
                  <Button
                    type="submit"
                    variant="gradient"
                    color="gray"
                    fullWidth
                    size="sm"
                    disabled={changing}
                    className="flex items-center justify-center gap-2"
                >
                    {changing ? <Spinner className="h-3 w-3" /> : "Update Password"}
                </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* RIGHT: Danger Zone */}
      <motion.div variants={itemVariants} className="h-full">
        <Card className="h-full w-full border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10 backdrop-blur-sm shadow-none flex flex-col">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-3 border-b border-red-100 dark:border-red-900/30">
              <Typography variant="h6" color="red" className="flex items-center gap-2 text-sm">
                <ExclamationTriangleIcon className="h-4 w-4" />
                Danger Zone
            </Typography>
          </CardHeader>

          <CardBody className="p-4 flex flex-col justify-between flex-1 gap-2">
            <div className="rounded-lg bg-white/60 dark:bg-black/20 p-3 border border-red-100 dark:border-red-900/20">
               <Typography variant="small" className="font-bold text-red-900 dark:text-red-200 mb-1 text-xs">
                 Before you delete:
               </Typography>
               <ul className="list-disc pl-4 text-[10px] text-red-800/80 dark:text-red-300/80 space-y-0.5">
                 <li>All your practice history will be lost.</li>
                 <li>Any active subscriptions will be cancelled.</li>
                 <li>This action cannot be undone.</li>
               </ul>
            </div>

            <div className="mt-auto">
              <Button
                variant="outlined"
                color="red"
                size="sm"
                fullWidth
                onClick={onDeleteAccount}
                disabled={deleting}
                className="bg-white hover:bg-red-50 focus:ring-red-200 dark:bg-transparent dark:hover:bg-red-900/20"
              >
                {deleting ? <Spinner className="h-3 w-3 mx-auto text-red-500" /> : "Delete My Account"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ================================ Page ================================ */
export function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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

  useEffect(() => {
    setEditError(null);
    setEditSuccess(null);
    setSecError(null);
    setSecSuccess(null);
  }, [activeTab]);

  const maleAvatar = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-circle-icon.png";
  const femaleAvatar = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/woman-user-circle-icon.png";
  const avatarSrc = (gender || user?.gender) === "female" ? femaleAvatar : maleAvatar;

  // --- Handlers ---

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setEditError(null);
    setEditSuccess(null);
    
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      const res = await axios.put(`${BASE_URL}/api/students/profile`, { firstName, lastName, gender }, config);

      try {
        if(updateUser && res.data) updateUser(res.data);
      } catch (ctxErr) { console.warn("Context update warning:", ctxErr); }

      setEditSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      let msg = "Failed to update profile.";
      if (err.response?.data) {
        const data = err.response.data;
        msg = typeof data === "string" ? data : (data.message || data.error || msg);
      }
      setEditError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setSecError(null);
    setSecSuccess(null);
    
    try {
        const token = localStorage.getItem("token");
        const config = { headers: { "Authorization": `Bearer ${token}` } };
        await axios.put(`${BASE_URL}/api/students/password`, { oldPassword, newPassword }, config);
        
        setSecSuccess("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
    } catch (err) {
        let msg = "Failed to change password.";
        if (err.response?.data) {
            const data = err.response.data;
            msg = typeof data === "string" ? data : (data.message || msg);
        }
        setSecError(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm("Are you sure? This cannot be undone.");
    if (!ok) return;
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

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden rounded-xl border border-blue-gray-50 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      
      {/* Background Gradient */}
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

      {/* Main Content Area: Reduced padding from p-6 to p-3 */}
      <div className="relative z-10 p-3 flex flex-col h-full w-full">
        
        {/* Banner Section: Reduced Height h-48 -> h-28 */}
        <div className="relative w-full shrink-0">
            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-80" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />
            </div>
            
            {/* Banner Content: Tighter negative margins */}
            <div className="px-4 -mt-10 flex items-end justify-between gap-4">
                <div className="flex items-end gap-3">
                    {/* Avatar: Size xl instead of xxl */}
                    <Avatar 
                        src={avatarSrc} 
                        alt="avatar" 
                        size="xl" 
                        variant="rounded"
                        className="border-4 border-white dark:border-gray-900 bg-white shadow-lg" 
                    />
                    <div className="mb-1">
                        <Typography variant="h5" color="white" className="font-bold drop-shadow-md">
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="small" className="text-blue-50 font-medium text-xs">
                            {user?.email}
                        </Typography>
                    </div>
                </div>

                <div className="mb-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg p-1 shadow-sm border border-white/20 hidden md:block">
                      <Tabs value={activeTab} className="w-80">
                        <TabsHeader 
                            className="bg-transparent h-8"
                            indicatorProps={{ className: "bg-white dark:bg-gray-700 shadow-sm" }}
                        >
                            <Tab value="profile" onClick={() => setActiveTab("profile")} className="py-1 text-[10px] font-bold uppercase">
                                Profile
                            </Tab>
                            <Tab value="edit" onClick={() => setActiveTab("edit")} className="py-1 text-[10px] font-bold uppercase">
                                Edit
                            </Tab>
                            <Tab value="security" onClick={() => setActiveTab("security")} className="py-1 text-[10px] font-bold uppercase">
                                Security
                            </Tab>
                        </TabsHeader>
                    </Tabs>
                </div>
            </div>
            {/* Mobile Tabs fallback */}
            <div className="md:hidden mt-4">
                 <Tabs value={activeTab}>
                    <TabsHeader className="bg-blue-gray-50/50">
                        <Tab value="profile" onClick={() => setActiveTab("profile")}>Profile</Tab>
                        <Tab value="edit" onClick={() => setActiveTab("edit")}>Edit</Tab>
                        <Tab value="security" onClick={() => setActiveTab("security")}>Security</Tab>
                    </TabsHeader>
                 </Tabs>
            </div>
        </div>

        {/* Tab Content: Reduced top margin */}
        <div className="mt-3 flex-1 min-h-0 w-full">
            <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                    <motion.div
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                         <Card className="w-full h-full border border-blue-gray-50 dark:border-gray-800 bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm shadow-sm">
                            <CardBody className="p-4">
                                <ProfileInfoCard
                                    title="About Me"
                                    description="Student on AI Practice Platform."
                                    details={{
                                        "Full Name": `${firstName} ${lastName}`.trim() || "—",
                                        "Email": user?.email || "—",
                                        "Gender": (user?.gender || "male").charAt(0).toUpperCase() + (user?.gender || "male").slice(1),
                                        "Account Type": "Student",
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
                        </Card>
                    </motion.div>
                )}

                {activeTab === "edit" && (
                    <motion.div key="edit" className="w-full h-full">
                         <EditForm
                            firstName={firstName}
                            lastName={lastName}
                            email={user?.email}
                            gender={gender}
                            setFirstName={setFirstName}
                            setLastName={setLastName}
                            setGender={setGender}
                            onSubmit={handleProfileUpdate}
                            saving={savingProfile}
                            theme={theme}
                            error={editError}
                            success={editSuccess}
                        />
                    </motion.div>
                )}

                {activeTab === "security" && (
                    <motion.div key="security" className="w-full h-full">
                        <SecurityPanel
                            oldPassword={oldPassword}
                            newPassword={newPassword}
                            setOldPassword={setOldPassword}
                            setNewPassword={setNewPassword}
                            onChangePassword={handlePasswordChange}
                            changing={changingPassword}
                            onDeleteAccount={handleDeleteAccount}
                            deleting={deletingAccount}
                            theme={theme}
                            error={secError}
                            success={secSuccess}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

export default Profile;