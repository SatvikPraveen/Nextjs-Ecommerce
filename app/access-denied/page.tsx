// app/access-denied/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AccessDeniedPage() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md space-y-6 p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600">
          You don&apos;t have permission to view this page.
        </p>
        <Link href="/">
          <Button size="lg" className="w-full">
            Return to Home Page
          </Button>
        </Link>
      </Card>
    </div>
  );
}
