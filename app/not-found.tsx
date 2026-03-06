import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Demo Project
          </h1>
          <p className="text-xl text-gray-600">
            Practice E-commerce Application
          </p>
        </div>

        <div className="space-y-4 text-left bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900">
            ℹ️ About This Project
          </h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• This is a <strong>demonstration project</strong> built for learning and practice purposes</li>
            <li>• It showcases a modern Next.js e-commerce application with TypeScript, Prisma, and PostgreSQL</li>
            <li>• Not all features are fully implemented or connected to real services</li>
            <li>• This is <strong>not a production-ready application</strong> for actual purchases</li>
          </ul>
        </div>

        <div className="pt-4">
          <p className="text-gray-600 mb-4">
            You can explore the home page to see the available demo features.
          </p>
          <Link href="/">
            <Button size="lg" className="w-full md:w-auto">
              Return to Home Page
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Built with Next.js 15 · React 18 · TypeScript · Prisma · PostgreSQL
          </p>
        </div>
      </Card>
    </div>
  );
}
