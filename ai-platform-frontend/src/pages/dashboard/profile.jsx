import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
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

/* ============================ Custom Components ============================ */

// 1. High Visibility Input (Opaque background, clear border)
const CustomInput = ({ label, ...props }) => (
  <div className="w-full">
    <Input
      variant="outlined"
      label={label}
      color="blue"
      className="!border-blue-gray-300 dark:!border-gray-600 !bg-white dark:!bg-gray-800 text-blue-gray-900 dark:text-white focus:!border-blue-600 focus:!bg-white ring-4 ring-transparent focus:ring-blue-500/10 shadow-sm"
      labelProps={{
        className: "text-blue-gray-600 dark:text-gray-400 peer-placeholder-shown:text-blue-gray-500",
      }}
      {...props}
    />
  </div>
);

/* ============================ Tab Views ============================ */

// 1. Profile View
function ProfileView({ user, onEdit }) {
  const details = [
    { label: "Full Name", value: `${user?.firstName} ${user?.lastName}`, icon: UserCircleIcon },
    { label: "Email", value: user?.email, icon: EnvelopeIcon },
    { label: "Role", value: "Student", icon: IdentificationIcon },
    { label: "Location", value: "India", icon: MapPinIcon },
    { label: "Gender", value: (user?.gender || "Male"), icon: UserCircleIcon },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="h-full w-full flex flex-col"
    >
      <Card className="flex-1 w-full border border-blue-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-none flex flex-col overflow-hidden">
        <CardHeader floated={false} shadow={false} className="m-0 p-4 shrink-0 border-b border-blue-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
          <Typography variant="h6" className="dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
            <UserCircleIcon className="h-5 w-5 text-blue-600" />
            About Me
          </Typography>
        </CardHeader>
        
        <CardBody className="p-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {details.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-blue-gray-50/50 dark:bg-gray-800 border border-blue-gray-100 dark:border-gray-700">
                    <div className="p-2 rounded-full bg-white dark:bg-gray-900 shadow-sm shrink-0">
                      <item.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <Typography variant="small" className="text-[10px] uppercase font-bold text-blue-gray-500 dark:text-gray-400">
                        {item.label}
                      </Typography>
                      <Typography variant="h6" className="text-sm dark:text-gray-100 font-semibold text-blue-gray-900">
                        {item.value}
                      </Typography>
                    </div>
                </div>
             ))}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
             <Typography variant="small" className="text-blue-800 dark:text-blue-200 font-medium text-center">
                "Consistency is the key to mastery."
             </Typography>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// 2. Edit View
function EditForm({ firstName, lastName, email, gender, setFirstName, setLastName, setGender, onSubmit, saving, error, success }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="h-full w-full"
    >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Left Card */}
            <Card className="h-full flex flex-col border border-blue-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-none overflow-hidden">
                <CardHeader floated={false} shadow={false} className="m-0 p-4 shrink-0 border-b border-blue-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                    <Typography variant="h6" className="dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                        <UserCircleIcon className="h-5 w-5 text-blue-600" /> Personal
                    </Typography>
                </CardHeader>
                <CardBody className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
                    <AnimatePresence>
                        {(error || success) && (
                            <Alert color={error ? "red" : "green"} variant="ghost" className="py-2 px-3 text-xs flex items-center gap-2">
                                {error || success}
                            </Alert>
                        )}
                    </AnimatePresence>
                    <CustomInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    <CustomInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </CardBody>
            </Card>

            {/* Right Card */}
            <Card className="h-full flex flex-col border border-blue-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-none overflow-hidden">
                <CardHeader floated={false} shadow={false} className="m-0 p-4 shrink-0 border-b border-blue-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                    <Typography variant="h6" className="dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                        <PencilIcon className="h-5 w-5 text-purple-500" /> Preferences
                    </Typography>
                </CardHeader>
                <CardBody className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
                     <CustomInput label="Email" value={email || ""} disabled />
                     <div className="p-3 rounded-lg border border-blue-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <Typography variant="small" className="font-bold text-blue-gray-900 dark:text-gray-200 mb-2">Gender</Typography>
                        <div className="flex gap-4">
                            <Radio name="gender" label="Male" value="male" checked={gender === "male"} onChange={(e) => setGender(e.target.value)} color="blue" />
                            <Radio name="gender" label="Female" value="female" checked={gender === "female"} onChange={(e) => setGender(e.target.value)} color="pink" />
                        </div>
                    </div>
                </CardBody>
                <div className="p-4 pt-0 mt-auto shrink-0">
                    <Button onClick={onSubmit} variant="gradient" color="blue" fullWidth disabled={saving} className="h-9 shadow-blue-500/20">
                        {saving ? <Spinner className="h-4 w-4 mx-auto" /> : "Save Changes"}
                    </Button>
                </div>
            </Card>
        </div>
    </motion.div>
  );
}

