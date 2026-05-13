import { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { orderService } from '../../services/orderService';
import { useAdminData, filterByAllColumns } from './useAdminData';
import { FiSearch } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';
import './AdminTable.css';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { userName, loaded: lookupReady } = useAdminData();

  useEffect(() => {
    (async () => {
      try {
        const [pRes, oRes] = await Promise.all([
          paymentService.search(''),
          orderService.getAll(),
        ]);
        setPayments(pRes.data?.payments || []);
        setOrders(oRes.data?.orders || []);
      } catch {
        setPayments([]);
        setOrders([]);
      }
      finally { setLoading(false); }
    })();
  }, []);

  const isReady = !loading && lookupReady;
  const orderMap = Object.fromEntries(orders.map(o => [o.id, o]));

  const enriched = payments.map(p => {
    const order = orderMap[p.orderId];
    return {
      ...p,
      buyerName: order ? userName(order.buyerId) : '—',
      orderRef: order ? `Order #${p.orderId}` : `#${p.orderId || '—'}`,
    };
  });

  const filtered = filterByAllColumns(enriched, search, p =>
    `${p.id} ${p.buyerName} ${p.orderRef} ${p.totalAmount || p.amount || ''} ${p.paymentMethod || p.method || ''} ${p.status || ''}`
  );

  const totalProcessed = payments.reduce((s, p) => s + Number(p.totalAmount || p.amount || 0), 0);
  const completed = payments.filter(p => p.status === 'Completed').length;
  const pending = payments.filter(p => !p.status || p.status === 'Pending').length;

  const statusBadge = (status) => {
    const map = { Completed: 'badge-green', Pending: 'badge-yellow', Failed: 'badge-red', Refunded: 'badge-purple' };
    return <span className={`admin-badge ${map[status] || 'badge-yellow'}`}>{status || 'Pending'}</span>;
  };

  const renderSkeleton = () => (
    <div className="admin-loading-skeleton">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="admin-skeleton-row">
          <div className="admin-skeleton-cell" style={{ width: 130 }} />
          <div className="admin-skeleton-cell" style={{ width: 100 }} />
          <div className="admin-skeleton-cell" style={{ width: 80 }} />
          <div className="admin-skeleton-cell" style={{ width: 90 }} />
          <div className="admin-skeleton-cell" style={{ width: 70 }} />
          <div className="admin-skeleton-cell" style={{ width: 90 }} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin-table-page">
      <div className="admin-table-header">
        <div>
          <h1>Payments</h1>
          <p className="admin-table-count">{payments.length} transactions · Search by buyer, method, status, amount</p>
        </div>
        <div className="admin-search-bar">
          <FiSearch className="search-icon" />
          <input placeholder="Search all fields..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="admin-mini-stats">
        <div className="admin-mini-stat">
          <p className="admin-mini-stat-label">Total Processed</p>
          <p className="admin-mini-stat-value" style={{ color: '#D4A843' }}>{formatCurrency(totalProcessed)}</p>
        </div>
        <div className="admin-mini-stat">
          <p className="admin-mini-stat-label">Completed</p>
          <p className="admin-mini-stat-value" style={{ color: '#10B981' }}>{completed}</p>
        </div>
        <div className="admin-mini-stat">
          <p className="admin-mini-stat-label">Pending</p>
          <p className="admin-mini-stat-value" style={{ color: '#F59E0B' }}>{pending}</p>
        </div>
      </div>

      <div className="admin-table-wrapper">
        {!isReady ? renderSkeleton() : filtered.length === 0 ? (
          <div className="admin-table-empty"><p>No payment records found.</p></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Payment</th>
                <th>Buyer</th>
                <th>Order</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="admin-cell-id">#{p.id}</td>
                  <td className="admin-cell-primary">{p.buyerName}</td>
                  <td className="admin-cell-secondary">{p.orderRef}</td>
                  <td className="admin-cell-primary">{formatCurrency(p.totalAmount || p.amount)}</td>
                  <td className="admin-cell-secondary">{p.paymentMethod || p.method || '—'}</td>
                  <td>{statusBadge(p.status)}</td>
                  <td className="admin-cell-secondary">
                    {(p.transactionDate || p.paymentDate) ? new Date(p.transactionDate || p.paymentDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
