// (exactly your provided file)
import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
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
import api from "@/api"; 

export function Profile() {
  const { user, updateUser, logout } = useAuth(); 
  const [activeTab, setActiveTab] = useState("profile");

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName || "");
  const [gender, setGender] = useState(user.gender || "male");
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const maleAvatar = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-circle-icon.png";
  const femaleAvatar = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/woman-user-circle-icon.png";
  const avatarSrc = user.gender === 'female' ? femaleAvatar : maleAvatar;

  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [activeTab]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    console.log("➡ Submitting profile update...");
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
        console.log("🛰️ PUT /api/students/profile payload:", {
              firstName,
              lastName,
              gender,
            });
      const response = await api.put("/api/students/profile", {
        firstName,
        lastName,
        gender,
      });
    console.log("✅ PUT /api/students/profile response:", response.status, response.data);
      updateUser(response.data); // merge in (keeps token if backend returned token; we also preserve in updateUser)
      setSuccess("Profile updated successfully!");
    } catch (err) {
          console.error("❌ PUT /api/students/profile failed:", err?.response?.status, err?.response?.data);
          const msg = err?.response?.data;
          setError(typeof msg === "string" ? msg : "Failed to update profile. Please try again.");
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.put("/api/students/password", {
        oldPassword,
        newPassword,
      });
      setSuccess("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data || "Failed to change password. Check your old password.");
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await api.delete("/api/students/account");
        logout();
      } catch (err) {
        setError("Failed to delete account. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover   bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <Avatar
                src={avatarSrc} 
                alt="Profile"
                size="xl"
                variant="rounded"
                className="rounded-lg shadow-lg shadow-blue-gray-500/40"
              />
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {user.firstName} {user.lastName || ""}
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-600"
                >
                  Student
                </Typography>
              </div>
            </div>

            <div className="w-96">
              <Tabs value={activeTab}>
                <TabsHeader>
                  <Tab value="profile" onClick={() => setActiveTab("profile")}>
                    <UserCircleIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    Profile
                  </Tab>
                  <Tab value="edit" onClick={() => setActiveTab("edit")}>
                    <PencilIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    Edit
                  </Tab>
                  <Tab value="security" onClick={() => setActiveTab("security")}>
                    <Cog6ToothIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                    Security
                  </Tab>
                </TabsHeader>
              </Tabs>
            </div>
          </div>
          
          <div className="mt-12 px-4"> 
            {activeTab === "profile" && (
              <div className="grid grid-cols-1 gap-12">
                <div className="w-full max-w-lg">
                  <ProfileInfoCard
                    title="Profile Information"
                    description="Hi! I'm a student using the AI Practice Platform to improve my skills."
                    details={{
                      "full name": `${user.firstName} ${user.lastName || ""}`,
                      "email": user.email,
                      "gender": user.gender ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) : 'Not set',
                      "location": "India",
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
                </div>
              </div>
            )}

            {/* "Edit Profile" Tab Content */}
            {activeTab === "edit" && (
              <div className="grid grid-cols-1 gap-12">
                <div className="w-full max-w-lg">
                  <Card className="border border-blue-gray-100 shadow-sm">
                    <CardHeader color="transparent" floated={false} shadow={false} className="m-0 p-6">
                      <Typography variant="h6" color="blue-gray">
                        Edit Profile
                      </Typography>
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        Update your personal information.
                      </Typography>
                    </CardHeader>

                    {/* 👇 FORM — this is crucial! */}
                    <form onSubmit={handleProfileUpdate}>
                      <CardBody className="p-6 flex flex-col gap-6">
                        {error && <Alert color="red">{error}</Alert>}
                        {success && <Alert color="green">{success}</Alert>}

                        <Input
                          label="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                        <Input
                          label="Last Name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                        <Input
                          label="Email"
                          value={user.email}
                          disabled
                        />

                        <div>
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            Gender
                          </Typography>
                          <div className="flex gap-10">
                            <Radio
                              name="gender"
                              label="Male"
                              value="male"
                              checked={gender === 'male'}
                              onChange={(e) => setGender(e.target.value)}
                            />
                            <Radio
                              name="gender"
                              label="Female"
                              value="female"
                              checked={gender === 'female'}
                              onChange={(e) => setGender(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* 👇 BUTTON: type MUST be submit */}
                        <Button
                          type="submit"
                          variant="gradient"
                          className="w-full md:w-1/2"
                          disabled={loading}
                        >
                          {loading ? <Spinner className="h-4 w-4" /> : "Save Profile Changes"}
                        </Button>
                      </CardBody>
                    </form>
                  </Card>
                </div>
              </div>
            )}


            {activeTab === "security" && (
              <div className="grid grid-cols-1 gap-6">
                <div className="w-full max-w-lg">
                  <Card className="border border-blue-gray-100 shadow-sm">
                    <CardHeader color="transparent" floated={false} shadow={false} className="m-0 p-6">
                      <Typography variant="h6" color="blue-gray">
                        Change Password
                      </Typography>
                    </CardHeader>
                    <CardBody className="p-6">
                      <form onSubmit={handlePasswordChange} className="flex flex-col gap-6">
                        {error && activeTab === 'security' && <Alert color="red">{error}</Alert>}
                        {success && activeTab === 'security' && <Alert color="green">{success}</Alert>}

                        <Input
                          type="password"
                          label="Current Password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                        <Input
                          type="password"
                          label="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          disabled={loading}
                        />

                        <Button type="submit" variant="gradient" className="w-full md:w-1/2" disabled={loading}>
                          {loading ? <Spinner className="h-4 w-4" /> : "Change Password"}
                        </Button>
                      </form>
                    </CardBody>
                  </Card>

                  <Card className="border border-blue-gray-100 shadow-sm">
                    <CardHeader color="transparent" floated={false} shadow={false} className="m-0 p-6">
                      <Typography variant="h6" color="red">
                        Delete Account
                      </Typography>
                    </CardHeader>
                    <CardBody className="p-6">
                      <Typography variant="small" color="blue-gray" className="mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </Typography>
                      <Button variant="outlined" color="red" onClick={handleDeleteAccount} disabled={loading}>
                        {loading ? <Spinner className="h-4 w-4" /> : "Delete My Account"}
                      </Button>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;
