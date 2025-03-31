import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building, Mail, MapPin, Phone } from "lucide-react";

export default function About() {
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
            <Link
              href="/how-it-works"
              className="text-muted-foreground hover:text-foreground"
            >
              How it Works
            </Link>
            <Link href="/about" className="text-foreground font-medium">
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
              About Parttimejob
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're on a mission to make part-time work more accessible and
              efficient for everyone.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-12 md:grid-cols-2 md:gap-8 lg:gap-16 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-muted-foreground mb-4">
                  Parttimejob was founded in 2023 with a simple idea: make it
                  easier for people to find flexible work and for businesses to
                  find qualified part-time help.
                </p>
                <p className="text-muted-foreground mb-4">
                  We noticed that while full-time job platforms were abundant,
                  there was a gap in the market for quality part-time work
                  connections. Many talented individuals—students, parents,
                  retirees, and side-hustlers—were looking for flexible
                  opportunities that traditional job boards didn't effectively
                  serve.
                </p>
                <p className="text-muted-foreground">
                  Today, Parttimejob has connected thousands of job seekers with
                  part-time opportunities across various industries, helping
                  businesses find the perfect match for their short-term needs.
                </p>
              </div>
              <div>
                <Image
                  src="/placeholder.svg?height=300&width=400"
                  width={400}
                  height={300}
                  alt="Parttimejob team"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Our Mission & Values
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-2">
                      Accessibility
                    </h3>
                    <p className="text-muted-foreground">
                      We believe everyone should have access to quality work
                      opportunities regardless of their schedule constraints.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-2">Transparency</h3>
                    <p className="text-muted-foreground">
                      We promote clear communication about job requirements,
                      compensation, and expectations.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-2">Community</h3>
                    <p className="text-muted-foreground">
                      We're building a trusted network of professionals and
                      businesses that help each other succeed.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Meet Our Team
              </h2>
              <div className="grid gap-8 md:grid-cols-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-4 mx-auto rounded-full overflow-hidden w-32 h-32">
                      <Image
                        src="/placeholder.svg?height=128&width=128"
                        width={128}
                        height={128}
                        alt={member.name}
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-primary text-sm mb-2">{member.role}</p>
                    <p className="text-muted-foreground text-sm">
                      {member.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Contact Us
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-muted-foreground">info@Parttimejob.com</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-muted-foreground">(555) 123-4567</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-muted-foreground">
                    123 Main Street, Suite 101
                    <br />
                    San Francisco, CA 94105
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Office Hours</h3>
                  <p className="text-muted-foreground">
                    Monday-Friday
                    <br />
                    9:00 AM - 5:00 PM PST
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/contact">
                  <Button>Contact Us</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Whether you're looking for work or looking to hire, Parttimejob is
              here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Create an Account
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-white text-white hover:bg-white/10"
                >
                  Learn More
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

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "CEO & Co-Founder",
    bio: "Former HR executive with 15+ years of experience in talent acquisition.",
  },
  {
    name: "Michael Chen",
    role: "CTO & Co-Founder",
    bio: "Tech entrepreneur with multiple successful platform startups.",
  },
  {
    name: "Aisha Patel",
    role: "Head of Operations",
    bio: "Operations expert specializing in marketplace optimization.",
  },
  {
    name: "David Rodriguez",
    role: "Head of Marketing",
    bio: "Digital marketing strategist focused on community building.",
  },
];
