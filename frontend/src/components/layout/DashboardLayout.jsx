import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FiGrid, FiShoppingBag, FiFileText, FiDollarSign, FiUser,
  FiPackage, FiImage, FiSend, FiHeart, FiInbox, FiBriefcase,
  FiBookOpen, FiCalendar, FiMessageSquare
} from 'react-icons/fi';
import Navbar from './Navbar';
import Footer from './Footer';
import BackButton from '../ui/BackButton';
import { useChat } from '../../hooks/useChat';
import './Sidebar.css';

export default function DashboardLayout() {
  const { isBuyer, isArtisan } = useAuth();
  const { totalUnread } = useChat();

  const buyerLinks = [
    { path: '/dashboard', label: 'Overview', icon: FiGrid, end: true },
    { path: '/dashboard/orders', label: 'My Orders', icon: FiShoppingBag },
    { path: '/dashboard/requests', label: 'My Requests', icon: FiFileText },
    { path: '/dashboard/mentorships', label: 'My Mentorships', icon: FiBookOpen },
    { path: '/dashboard/workshops', label: 'My Workshops', icon: FiCalendar },
    { path: '/dashboard/proposals', label: 'Proposals', icon: FiInbox },
    { path: '/dashboard/favorites', label: 'Favorites', icon: FiHeart },
    { path: '/dashboard/payments', label: 'Payments', icon: FiDollarSign },
    { path: '/dashboard/chat', label: 'Messages', icon: FiMessageSquare, badge: totalUnread },

    { path: '/dashboard/profile', label: 'Profile', icon: FiUser },
  ];

  const artisanLinks = [
    { path: '/dashboard', label: 'Overview', icon: FiGrid, end: true },
    { path: '/dashboard/products', label: 'My Products', icon: FiPackage },
    { path: '/dashboard/applications', label: 'My Orders', icon: FiBriefcase },
    { path: '/dashboard/mentorships', label: 'Mentorships', icon: FiBookOpen },
    { path: '/dashboard/workshops', label: 'Workshops', icon: FiCalendar },
    { path: '/dashboard/portfolio', label: 'Portfolio', icon: FiImage },
    { path: '/dashboard/wallet', label: 'Wallet', icon: FiDollarSign },
    { path: '/dashboard/chat', label: 'Messages', icon: FiMessageSquare, badge: totalUnread },

    { path: '/dashboard/profile', label: 'Profile', icon: FiUser },
  ];

  const links = isBuyer ? buyerLinks : artisanLinks;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar" id="sidebar">
          <div className="sidebar-header">
            <h3>Dashboard</h3>
          </div>
          <nav className="sidebar-nav">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <link.icon className="sidebar-link-icon" />
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span style={{
                    background: 'var(--gold-primary)',
                    color: 'var(--black-deep)',
                    fontSize: '11px',
                    fontWeight: 700,
                    minWidth: '18px',
                    height: '18px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 5px',
                    marginLeft: 'auto',
                  }}>
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="dashboard-content">
          <BackButton />
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}
