import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useContext, useRef, useEffect } from "react";
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiUser,
  FiLogOut,
  FiGrid,
  FiChevronDown,
  FiSun,
  FiMoon,
  FiHeart,
  FiGlobe,
  FiFileText,
  FiHome,
  FiList,
  FiBriefcase,
  FiInbox,
  FiMessageSquare,
} from "react-icons/fi";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useChat } from "../../hooks/useChat";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../services/api";
import "./Navbar.css";
import logo from "../../assets/logo.png";

export default function Navbar({ showSidebarToggle, onSidebarToggle, sidebarOpen }) {
  const { t, i18n } = useTranslation("common");
  const { user, isAuthenticated, logout, isBuyer, isArtisan, isAdmin } =
    useAuth();
  const { totalItems } = useCart();
  const { totalUnread } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Role-based navigation links
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { path: "/", label: t("nav.home"), icon: FiHome },
        { path: "/marketplace", label: t("nav.marketplace"), icon: FiList },
        { path: "/artisans", label: t("nav.artisans"), icon: FiUser },
      ];
    }

    if (isBuyer) {
      return [
        { path: "/dashboard", label: t("nav.dashboard"), icon: FiGrid },
        { path: "/marketplace", label: t("nav.marketplace"), icon: FiList },
        {
          path: "/mentorships",
          label: t("nav.mentorships"),
          icon: FiBriefcase,
        },
        { path: "/workshops", label: t("nav.workshops"), icon: FiInbox },
      ];
    }

    if (isArtisan) {
      return [
        { path: "/dashboard", label: t("nav.dashboard"), icon: FiGrid },
        { path: "/requests", label: t("nav.requests"), icon: FiFileText },
      ];
    }

    if (isAdmin) {
      return [{ path: "/admin", label: t("nav.dashboard"), icon: FiGrid }];
    }

    return [];
  };

  const navLinks = getNavLinks();

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.documentElement.classList.add("no-scroll");
    } else {
      document.documentElement.classList.remove("no-scroll");
    }

    return () => {
      document.documentElement.classList.remove("no-scroll");
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const profileImage = user?.profileImage;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-container container">
        {showSidebarToggle && (
          <button
            className="navbar-sidebar-toggle"
            onClick={onSidebarToggle}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? (
              <FiX />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{ display: "block" }}
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="14" y2="12" />
                <line x1="3" y1="18" x2="18" y2="18" />
              </svg>
            )}
          </button>
        )}
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <img src={logo} alt="CURIO" className="navbar-logo-img" />
          <span className="navbar-logo-text">CURIO</span>
        </Link>

        {mobileOpen && (
          <button
            className="navbar-mobile-overlay"
            aria-label="Close menu"
            onClick={closeMobileMenu}
          />
        )}

        <div
          className={`navbar-links ${mobileOpen ? "navbar-links-open" : ""}`}
          id="navbar-mobile-menu"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${
                link.path === "/" || link.path === "/dashboard"
                  ? location.pathname === link.path
                    ? "navbar-link-active"
                    : ""
                  : location.pathname === link.path ||
                      location.pathname.startsWith(link.path + "/")
                    ? "navbar-link-active"
                    : ""
              }`}
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}

          {!isAuthenticated && (
            <div
              className="navbar-mobile-auth"
              aria-label="Authentication links"
            >
              <Link
                to="/login"
                className="navbar-login-btn"
                onClick={closeMobileMenu}
              >
                {t("nav.signIn")}
              </Link>
              <Link
                to="/register"
                className="navbar-register-btn"
                onClick={closeMobileMenu}
              >
                {t("nav.signUp")}
              </Link>
            </div>
          )}
        </div>

        <div className="navbar-actions">
          <button
            onClick={() =>
              i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")
            }
            className="navbar-cart"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "0 8px",
            }}
            title={i18n.language === "ar" ? "English" : "العربية"}
          >
            <FiGlobe style={{ fontSize: 16 }} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>
              {i18n.language === "ar" ? "EN" : "عربي"}
            </span>
          </button>
          <button
            onClick={toggleTheme}
            className="navbar-cart"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            title={t("nav.switchTheme", {
              mode: theme === "light" ? "dark" : "light",
            })}
          >
            {theme === "light" ? <FiMoon /> : <FiSun />}
          </button>
          {isBuyer && (
            <Link to="/cart" className="navbar-cart" id="navbar-cart">
              <FiShoppingCart />
              {totalItems > 0 && (
                <span className="navbar-cart-badge">{totalItems}</span>
              )}
            </Link>
          )}
          {(isBuyer || isArtisan) && (
            <Link to="/dashboard/chat" className="navbar-cart" id="navbar-chat">
              <FiMessageSquare />
              {totalUnread > 0 && (
                <span className="navbar-cart-badge">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </Link>
          )}
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="navbar-cart"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={t("nav.logout")}
            >
              <FiLogOut />
            </button>
          )}

          {isAuthenticated ? (
            <div className="navbar-user-menu" ref={dropdownRef}>
              <button
                className="navbar-user-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                id="navbar-user-btn"
              >
                <div className="navbar-avatar">
                  {profileImage ? (
                    <img
                      src={
                        profileImage.startsWith("/")
                          ? `${API_BASE}${profileImage}`
                          : profileImage
                      }
                      alt=""
                    />
                  ) : (
                    <>
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </>
                  )}
                </div>
                <span className="navbar-username">{user?.firstName}</span>
                <FiChevronDown
                  className={`navbar-chevron ${dropdownOpen ? "navbar-chevron-open" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <>
                  <div className="navbar-dropdown" id="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <p className="navbar-dropdown-name">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="navbar-dropdown-type">{user?.type}</p>
                    </div>
                    <div className="navbar-dropdown-divider" />
                    <Link
                      to={isAdmin ? "/admin" : "/dashboard"}
                      className="navbar-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiGrid /> {t("nav.dashboard")}
                    </Link>
                    {!isAdmin && (
                      <Link
                        to="/dashboard/profile"
                        className="navbar-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiUser /> {t("nav.profile")}
                      </Link>
                    )}
                    <div className="navbar-dropdown-divider" />
                    <button
                      className="navbar-dropdown-item navbar-dropdown-logout"
                      onClick={handleLogout}
                    >
                      <FiLogOut /> {t("nav.logout")}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="navbar-auth-btns">
              <Link to="/login" className="navbar-login-btn" id="navbar-login">
                {t("nav.signIn")}
              </Link>
              <Link
                to="/register"
                className="navbar-register-btn"
                id="navbar-register"
              >
                {t("nav.signUp")}
              </Link>
            </div>
          )}

          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="navbar-mobile-menu"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
}
