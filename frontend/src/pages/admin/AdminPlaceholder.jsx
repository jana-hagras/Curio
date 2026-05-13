import { FiTool } from 'react-icons/fi';

export default function AdminPlaceholder({ title = 'Coming Soon' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400,
      gap: 16,
      animation: 'fadeInUp 0.4s ease forwards',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        background: 'rgba(212, 168, 67, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--gold-primary)',
      }}>
        <FiTool size={28} />
      </div>
      <h2 style={{ fontSize: 24 }}>{title}</h2>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: 15,
        maxWidth: 400,
        textAlign: 'center',
      }}>
        This section is under development and will be available soon.
      </p>
    </div>
  );
}
