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
  Avatar,
  List,
  ListItem,
  ListItemPrefix,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileInfoCard } from "@/widgets/cards";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider.jsx";

/* ============================ Config ============================ */
const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

// --- Animation Variants ---
const fadeVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 5, transition: { duration: 0.2 } },
};

/* ============================ Sub-Components ============================ */

// 1. Edit Profile Form
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
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto w-full"
    >
      <div className="mb-6">
        <Typography variant="h5" color="blue-gray" className="dark:text-white">
          Edit Personal Details
        </Typography>
        <Typography className="text-gray-600 font-normal dark:text-gray-400 text-sm">
          Update your public identity information.
        </Typography>
      </div>

      {/* Alerts Area - Fixed height wrapper to minimize layout jumps could be added here, 
          but scrolling container solves the main footer shift issue. */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <Alert color="red" icon={<ExclamationTriangleIcon className="h-5 w-5" />}>
              {error}
            </Alert>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <Alert color="green" icon={<CheckCircleIcon className="h-5 w-5" />}>
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            size="lg"
            color="blue"
            className="dark:text-white"
            labelProps={{ className: "dark:text-gray-400" }}
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            size="lg"
            color="blue"
            className="dark:text-white"
            labelProps={{ className: "dark:text-gray-400" }}
          />
        </div>

        <Input
          label="Email Address"
          value={email || ""}
          disabled
          size="lg"
          className="!border-blue-gray-100 bg-blue-gray-50/50 text-blue-gray-500 dark:bg-gray-800/50 dark:text-gray-400 dark:!border-gray-700"
          labelProps={{ className: "dark:text-gray-500" }}
          icon={<UserCircleIcon className="h-5 w-5 text-blue-gray-300" />}
        />

        <div className="space-y-3">
          <Typography variant="small" className="font-semibold text-blue-gray-500 dark:text-gray-400">
            Gender
          </Typography>
          <div className="flex gap-10">
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

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700/50">
          <Button
            type="submit"
            variant="gradient"
            color="blue"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? <Spinner className="h-4 w-4" /> : <PencilSquareIcon className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

// 2. Security & Password Form
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
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto w-full space-y-8"
    >
      {/* Password Section */}
      <div>
        <div className="mb-6">
          <Typography variant="h5" color="blue-gray" className="dark:text-white">
            Security Settings
          </Typography>
          <Typography className="text-gray-600 font-normal dark:text-gray-400 text-sm">
            Manage your password and authentication.
          </Typography>
        </div>

        <AnimatePresence>
          {(error || success) && (
            <motion.div
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <Alert
                color={error ? "red" : "green"}
                icon={error ? <ExclamationTriangleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}
              >
                {error || success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={onChangePassword} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="password"
              label="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={changing}
              icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
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
              icon={<KeyIcon className="h-5 w-5 text-gray-400" />}
              className="dark:text-white"
              labelProps={{ className: "dark:text-gray-400" }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="outlined"
              color="blue-gray"
              disabled={changing}
              className="flex items-center gap-2 dark:text-white dark:border-gray-600 hover:dark:bg-white/10"
            >
              {changing ? <Spinner className="h-4 w-4" /> : "Update Password"}
            </Button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <Typography variant="h6" color="red" className="mb-3 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5" /> Danger Zone
        </Typography>
        <div className="rounded-lg border border-red-100 bg-red-50/30 p-4 dark:bg-red-900/10 dark:border-red-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Typography variant="small" color="blue-gray" className="font-bold dark:text-red-200">
              Delete Account
            </Typography>
            <Typography variant="small" className="text-gray-600 dark:text-red-200/60">
              This action is irreversible. All data will be lost.
            </Typography>
          </div>
          <Button
            variant="gradient"
            color="red"
            size="sm"
            onClick={onDeleteAccount}
            disabled={deleting}
            className="shrink-0"
          >
            {deleting ? (
              <Spinner className="h-4 w-4 text-white" />
            ) : (
              <div className="flex items-center gap-2">
                <TrashIcon className="h-4 w-4" /> Delete Account
              </div>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// 3. View Profile (Read Only)
function ViewProfile({ user, onEditRequest }) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-4xl mx-auto w-full h-full"
    >
      <div className="flex justify-between items-end mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <Typography variant="h5" color="blue-gray" className="dark:text-white">
            Profile Overview
          </Typography>
          <Typography className="text-gray-600 font-normal dark:text-gray-400 text-sm">
            Your public profile information.
          </Typography>
        </div>
        <Button 
          size="sm" 
          variant="text" 
          className="flex items-center gap-2 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" 
          onClick={onEditRequest}
        >
          <PencilSquareIcon className="h-4 w-4" /> Edit
        </Button>
      </div>

      <ProfileInfoCard
        title=""
        description=""
        details={{
          "First Name": user?.firstName || "—",
          "Last Name": user?.lastName || "—",
          "Email": user?.email || "—",
          "Gender": (user?.gender || "male").charAt(0).toUpperCase() + (user?.gender || "male").slice(1),
          "Account Type": "Student",
          "Region": "India",
        }}
        action={null}
      />
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
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`${BASE_URL}/api/students/profile`, { firstName, lastName, gender }, config);
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
    setChangingPassword(true);
    setSecError(null);
    setSecSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${BASE_URL}/api/students/password`, { oldPassword, newPassword }, config);
      setSecSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
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
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${BASE_URL}/api/students/account`, config);
      logout();
    } catch {
      setSecError("Failed to delete account.");
      setDeletingAccount(false);
    }
  };

  const navItems = [
    { value: "profile", label: "Overview", icon: UserCircleIcon },
    { value: "edit", label: "Edit Profile", icon: PencilSquareIcon },
    { value: "security", label: "Security", icon: ShieldCheckIcon },
  ];

  return (
    // Outer container
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden">
      
      {/* Title / Header Section */}
      <div className="shrink-0">
         <Typography variant="h4" color="white" className="mb-1">
             Profile Settings
         </Typography>
         <Typography variant="small" className="text-gray-400 font-normal">
             Manage your personal information and account security.
         </Typography>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* LEFT SIDEBAR (Navigation) - Fixed width */}
        <Card className="w-full lg:w-72 shrink-0 h-fit border border-blue-gray-50 dark:border-gray-800 bg-white dark:bg-[#111c44] shadow-sm">
          <CardBody className="p-4 flex flex-col items-center gap-4">
             <Avatar
                src={avatarSrc}
                alt="avatar"
                size="xl"
                className="border-2 border-white dark:border-gray-600 shadow-md"
             />
             <div className="text-center mb-2">
                 <Typography variant="h6" color="blue-gray" className="dark:text-white">
                     {user?.firstName} {user?.lastName}
                 </Typography>
                 <Typography variant="small" className="text-gray-500 font-normal dark:text-gray-400">
                     Student Account
                 </Typography>
             </div>
             
             <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-1" />

             <List className="w-full min-w-0 p-0">
                {navItems.map(({ value, label, icon: Icon }) => (
                    <ListItem 
                        key={value}
                        onClick={() => setActiveTab(value)}
                        className={`p-3 rounded-lg transition-colors ${
                            activeTab === value 
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium" 
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                        }`}
                    >
                        <ListItemPrefix>
                            <Icon className="h-5 w-5" />
                        </ListItemPrefix>
                        {label}
                    </ListItem>
                ))}
                <ListItem 
                    onClick={logout}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 mt-2"
                >
                    <ListItemPrefix>
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </ListItemPrefix>
                    Sign Out
                </ListItem>
             </List>
          </CardBody>
        </Card>

        {/* RIGHT CONTENT AREA - Flex-1 to fill space */}
        {/* Added border and background here to match 'Notifications' page */}
        <div className="flex-1 flex flex-col min-w-0 rounded-xl border border-blue-gray-50 dark:border-gray-800 bg-white dark:bg-[#111c44] shadow-sm overflow-hidden">
             
             {/* SCROLLABLE CONTENT AREA 
                 This is the key fix: 'overflow-y-auto' is applied HERE. 
                 The footer below is OUTSIDE this div, so it stays pinned to the bottom.
             */}
             <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
                <AnimatePresence mode="wait">
                    {activeTab === "profile" && (
                        <ViewProfile key="profile" user={user} onEditRequest={() => setActiveTab("edit")} />
                    )}
                    {activeTab === "edit" && (
                        <EditForm 
                            key="edit"
                            firstName={firstName} setFirstName={setFirstName}
                            lastName={lastName} setLastName={setLastName}
                            email={user?.email}
                            gender={gender} setGender={setGender}
                            onSubmit={handleProfileUpdate}
                            saving={savingProfile}
                            error={editError}
                            success={editSuccess}
                        />
                    )}
                    {activeTab === "security" && (
                        <SecurityPanel 
                            key="security"
                            oldPassword={oldPassword} setOldPassword={setOldPassword}
                            newPassword={newPassword} setNewPassword={setNewPassword}
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

             {/* STATIC FOOTER (Inside the Card) - Ensures it never shifts */}
             <div className="shrink-0 p-4 border-t border-blue-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 text-center">
                 <Typography variant="small" className="font-normal text-gray-500 dark:text-gray-500">
                    &copy; 2026, made by Subarta Ghosh
                 </Typography>
             </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;