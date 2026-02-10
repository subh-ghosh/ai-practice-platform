import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  Typography,
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
  UserCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  KeyIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileInfoCard } from "@/widgets/cards";
import { useAuth } from "@/context/AuthContext";

/* ============================ Config ============================ */
const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

// --- Animation Variants ---
const fadeVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -5, transition: { duration: 0.2 } },
};

/* ============================ Sub-Components ============================ */

function EditForm({ firstName, lastName, email, gender, setFirstName, setLastName, setGender, onSubmit, saving, error, success }) {
  return (
    <motion.form
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={onSubmit}
      className="flex flex-col gap-6 max-w-3xl mx-auto py-4"
    >
       {/* Alerts */}
       <AnimatePresence>
        {error && <Alert color="red" icon={<ExclamationTriangleIcon className="h-5 w-5"/>}>{error}</Alert>}
        {success && <Alert color="green" icon={<CheckCircleIcon className="h-5 w-5"/>}>{success}</Alert>}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} size="lg" className="dark:text-white" labelProps={{ className: "dark:text-gray-400" }} />
        <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} size="lg" className="dark:text-white" labelProps={{ className: "dark:text-gray-400" }} />
      </div>

      <Input label="Email Address" value={email || ""} disabled size="lg" className="!border-blue-gray-100 bg-blue-gray-50/50 text-blue-gray-500 dark:bg-gray-800/50 dark:text-gray-400 dark:!border-gray-700" labelProps={{ className: "dark:text-gray-500" }} icon={<UserCircleIcon className="h-5 w-5 text-blue-gray-300" />} />

      <div className="space-y-3">
        <Typography variant="small" className="font-semibold text-blue-gray-500 dark:text-gray-400">Gender</Typography>
        <div className="flex gap-10">
          <Radio name="gender" label="Male" value="male" checked={gender === "male"} onChange={(e) => setGender(e.target.value)} color="blue" labelProps={{ className: "dark:text-gray-300" }} />
          <Radio name="gender" label="Female" value="female" checked={gender === "female"} onChange={(e) => setGender(e.target.value)} color="pink" labelProps={{ className: "dark:text-gray-300" }} />
        </div>
      </div>

      <Button type="submit" variant="gradient" color="blue" disabled={saving} className="flex items-center justify-center gap-2 mt-4">
        {saving ? <Spinner className="h-4 w-4" /> : "Save Changes"}
      </Button>
    </motion.form>
  );
}

