import { PageHeading } from "@/components/PageHeading";

const NotFound = () => {

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-neutral-900)' }}>
      <div className="text-center">
        <PageHeading level="h1" className="mx-0 px-4 mb-4">404</PageHeading>
        <p className="mb-4 text-paragraph-lg" style={{ color: 'var(--text-paragraph)' }}>Oops! Page not found</p>
        <a href="/" className="text-paragraph-sm" style={{ color: 'var(--icon-cta)' }}>
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
