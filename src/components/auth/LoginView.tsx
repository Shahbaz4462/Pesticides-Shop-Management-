import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { ShopSettings } from '../../types';
import { Sprout, Lock, User, Shield, Users, LogIn } from 'lucide-react';

interface Props {
  onLogin: (role: 'ADMIN' | 'STAFF', staffName?: string) => void;
  settings?: ShopSettings;
}

export const LoginView: React.FC<Props> = ({ onLogin, settings }) => {
  const [loginType, setLoginType] = useState<'ADMIN' | 'STAFF'>('ADMIN');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [error, setError] = useState('');

  const allStaff = useLiveQuery(() => db.staff.toArray(), []) || [];
  const staffList = allStaff.filter(s => s.isActive);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple admin login for demo (in production, use proper authentication)
    if (adminUsername === 'admin' && adminPassword === 'admin123') {
      onLogin('ADMIN', 'Administrator');
    } else {
      setError('Invalid admin credentials');
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const staff = staffList.find(s => 
      s.username === staffUsername && 
      s.password === staffPassword
    );

    if (staff) {
      onLogin('STAFF', staff.name);
    } else {
      setError('Invalid staff credentials or account inactive');
    }
  };

  return (
    <div
        className="login-screen"
        style={{
          minHeight: '100vh',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'var(--bg-app)'
      }}
    >
      <div 
        className="card-3d login-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '32px 28px',
          textAlign: 'center'
        }}
      >
        {/* Logo */}
        <div 
          className="login-logo"
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 20px',
            boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
          }}
        >
          <Sprout size={40} />
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          {settings?.shopName || 'Kisan Dost Pesticides'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Shop Management System
        </p>

        {/* Login Type Toggle */}
        <div 
          style={{
            display: 'flex',
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '24px',
            border: '1px solid var(--border-light)'
          }}
        >
          <button
            onClick={() => { setLoginType('ADMIN'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: loginType === 'ADMIN' ? 'var(--primary-600)' : 'transparent',
              color: loginType === 'ADMIN' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Shield size={16} />
            Admin
          </button>
          <button
            onClick={() => { setLoginType('STAFF'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: loginType === 'STAFF' ? 'var(--primary-600)' : 'transparent',
              color: loginType === 'STAFF' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} />
            Staff
          </button>
        </div>

        {error && (
          <div 
            style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'var(--danger-100)',
              color: '#b91c1c',
              fontSize: '0.85rem',
              marginBottom: '16px',
              fontWeight: 600
            }}
          >
            {error}
          </div>
        )}

        {/* Admin Login Form */}
        {loginType === 'ADMIN' ? (
          <form onSubmit={handleAdminLogin}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">
                <User size={14} />
                Admin Username
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={adminUsername}
                onChange={e => setAdminUsername(e.target.value)}
                placeholder="Enter admin username"
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">
                <Lock size={14} />
                Admin Password
              </label>
              <input
                type="password"
                className="form-input"
                required
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              <LogIn size={18} />
              <span>Login as Admin</span>
            </button>
          </form>
        ) : (
          /* Staff Login Form */
          <form onSubmit={handleStaffLogin}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">
                <User size={14} />
                Staff Username
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={staffUsername}
                onChange={e => setStaffUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">
                <Lock size={14} />
                Staff Password
              </label>
              <input
                type="password"
                className="form-input"
                required
                value={staffPassword}
                onChange={e => setStaffPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              <LogIn size={18} />
              <span>Login as Staff</span>
            </button>
          </form>
        )}

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '20px' }}>
          Default Admin: admin / admin123
        </p>
      </div>
    </div>
  );
};