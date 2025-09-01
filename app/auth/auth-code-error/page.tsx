import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, Mail, RefreshCw } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl">
                Confirmation Failed
              </CardTitle>
              <CardDescription>
                There was a problem confirming your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <p>
                  The confirmation link may have expired or been used already.
                </p>
                <p>
                  This can happen if:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>The link is older than 24 hours</li>
                  <li>You&apos;ve already confirmed your account</li>
                  <li>The link was corrupted during forwarding</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Link href="/auth/login" className="w-full">
                  <Button className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Try Signing In
                  </Button>
                </Link>
                
                <Link href="/auth/forgot-password" className="w-full">
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Request New Confirmation
                  </Button>
                </Link>
                
                <Link href="/" className="w-full">
                  <Button variant="ghost" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Need help? Contact support if you continue having issues.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}