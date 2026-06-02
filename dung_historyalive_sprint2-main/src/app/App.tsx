import { RouterProvider } from 'react-router';
import { router } from './routes';
import { OnboardingProvider } from './context/OnboardingContext';

export default function App() {
  return (
    <OnboardingProvider>
      <RouterProvider router={router} />
    </OnboardingProvider>
  );
}