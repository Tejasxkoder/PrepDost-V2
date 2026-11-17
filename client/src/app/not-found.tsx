import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-sm text-accent">404</p>
        <h1 className="mt-2 mb-1 text-2xl font-semibold">Page not found</h1>
        <p className="mb-6 text-sm text-fg-muted">
          The page you are looking for doesn&apos;t exist or was moved.
        </p>
        <Button asChild variant="primary" size="lg">
          <Link href={ROUTES.dashboard}>Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
