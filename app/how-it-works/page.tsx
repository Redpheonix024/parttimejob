import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  UserPlus,
} from "lucide-react";
import { RupeeIcon } from "@/components/ui/rupee-icon"

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Parttimejob
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              Browse Jobs
            </Link>
            <Link href="/how-it-works" className="text-foreground font-medium">
              How it Works
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/post-job">
              <Button>Post a Job</Button>
            </Link>
            <Link href="/login" className="hidden md:block">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How Parttimejob Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Parttimejob connects people looking for part-time work with those
              who need help. Here's how it works.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <Tabs defaultValue="job-seekers" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="job-seekers">For Job Seekers</TabsTrigger>
                <TabsTrigger value="employers">For Employers</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="job-seekers">
              <div className="max-w-4xl mx-auto">
                <div className="grid gap-12 md:grid-cols-2 md:gap-8 lg:gap-16 items-center mb-16">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">
                      Find the Perfect Part-Time Job
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Parttimejob makes it easy to find part-time jobs that fit
                      your schedule, skills, and preferences. Whether you're
                      looking for a few hours of work or a regular part-time
                      position, we've got you covered.
                    </p>
                    <Link href="/">
                      <Button>Browse Jobs Now</Button>
                    </Link>
                  </div>
                  <div className="order-first md:order-last">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      width={400}
                      height={300}
                      alt="Person browsing jobs on a laptop"
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-6 text-center">
                  How to Find and Apply for Jobs
                </h3>

                <div className="grid gap-6 md:grid-cols-3 mb-12">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-4 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserPlus className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-center mb-2">
                        1. Create an Account
                      </h4>
                      <p className="text-muted-foreground text-center">
                        Sign up for a free account to access all features and
                        set up your profile.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-4 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Search className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-center mb-2">
                        2. Browse & Filter Jobs
                      </h4>
                      <p className="text-muted-foreground text-center">
                        Search for jobs that match your skills and availability
                        with our powerful filters.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-4 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-center mb-2">
                        3. Apply & Get Hired
                      </h4>
                      <p className="text-muted-foreground text-center">
                        Submit your application directly through Parttimejob and
                        start working quickly.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-muted rounded-lg p-6 md:p-8">
                  <h3 className="text-2xl font-bold mb-4">
                    Tips for Job Seekers
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Complete your profile with all relevant skills and
                        experience to stand out to employers.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Set up job alerts to be notified when new opportunities
                        matching your criteria are posted.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Respond quickly to job postings - many part-time
                        positions are filled rapidly.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Customize your application for each job to highlight
                        relevant experience.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Build your reputation with positive reviews from
                        previous employers.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="employers">
              <div className="max-w-4xl mx-auto">
                <div className="grid gap-12 md:grid-cols-2 md:gap-8 lg:gap-16 items-center mb-16">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">
                      Find Qualified Part-Time Help
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Parttimejob connects you with qualified candidates for
                      your part-time positions or short-term projects. Post a
                      job and start receiving applications from interested
                      candidates within minutes.
                    </p>
                    <Link href="/post-job">
                      <Button>Post a Job</Button>
                    </Link>
                  </div>
                  <div>
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      width={400}
                      height={300}
                      alt="Employer reviewing applications"
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-6 text-center">
                  How to Post Jobs and Find Candidates
                </h3>

                <div className="grid gap-6 md:grid-cols-3 mb-12">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-4 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-center mb-2">
                        1. Create a Job Posting
                      </h4>
                      <p className="text-muted-foreground text-center">
                        Describe your job, requirements, schedule, and
                        compensation in our easy-to-use form.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-4 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-center mb-2">
                        2. Review Applications
                      </h4>
                      <p className="text-muted-foreground text-center">
                        Receive applications and review candidate profiles,
                        experience, and availability.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="mb-4 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <RupeeIcon className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-center mb-2">
                        3. Hire & Pay
                      </h4>
                      <p className="text-muted-foreground text-center">
                        Contact candidates, make your selection, and manage
                        payments securely through our platform.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-muted rounded-lg p-6 md:p-8">
                  <h3 className="text-2xl font-bold mb-4">
                    Tips for Employers
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Be specific about job requirements, hours, and
                        compensation to attract the right candidates.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Consider marking urgent jobs to get more visibility for
                        time-sensitive positions.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Respond promptly to applications to keep candidates
                        engaged.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Verify candidate skills with our built-in screening
                        questions and reference check tools.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Leave reviews for workers to help build a reliable
                        community of professionals.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of people finding flexible work and qualified help
              on Parttimejob.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button variant="secondary" size="lg">
                  Find Jobs
                </Button>
              </Link>
              <Link href="/post-job">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white/10"
                >
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Parttimejob</h3>
              <p className="text-muted-foreground text-sm">
                Connecting people with part-time opportunities since 2023.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Create Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    How It Works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Employers</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/post-job"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link
                    href="/how-it-works?tab=employers"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms & Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Parttimejob. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
