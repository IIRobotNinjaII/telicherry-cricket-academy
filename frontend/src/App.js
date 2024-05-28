import { useRoutes } from "react-router-dom";
import SignIn from './components/SignIn';
import { AuthProvider } from './contexts/authContext';
import Home from './components/Home';

export default function App() {
  const routesArray = [
    {
      path: "*",
      element: <SignIn />,
    },
    {
      path: "/login",
      element: <SignIn />,
    },
    {
      path: "/home",
      element: <Home />,
    },
  ];
  let routesElement = useRoutes(routesArray);
  return (
    <AuthProvider>
      {routesElement}
    </AuthProvider>
  );
}