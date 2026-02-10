import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
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
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  PencilSquareIcon,
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

/* ============================ Components ============================ */

// Input style that blends into the dark theme (Notification style)
const DarkInput = ({ label, ...props }) => (
  <div className="w-full">
    <Typography variant="small" className="mb-2 font-medium text-gray-400">
      {label}
    </Typography>
    <Input
      {...props}
      className="!border-gray-800 bg-gray-900/50 text-white placeholder:text-gray-600 focus:!border-blue-500 transition-colors"
      labelProps={{
        className: "hidden",
      }}
      containerProps={{
        className: "!min-w-0",
      }}
    />
  </div>
);

// A row item similar to a "Notification Item"
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-800 bg-[#18181b]/50 hover:bg-[#18181b] transition-colors">
    <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <Typography variant="small" className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">
        {label}
      </Typography>
      <Typography variant="h6" className="text-gray-200 text-sm font-medium">
        {value}
      </Typography>
    </div>
  </div>
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

  // Clear messages on tab switch
  useEffect(() => {
    setStatus({ type: "", message: "" });
  }, [activeTab]);

  const handleUpdateProfile = async () => {
    setLoading(true); setStatus({ type: "", message: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${BASE_URL}/api/students/profile`, 
        { firstName, lastName, gender }, 
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      if (updateUser) updateUser(res.data);
      setStatus({ type: "success", message: "Profile updated successfully." });
    } catch (error) {
      setStatus({ type: "error", message: "Failed to update profile." });
    } finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    setLoading(true); setStatus({ type: "", message: "" });
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/students/password`, 
        { oldPassword, newPassword }, 
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      setStatus({ type: "success", message: "Password changed successfully." });
      setOldPassword(""); setNewPassword("");
    } catch (error) {
      setStatus({ type: "error", message: "Failed to change password." });
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("This action is irreversible. Delete account?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/students/account`, 
        { headers: { "Authorization": `Bearer ${token}` } }
      );
      logout();
    } catch (error) {
      setStatus({ type: "error", message: "Could not delete account." });
      setLoading(false);
    }
  };

  const avatarSrc = gender === "female" 
    ? "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/woman-user-circle-icon.png" 
    : "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-circle-icon.png";

  return (
    // OUTER CONTAINER: Matches the Notification Box dimensions and style
    <div className="w-full h-full p-6 flex flex-col">
      
      <Card className="flex-1 w-full bg-[#111113] border border-gray-800 shadow-xl overflow-hidden flex flex-col">
        
        {/* HEADER SECTION (Like Notification Header) */}
        <div className="p-6 border-b border-gray-800 bg-[#111113]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Title & Subtitle */}
            <div>
              <Typography variant="h4" color="white" className="font-semibold tracking-tight">
                Profile
              </Typography>
              <Typography variant="small" className="text-gray-500 font-medium mt-1">
                Manage your personal information and security.
              </Typography>
            </div>

            {/* Avatar & User Info (Integrated into header) */}
            <div className="flex items-center gap-4 bg-gray-900/50 p-2 pr-6 rounded-full border border-gray-800">
              <Avatar src={avatarSrc} variant="circular" size="sm" className="border border-gray-700" />
              <div>
                <Typography variant="small" color="white" className="font-bold leading-none">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="small" className="text-gray-500 text-[10px] font-medium leading-none mt-0.5">
                  {user?.email}
                </Typography>
              </div>
            </div>
          </div>

          {/* TABS (Styled like the Notification toggles) */}
          <div className="mt-8 w-full md:w-fit">
            <Tabs value={activeTab}>
              <TabsHeader
                className="bg-gray-900/50 border border-gray-800 p-1 h-10"
                indicatorProps={{
                  className: "bg-[#1f1f23] border border-gray-700 shadow-none text-white",
                }}
              >
                <Tab value="profile" onClick={() => setActiveTab("profile")} className={`text-xs font-bold px-6 transition-colors ${activeTab === "profile" ? "text-white" : "text-gray-500"}`}>
                  Overview
                </Tab>
                <Tab value="edit" onClick={() => setActiveTab("edit")} className={`text-xs font-bold px-6 transition-colors ${activeTab === "edit" ? "text-white" : "text-gray-500"}`}>
                  Edit
                </Tab>
                <Tab value="security" onClick={() => setActiveTab("security")} className={`text-xs font-bold px-6 transition-colors ${activeTab === "security" ? "text-white" : "text-gray-500"}`}>
                  Security
                </Tab>
              </TabsHeader>
            </Tabs>
          </div>
        </div>

        {/* CONTENT BODY */}
        <CardBody className="flex-1 overflow-y-auto p-6 bg-[#111113]">
          
          <AnimatePresence mode="wait">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === "profile" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <InfoRow icon={UserCircleIcon} label="Full Name" value={`${user?.firstName} ${user?.lastName}`} />
                <InfoRow icon={EnvelopeIcon} label="Email Address" value={user?.email} />
                <InfoRow icon={IdentificationIcon} label="Account Type" value="Student" />
                <InfoRow icon={MapPinIcon} label="Region" value="India" />
                <InfoRow icon={UserCircleIcon} label="Gender" value={user?.gender || "Male"} />
                <div className="flex items-center gap-4 p-4 rounded-lg border border-blue-900/30 bg-blue-900/10">
                   <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                      <CheckCircleIcon className="h-5 w-5" />
                   </div>
                   <div>
                     <Typography variant="small" className="font-bold text-blue-300 uppercase text-[10px] tracking-wider">Status</Typography>
                     <Typography variant="h6" className="text-blue-100 text-sm font-medium">Active Member</Typography>
                   </div>
                </div>
              </motion.div>
            )}

            {/* 2. EDIT TAB */}
            {activeTab === "edit" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto flex flex-col gap-6"
              >
                {status.message && (
                  <Alert color={status.type === "error" ? "red" : "green"} variant="ghost" className="text-xs py-2 px-4 flex items-center gap-2 border border-current">
                     {status.type === "error" ? <ExclamationTriangleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                     {status.message}
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <DarkInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                   <DarkInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                
                <div className="p-4 rounded-lg border border-gray-800 bg-[#18181b]/50">
                    <Typography variant="small" className="mb-3 font-medium text-gray-400">Gender Selection</Typography>
                    <div className="flex gap-6">
                        <Radio name="gender" label="Male" value="male" checked={gender === "male"} onChange={(e) => setGender(e.target.value)} color="blue" labelProps={{ className: "text-gray-300" }} />
                        <Radio name="gender" label="Female" value="female" checked={gender === "female"} onChange={(e) => setGender(e.target.value)} color="pink" labelProps={{ className: "text-gray-300" }} />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleUpdateProfile} disabled={loading} color="blue" className="normal-case w-40 flex justify-center items-center">
                    {loading ? <Spinner className="h-4 w-4" /> : "Save Changes"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* 3. SECURITY TAB */}
            {activeTab === "security" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl mx-auto flex flex-col gap-8"
              >
                 {status.message && (
                  <Alert color={status.type === "error" ? "red" : "green"} variant="ghost" className="text-xs py-2 px-4 flex items-center gap-2 border border-current">
                     {status.type === "error" ? <ExclamationTriangleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                     {status.message}
                  </Alert>
                )}

                {/* Password Section */}
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-2 mb-2 border-b border-gray-800 pb-2">
                      <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                      <Typography color="white" className="font-semibold">Password Update</Typography>
                   </div>
                   <DarkInput type="password" label="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                   <DarkInput type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                   <div className="flex justify-end">
                      <Button onClick={handleChangePassword} disabled={loading} variant="outlined" color="white" className="normal-case border-gray-700 text-gray-300 hover:bg-gray-800 focus:ring-0">
                        {loading ? "Updating..." : "Update Password"}
                      </Button>
                   </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-4 p-5 rounded-lg border border-red-900/30 bg-red-900/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <Typography color="red" className="font-bold flex items-center gap-2 text-sm">
                           <ExclamationTriangleIcon className="h-4 w-4" /> Delete Account
                        </Typography>
                        <Typography variant="small" className="text-red-300/60 mt-1 max-w-sm">
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
        </CardBody>
        
        {/* Footer Text (Matching Notification Page) */}
        <div className="p-4 border-t border-gray-800 bg-[#111113]">
             <Typography variant="small" className="text-center text-gray-600 font-normal text-[11px]">
                &copy; 2026, made by Subarta Ghosh
             </Typography>
        </div>

      </Card>
    </div>
  );
}

export default Profile;