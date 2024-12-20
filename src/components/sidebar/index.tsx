import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/userAuthContext";

// Icons
import homeIcon from "@/assets/icons/home.svg";
import addIcon from "@/assets/icons/add.svg";
import myphotoIcon from "@/assets/icons/myphotos.svg";
import profileIcon from "@/assets/icons/profile.svg";
import logoutIcon from "@/assets/icons/logout.svg";

// Navigation items
const navItems = [
  { name: "Home", link: "/", icon: homeIcon },
  { name: "Add Photos", link: "/post", icon: addIcon },
  { name: "Add Tweets", link: "/tweets", icon: addIcon },
  { name: "My Content", link: "/myphotos", icon: myphotoIcon },
  { name: "Profile", link: "/profile", icon: profileIcon },
];

const Sidebar: React.FunctionComponent = () => {
  const { pathname } = useLocation();
  const { logOut } = useUserAuth();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="flex flex-col h-screen w-full max-w-sm bg-black">
      <div className="flex justify-center my-5">
        <div className="text-white text-xl font-bold">MyCircle</div>
      </div>
      {/* Navigation links */}
      {navItems.map((item) => (
        <Link
          to={item.link}
          key={item.name}
          className={cn(
            "flex items-center justify-start gap-2 px-4 py-3 rounded-md",
            pathname === item.link
              ? "bg-gray-800 text-white"
              : "bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200"
          )}
        >
          <img
            src={item.icon}
            alt={item.name}
            className="w-5 h-5"
            style={{ filter: pathname === item.link ? "invert(1)" : "invert(0.7)" }}
          />
          <span className="text-sm font-medium">{item.name}</span>
        </Link>
      ))}
      {/* Logout */}
      <button
        onClick={handleLogout}
        className={cn(
          "mt-auto flex items-center justify-start gap-2 px-4 py-3 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200"
        )}
      >
        <img
          src={logoutIcon}
          alt="Logout"
          className="w-5 h-5"
          style={{ filter: "invert(0.7)" }}
        />
        <span className="text-sm font-medium">Logout</span>
      </button>
    </nav>
  );
};

export default Sidebar;
