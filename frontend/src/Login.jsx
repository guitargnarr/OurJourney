import { useState } from 'react';
import { Heart, Lock } from 'lucide-react';

function Login({ onLogin, onShowPrivacy }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('ourjourney_token', data.token);
        onLogin(data.token);
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '400px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    logo: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1a202c',
      margin: 0,
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#718096',
      marginTop: '0.5rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#4a5568',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    input: {
      padding: '0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    button: {
      padding: '0.75rem',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '0.5rem',
    },
    error: {
      backgroundColor: '#fed7d7',
      color: '#c53030',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      textAlign: 'center',
    },
    info: {
      backgroundColor: '#e6fffa',
      color: '#047481',
      padding: '1rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      marginTop: '1rem',
      lineHeight: '1.5',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <Heart size={32} color="#f43f5e" />
            <h1 style={styles.title}>OurJourney</h1>
          </div>
          <p style={styles.subtitle}>Enter your shared password to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your shared password"
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
              }}
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = '#764ba2';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = '#667eea';
            }}
          >
            {loading ? 'Logging in...' : 'Enter OurJourney'}
          </button>
        </form>

        <div style={styles.info}>
          <strong>💕 Welcome to your shared space!</strong><br />
          Track your relationship journey together with goals, memories, and special moments.
          Use the password you both agreed on.
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={onShowPrivacy}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;