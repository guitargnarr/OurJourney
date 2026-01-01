import { useState } from 'react';
import { Heart, Lock, Mail, User, Sparkles, Eye, EyeOff } from 'lucide-react';

function Login({ onLogin, onShowPrivacy }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'demo'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoPassword, setDemoPassword] = useState('');

  // Generate a memorable demo password
  const generateDemoPassword = () => {
    const adjectives = ['happy', 'sunny', 'cozy', 'sweet', 'bright'];
    const nouns = ['journey', 'moment', 'memory', 'dream', 'story'];
    const numbers = Math.floor(Math.random() * 100);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}-${noun}-${numbers}`;
  };

  const handleDemoLogin = () => {
    const generatedPassword = generateDemoPassword();
    setDemoPassword(generatedPassword);

    // Create demo token and store in localStorage
    const demoToken = btoa(JSON.stringify({
      type: 'demo',
      created: Date.now(),
      password: generatedPassword
    }));

    localStorage.setItem('ourjourney_token', demoToken);
    localStorage.setItem('ourjourney_demo_mode', 'true');
    localStorage.setItem('ourjourney_demo_password', generatedPassword);

    onLogin(demoToken);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('ourjourney_token', data.token);
        localStorage.removeItem('ourjourney_demo_mode');
        onLogin(data.token);
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Try Demo mode or check your internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('ourjourney_token', data.token);
        localStorage.removeItem('ourjourney_demo_mode');
        onLogin(data.token);
      } else {
        setError(data.message || 'Could not create account. Try again.');
      }
    } catch (err) {
      setError('Connection error. Try Demo mode to explore first.');
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
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      padding: '1rem',
    },
    card: {
      backgroundColor: '#1e293b',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      width: '100%',
      maxWidth: '420px',
      border: '1px solid #334155',
    },
    header: {
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    logo: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.75rem',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#f8fafc',
      margin: 0,
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#94a3b8',
      marginTop: '0.25rem',
    },
    tabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
      backgroundColor: '#0f172a',
      padding: '0.25rem',
      borderRadius: '0.5rem',
    },
    tab: {
      flex: 1,
      padding: '0.75rem',
      minHeight: '44px',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabActive: {
      backgroundColor: '#14b8a6',
      color: 'white',
    },
    tabInactive: {
      backgroundColor: 'transparent',
      color: '#94a3b8',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#cbd5e1',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      paddingRight: '2.5rem',
      border: '1px solid #334155',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      boxSizing: 'border-box',
    },
    eyeButton: {
      position: 'absolute',
      right: '0.25rem',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      padding: '0.5rem',
      minWidth: '44px',
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      padding: '0.875rem',
      minHeight: '44px',
      backgroundColor: '#14b8a6',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondary: {
      padding: '0.875rem',
      minHeight: '44px',
      backgroundColor: 'transparent',
      color: '#f97316',
      border: '2px solid #f97316',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    error: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#f87171',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      textAlign: 'center',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      margin: '1rem 0',
      color: '#64748b',
      fontSize: '0.875rem',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: '#334155',
    },
    demoInfo: {
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      color: '#fb923c',
      padding: '1rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      marginTop: '1rem',
      lineHeight: '1.5',
      border: '1px solid rgba(249, 115, 22, 0.2)',
    },
    demoPassword: {
      backgroundColor: '#0f172a',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      fontFamily: 'monospace',
      fontSize: '1rem',
      color: '#14b8a6',
      marginTop: '0.5rem',
      display: 'block',
      wordBreak: 'break-all',
    },
    featureList: {
      marginTop: '1.5rem',
      padding: '1rem',
      backgroundColor: 'rgba(20, 184, 166, 0.05)',
      borderRadius: '0.5rem',
      border: '1px solid rgba(20, 184, 166, 0.1)',
    },
    featureTitle: {
      color: '#14b8a6',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '0.75rem',
    },
    featureItem: {
      color: '#94a3b8',
      fontSize: '0.8rem',
      marginBottom: '0.375rem',
      paddingLeft: '1rem',
      position: 'relative',
    },
  };

  return (
    <div style={styles.container}>
      <main role="main" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <Heart size={32} color="#f97316" fill="#f97316" />
            <h1 style={styles.title}>OurJourney</h1>
          </div>
          <p style={styles.subtitle}>Track your story together</p>
        </div>

        {/* Mode Tabs */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(mode === 'signin' ? styles.tabActive : styles.tabInactive)
            }}
            onClick={() => { setMode('signin'); setError(''); }}
          >
            Sign In
          </button>
          <button
            style={{
              ...styles.tab,
              ...(mode === 'signup' ? styles.tabActive : styles.tabInactive)
            }}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* Sign In Form */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Lock size={16} />
                Password
              </label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={styles.input}
                  required
                />
                <button
                  type="button"
                  style={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Lock size={16} />
                Password
              </label>
              <div style={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (6+ chars)"
                  style={styles.input}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  style={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Lock size={16} />
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Demo Mode Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span>or</span>
          <div style={styles.dividerLine}></div>
        </div>

        {/* Demo Button */}
        <button
          style={styles.buttonSecondary}
          onClick={handleDemoLogin}
        >
          <Sparkles size={18} />
          Try Demo (No Account Needed)
        </button>

        {demoPassword && (
          <div style={styles.demoInfo}>
            <strong>Your demo password:</strong>
            <code style={styles.demoPassword}>{demoPassword}</code>
            <small style={{ display: 'block', marginTop: '0.5rem', opacity: 0.8 }}>
              Save this to return to your demo data later.
            </small>
          </div>
        )}

        {/* PWA Features */}
        <div style={styles.featureList}>
          <div style={styles.featureTitle}>PWA Architecture Demo</div>
          <div style={styles.featureItem}>- Offline-first with IndexedDB</div>
          <div style={styles.featureItem}>- Service worker caching</div>
          <div style={styles.featureItem}>- Real-time Supabase sync</div>
          <div style={styles.featureItem}>- Install as native app</div>
        </div>

        {onShowPrivacy && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={onShowPrivacy}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.875rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                minHeight: '44px',
                padding: '0.75rem 1rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Privacy Policy
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Login;