// 3. Security View
function SecurityPanel({ oldPassword, newPassword, setOldPassword, setNewPassword, onChangePassword, changing, onDeleteAccount, deleting, error, success }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="h-full w-full"
    >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Password Card */}
            <Card className="h-full flex flex-col border border-blue-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-none overflow-hidden">
                <CardHeader floated={false} shadow={false} className="m-0 p-4 shrink-0 border-b border-blue-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                    <Typography variant="h6" className="dark:text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                        <ShieldCheckIcon className="h-5 w-5 text-green-600" /> Password
                    </Typography>
                </CardHeader>
                <CardBody className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
                    <AnimatePresence>
                        {(error || success) && (
                            <Alert color={error ? "red" : "green"} variant="ghost" className="py-2 px-3 text-xs flex items-center gap-2">
                                {error || success}
                            </Alert>
                        )}
                    </AnimatePresence>
                    <CustomInput type="password" label="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} disabled={changing} />
                    <CustomInput type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={changing} />
                </CardBody>
                <div className="p-4 pt-0 mt-auto shrink-0">
                     <Button onClick={onChangePassword} variant="gradient" color="gray" fullWidth disabled={changing} className="h-9">
                        {changing ? <Spinner className="h-4 w-4 mx-auto" /> : "Update Password"}
                    </Button>
                </div>
            </Card>

            {/* Delete Card */}
            <Card className="h-full flex flex-col border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10 shadow-none overflow-hidden">
                <CardHeader floated={false} shadow={false} className="m-0 p-4 shrink-0 border-b border-red-100 dark:border-red-900/30">
                    <Typography variant="h6" color="red" className="flex items-center gap-2 text-sm uppercase tracking-wide">
                        <ExclamationTriangleIcon className="h-5 w-5" /> Danger Zone
                    </Typography>
                </CardHeader>
                <CardBody className="p-4 flex-1 overflow-y-auto flex flex-col justify-between">
                    <div className="rounded-lg bg-white/80 dark:bg-black/40 p-4 border border-red-100 dark:border-red-900/30">
                       <Typography variant="small" className="font-bold text-red-900 dark:text-red-200 mb-1">
                         Delete Account
                       </Typography>
                       <Typography variant="small" className="text-red-800/80 dark:text-red-300/80 text-[11px] leading-snug">
                         This action cannot be undone. All data will be lost.
                       </Typography>
                    </div>
                    <Button variant="outlined" color="red" fullWidth onClick={onDeleteAccount} disabled={deleting} className="mt-4 bg-white dark:bg-transparent h-9 border-red-200">
                        {deleting ? <Spinner className="h-4 w-4 mx-auto text-red-500" /> : "Delete My Account"}
                    </Button>
                </CardBody>
            </Card>
        </div>
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

  // -- Handlers --
  const handleProfileUpdate = async (e) => {
    e.preventDefault(); setSavingProfile(true); setEditError(null); setEditSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      const res = await axios.put(`${BASE_URL}/api/students/profile`, { firstName, lastName, gender }, config);
      if(updateUser && res.data) updateUser(res.data);
      setEditSuccess("Updated!");
    } catch (err) { setEditError("Update failed."); } finally { setSavingProfile(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault(); setChangingPassword(true); setSecError(null); setSecSuccess(null);
    try {
        const token = localStorage.getItem("token");
        const config = { headers: { "Authorization": `Bearer ${token}` } };
        await axios.put(`${BASE_URL}/api/students/password`, { oldPassword, newPassword }, config);
        setSecSuccess("Password updated!"); setOldPassword(""); setNewPassword("");
    } catch (err) { setSecError("Update failed."); } finally { setChangingPassword(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure?")) return;
    setDeletingAccount(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/students/account`, { headers: { "Authorization": `Bearer ${token}` } });
      logout();
    } catch { setSecError("Delete failed."); setDeletingAccount(false); }
  };

  return (
    // MAIN CONTAINER: Fixed Height (600px) + Max Width (4xl)
    // This creates the "Small Box" effect that matches other cards.
    <div className="relative w-full max-w-4xl mx-auto h-[600px] mt-6 flex flex-col overflow-hidden rounded-2xl border border-blue-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-400/10 blur-[100px]" />
        <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-400/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full w-full">
        
        {/* Banner - Compact */}
        <div className="relative w-full shrink-0">
            <div className="relative h-24 w-full bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-purple-800" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
            </div>
            
            <div className="px-6 -mt-8 flex items-end justify-between gap-4">
                <div className="flex items-end gap-3">
                    <Avatar 
                        src={avatarSrc} 
                        alt="avatar" 
                        size="lg" 
                        variant="rounded"
                        className="border-4 border-white dark:border-gray-900 bg-white shadow-md" 
                    />
                    <div className="mb-1">
                        <Typography variant="h6" className="font-bold text-blue-gray-900 dark:text-white">
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="small" className="text-gray-500 font-medium text-[10px]">
                            {user?.email}
                        </Typography>
                    </div>
                </div>

                {/* Desktop Tabs */}
                <div className="mb-0 hidden md:block">
                      <Tabs value={activeTab} className="w-auto">
                        <TabsHeader 
                            className="bg-blue-gray-50/80 p-1 h-9"
                            indicatorProps={{ className: "bg-white shadow-sm" }}
                        >
                            <Tab value="profile" onClick={() => setActiveTab("profile")} className="text-xs px-4 py-1 font-bold">Profile</Tab>
                            <Tab value="edit" onClick={() => setActiveTab("edit")} className="text-xs px-4 py-1 font-bold">Edit</Tab>
                            <Tab value="security" onClick={() => setActiveTab("security")} className="text-xs px-4 py-1 font-bold">Security</Tab>
                        </TabsHeader>
                    </Tabs>
                </div>
            </div>
            
            {/* Mobile Tabs */}
            <div className="md:hidden mt-3 px-4">
                 <Tabs value={activeTab}>
                    <TabsHeader className="bg-blue-gray-50 h-9">
                        <Tab value="profile" onClick={() => setActiveTab("profile")} className="text-xs">Profile</Tab>
                        <Tab value="edit" onClick={() => setActiveTab("edit")} className="text-xs">Edit</Tab>
                        <Tab value="security" onClick={() => setActiveTab("security")} className="text-xs">Security</Tab>
                    </TabsHeader>
                 </Tabs>
            </div>
        </div>

        {/* Content Area - Rigid Height */}
        <div className="flex-1 min-h-0 w-full p-4 overflow-hidden relative">
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