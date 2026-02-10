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
  CheckCircleIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider.jsx";

/* ============================ Config ============================ */
const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

/* ============================ Custom Components ============================ */

// 1. Better looking Input Field wrapper
const CustomInput = ({ label, ...props }) => (
  <div className="w-full">
    <Input
      variant="outlined"
      label={label}
      color="blue"
      className="text-blue-gray-900 dark:text-white bg-white/50 dark:bg-black/20 border-blue-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
      labelProps={{
        className: "text-blue-gray-500 dark:text-gray-400 peer-placeholder-shown:text-blue-gray-500",
      }}
      containerProps={{ className: "min-w-[100px]" }}
      {...props}
    />
  </div>
);

// 2. Profile Details Row (for the Read-Only tab)
const ProfileDetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-gray-50/50 dark:bg-gray-800/30 border border-blue-gray-50 dark:border-gray-700/50">
    <div className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm shrink-0">
      <Icon className="h-5 w-5 text-blue-500" />
    </div>
    <div className="flex flex-col">
      <Typography variant="small" className="font-normal text-blue-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wide">
        {label}
      </Typography>
      <Typography variant="h6" color="blue-gray" className="dark:text-gray-100 text-sm font-medium">
        {value}
      </Typography>
    </div>
  </div>
);

/* ============================ Tab Components ============================ */

