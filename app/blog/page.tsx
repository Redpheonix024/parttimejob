import Link from "next/link";
import Image from "next/image";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, ChevronRight } from "lucide-react";

export default function Blog() {
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
              Parttimejob Blog
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tips, insights, and resources for part-time work success.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search articles..." className="pl-10" />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>

              <div className="space-y-8">
                {featuredArticles.map((article, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <Image
                          src="/placeholder.svg?height=200&width=300"
                          width={300}
                          height={200}
                          alt={article.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            {article.categories.map((category, i) => (
                              <Badge key={i} variant="secondary">
                                {category}
                              </Badge>
                            ))}
                          </div>
                          <CardTitle className="text-xl">
                            {article.title}
                          </CardTitle>
                          <CardDescription>{article.excerpt}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage
                                src="/placeholder.svg?height=24&width=24"
                                alt={article.author}
                              />
                              <AvatarFallback>
                                {article.author.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{article.author}</span>
                            <span className="mx-2">•</span>
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{article.date}</span>
                            <span className="mx-2">•</span>
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{article.readTime} min read</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Link href={`/blog/${article.slug}`}>
                            <Button variant="link" className="px-0">
                              Read More
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </CardFooter>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {recentArticles.map((article, index) => (
                  <Card key={index}>
                    <div className="aspect-video relative">
                      <Image
                        src="/placeholder.svg?height=200&width=400"
                        fill
                        alt={article.title}
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {article.categories.map((category, i) => (
                          <Badge key={i} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2">
                        {article.excerpt}
                      </CardDescription>
                      <div className="flex items-center text-sm text-muted-foreground mt-4">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage
                            src="/placeholder.svg?height=24&width=24"
                            alt={article.author}
                          />
                          <AvatarFallback>
                            {article.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{article.author}</span>
                        <span className="mx-2">•</span>
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{article.date}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/blog/${article.slug}`}>
                        <Button variant="link" className="px-0">
                          Read More
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button variant="outline">Load More Articles</Button>
              </div>
            </div>

            <div>
              <div className="sticky top-8">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {blogCategories.map((category, index) => (
                        <Link
                          href={`/blog/category/${category.slug}`}
                          key={index}
                        >
                          <div className="flex items-center justify-between py-2 hover:text-primary transition-colors">
                            <span>{category.name}</span>
                            <Badge variant="outline">{category.count}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Popular Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {popularPosts.map((post, index) => (
                        <div key={index} className="flex items-start">
                          <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src="/placeholder.svg?height=64&width=64"
                              width={64}
                              height={64}
                              alt={post.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-3">
                            <Link href={`/blog/${post.slug}`}>
                              <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">
                              {post.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscribe to Our Newsletter</CardTitle>
                    <CardDescription>
                      Get the latest articles and job tips delivered to your
                      inbox.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <Input
                        placeholder="Your email address"
                        type="email"
                        required
                      />
                      <Button className="w-full">Subscribe</Button>
                    </form>
                    <p className="text-xs text-muted-foreground mt-4">
                      By subscribing, you agree to our{" "}
                      <Link href="/terms" className="underline">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="underline">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t py-8 mt-12">
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

const featuredArticles = [
  {
    title: "10 Tips for Finding the Perfect Part-Time Job",
    slug: "tips-finding-perfect-part-time-job",
    excerpt:
      "Discover proven strategies to help you find a part-time job that fits your schedule, skills, and career goals.",
    author: "Sarah Johnson",
    date: "May 10, 2023",
    readTime: 8,
    categories: ["Job Search", "Career Advice"],
  },
  {
    title: "How to Balance Part-Time Work with Full-Time Studies",
    slug: "balance-part-time-work-full-time-studies",
    excerpt:
      "Learn effective time management techniques to successfully juggle academic responsibilities with a part-time job.",
    author: "Michael Chen",
    date: "April 28, 2023",
    readTime: 6,
    categories: ["Work-Life Balance", "Student Resources"],
  },
  {
    title: "The Rise of Flexible Work Arrangements in 2023",
    slug: "rise-flexible-work-arrangements-2023",
    excerpt:
      "Explore how the job market is evolving to accommodate more flexible work options and what this means for job seekers.",
    author: "Aisha Patel",
    date: "April 15, 2023",
    readTime: 10,
    categories: ["Industry Trends", "Remote Work"],
  },
];

const recentArticles = [
  {
    title: "7 Part-Time Jobs That Pay Surprisingly Well",
    slug: "part-time-jobs-pay-surprisingly-well",
    excerpt:
      "Not all part-time work pays minimum wage. Discover high-paying part-time opportunities that might surprise you.",
    author: "David Rodriguez",
    date: "April 5, 2023",
    categories: ["Job Search", "Salary Insights"],
  },
  {
    title: "How to Create a Standout Profile on Parttimejob",
    slug: "create-standout-profile-Parttimejob",
    excerpt:
      "Tips and tricks to optimize your Parttimejob profile to attract more job offers and stand out to employers.",
    author: "Emma Wilson",
    date: "March 30, 2023",
    categories: ["Platform Tips", "Career Advice"],
  },
  {
    title: "The Benefits of Hiring Part-Time Workers for Small Businesses",
    slug: "benefits-hiring-part-time-workers-small-businesses",
    excerpt:
      "Learn why part-time employees can be a strategic advantage for small businesses and startups.",
    author: "James Thompson",
    date: "March 25, 2023",
    categories: ["Employer Resources", "Small Business"],
  },
  {
    title: "From Side Gig to Full-Time: Success Stories from Parttimejob",
    slug: "side-gig-full-time-success-stories",
    excerpt:
      "Read inspiring stories of people who turned their part-time opportunities into fulfilling careers.",
    author: "Sophia Garcia",
    date: "March 18, 2023",
    categories: ["Success Stories", "Career Growth"],
  },
];

const blogCategories = [
  { name: "Job Search", slug: "job-search", count: 24 },
  { name: "Career Advice", slug: "career-advice", count: 18 },
  { name: "Work-Life Balance", slug: "work-life-balance", count: 12 },
  { name: "Remote Work", slug: "remote-work", count: 15 },
  { name: "Student Resources", slug: "student-resources", count: 9 },
  { name: "Employer Tips", slug: "employer-tips", count: 11 },
  { name: "Industry Trends", slug: "industry-trends", count: 7 },
  { name: "Success Stories", slug: "success-stories", count: 5 },
];

const popularPosts = [
  {
    title: "5 Red Flags to Watch for in Part-Time Job Listings",
    slug: "red-flags-part-time-job-listings",
    date: "March 12, 2023",
  },
  {
    title: "How to Negotiate Pay for Part-Time Positions",
    slug: "negotiate-pay-part-time-positions",
    date: "February 28, 2023",
  },
  {
    title: "The Hidden Benefits of Part-Time Work",
    slug: "hidden-benefits-part-time-work",
    date: "February 15, 2023",
  },
  {
    title: "Remote Part-Time Jobs: The Ultimate Guide",
    slug: "remote-part-time-jobs-guide",
    date: "January 30, 2023",
  },
];
