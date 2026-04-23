const NotFound = () => {

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 className="text-heading-h1" style={{ marginBottom: 'var(--spacing-400)', fontWeight: 700, color: 'var(--text-header)' }}>404</h1>
        <p className="text-paragraph-lg" style={{ marginBottom: 'var(--spacing-400)', color: 'var(--text-paragraph)' }}>Oops! Page not found</p>
        <a href="/" className="text-paragraph-sm" style={{ color: 'var(--icon-cta)' }}>
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
