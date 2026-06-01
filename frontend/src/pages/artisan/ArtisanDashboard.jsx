import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { applicationService } from '../../services/applicationService';
import { marketItemService } from '../../services/marketItemService';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { reviewService } from '../../services/reviewService';
import { milestoneService } from '../../services/milestoneService';
import { workshopService } from '../../services/workshopService';
import { mentorshipService } from '../../services/mentorshipService';
import {
  FiPackage, FiSend, FiDollarSign, FiCheckCircle,
  FiTrendingUp, FiStar, FiArrowRight, FiArrowLeft, FiPlus, FiBarChart2, FiClock,
  FiMessageCircle, FiInfo, FiCalendar, FiBookOpen, FiActivity, FiCreditCard, FiUsers,
  FiShoppingCart
} from 'react-icons/fi';
import DashboardSkeleton from '../../components/ui/DashboardSkeleton';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import { useTranslation } from 'react-i18next';
import '../shared/Dashboard.css';

export default function ArtisanDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, applications: 0, accepted: 0, inProgress: 0, earnings: 0, reviews: 0 });
  const [products, setProducts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation(['dashboard', 'common']);

  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    Promise.all([
      marketItemService.getByArtisan(user.id).catch(() => ({ data: { items: [] } })),
      applicationService.getByArtisan(user.id).catch(() => ({ data: { applications: [] } })),
      orderService.getByArtisan(user.id).catch(() => ({ data: { orders: [] } })),
      paymentService.getByArtisan(user.id).catch(() => ({ data: { payments: [] } })),
      workshopService.getByArtisan(user.id).catch(() => ({ data: { workshops: [] } })),
      mentorshipService.getByArtisan(user.id).catch(() => ({ data: { mentorships: [] } })),
    ]).then(async ([pRes, aRes, oRes, payRes, wRes, mRes]) => {
      const prods = pRes.data?.items || [];
      const apps = aRes.data?.applications || [];
      const artisanOrders = oRes.data?.orders || [];
      const artisanPayments = payRes.data?.payments || [];
      const artisanWorkshops = wRes.data?.workshops || [];
      const artisanMentorships = mRes.data?.mentorships || [];

      // Use DB-computed artisan amounts (after 10% commission)
      const totalGross = artisanPayments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
      const totalNet = artisanPayments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + Number(p.artisanAmount || 0), 0);
      const totalCommission = artisanPayments
        .filter(p => p.status === 'Completed')
        .reduce((sum, p) => sum + Number(p.platformCommissionAmount || 0), 0);

      const accepted = apps.filter(a => a.status === 'Approved').length;
      const inProgress = apps.filter(a => a.status === 'Approved' || a.status === 'Pending').length;

      setProducts(prods);
      setApplications(apps);
      setOrders(artisanOrders);
      setWorkshops(artisanWorkshops);
      setMentorships(artisanMentorships);
      setStats({
        products: prods.length,
        applications: apps.length,
        accepted,
        inProgress,
        earnings: totalNet,
        grossEarnings: totalGross,
        commission: totalCommission,
        reviews: 0,
      });
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <DashboardSkeleton />;

  const statCards = [
    { label: t('dashboard:artisan.activeProducts', 'Active Products'), value: stats.products, icon: FiPackage, color: '#D4A843' },
    { label: t('dashboard:artisan.totalOrders', 'Total Orders'), value: orders.length, icon: FiShoppingCart, color: '#10B981' },
    { label: t('dashboard:artisan.sentProposals', 'Sent Proposals'), value: stats.applications, icon: FiSend, color: '#3B82F6' },
    { label: t('dashboard:workshops.upcoming', 'Upcoming Workshops'), value: workshops.length, icon: FiCalendar, color: '#EC4899' },
    { label: t('dashboard:mentorships.active', 'Active Mentorships'), value: mentorships.filter(m => m.status === 'Active').length, icon: FiBookOpen, color: '#8B5CF6' },
    { label: t('dashboard:artisan.netEarnings', 'Net Earnings'), value: formatCurrency(stats.earnings), icon: FiDollarSign, color: '#10B981', hasTooltip: true },
  ];

  // Calculate earnings progress bar percentages
  const grossVal = stats.grossEarnings || 0;
  const netVal = stats.earnings || 0;
  const commVal = stats.commission || 0;
  const netPercentage = grossVal > 0 ? (netVal / grossVal) * 100 : 100;
  const commissionPercentage = grossVal > 0 ? (commVal / grossVal) * 100 : 0;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>{t('dashboard:artisan.welcome', { name: user.firstName })}</h1>
          <p>{t('dashboard:artisan.overview', "Here's what's happening with your craft business")}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button icon={FiCalendar} variant="secondary" onClick={() => navigate('/dashboard/workshops')}>{t('dashboard:workshops.newWorkshop', 'New Workshop')}</Button>
          <Button icon={FiPlus} onClick={() => navigate('/dashboard/products/new')}>{t('dashboard:artisan.newProduct', 'New Product')}</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="dashboard-stat-card" style={{ animationDelay: `${i * 0.1}s`, opacity: 1 }}>
            <div className="dashboard-stat-icon-wrapper" style={{
              background: `${card.color}15`,
              color: card.color,
            }}>
              <card.icon />
            </div>
            <div className="dashboard-stat-info">
              <p>
                {card.label}
                {card.hasTooltip && (
                  <span style={{ position: 'relative', display: 'inline-flex', cursor: 'help', marginLeft: 6 }} className="earnings-tooltip-wrapper">
                    <FiInfo size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span className="earnings-tooltip">{t('dashboard:artisan.netCommissionTooltip', 'Net after 10% platform commission')}</span>
                  </span>
                )}
              </p>
              <h3>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Finance Breakdown & Recent Orders */}
      <div className="dashboard-content-grid" style={{ marginBottom: 24 }}>
        {/* Earnings Breakdown Tracker */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>{t('dashboard:artisan.earnings', 'Earnings & Platform Fees')}</h3>
            <span className="dashboard-card-action" style={{ cursor: 'default' }}>
              {t('dashboard:wallet.title')}
            </span>
          </div>
          <div className="dashboard-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('dashboard:wallet.grossRevenue', 'Gross Revenue')}</p>
                <h4 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(grossVal)}</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t('dashboard:wallet.platformCommission', 'Platform Commission (10%)')}</p>
                <h4 style={{ fontSize: 20, fontWeight: 700, color: '#EF4444' }}>-{formatCurrency(commVal)}</h4>
              </div>
            </div>

            {/* Progress Bar showing Net vs Commission */}
            <div style={{ height: 10, width: '100%', background: '#EF4444', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${netPercentage}%`, background: '#10B981', height: '100%' }} title={`Net: ${netPercentage.toFixed(1)}%`} />
              <div style={{ width: `${commissionPercentage}%`, background: '#EF4444', height: '100%' }} title={`Commission: ${commissionPercentage.toFixed(1)}%`} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: '#10B981', borderRadius: '50%' }} />
                {t('dashboard:artisan.netEarnings', 'Net Payout')}: {netPercentage.toFixed(0)}%
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, background: '#EF4444', borderRadius: '50%' }} />
                {t('dashboard:wallet.platformCommission', 'Curio Commission')}: {commissionPercentage.toFixed(0)}%
              </span>
            </div>

            <div style={{ marginTop: 8, padding: '16px', background: 'var(--background-secondary)', borderRadius: 8, borderLeft: '4px solid var(--gold-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{t('dashboard:wallet.withdrawFunds', 'Withdrawal Portal')}</p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: '1.4' }}>{t('dashboard:wallet.processing', 'Instant transfer to local bank account available.')}</p>
              </div>
              <Button size="sm" onClick={() => navigate('/dashboard/wallet')}>{t('dashboard:wallet.withdrawFunds', 'Withdraw')}</Button>
            </div>
          </div>
        </div>

        {/* Recent Orders / Product Sales */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>{t('dashboard:artisan.recentOrders', 'Recent Orders')}</h3>
            <button onClick={() => navigate('/dashboard/applications')} className="dashboard-card-action">
              {t('dashboard:artisan.viewAllOrders', 'View All')} {isRtl ? <FiArrowLeft size={14} /> : <FiArrowRight size={14} />}
            </button>
          </div>
          <div className="dashboard-card-body">
            {orders.length === 0 ? (
              <p className="dashboard-empty-text">
                {t('dashboard:artisan.noOrdersDesc', 'No orders received yet.')}
              </p>
            ) : (
              orders.slice(0, 4).map((order) => (
                <div key={order.id} className="dashboard-row-item" onClick={() => navigate('/dashboard/applications')}>
                  <div className="dashboard-item-meta">
                    <div className="dashboard-item-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                      <FiShoppingCart />
                    </div>
                    <div className="dashboard-item-details">
                      <p className="dashboard-item-title">
                        {order.buyerName || t('dashboard:orders.buyerInfo', { name: 'Customer' })}
                      </p>
                      <p className="dashboard-item-subtitle">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="dashboard-item-price" style={{ display: 'block', fontWeight: 700 }}>
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <Badge status={order.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Listed Products & Sent Proposals */}
      <div className="dashboard-content-grid" style={{ marginBottom: 24 }}>
        {/* My Products */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>{t('dashboard:artisan.myProducts', 'My Products')}</h3>
            <button onClick={() => navigate('/dashboard/products')} className="dashboard-card-action">
              {t('dashboard:artisan.viewAll', 'View All')} {isRtl ? <FiArrowLeft size={14} /> : <FiArrowRight size={14} />}
            </button>
          </div>
          <div className="dashboard-card-body">
            {products.length === 0 ? (
              <p className="dashboard-empty-text">
                {t('dashboard:artisan.noProductsDesc', 'No products yet. Create your first listing!')}
              </p>
            ) : (
              products.slice(0, 4).map((product) => (
                <div key={product.id} className="dashboard-row-item" onClick={() => navigate(`/marketplace/${product.id}`)}>
                  <div className="dashboard-item-meta">
                    <div className="dashboard-item-img">
                      {product.image && <img src={product.image} alt="" />}
                    </div>
                    <div className="dashboard-item-details">
                      <p className="dashboard-item-title">{product.itemName}</p>
                      <p className="dashboard-item-subtitle">{t('common:categories.' + product.category, product.category)}</p>
                    </div>
                  </div>
                  <span className="dashboard-item-price">{formatCurrency(product.price)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>{t('dashboard:artisan.recentProposals', 'Recent Proposals')}</h3>
            <button onClick={() => navigate('/dashboard/applications')} className="dashboard-card-action">
              {t('dashboard:artisan.viewAll', 'View All')} {isRtl ? <FiArrowLeft size={14} /> : <FiArrowRight size={14} />}
            </button>
          </div>
          <div className="dashboard-card-body">
            {applications.length === 0 ? (
              <p className="dashboard-empty-text">
                {t('dashboard:artisan.noProposalsDesc', 'No proposals submitted yet.')}
              </p>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div key={app.id} className="dashboard-row-item" onClick={() => navigate(`/requests/${app.request_id}`)}>
                  <div className="dashboard-item-meta">
                    <div className="dashboard-item-icon">
                      <FiSend />
                    </div>
                    <div className="dashboard-item-details">
                      <p className="dashboard-item-title">{app.proposal?.slice(0, 50) || 'Proposal'}...</p>
                      <p className="dashboard-item-subtitle">{t('dashboard:proposals.request', 'Request')} #{app.request_id}</p>
                    </div>
                  </div>
                  <Badge status={app.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Workshops & Mentorships */}
      <div className="dashboard-content-grid" style={{ marginBottom: 24 }}>
        {/* Workshops hosted */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>{t('dashboard:workshops.title', 'My Workshops')}</h3>
            <button onClick={() => navigate('/dashboard/workshops')} className="dashboard-card-action">
              {t('dashboard:artisan.viewAll', 'View All')} {isRtl ? <FiArrowLeft size={14} /> : <FiArrowRight size={14} />}
            </button>
          </div>
          <div className="dashboard-card-body">
            {workshops.length === 0 ? (
              <p className="dashboard-empty-text">
                {t('dashboard:workshops.noWorkshopsYet', 'No workshops hosted yet.')}
              </p>
            ) : (
              workshops.slice(0, 4).map((workshop) => (
                <div key={workshop.id} className="dashboard-row-item" onClick={() => navigate('/dashboard/workshops')}>
                  <div className="dashboard-item-meta">
                    <div className="dashboard-item-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899' }}>
                      <FiCalendar />
                    </div>
                    <div className="dashboard-item-details">
                      <p className="dashboard-item-title">{workshop.title}</p>
                      <p className="dashboard-item-subtitle">
                        {workshop.date ? new Date(workshop.date).toLocaleDateString() : t('dashboard:workshops.noDateSet', 'No Date')}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                    {workshop.price > 0 ? formatCurrency(workshop.price) : t('dashboard:workshops.free', 'Free')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mentorship programs */}
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3>{t('dashboard:mentorships.title', 'My Mentorships')}</h3>
            <button onClick={() => navigate('/dashboard/mentorships')} className="dashboard-card-action">
              {t('dashboard:artisan.viewAll', 'View All')} {isRtl ? <FiArrowLeft size={14} /> : <FiArrowRight size={14} />}
            </button>
          </div>
          <div className="dashboard-card-body">
            {mentorships.length === 0 ? (
              <p className="dashboard-empty-text">
                {t('dashboard:mentorships.noMentorshipsYet', 'No mentorship programs yet.')}
              </p>
            ) : (
              mentorships.slice(0, 4).map((m) => (
                <div key={m.id} className="dashboard-row-item" onClick={() => navigate('/dashboard/mentorships')}>
                  <div className="dashboard-item-meta">
                    <div className="dashboard-item-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                      <FiBookOpen />
                    </div>
                    <div className="dashboard-item-details">
                      <p className="dashboard-item-title">{m.category || t('dashboard:mentorships.generalMentorship', 'General Mentorship')}</p>
                      <p className="dashboard-item-subtitle">{t('dashboard:mentorships.durationMin', { duration: m.duration })}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                      {t('dashboard:mentorships.sessionPrice', { price: formatCurrency(m.price) })}
                    </span>
                    <Badge status={m.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-stats-grid" style={{ marginTop: 24 }}>
        {[
          { label: t('dashboard:artisan.actions.browseRequests', 'Browse Requests'), desc: t('dashboard:artisan.actions.browseRequestsDesc', 'Find new craft opportunities'), icon: FiMessageCircle, path: '/requests' },
          { label: t('dashboard:artisan.actions.myWallet', 'My Wallet'), desc: t('dashboard:artisan.actions.myWalletDesc', 'Manage your earnings'), icon: FiDollarSign, path: '/dashboard/wallet' },
          { label: t('dashboard:artisan.actions.myPortfolio', 'My Portfolio'), desc: t('dashboard:artisan.actions.myPortfolioDesc', 'Showcase your best work'), icon: FiBarChart2, path: '/dashboard/portfolio' },
        ].map((action, i) => (
          <div key={i} onClick={() => navigate(action.path)} className="dashboard-stat-card" style={{ cursor: 'pointer', opacity: 1, animationDelay: `${i * 0.1}s` }}>
            <div className="dashboard-stat-icon-wrapper" style={{
              background: 'rgba(212, 168, 67, 0.1)',
              color: 'var(--gold-primary)',
            }}>
              <action.icon />
            </div>
            <div className="dashboard-stat-info">
              <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, color: 'var(--text-primary)' }}>{action.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{action.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
