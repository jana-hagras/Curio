import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import { filterByAllColumns } from './useAdminData';
import toast from 'react-hot-toast';
import './AdminTable.css';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getAll();
        setUsers(res.data?.users || []);
      } catch { toast.error('Failed to load users'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await userService.delete(id);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { toast.error('Failed to delete user'); }
  };

  const handleToggleVerified = async (user) => {
    const newVerified = !user.verified;
    try {
      await userService.update(user.id, { verified: newVerified });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, verified: newVerified } : u));
      toast.success(`${user.firstName} ${user.lastName} ${newVerified ? 'verified' : 'unverified'}`);
    } catch { toast.error('Failed to update verification'); }
  };

  const filtered = filterByAllColumns(users, search, u =>
    `${u.id} ${u.firstName} ${u.lastName} ${u.email} ${u.type} ${u.phone || ''} ${u.address || ''} ${u.verified ? 'verified' : 'unverified'}`
  );

  const buyers = users.filter(u => u.type === 'Buyer').length;
  const artisans = users.filter(u => u.type === 'Artisan').length;
  const admins = users.filter(u => u.type === 'Admin').length;
  const verified = users.filter(u => u.type === 'Artisan' && u.verified).length;

  const roleBadge = (type) => {
    const map = { Buyer: 'badge-blue', Artisan: 'badge-green', Admin: 'badge-gold' };
    return <span className={`admin-badge ${map[type] || 'badge-purple'}`}>{type || 'Unknown'}</span>;
  };

  const renderSkeleton = () => (
    <div className="admin-loading-skeleton">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="admin-skeleton-row">
          <div className="admin-skeleton-cell" style={{ width: 40 }} />
          <div className="admin-skeleton-cell" style={{ width: 140 }} />
          <div className="admin-skeleton-cell" style={{ width: 180 }} />
          <div className="admin-skeleton-cell" style={{ width: 70 }} />
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
          <h1>Manage Users</h1>
          <p className="admin-table-count">{users.length} registered · Search by name, email, role, status</p>
        </div>
        <div className="admin-search-bar">
          <FiSearch className="search-icon" />
          <input
            placeholder="Search all fields..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-mini-stats">
        <div className="admin-mini-stat">
          <p className="admin-mini-stat-label">Buyers</p>
          <p className="admin-mini-stat-value" style={{ color: '#3B82F6' }}>{buyers}</p>
        </div>
        <div className="admin-mini-stat">
          <p className="admin-mini-stat-label">Artisans</p>
          <p className="admin-mini-stat-value" style={{ color: '#10B981' }}>{artisans}</p>
        </div>
        <div className="admin-mini-stat">
          <p className="admin-mini-stat-label">Verified Artisans</p>
          <p className="admin-mini-stat-value" style={{ color: '#D4A843' }}>{verified}</p>
        </div>
        <div className="admin-mini-stat">
          <p className="admin-mini-stat-label">Admins</p>
          <p className="admin-mini-stat-value" style={{ color: '#8B5CF6' }}>{admins}</p>
        </div>
      </div>

      <div className="admin-table-wrapper">
        {loading ? renderSkeleton() : filtered.length === 0 ? (
          <div className="admin-table-empty"><p>No users found.</p></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="admin-cell-stack">
                      <span className="admin-cell-stack-primary">{u.firstName} {u.lastName}</span>
                      <span className="admin-cell-stack-secondary">ID #{u.id}</span>
                    </div>
                  </td>
                  <td className="admin-cell-secondary">{u.email}</td>
                  <td>{roleBadge(u.type)}</td>
                  <td>
                    {u.type === 'Artisan' ? (
                      <button
                        className={`admin-toggle ${u.verified ? 'active' : ''}`}
                        onClick={() => handleToggleVerified(u)}
                        title={u.verified ? 'Click to unverify' : 'Click to verify'}
                      />
                    ) : (
                      <span className="admin-cell-secondary">—</span>
                    )}
                  </td>
                  <td className="admin-cell-secondary">
                    {u.joinDate ? new Date(u.joinDate).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-action-btn danger" title="Delete" onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}>
                        <FiTrash2 />
                      </button>
                    </div>
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
