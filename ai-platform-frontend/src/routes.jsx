import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  ChartPieIcon,
  PencilIcon,
  CreditCardIcon,
  BookOpenIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";

// Import all dashboard pages from the main barrel file
import {
  Home,
  Practice,
  Profile,
  Notifications,
  Pricing,
} from "@/pages/dashboard";
import CourseGeneratorPage from "@/pages/dashboard/CourseGeneratorPage";
import StudyPlanBuilderPage from "@/pages/dashboard/StudyPlanBuilderPage";

import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    title: "Main Practice Hub",
    pages: [
      {
        icon: <ChartPieIcon {...icon} />,
        name: "Dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <PencilIcon {...icon} />,
        name: "Practice",
        path: "/practice",
        element: <Practice />,
      },
      {
        icon: <BookOpenIcon {...icon} />,
        name: "AI Course Generator",
        path: "/course-generator",
        element: <CourseGeneratorPage />,
      },
      {
        icon: <AcademicCapIcon {...icon} />,
        name: "Study Plan Builder",
        path: "/study-plan-builder",
        element: <StudyPlanBuilderPage />,
      },
    ],
  },
  {
    layout: "dashboard",
    title: "Account Pages",
    pages: [
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Profile",
        path: "/profile",
        element: <Profile />,
      },

      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Notifications ",
        path: "/notifications",
        element: <Notifications />,
      },
    ],
  },
  // --- 👇 ADD THIS ENTIRE NEW SECTION --- 👇
  {
    layout: "dashboard",
    title: "Upgrade",
    pages: [
      {
        icon: <CreditCardIcon {...icon} />,
        name: "Pricing",
        path: "/pricing",
        element: <Pricing />,
      },
    ],
  },
  // --- 👆 END OF NEW SECTION --- 👆
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;