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
import { CheckCircle2, HelpCircle, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Pricing() {
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
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose the plan that works best for your hiring needs.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="monthly" className="w-full mb-8">
              <div className="flex justify-center">
                <TabsList>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="annual">Annual (Save 20%)</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="monthly" className="mt-8">
                <div className="grid gap-6 md:grid-cols-3">
                  {monthlyPlans.map((plan, index) => (
                    <Card
                      key={index}
                      className={`flex flex-col ${
                        plan.featured ? "border-primary shadow-md relative" : ""
                      }`}
                    >
                      {plan.featured && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg rounded-tr-lg">
                          Most Popular
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">
                            ${plan.price}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            /month
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <ul className="space-y-2">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.notIncluded &&
                            plan.notIncluded.map((feature, i) => (
                              <li
                                key={i}
                                className="flex items-start text-muted-foreground"
                              >
                                <X className="h-5 w-5 mr-2 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className={`w-full ${
                            plan.featured
                              ? ""
                              : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                        >
                          {plan.buttonText}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="annual" className="mt-8">
                <div className="grid gap-6 md:grid-cols-3">
                  {annualPlans.map((plan, index) => (
                    <Card
                      key={index}
                      className={`flex flex-col ${
                        plan.featured ? "border-primary shadow-md relative" : ""
                      }`}
                    >
                      {plan.featured && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg rounded-tr-lg">
                          Most Popular
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">
                            ${plan.price}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            /month
                          </span>
                          <div className="text-sm text-primary font-medium mt-1">
                            Billed annually (${plan.annualPrice}/year)
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <ul className="space-y-2">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.notIncluded &&
                            plan.notIncluded.map((feature, i) => (
                              <li
                                key={i}
                                className="flex items-start text-muted-foreground"
                              >
                                <X className="h-5 w-5 mr-2 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className={`w-full ${
                            plan.featured
                              ? ""
                              : "bg-muted text-foreground hover:bg-muted/80"
                          }`}
                        >
                          {plan.buttonText}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-12 bg-muted rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h3 className="font-semibold flex items-center">
                      <HelpCircle className="h-5 w-5 text-primary mr-2" />
                      {faq.question}
                    </h3>
                    <p className="mt-1 text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Need a Custom Solution?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                For businesses with high-volume hiring needs or specialized
                requirements, we offer custom enterprise solutions.
              </p>
              <Link href="/contact">
                <Button size="lg">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-primary text-primary-foreground py-12 mt-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Find Your Perfect Match?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of businesses finding qualified part-time help on
              Parttimejob.
            </p>
            <Link href="/post-job">
              <Button variant="secondary" size="lg">
                Post Your First Job
              </Button>
            </Link>
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

const monthlyPlans = [
  {
    name: "Basic",
    description: "For occasional hiring needs",
    price: 49,
    features: [
      "1 active job posting",
      "30 days visibility",
      "Basic candidate filtering",
      "Email support",
    ],
    notIncluded: [
      "Featured job placement",
      "Candidate messaging",
      "Applicant tracking",
    ],
    buttonText: "Get Started",
    featured: false,
  },
  {
    name: "Professional",
    description: "For growing businesses",
    price: 99,
    features: [
      "3 active job postings",
      "45 days visibility",
      "Featured job placement",
      "Advanced candidate filtering",
      "Candidate messaging",
      "Priority email support",
    ],
    notIncluded: ["Applicant tracking system"],
    buttonText: "Choose Professional",
    featured: true,
  },
  {
    name: "Business",
    description: "For high-volume hiring",
    price: 199,
    features: [
      "10 active job postings",
      "60 days visibility",
      "Featured job placement",
      "Advanced candidate filtering",
      "Candidate messaging",
      "Applicant tracking system",
      "Phone & email support",
      "Dedicated account manager",
    ],
    buttonText: "Choose Business",
    featured: false,
  },
];

const annualPlans = [
  {
    name: "Basic",
    description: "For occasional hiring needs",
    price: 39,
    annualPrice: 468,
    features: [
      "1 active job posting",
      "30 days visibility",
      "Basic candidate filtering",
      "Email support",
    ],
    notIncluded: [
      "Featured job placement",
      "Candidate messaging",
      "Applicant tracking",
    ],
    buttonText: "Get Started",
    featured: false,
  },
  {
    name: "Professional",
    description: "For growing businesses",
    price: 79,
    annualPrice: 948,
    features: [
      "3 active job postings",
      "45 days visibility",
      "Featured job placement",
      "Advanced candidate filtering",
      "Candidate messaging",
      "Priority email support",
    ],
    notIncluded: ["Applicant tracking system"],
    buttonText: "Choose Professional",
    featured: true,
  },
  {
    name: "Business",
    description: "For high-volume hiring",
    price: 159,
    annualPrice: 1908,
    features: [
      "10 active job postings",
      "60 days visibility",
      "Featured job placement",
      "Advanced candidate filtering",
      "Candidate messaging",
      "Applicant tracking system",
      "Phone & email support",
      "Dedicated account manager",
    ],
    buttonText: "Choose Business",
    featured: false,
  },
];

const faqs = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "We offer a 7-day free trial for new users to test our Professional plan features before committing.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, PayPal, and bank transfers for annual plans.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your subscription at any time from your account settings. No long-term contracts required.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee if you're not satisfied with our service.",
  },
  {
    question: "What happens to my job postings if I downgrade?",
    answer:
      "If you have more active job postings than your new plan allows, the oldest postings will be archived.",
  },
];
