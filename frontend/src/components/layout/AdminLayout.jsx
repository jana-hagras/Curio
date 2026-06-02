import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FiGrid, FiUsers, FiShoppingBag, FiFileText, FiPackage,
  FiSettings, FiBarChart2, FiShield, FiLogOut, FiStar, FiCreditCard, FiSend, FiImage,
  FiBookOpen, FiVideo
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import './Sidebar.css';

export default function AdminLayout() {
  const { logout } = useAuth();
  const { t } = useTranslation(['admin', 'common']);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (sidebarOpen) {
      document.documentElement.classList.add('no-scroll');
    } else {
      document.documentElement.classList.remove('no-scroll');
    }
    return () => {
      document.documentElement.classList.remove('no-scroll');
    };
  }, [sidebarOpen]);

  const adminLinks = [
    { path: '/admin', label: t('common:sidebar.overview'), icon: FiGrid, end: true },
    { path: '/admin/users', label: t('admin:users.title'), icon: FiUsers },
    { path: '/admin/products', label: t('admin:products.title'), icon: FiPackage },
    { path: '/admin/orders', label: t('admin:orders.title'), icon: FiShoppingBag },
    { path: '/admin/requests', label: t('admin:requests.title'), icon: FiFileText },
    { path: '/admin/applications', label: t('admin:applications.title'), icon: FiSend },
    { path: '/admin/reviews', label: t('admin:reviews.title'), icon: FiStar },
    { path: '/admin/payments', label: t('admin:payments.title'), icon: FiCreditCard },
    { path: '/admin/portfolios', label: t('admin:portfolios.title'), icon: FiImage },
    { path: '/admin/mentorships', label: t('admin:mentorships.title'), icon: FiBookOpen },
    { path: '/admin/workshops', label: t('admin:workshops.title'), icon: FiVideo },
    { path: '/admin/settings', label: t('admin:settings.title'), icon: FiSettings },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar 
        showSidebarToggle={true} 
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} 
        sidebarOpen={sidebarOpen} 
      />
      <div className="dashboard-layout">
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} id="admin-sidebar">
          <div className="sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiShield style={{ color: 'var(--gold-primary)', fontSize: 18 }} />
              <h3>{t('common:nav.adminPanel')}</h3>
            </div>
          </div>
          <nav className="sidebar-nav">
            {adminLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <link.icon className="sidebar-link-icon" />
                <span>{link.label}</span>
              </NavLink>
            ))}
            <div style={{ margin: '16px 0', borderTop: '1px solid rgba(212,168,67,0.1)' }} />
            <button
              onClick={logout}
              className="sidebar-link"
              style={{ width: '100%', textAlign: 'left', color: '#EF4444' }}
            >
              <FiLogOut className="sidebar-link-icon" />
              <span>{t('common:sidebar.signOut')}</span>
            </button>
          </nav>
        </aside>
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}

