import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";

export function Profile() {
  // --- 2. GET THE USER FROM THE AUTH CONTEXT ---
  const { user } = useAuth();

  return (
    <>
      {/* ... code for the background image ... */}
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              {/* ... Avatar code ... */}
              <div>
                {/* --- 3. REPLACE STATIC NAME --- */}
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {user.firstName} {user.lastName || ''}
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-600"
                >
                  Student
                </Typography>
              </div>
            </div>
            {/* ... Tabs code ... */}
          </div>
          <div className="gird-cols-1 mb-12 grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
            {/* ... Platform Settings code ... */}

            {/* --- 4. REPLACE STATIC PROFILE INFO --- */}
            <ProfileInfoCard
              title="Profile Information"
              description="Your student profile information. (You can add a bio field later!)"
              details={{
                "First Name": user.firstName,
                "Last Name": user.lastName || "N/A",
                "Email": user.email,
                "Location": "India (Example)", // This is static, as it's not in your user object
              }}
              action={
                <Tooltip content="Edit Profile">
                  <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500" />
                </Tooltip>
              }
            />

            {/* ... other code ... */}
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;