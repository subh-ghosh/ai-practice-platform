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
} from "@material-tailwind/react";
import {
  Cog6ToothIcon,
  PencilIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { ProfileInfoCard } from "@/widgets/cards";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeProvider.jsx";

/* ============================ Config ============================ */
const TAB_HEIGHT = "h-[330px] md:h-[370px]";
const panelCard =
  "h-full rounded-2xl border border-blue-100/60 bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-800/80 dark:border-gray-700";
const scrollBody =
  "p-5 md:p-6 flex flex-col gap-5 md:gap-6 h-full overflow-y-auto pr-3 md:pr-4";

// Hardcode URL for safety
const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

/* ============================ Reusable blocks ============================ */
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
  theme,
  error,
  success,
}) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 items-stretch w-full ${TAB_HEIGHT}`}
    >
      {/* LEFT: Name */}
      <Card className={panelCard}>
        <CardHeader color="transparent" shadow={false} className="m-0 p-5 md:p-6">
          <Typography variant="h6" color="blue-gray" className="dark:text-gray-100">
            Edit Profile
          </Typography>
          <Typography variant="small" color="blue-gray" className="font-normal dark:text-gray-300">
            Update your personal information.
          </Typography>
        </CardHeader>
        <CardBody className={scrollBody}>
          {error && <Alert color="red" className="text-sm font-medium">{error}</Alert>}
          {success && <Alert color="green" className="text-sm font-medium">{success}</Alert>}

          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            color={theme === "dark" ? "white" : "gray"}
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            color={theme === "dark" ? "white" : "gray"}
          />
        </CardBody>
      </Card>

      {/* RIGHT: Email + Gender + Save */}
      <Card className={panelCard}>
        <CardHeader color="transparent" shadow={false} className="m-0 p-5 md:p-6">
          <Typography variant="h6" color="blue-gray" className="dark:text-gray-100">
            Contact & Preferences
          </Typography>
          <Typography variant="small" color="blue-gray" className="font-normal dark:text-gray-300">
            Manage email and gender.
          </Typography>
        </CardHeader>

        <form onSubmit={onSubmit} className="h-full">
          <CardBody className={scrollBody}>
            <Input
              label="Email"
              value={email || ""}
              disabled
              color={theme === "dark" ? "white" : "gray"}
            />

            <div>
              <Typography variant="small" color="blue-gray" className="font-medium dark:text-gray-200 mb-2">
                Gender
              </Typography>
              <div className="flex gap-8">
                <Radio
                  name="gender"
                  label="Male"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                  labelProps={{ className: "dark:text-gray-200" }}
                />
                <Radio
                  name="gender"
                  label="Female"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                  labelProps={{ className: "dark:text-gray-200" }}
                />
              </div>
            </div>

            {/* Moved up and left-aligned */}
            <div className="mt-2">
              <Button
                type="submit"
                variant="gradient"
                color="blue"
                className="w-full lg:w-auto rounded-full"
                disabled={saving}
              >
                {saving ? <Spinner className="h-4 w-4" /> : "Save Profile Changes"}
              </Button>
            </div>
          </CardBody>
        </form>
      </Card>
    </div>
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
  theme,
  error,
  success,
}) {
  const TAB_HEIGHT = "h-[300px] md:h-[350px]";
  const panelCard =
    "h-full rounded-2xl border border-blue-100/60 bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-800/80 dark:border-gray-700";

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 items-stretch w-full ${TAB_HEIGHT}`}>
      {/* LEFT: Password change */}
      <Card className={panelCard}>
        <CardHeader color="transparent" shadow={false} className="m-0 p-4 md:p-5">
          <Typography variant="h6" color="blue-gray" className="dark:text-gray-100">
            Security
          </Typography>
          <Typography variant="small" color="blue-gray" className="font-normal dark:text-gray-300">
            Manage your password and account safety.
          </Typography>
        </CardHeader>

        <form onSubmit={onChangePassword} className="h-full">
          <CardBody className="p-4 md:p-5 flex flex-col gap-4 h-full">
            {!!error && <Alert color="red" className="py-2 text-sm">{error}</Alert>}
            {!!success && <Alert color="green" className="py-2 text-sm">{success}</Alert>}

            <Input
              type="password"
              label="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={changing}
              autoComplete="current-password"
              color={theme === "dark" ? "white" : "gray"}
            />
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={changing}
              autoComplete="new-password"
              color={theme === "dark" ? "white" : "gray"}
            />

            {/* Moved up and left-aligned */}
            <div className="mt-2">
              <Button
                type="submit"
                variant="gradient"
                color="blue"
                className="rounded-full w-full md:w-auto"
                disabled={changing}
              >
                {changing ? <Spinner className="h-4 w-4" /> : "Change Password"}
              </Button>
            </div>
          </CardBody>
        </form>
      </Card>

      {/* RIGHT: Tips + Delete */}
      <Card className={panelCard}>
        <CardHeader color="transparent" shadow={false} className="m-0 p-4 md:p-5">
          <Typography variant="h6" color="blue-gray" className="dark:text-gray-100">
            Account Safety
          </Typography>
          <Typography variant="small" color="blue-gray" className="font-normal dark:text-gray-300">
            Best practices & account options.
          </Typography>
        </CardHeader>

        <CardBody className="p-4 md:p-5 flex flex-col justify-between h-full">
          <div className="rounded-lg border border-blue-100/60 p-3 bg-white/70 backdrop-blur-sm dark:bg-gray-700/40 dark:border-gray-600">
            <Typography variant="small" className="font-medium dark:text-gray-100">
              Strong password tips
            </Typography>
            <ul className="mt-2 list-disc pl-5 text-sm text-blue-gray-700 dark:text-gray-300 space-y-1">
              <li>At least 8 characters</li>
              <li>Mix of letters, numbers, symbols</li>
              <li>Avoid common or reused passwords</li>
            </ul>
          </div>

          <div className="my-3 h-px bg-black/5 dark:bg-white/10" />

          <div className="mt-auto">
            <Typography variant="h6" color="red" className="mb-1">
              Delete Account
            </Typography>
            <Typography variant="small" className="text-blue-gray-700 dark:text-gray-300">
              Once you delete your account, there’s no going back.
            </Typography>

            <div className="mt-3">
              <Button
                variant="outlined"
                color="red"
                size="sm"
                onClick={onDeleteAccount}
                disabled={deleting}
                className="rounded-full w-full md:w-auto"
              >
                {deleting ? <Spinner className="h-4 w-4" /> : "Delete My Account"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
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
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setGender(user?.gender || "male");
  }, [user]);

  useEffect(() => {
    setEditError(null);
    setEditSuccess(null);
    setSecError(null);
    setSecSuccess(null);
  }, [activeTab]);

  const maleAvatar =
    "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-circle-icon.png";
  const femaleAvatar =
    "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/woman-user-circle-icon.png";
  const avatarSrc = (gender || user?.gender) === "female" ? femaleAvatar : maleAvatar;

  // 1. UPDATE PROFILE (FIXED ERROR HANDLING)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setEditError(null);
    setEditSuccess(null);
    
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };

      // 1. Send Request
      const res = await axios.put(`${BASE_URL}/api/students/profile`, { 
        firstName, 
        lastName, 
        gender 
      }, config);

      // 2. Safe Update Context
      try {
        if(updateUser && res.data) {
            updateUser(res.data);
        }
      } catch (ctxErr) {
        console.warn("Auth context update minor issue:", ctxErr);
        // We do NOT stop here, because the backend save was successful.
      }

      // 3. Show Success
      setEditSuccess("Profile updated successfully!");

    } catch (err) {
      console.error("Profile update error:", err);
      
      // Better Error Parsing
      let msg = "Failed to update profile.";
      
      if (err.response && err.response.data) {
        // If server sent a JSON object (common in Spring Boot)
        const data = err.response.data;
        if (typeof data === "string") msg = data;
        else if (data.message) msg = data.message;
        else if (data.error) msg = data.error;
      } else if (err.request) {
        msg = "Network error. Please try again.";
      } else if (err.message) {
        msg = err.message;
      }

      setEditError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. CHANGE PASSWORD (FIXED ERROR HANDLING)
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setSecError(null);
    setSecSuccess(null);
    
    try {
        const token = localStorage.getItem("token");
        const config = { headers: { "Authorization": `Bearer ${token}` } };
        
        await axios.put(`${BASE_URL}/api/students/password`, { 
            oldPassword, 
            newPassword 
        }, config);
        
        setSecSuccess("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
    } catch (err) {
        let msg = "Failed to change password.";
        if (err.response && err.response.data) {
            const data = err.response.data;
            if (typeof data === "string") msg = data;
            else if (data.message) msg = data.message;
        }
        setSecError(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  // 3. DELETE ACCOUNT (Manual Token)
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
    <section className="relative isolate -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pb-10 min-h-[calc(100vh-4rem)]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-sky-100 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 transition-all duration-700" />

      {/* ====== Banner + Overlapping Card ====== */}
      <div className="relative w-full flex flex-col items-center">
        {/* Banner */}
        <div className="relative h-64 md:h-72 lg:h-80 w-full max-w-6xl overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-[url('/img/background-image.png')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
        </div>

        {/* Overlapping Card */}
        <Card
          className="
            relative z-20 w-full max-w-5xl
            -mt-20 md:-mt-28 lg:-mt-32
            rounded-3xl
            border border-blue-100/60 dark:border-white/10
            bg-white/90 dark:bg-gray-800/80
            backdrop-blur-md
            shadow-2xl ring-1 ring-black/5 dark:ring-white/5
          "
        >
          <CardBody className="p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 md:mb-7 flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-6">
                <Avatar src={avatarSrc} size="xl" variant="rounded" className="rounded-lg shadow-lg" />
                <div>
                  <Typography variant="h5" className="dark:text-gray-100">
                    {`${firstName || ""} ${lastName || ""}`.trim() || "Student"}
                  </Typography>
                  <Typography variant="small" className="text-blue-gray-600 dark:text-gray-300">
                    Student
                  </Typography>
                </div>
              </div>

              {/* Tabs */}
              <div className="w-full sm:w-96 max-w-full">
                <div
                  role="tablist"
                  aria-label="Profile sections"
                  className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-blue-100/60 bg-white/70 p-1 shadow-sm backdrop-blur-md dark:border-gray-600 dark:bg-gray-700/80"
                >
                  {[
                    { key: "profile", icon: UserCircleIcon, label: "Profile" },
                    { key: "edit", icon: PencilIcon, label: "Edit" },
                    { key: "security", icon: Cog6ToothIcon, label: "Security" },
                  ].map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === key}
                      onClick={() => setActiveTab(key)}
                      className={`flex w-1/3 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                        ${
                          activeTab === key
                            ? "bg-white text-gray-900 shadow dark:bg-gray-600 dark:text-white"
                            : "text-blue-gray-600 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-600/40"
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Equal-height frame */}
            <div className={`w-full ${TAB_HEIGHT}`}>
              {activeTab === "profile" && (
                <Card className={`${panelCard} w-full`}>
                  <CardBody className={scrollBody}>
                    <ProfileInfoCard
                      title="Profile Information"
                      description="Hi! I'm a student using the AI Practice Platform to improve my skills."
                      details={{
                        "Full Name": `${firstName} ${lastName}`.trim() || "—",
                        Email: user?.email || "—",
                        Gender:
                          (user?.gender || "male").charAt(0).toUpperCase() +
                          (user?.gender || "male").slice(1),
                        Location: "India",
                      }}
                      action={
                        <Tooltip content="Edit Profile">
                          <PencilIcon
                            className="h-4 w-4 cursor-pointer text-blue-gray-500"
                            onClick={() => setActiveTab("edit")}
                          />
                        </Tooltip>
                      }
                    />
                  </CardBody>
                </Card>
              )}

              {activeTab === "edit" && (
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
              )}

              {activeTab === "security" && (
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
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

export default Profile;