function SecurityPanel({ oldPassword, newPassword, setOldPassword, setNewPassword, onChangePassword, changing, onDeleteAccount, deleting, error, success }) {
  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="max-w-3xl mx-auto py-4 space-y-8">
      
      {/* Password Form */}
      <form onSubmit={onChangePassword} className="flex flex-col gap-6">
         <AnimatePresence>
            {(error || success) && (
              <Alert color={error ? "red" : "green"} icon={error ? <ExclamationTriangleIcon className="h-5 w-5"/> : <CheckCircleIcon className="h-5 w-5"/>}>
                {error || success}
              </Alert>
            )}
         </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input type="password" label="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required disabled={changing} className="dark:text-white" labelProps={{ className: "dark:text-gray-400" }} />
          <Input type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={changing} className="dark:text-white" labelProps={{ className: "dark:text-gray-400" }} />
        </div>
        <Button type="submit" variant="outlined" color="blue-gray" disabled={changing} className="flex items-center justify-center gap-2 dark:text-white dark:border-gray-600">
            {changing ? <Spinner className="h-4 w-4" /> : "Update Password"}
        </Button>
      </form>

      {/* Delete Account */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="rounded-lg border border-red-100 bg-red-50/30 p-4 dark:bg-red-900/10 dark:border-red-900/30 flex items-center justify-between gap-4">
          <div>
            <Typography variant="small" color="blue-gray" className="font-bold dark:text-red-200">Delete Account</Typography>
            <Typography variant="small" className="text-gray-600 dark:text-red-200/60">Irreversible action.</Typography>
          </div>
          <Button variant="gradient" color="red" size="sm" onClick={onDeleteAccount} disabled={deleting}>
            {deleting ? <Spinner className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ViewProfile({ user, onEdit }) {
  return (
    <motion.div variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="max-w-4xl mx-auto">
      <ProfileInfoCard
        title="Profile Information"
        description={`Hi, ${user?.firstName}, here are your details.`}
        details={{
          "First Name": user?.firstName,
          "Last Name": user?.lastName,
          "Email": user?.email,
          "Gender": user?.gender,
          "Region": "India",
        }}
        action={<Button size="sm" variant="text" onClick={onEdit} className="flex items-center gap-2">Edit Profile</Button>}
      />
    </motion.div>
  );
}

/* ================================ Main Page ================================ */
export function Profile() {
  const { user, updateUser, logout } = useAuth();
  
  // State
  const [activeTab, setActiveTab] = useState("overview");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [gender, setGender] = useState(user?.gender || "male");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Loading & Alerts
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);
  const [secError, setSecError] = useState(null);
  const [secSuccess, setSecSuccess] = useState(null);

  useEffect(() => {
     if(user) { setFirstName(user.firstName); setLastName(user.lastName); setGender(user.gender); }
  }, [user]);

  // Handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true); setEditError(null); setEditSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${BASE_URL}/api/students/profile`, { firstName, lastName, gender }, { headers: { Authorization: `Bearer ${token}` } });
      if (updateUser) updateUser(res.data);
      setEditSuccess("Profile updated!");
    } catch (err) { setEditError(err.response?.data?.message || "Error updating."); }
    finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true); setSecError(null); setSecSuccess(null);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/students/password`, { oldPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      setSecSuccess("Password updated!"); setOldPassword(""); setNewPassword("");
    } catch (err) { setSecError(err.response?.data?.message || "Error changing password."); }
    finally { setChangingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure?")) return;
    setDeletingAccount(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/students/account`, { headers: { Authorization: `Bearer ${token}` } });
      logout();
    } catch { setSecError("Failed to delete."); setDeletingAccount(false); }
  };

  const tabData = [
    { label: "Overview", value: "overview", icon: UserCircleIcon },
    { label: "Edit Profile", value: "edit", icon: PencilSquareIcon },
    { label: "Security", value: "security", icon: ShieldCheckIcon },
  ];

  return (
    // Outer page container
    <div className="w-full h-[calc(100vh-2rem)] p-6 flex flex-col overflow-hidden">
      
      {/* ONE SINGLE BOX for Everything */}
      <div className="flex flex-col flex-1 w-full bg-white dark:bg-[#111c44] border border-blue-gray-50 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        
        {/* 1. HEADER section (Fixed at top of box) */}
        <div className="p-6 pb-0 shrink-0">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Typography variant="h5" color="blue-gray" className="dark:text-white">
                        Profile Settings
                    </Typography>
                    <Typography className="text-gray-500 font-normal mt-1">
                        Manage your account settings and preferences.
                    </Typography>
                </div>
                {/* User Pill */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <div>
                        <Typography variant="small" className="font-bold dark:text-gray-200">
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="small" className="text-gray-500 text-[10px]">
                            Student Account
                        </Typography>
                    </div>
                </div>
            </div>

            {/* Horizontal Tabs */}
            <div className="w-full md:w-auto">
                <Tabs value={activeTab} className="bg-transparent">
                    <TabsHeader 
                        className="bg-gray-100/50 dark:bg-gray-900/50 p-1 min-w-[300px]"
                        indicatorProps={{ className: "bg-white dark:bg-gray-800 shadow-sm" }}
                    >
                        {tabData.map(({ label, value, icon: Icon }) => (
                            <Tab 
                                key={value} 
                                value={value} 
                                onClick={() => setActiveTab(value)}
                                className={activeTab === value ? "text-blue-500 dark:text-blue-400 font-medium" : "text-gray-500 dark:text-gray-400"}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </div>
                            </Tab>
                        ))}
                    </TabsHeader>
                </Tabs>
            </div>
            
            <div className="h-px bg-gray-200 dark:bg-gray-800 mt-4" />
        </div>

        {/* 2. SCROLLABLE CONTENT (Middle section) */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
            <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                    <ViewProfile key="overview" user={user} onEdit={() => setActiveTab("edit")} />
                )}
                {activeTab === "edit" && (
                    <EditForm 
                        key="edit"
                        firstName={firstName} setFirstName={setFirstName}
                        lastName={lastName} setLastName={setLastName}
                        email={user?.email} gender={gender} setGender={setGender}
                        onSubmit={handleProfileUpdate} saving={savingProfile}
                        error={editError} success={editSuccess}
                    />
                )}
                {activeTab === "security" && (
                    <SecurityPanel 
                        key="security"
                        oldPassword={oldPassword} setOldPassword={setOldPassword}
                        newPassword={newPassword} setNewPassword={setNewPassword}
                        onChangePassword={handlePasswordChange} changing={changingPassword}
                        onDeleteAccount={handleDeleteAccount} deleting={deletingAccount}
                        error={secError} success={secSuccess}
                    />
                )}
            </AnimatePresence>
        </div>

        {/* 3. STATIC FOOTER (Fixed at bottom of box) */}
        <div className="shrink-0 p-4 border-t border-blue-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0f193d] text-center z-10">
            <Typography variant="small" className="font-normal text-gray-500">
                &copy; 2026, made by Subarta Ghosh
            </Typography>
        </div>

      </div>
    </div>
  );
}

export default Profile;