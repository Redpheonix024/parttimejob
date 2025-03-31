import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function JobPosted() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Parttimejob
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Job Posted Successfully!</CardTitle>
            <CardDescription>
              Your job has been posted and is now live on Parttimejob.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            <p className="text-muted-foreground">
              Your job listing will be visible to potential candidates for the
              next 30 days.
            </p>
            <p className="text-muted-foreground">
              You can manage your job posting from your dashboard.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full" asChild>
              <Link href="/">View All Jobs</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/post-job">Post Another Job</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>

      <footer className="bg-background border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Parttimejob. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
