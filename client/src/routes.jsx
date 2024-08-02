import { Home, Profile, SignIn, SignUp } from "@/pages";

export let routes;

const handleSignOut = () => {
  // Perform sign out logic here
  console.log("Signing out...");
  // Clear local storage
  localStorage.removeItem('isLoggedIn');
  // Redirect to home or sign-in page
  window.location.href = "/home";
  window.location.reload();
};

if (localStorage.getItem('isLoggedIn') === 'Y') {
  routes = [
    {
      name: "home",
      path: "/home",
      element: <Home />,
    },
    {
      name: "Tool",
      href: "#tool",
      path: "/tool",
      element: <Profile />,
    },
    {
      name: "Features",
      href: "https://www.material-tailwind.com/docs/react/installation",
      target: "_blank",
      element: "",
    },
    {
      name: "Sign Out",
      path: "/home",
      element: <Home />,
      onClick: handleSignOut,
    },
  ];
} else {
  routes = [
    {
      name: "home",
      path: "/home",
      element: <Home />,
    },
    {
      name: "profile",
      path: "/profile",
      element: <Profile />,
    },
    {
      name: "Features",
      href: "https://www.material-tailwind.com/docs/react/installation",
      target: "_blank",
      element: "",
    },
    {
      name: "Sign In",
      path: "/sign-in",
      element: <SignIn />,
    },
    {
      name: "Sign Up",
      path: "/sign-up",
      element: <SignUp />,
    },
  ];
}

export default routes;
