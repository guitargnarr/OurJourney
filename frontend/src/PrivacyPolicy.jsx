import { ArrowLeft } from 'lucide-react'

function PrivacyPolicy({ onClose }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            background: 'none',
            border: 'none',
            color: '#f43f5e',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          <ArrowLeft size={20} />
          Back to App
        </button>

        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Privacy Policy</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Last updated: November 25, 2025
        </p>

        <div style={{ lineHeight: '1.8', color: '#374151' }}>
          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Overview</h2>
          <p>
            OurJourney is a private relationship tracking app designed for couples.
            We are committed to protecting your privacy and being transparent about how your data is handled.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Data Collection</h2>
          <p><strong>What we collect:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Relationship data you voluntarily enter (goals, memories, notes, events)</li>
            <li>Login credentials (password only, stored encrypted)</li>
            <li>Usage data for app functionality</li>
          </ul>

          <p><strong>What we DO NOT collect:</strong></p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>No tracking cookies</li>
            <li>No advertising identifiers</li>
            <li>No location data</li>
            <li>No data sharing with third parties</li>
            <li>No analytics or behavioral tracking</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Data Storage</h2>
          <p>
            Your data is stored securely in a private PostgreSQL database hosted on Railway.app.
            All connections use encrypted HTTPS/TLS. Only you and your partner can access your data
            using your shared password.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Data Usage</h2>
          <p>
            We use your data solely to provide the OurJourney app functionality:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Display your relationship timeline</li>
            <li>Track shared goals and progress</li>
            <li>Store memories and love notes</li>
            <li>Manage calendar events</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Data Retention</h2>
          <p>
            Your data is retained indefinitely until you choose to delete it.
            You can delete individual entries at any time using the delete buttons in the app.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Your Rights</h2>
          <p>You have the right to:</p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li><strong>Access:</strong> View all your data at any time in the app</li>
            <li><strong>Delete:</strong> Remove any or all entries using in-app delete functions</li>
            <li><strong>Export:</strong> Use the "Export Insights" feature to download your data</li>
            <li><strong>Account Deletion:</strong> Contact us to delete your entire account and all data</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Security</h2>
          <p>
            We implement industry-standard security measures:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Encrypted database connections (TLS/SSL)</li>
            <li>Password-protected access</li>
            <li>Secure hosting infrastructure</li>
            <li>Regular security updates</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Children's Privacy</h2>
          <p>
            OurJourney is intended for adults in romantic relationships.
            We do not knowingly collect data from children under 13.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Changes to Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time. The "Last updated" date
            at the top will reflect any changes. Continued use of the app constitutes acceptance
            of the updated policy.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>Contact</h2>
          <p>
            For privacy-related questions or to request account deletion, contact:
          </p>
          <p style={{ marginTop: '1rem' }}>
            <strong>Email:</strong> matthewdscott7@gmail.com<br />
            <strong>Developer:</strong> Matthew Scott
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>GDPR Compliance</h2>
          <p>
            For users in the European Union, we comply with GDPR requirements:
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li>Lawful basis for processing: Consent (by using the app)</li>
            <li>Data portability: Use Export feature to download your data</li>
            <li>Right to erasure: Contact us to delete your account</li>
            <li>Data controller: Matthew Scott, matthewdscott7@gmail.com</li>
          </ul>

          <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            By using OurJourney, you agree to this Privacy Policy and our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
