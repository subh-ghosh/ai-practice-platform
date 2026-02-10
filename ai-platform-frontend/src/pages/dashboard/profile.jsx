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

// Standard Input (Clean White Style)
const StandardInput = ({ label, ...props }) => (
  <div className="w-full">
    <Typography variant="small" color="blue-gray" className="mb-1 font-semibold">
      {label}
    </Typography>
    <Input
      {...props}
      size="lg"
      className="!border-blue-gray-200 bg-white text-blue-gray-900 focus:!border-blue-500 placeholder:opacity-100"
      labelProps={{
        className: "hidden",
      }}
      containerProps={{
        className: "!min-w-0",
      }}
    />
  </div>
);

// Row Item (Like a Notification List Item)
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 border-b border-blue-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
    <div className="p-2.5 rounded-full bg-blue-50 text-blue-500">
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <Typography variant="small" className="font-bold text-blue-gray-400 uppercase text-[10px] tracking-wider">
        {label}
      </Typography>
      <Typography variant="h6" color="blue-gray" className="text-sm font-semibold">
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
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
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
    // MAIN WRAPPER: Centers the "Notification Box" style card
    <div className="flex justify-center w-full p-4 mt-4">
      
      {/* THE BOX: Clean White, Shadow, Rounded */}
      <Card className="w-full max-w-4xl bg-white border border-blue-gray-100 shadow-md overflow-hidden flex flex-col h-[600px]">
        
        {/* HEADER SECTION */}
        <div className="px-6 py-5 border-b border-blue-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-4">
             <Avatar 
                src={avatarSrc} 
                variant="rounded" 
                size="md" 
                className="border border-blue-gray-100 shadow-sm p-0.5 bg-white" 
             />
             <div>
                <Typography variant="h5" color="blue-gray" className="font-bold tracking-tight">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="small" className="text-blue-gray-500 font-medium">
                  {user?.email}
                </Typography>
             </div>
          </div>

          {/* TABS - Clean Gray Pill Style */}
          <div className="w-full md:w-auto">
            <Tabs value={activeTab}>
              <TabsHeader
                className="bg-blue-gray-50/60 p-1 h-10 border border-blue-gray-50"
                indicatorProps={{
                  className: "bg-white shadow-sm border border-blue-gray-100",
                }}
              >
                <Tab value="profile" onClick={() => setActiveTab("profile")} className="text-xs font-bold px-4 text-blue-gray-500">
                  Profile
                </Tab>
                <Tab value="edit" onClick={() => setActiveTab("edit")} className="text-xs font-bold px-4 text-blue-gray-500">
                  Edit
                </Tab>
                <Tab value="security" onClick={() => setActiveTab("security")} className="text-xs font-bold px-4 text-blue-gray-500">
                  Security
                </Tab>
              </TabsHeader>
            </Tabs>
          </div>
        </div>

        {/* CONTENT BODY */}
        <CardBody className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-blue-gray-100">
          
          <AnimatePresence mode="wait">
            
            {/* 1. OVERVIEW TAB (List Style) */}
            {activeTab === "profile" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col"
              >
                <div className="p-4 bg-blue-50/30 border-b border-blue-gray-50">
                    <Typography variant="small" className="font-bold text-blue-gray-600">Personal Information</Typography>
                </div>
                <InfoRow icon={UserCircleIcon} label="Full Name" value={`${user?.firstName} ${user?.lastName}`} />
                <InfoRow icon={EnvelopeIcon} label="Email Address" value={user?.email} />
                <InfoRow icon={IdentificationIcon} label="Role" value="Student" />
                <InfoRow icon={MapPinIcon} label="Location" value="India" />
                <InfoRow icon={UserCircleIcon} label="Gender" value={user?.gender || "Male"} />
              </motion.div>
            )}

            {/* 2. EDIT TAB (Form Style) */}
            {activeTab === "edit" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-6 md:p-8 max-w-2xl mx-auto w-full flex flex-col gap-6"
              >
                {status.message && (
                  <Alert color={status.type === "error" ? "red" : "green"} variant="ghost" className="text-xs py-2 px-3 border border-current">
                     {status.message}
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <StandardInput label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                   <StandardInput label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                
                <div className="p-4 rounded-lg border border-blue-gray-100 bg-gray-50/50">
                    <Typography variant="small" className="mb-3 font-bold text-blue-gray-700">Gender</Typography>
                    <div className="flex gap-6">
                        <Radio name="gender" label="Male" value="male" checked={gender === "male"} onChange={(e) => setGender(e.target.value)} color="blue" />
                        <Radio name="gender" label="Female" value="female" checked={gender === "female"} onChange={(e) => setGender(e.target.value)} color="pink" />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleUpdateProfile} disabled={loading} color="blue" className="normal-case w-32 shadow-blue-500/20">
                    {loading ? <Spinner className="h-4 w-4 mx-auto" /> : "Save"}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* 3. SECURITY TAB */}
            {activeTab === "security" && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-6 md:p-8 max-w-2xl mx-auto w-full flex flex-col gap-8"
              >
                 {status.message && (
                  <Alert color={status.type === "error" ? "red" : "green"} variant="ghost" className="text-xs py-2 px-3 border border-current">
                     {status.message}
                  </Alert>
                )}

                {/* Password Section */}
                <div className="flex flex-col gap-5">
                   <div className="flex items-center gap-2 border-b border-blue-gray-100 pb-2">
                      <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                      <Typography color="blue-gray" className="font-bold">Change Password</Typography>
                   </div>
                   <StandardInput type="password" label="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                   <StandardInput type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                   <div className="flex justify-end">
                      <Button onClick={handleChangePassword} disabled={loading} variant="outlined" color="blue-gray" className="normal-case border-blue-gray-200">
                        {loading ? "Updating..." : "Update Password"}
                      </Button>
                   </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-2 p-4 rounded-lg border border-red-100 bg-red-50/30 flex items-center justify-between gap-4">
                    <div>
                        <Typography color="red" className="font-bold text-sm">Delete Account</Typography>
                        <Typography variant="small" className="text-red-400 text-xs">
                           Permanently remove your data.
                        </Typography>
                    </div>
                    <Button size="sm" color="red" variant="gradient" className="shrink-0 shadow-none hover:shadow-md" onClick={handleDeleteAccount} disabled={loading}>
                       {loading ? "..." : "Delete"}
                    </Button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </CardBody>
        
        {/* Footer Text */}
        <div className="p-3 border-t border-blue-gray-50 bg-gray-50/50">
             <Typography variant="small" className="text-center text-blue-gray-400 font-normal text-[10px]">
                Account ID: {user?._id || "#######"} • Secure Connection
             </Typography>
        </div>

      </Card>
    </div>
  );
}

export default Profile;