// --- TAB 1: Read-Only Profile (Stretched to fit height) ---
function ProfileView({ user, onEdit }) {
  const details = [
    { label: "Full Name", value: `${user?.firstName} ${user?.lastName}`, icon: UserCircleIcon },
    { label: "Email Address", value: user?.email, icon: EnvelopeIcon },
    { label: "Account Type", value: "Student", icon: IdentificationIcon },
    { label: "Location", value: "India", icon: MapPinIcon },
    { label: "Gender", value: (user?.gender || "Male"), icon: UserCircleIcon }, // capitalized in UI
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="h-full w-full">
      <Card className="h-full w-full border border-blue-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm flex flex-col">
        <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-4 border-b border-blue-gray-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
          <Typography variant="h6" color="blue-gray" className="dark:text-white flex items-center gap-2">
            <UserCircleIcon className="h-5 w-5 text-blue-500" />
            About Me
          </Typography>
          <Tooltip content="Edit Profile">
             <Button size="sm" variant="text" className="flex items-center gap-2" onClick={onEdit}>
                <PencilIcon className="h-4 w-4" /> Edit
             </Button>
          </Tooltip>
        </CardHeader>
        
        <CardBody className="p-6 flex-1 overflow-y-auto">
          <Typography variant="paragraph" className="mb-6 font-normal text-blue-gray-500 dark:text-gray-400">
            Student on AI Practice Platform. Managing learning goals and tracking progress.
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {details.map((item, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <ProfileDetailRow {...item} />
                </motion.div>
             ))}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// --- TAB 2: Edit Form (Split Grid) ---
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
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full"
    >
      {/* LEFT COL */}
      <motion.div variants={itemVariants} className="h-full flex flex-col">
        <Card className="h-full border border-blue-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm flex flex-col">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-4 border-b border-blue-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
            <Typography variant="h6" className="dark:text-white flex items-center gap-2">
              <UserCircleIcon className="h-5 w-5 text-blue-500" />
              Personal Details
            </Typography>
          </CardHeader>
          <CardBody className="p-6 flex flex-col gap-5 flex-1">
             <AnimatePresence>
                {(error || success) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert color={error ? "red" : "green"} className="py-2 px-3 text-xs" icon={error ? <ExclamationTriangleIcon className="h-4 w-4"/> : <CheckCircleIcon className="h-4 w-4"/>}>
                            {error || success}
                        </Alert>
                    </motion.div>
                )}
             </AnimatePresence>
             <CustomInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
             <CustomInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </CardBody>
        </Card>
      </motion.div>

      {/* RIGHT COL */}
      <motion.div variants={itemVariants} className="h-full flex flex-col">
        <Card className="h-full border border-blue-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm flex flex-col">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-4 border-b border-blue-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
            <Typography variant="h6" className="dark:text-white flex items-center gap-2">
               <PencilIcon className="h-5 w-5 text-purple-500" />
               Preferences
            </Typography>
          </CardHeader>

          <form onSubmit={onSubmit} className="flex flex-col h-full flex-1">
            <CardBody className="p-6 flex flex-col gap-5 flex-1">
              <CustomInput label="Email Address" value={email || ""} disabled />
              
              <div className="p-3 rounded-lg border border-blue-gray-100 dark:border-gray-700/50 bg-blue-gray-50/20 dark:bg-black/20">
                <Typography variant="small" className="font-semibold dark:text-gray-200 mb-2">Gender</Typography>
                <div className="flex gap-6">
                  <Radio name="gender" label="Male" value="male" checked={gender === "male"} onChange={(e) => setGender(e.target.value)} color="blue" labelProps={{ className: "dark:text-gray-300" }} />
                  <Radio name="gender" label="Female" value="female" checked={gender === "female"} onChange={(e) => setGender(e.target.value)} color="pink" labelProps={{ className: "dark:text-gray-300" }} />
                </div>
              </div>
            </CardBody>
            
            <div className="p-6 pt-0 mt-auto">
                <Button type="submit" variant="gradient" color="blue" fullWidth className="flex items-center justify-center gap-2 shadow-blue-500/20">
                    {saving ? <Spinner className="h-4 w-4" /> : "Save Changes"}
                </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// --- TAB 3: Security (Split Grid) ---
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
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full"
    >
      <motion.div variants={itemVariants} className="h-full flex flex-col">
        <Card className="h-full border border-blue-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm flex flex-col">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-4 border-b border-blue-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
              <Typography variant="h6" className="dark:text-white flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                Password Update
            </Typography>
          </CardHeader>

          <form onSubmit={onChangePassword} className="flex flex-col h-full flex-1">
            <CardBody className="p-6 flex flex-col gap-5 flex-1">
               <AnimatePresence>
                {(error || success) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Alert color={error ? "red" : "green"} className="py-2 px-3 text-xs" icon={error ? <ExclamationTriangleIcon className="h-4 w-4"/> : <CheckCircleIcon className="h-4 w-4"/>}>
                            {error || success}
                        </Alert>
                    </motion.div>
                )}
               </AnimatePresence>
              <CustomInput type="password" label="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required disabled={changing} />
              <CustomInput type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={changing} />
            </CardBody>
            <div className="p-6 pt-0 mt-auto">
                  <Button type="submit" variant="gradient" color="gray" fullWidth disabled={changing} className="flex items-center justify-center gap-2">
                    {changing ? <Spinner className="h-4 w-4" /> : "Update Password"}
                </Button>
            </div>
          </form>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="h-full flex flex-col">
        <Card className="h-full border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10 shadow-none flex flex-col">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-4 border-b border-red-100 dark:border-red-900/30">
              <Typography variant="h6" color="red" className="flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Danger Zone
            </Typography>
          </CardHeader>

          <CardBody className="p-6 flex flex-col justify-between flex-1 gap-4">
            <div className="rounded-lg bg-white/60 dark:bg-black/20 p-4 border border-red-100 dark:border-red-900/20">
               <Typography variant="small" className="font-bold text-red-900 dark:text-red-200 mb-2">
                 Permanently Delete Account
               </Typography>
               <Typography variant="small" className="text-red-800/80 dark:text-red-300/80 text-xs leading-relaxed">
                 All your practice history will be lost. Any active subscriptions will be cancelled immediately. This action cannot be undone.
               </Typography>
            </div>

            <div className="mt-auto">
              <Button variant="outlined" color="red" fullWidth onClick={onDeleteAccount} disabled={deleting} className="bg-white hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-900/20 border-red-200 dark:border-red-800">
                {deleting ? <Spinner className="h-4 w-4 mx-auto text-red-500" /> : "Delete My Account"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ================================ Main Page ================================ */
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
    setEditError(null); setEditSuccess(null); setSecError(null); setSecSuccess(null);
  }, [activeTab]);

  const maleAvatar = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-circle-icon.png";
  const femaleAvatar = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/woman-user-circle-icon.png";
  const avatarSrc = (gender || user?.gender) === "female" ? femaleAvatar : maleAvatar;

  // --- Handlers (Same as before) ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault(); setSavingProfile(true); setEditError(null); setEditSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      const res = await axios.put(`${BASE_URL}/api/students/profile`, { firstName, lastName, gender }, config);
      if(updateUser && res.data) updateUser(res.data);
      setEditSuccess("Profile updated successfully!");
    } catch (err) {
      setEditError("Failed to update profile.");
    } finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault(); setChangingPassword(true); setSecError(null); setSecSuccess(null);
    try {
        const token = localStorage.getItem("token");
        const config = { headers: { "Authorization": `Bearer ${token}` } };
        await axios.put(`${BASE_URL}/api/students/password`, { oldPassword, newPassword }, config);
        setSecSuccess("Password changed successfully!"); setOldPassword(""); setNewPassword("");
    } catch (err) { setSecError("Failed to change password."); } finally { setChangingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure?")) return;
    setDeletingAccount(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/students/account`, { headers: { "Authorization": `Bearer ${token}` } });
      logout();
    } catch { setSecError("Failed to delete account."); setDeletingAccount(false); }
  };

  return (
    // Fixed Height Container + Top Margin
    <div className="relative w-full h-[calc(100%-1.5rem)] mt-6 flex flex-col overflow-hidden rounded-xl border border-blue-gray-50 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 p-3 flex flex-col h-full w-full">
        
        {/* Banner */}
        <div className="relative w-full shrink-0">
            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-gray-900 shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
            </div>
            
            <div className="px-5 -mt-10 flex items-end justify-between gap-4">
                <div className="flex items-end gap-4">
                    <Avatar 
                        src={avatarSrc} 
                        alt="avatar" 
                        size="xl" 
                        variant="rounded"
                        className="border-[3px] border-white dark:border-gray-900 bg-white shadow-xl" 
                    />
                    <div className="mb-1.5">
                        <Typography variant="h5" color="white" className="font-bold drop-shadow-md tracking-tight">
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="small" className="text-blue-100/80 font-medium text-xs">
                            {user?.email}
                        </Typography>
                    </div>
                </div>

                <div className="mb-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg p-1 shadow-lg border border-white/20 hidden md:block">
                      <Tabs value={activeTab} className="w-80">
                        <TabsHeader 
                            className="bg-transparent h-8"
                            indicatorProps={{ className: "bg-gradient-to-r from-blue-500 to-purple-500 shadow-md text-white" }}
                        >
                            <Tab value="profile" onClick={() => setActiveTab("profile")} className={`py-1 text-[10px] font-bold uppercase transition-colors ${activeTab === 'profile' ? 'text-white' : ''}`}>Profile</Tab>
                            <Tab value="edit" onClick={() => setActiveTab("edit")} className={`py-1 text-[10px] font-bold uppercase transition-colors ${activeTab === 'edit' ? 'text-white' : ''}`}>Edit</Tab>
                            <Tab value="security" onClick={() => setActiveTab("security")} className={`py-1 text-[10px] font-bold uppercase transition-colors ${activeTab === 'security' ? 'text-white' : ''}`}>Security</Tab>
                        </TabsHeader>
                    </Tabs>
                </div>
            </div>
            
            {/* Mobile Tab Fallback */}
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

        {/* Dynamic Content Area (Fills remaining height) */}
        <div className="mt-4 flex-1 min-h-0 w-full">
            <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                    <ProfileView key="profile" user={user} onEdit={() => setActiveTab("edit")} />
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
                        theme={theme}
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
                        theme={theme}
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