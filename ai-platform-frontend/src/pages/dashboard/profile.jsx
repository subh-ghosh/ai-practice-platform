import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
  Typography,
  Tooltip,
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
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
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
      className="max-w-3xl mx-auto"
    >
      <div className="mb-6">
        <Typography variant="h5" color="blue-gray" className="dark:text-white">
          Personal Information
        </Typography>
        <Typography className="text-gray-600 font-normal dark:text-gray-400">
          Update your identity details here.
        </Typography>
      </div>

      <Card className="border border-blue-gray-100 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <CardBody className="p-8 flex flex-col gap-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert
                  color="red"
                  icon={<ExclamationTriangleIcon className="h-5 w-5" />}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert
                  color="green"
                  icon={<CheckCircleIcon className="h-5 w-5" />}
                >
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
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                size="lg"
                color="blue"
                className="dark:text-white"
              />
            </div>

            <Input
              label="Email Address"
              value={email || ""}
              disabled
              size="lg"
              className="!border-blue-gray-100 bg-blue-gray-50/50 text-blue-gray-500 dark:bg-gray-800 dark:text-gray-400"
              icon={<UserCircleIcon className="h-5 w-5 text-blue-gray-300" />}
            />

            <div className="space-y-2">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-medium dark:text-gray-300"
              >
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
                />
                <Radio
                  name="gender"
                  label="Female"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                  color="pink"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="gradient"
                color="blue"
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <PencilSquareIcon className="h-4 w-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
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
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Password Section */}
      <div>
        <div className="mb-6">
          <Typography
            variant="h5"
            color="blue-gray"
            className="dark:text-white"
          >
            Security Settings
          </Typography>
          <Typography className="text-gray-600 font-normal dark:text-gray-400">
            Manage your password and account security.
          </Typography>
        </div>

        <Card className="border border-blue-gray-100 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <CardBody className="p-8 flex flex-col gap-6">
            <AnimatePresence>
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-2"
                >
                  <Alert
                    color={error ? "red" : "green"}
                    icon={
                      error ? (
                        <ExclamationTriangleIcon className="h-5 w-5" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5" />
                      )
                    }
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
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="outlined"
                  color="blue-gray"
                  disabled={changing}
                  className="flex items-center gap-2 dark:text-white dark:border-gray-600"
                >
                  {changing ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* Danger Zone */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <Typography variant="h6" color="red" className="mb-2 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-5 w-5" /> Danger Zone
        </Typography>
        <Card className="border border-red-100 bg-red-50/20 shadow-none dark:bg-red-900/10 dark:border-red-900/30">
          <CardBody className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <Typography variant="small" color="blue-gray" className="font-bold dark:text-red-100">
                Delete Account
              </Typography>
              <Typography variant="small" className="text-gray-600 dark:text-red-200/70">
                Once you delete your account, there is no going back. Please be certain.
              </Typography>
            </div>
            <Button
              variant="gradient"
              color="red"
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
          </CardBody>
        </Card>
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
      className="h-full"
    >
        <div className="mb-6 flex justify-between items-center">
            <div>
                <Typography variant="h5" color="blue-gray" className="dark:text-white">
                Profile Overview
                </Typography>
                <Typography className="text-gray-600 font-normal dark:text-gray-400">
                Your public profile details.
                </Typography>
            </div>
            <Button size="sm" variant="text" className="flex items-center gap-2 dark:text-blue-400" onClick={onEditRequest}>
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
          "Account Status": "Active Student",
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

  // Navigation State
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

  // Clear errors when switching tabs
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
      let msg = "Failed to update profile.";
      if (err.response?.data) {
        const data = err.response.data;
        msg = typeof data === "string" ? data : data.message || msg;
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
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${BASE_URL}/api/students/password`, { oldPassword, newPassword }, config);
      setSecSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      let msg = "Failed to change password.";
      if (err.response?.data) {
        const data = err.response.data;
        msg = typeof data === "string" ? data : data.message || msg;
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
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${BASE_URL}/api/students/account`, config);
      logout();
    } catch {
      setSecError("Failed to delete account.");
      setDeletingAccount(false);
    }
  };

  // Define Navigation Items
  const navItems = [
    { value: "profile", label: "Overview", icon: UserCircleIcon },
    { value: "edit", label: "Edit Profile", icon: PencilSquareIcon },
    { value: "security", label: "Password & Security", icon: ShieldCheckIcon },
  ];

  return (
    <div className="w-full h-full p-4 md:p-8 bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
        
      {/* Main Container - Split Layout */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full h-full">
        
        {/* LEFT SIDEBAR: Navigation & User Summary */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
          <Card className="shadow-lg border border-blue-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
            <CardBody className="flex flex-col items-center text-center p-8">
              <div className="relative">
                <Avatar
                    src={avatarSrc}
                    alt="avatar"
                    size="xxl"
                    className="border-4 border-white shadow-lg dark:border-gray-700"
                />
                <div className="absolute bottom-1 right-1 h-4 w-4 bg-green-400 border-2 border-white rounded-full dark:border-gray-700"></div>
              </div>
              <Typography variant="h4" color="blue-gray" className="mt-4 mb-1 dark:text-white">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography className="font-normal text-blue-gray-500 mb-6 dark:text-gray-400">
                {user?.email}
              </Typography>
              
              <Button size="sm" variant="outlined" color="red" className="flex items-center gap-2" onClick={logout}>
                <ArrowRightOnRectangleIcon className="h-4 w-4" /> Sign Out
              </Button>
            </CardBody>
          </Card>

          {/* Navigation Menu */}
          <Card className="shadow-md border border-blue-gray-50 dark:border-gray-800 dark:bg-gray-800/50 overflow-hidden">
             <List className="p-2">
                {navItems.map(({ value, label, icon: Icon }) => (
                    <ListItem 
                        key={value}
                        onClick={() => setActiveTab(value)}
                        className={`p-3 mb-1 ${activeTab === value ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "dark:text-gray-300 dark:hover:bg-gray-700"}`}
                        selected={activeTab === value}
                    >
                        <ListItemPrefix>
                            <Icon className="h-5 w-5" />
                        </ListItemPrefix>
                        <span className="font-medium">{label}</span>
                    </ListItem>
                ))}
             </List>
          </Card>
        </div>

        {/* RIGHT SIDE: Content Area */}
        <div className="flex-1 min-w-0">
             <div className="h-full overflow-y-auto pr-2 pb-10 custom-scrollbar">
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
        </div>
      </div>
    </div>
  );
}

export default Profile;