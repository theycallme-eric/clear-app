const NotFound = () => {

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-neutral-900)' }}>
      <div className="text-center">
        <h1 className="mb-4 text-heading-h1 font-bold" style={{ color: 'var(--text-header)' }}>404</h1>
        <p className="mb-4 text-paragraph-lg" style={{ color: 'var(--text-paragraph)' }}>Oops! Page not found</p>
        <a href="/" className="text-paragraph-sm" style={{ color: 'var(--icon-cta)' }}>
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
