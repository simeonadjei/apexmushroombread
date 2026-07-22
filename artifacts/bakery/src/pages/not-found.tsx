import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
      <div className="max-w-md space-y-6">
        <h1 className="font-serif text-6xl font-bold text-gray-900">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">Page not found</h2>
          <p className="text-muted-foreground">
            We couldn't find the page you're looking for. The link might be broken or the page may have been removed.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}