import React from "react";
import { NavLink } from "react-router-dom";
import type { I_NAVMENU } from "..";

interface NavItemProps {
  item: I_NAVMENU;
}

const NavItem: React.FC<NavItemProps> = ({ item }) => {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors ${
          isActive ? "bg-green text-white" : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      <span className='text-lg'>{item.icon}</span>
      <span>{item.item}</span>
    </NavLink>
  );
};

export default NavItem;


