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
import { Input } from "@/components/ui/input";
import {
  Code,
  Coffee,
  FileText,
  Hammer,
  HeartPulse,
  Home,
  Laptop,
  Pencil,
  Search,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";

export default function Categories() {
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
              Browse Job Categories
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find part-time opportunities in your field of expertise.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories or keywords..."
                className="pl-10"
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link href={`/categories/${category.slug}`} key={index}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        {category.icon}
                      </div>
                      <CardTitle>{category.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{category.description}</CardDescription>
                    <div className="mt-4 text-sm">
                      <span className="font-medium">{category.jobCount}</span>{" "}
                      open positions
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Browse Jobs
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-muted py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Can't Find What You're Looking For?
              </h2>
              <p className="text-muted-foreground mb-6">
                We're constantly adding new job categories. If you don't see
                your field listed, try searching for specific skills or job
                titles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button size="lg">Browse All Jobs</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Contact Us
                  </Button>
                </Link>
              </div>
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

const categories = [
  {
    name: "Food & Beverage",
    slug: "food-beverage",
    description:
      "Barista, server, bartender, and other food service positions.",
    jobCount: 248,
    icon: <Coffee className="h-5 w-5 text-primary" />,
  },
  {
    name: "Retail & Sales",
    slug: "retail-sales",
    description:
      "Cashier, sales associate, merchandiser, and customer service roles.",
    jobCount: 187,
    icon: <ShoppingBag className="h-5 w-5 text-primary" />,
  },
  {
    name: "Administrative",
    slug: "administrative",
    description:
      "Office assistant, receptionist, data entry, and clerical positions.",
    jobCount: 143,
    icon: <FileText className="h-5 w-5 text-primary" />,
  },
  {
    name: "Technology",
    slug: "technology",
    description:
      "Web development, IT support, software testing, and technical roles.",
    jobCount: 165,
    icon: <Code className="h-5 w-5 text-primary" />,
  },
  {
    name: "Creative & Design",
    slug: "creative-design",
    description:
      "Graphic design, photography, content creation, and artistic positions.",
    jobCount: 112,
    icon: <Pencil className="h-5 w-5 text-primary" />,
  },
  {
    name: "Education & Tutoring",
    slug: "education-tutoring",
    description:
      "Tutor, teaching assistant, after-school instructor, and educational roles.",
    jobCount: 98,
    icon: <Users className="h-5 w-5 text-primary" />,
  },
  {
    name: "Healthcare & Wellness",
    slug: "healthcare-wellness",
    description:
      "Caregiver, medical assistant, fitness instructor, and health-related positions.",
    jobCount: 76,
    icon: <HeartPulse className="h-5 w-5 text-primary" />,
  },
  {
    name: "Delivery & Driving",
    slug: "delivery-driving",
    description:
      "Food delivery, courier, rideshare driver, and transportation roles.",
    jobCount: 203,
    icon: <Truck className="h-5 w-5 text-primary" />,
  },
  {
    name: "Housekeeping & Cleaning",
    slug: "housekeeping-cleaning",
    description:
      "House cleaner, janitor, housekeeper, and cleaning service positions.",
    jobCount: 89,
    icon: <Home className="h-5 w-5 text-primary" />,
  },
  {
    name: "Manual Labor",
    slug: "manual-labor",
    description:
      "Moving help, landscaping, construction, and physical labor positions.",
    jobCount: 124,
    icon: <Hammer className="h-5 w-5 text-primary" />,
  },
  {
    name: "Event & Hospitality",
    slug: "event-hospitality",
    description:
      "Event staff, host/hostess, usher, and hospitality industry roles.",
    jobCount: 67,
    icon: <Users className="h-5 w-5 text-primary" />,
  },
  {
    name: "Remote & Virtual",
    slug: "remote-virtual",
    description:
      "Work-from-home opportunities across various industries and skills.",
    jobCount: 215,
    icon: <Laptop className="h-5 w-5 text-primary" />,
  },
];
