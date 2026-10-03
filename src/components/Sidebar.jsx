import { NavLink } from "react-router-dom";
import { LayoutDashboard, Inbox, Building, LogOut, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Enquiries", path: "/enquiries", icon: Inbox },
  { name: "Properties", path: "/properties", icon: Building },
];

export default function Sidebar({ mobileOpen, closeMobileMenu }) {
  const handleLogout = () => signOut(auth);

  return (
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <div className="brand">
          <span className="brand-icon">S</span>
          <div>
            <div className="brand-title">Swastik</div>
            <div className="brand-subtitle">Properties</div>
          </div>
        </div>

        <button className="btn-close-sidebar" onClick={closeMobileMenu} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={closeMobileMenu}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-signout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}