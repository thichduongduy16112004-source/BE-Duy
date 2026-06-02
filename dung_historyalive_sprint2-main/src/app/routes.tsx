import { createBrowserRouter } from "react-router";
import WelcomeScreen from "./screens/WelcomeScreen";
import SignUpScreen from "./screens/SignUpScreen";
import LoginScreen from "./screens/LoginScreen";
import AgeSelectionScreen from "./screens/AgeSelectionScreen";
import NameInputScreen from "./screens/NameInputScreen";
import EmailInputScreen from "./screens/EmailInputScreen";
import SubjectSelectionScreen from "./screens/SubjectSelectionScreen";
import GradeSelectionScreen from "./screens/GradeSelectionScreen";
import StudyTimeSelectionScreen from "./screens/StudyTimeSelectionScreen";
import HomeScreen from "./screens/HomeScreen";
import PracticeModesScreen from "./screens/PracticeModesScreen";
import LeaderboardScreen from "./screens/LeaderboardScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PremiumScreen from "./screens/PremiumScreen";
import AIChatScreen from "./screens/AIChatScreen";
import VideoLessonScreen from "./screens/VideoLessonScreen";
import WrongAnswerScreen from "./screens/WrongAnswerScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: WelcomeScreen,
  },
  {
    path: "/signup",
    Component: SignUpScreen,
  },
  {
    path: "/login",
    Component: LoginScreen,
  },
  {
    path: "/onboarding/age",
    Component: AgeSelectionScreen,
  },
  {
    path: "/onboarding/name",
    Component: NameInputScreen,
  },
  {
    path: "/onboarding/email",
    Component: EmailInputScreen,
  },
  {
    path: "/onboarding/subject",
    Component: SubjectSelectionScreen,
  },
  {
    path: "/onboarding/grade",
    Component: GradeSelectionScreen,
  },
  {
    path: "/onboarding/study-time",
    Component: StudyTimeSelectionScreen,
  },
  {
    path: "/home",
    Component: HomeScreen,
  },
  {
    path: "/practice",
    Component: PracticeModesScreen,
  },

  {
    path: "/leaderboard",
    Component: LeaderboardScreen,
  },
  {
    path: "/profile",
    Component: ProfileScreen,
  },
  {
    path: "/premium",
    Component: PremiumScreen,
  },
  {
    path: "/ai-chat",
    Component: AIChatScreen,
  },
  {
    path: "/video-lesson/:id",
    Component: VideoLessonScreen,
  },
  {
    path: "/wrong-answer",
    Component: WrongAnswerScreen,
  },
]);