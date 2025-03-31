import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function FAQ() {
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
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find answers to common questions about Parttimejob.
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search for answers..." className="pl-10" />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="general" className="w-full mb-8">
              <div className="flex justify-center mb-8">
                <TabsList className="grid grid-cols-4 w-full max-w-xl">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="job-seekers">Job Seekers</TabsTrigger>
                  <TabsTrigger value="employers">Employers</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="general">
                <Accordion type="single" collapsible className="w-full">
                  {generalFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="job-seekers">
                <Accordion type="single" collapsible className="w-full">
                  {jobSeekerFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="employers">
                <Accordion type="single" collapsible className="w-full">
                  {employerFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="billing">
                <Accordion type="single" collapsible className="w-full">
                  {billingFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>

            <div className="mt-12 bg-muted rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Can't find the answer you're looking for? Please contact our
                support team.
              </p>
              <Link href="/contact">
                <Button>Contact Support</Button>
              </Link>
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

const generalFaqs = [
  {
    question: "What is Parttimejob?",
    answer:
      "Parttimejob is a platform that connects people looking for part-time work with businesses and individuals who need help with short-term tasks or part-time positions. We make it easy to find flexible work opportunities or qualified candidates for your part-time positions.",
  },
  {
    question: "Is Parttimejob available in my area?",
    answer:
      "Parttimejob is currently available in most major cities across the United States, Canada, and the United Kingdom. We're expanding rapidly, so if we're not in your area yet, we likely will be soon. You can check availability in your location by entering your zip code on our homepage.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Creating an account is simple. Click the 'Sign In' button in the top right corner of the page, then select 'Create an Account'. You can sign up using your email address or through your Google or GitHub account. Once registered, you'll need to complete your profile to start using the platform.",
  },
  {
    question: "Is Parttimejob free to use?",
    answer:
      "Parttimejob is free for job seekers to create profiles, search for jobs, and apply to positions. For employers, we offer various subscription plans starting at $49 per month, as well as pay-per-post options. You can find more details on our Pricing page.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "You can reach our customer support team through the Contact page on our website, by emailing support@Parttimejob.com, or by calling (555) 123-4567 during business hours (Monday-Friday, 9am-5pm PST).",
  },
];

const jobSeekerFaqs = [
  {
    question: "How do I find jobs on Parttimejob?",
    answer:
      "You can browse available jobs on our homepage or use the search function to filter jobs by location, category, pay rate, and more. Once you find a job that interests you, simply click on it to view the details and apply if it's a good fit.",
  },
  {
    question: "How do I apply for a job?",
    answer:
      "To apply for a job, click the 'Apply Now' button on the job details page. Depending on the employer's preferences, you may need to answer some screening questions or provide additional information. Your profile information will automatically be included with your application.",
  },
  {
    question: "How do I make my profile stand out?",
    answer:
      "To make your profile stand out, be sure to include a professional photo, detailed work experience, relevant skills, and availability. Complete all sections of your profile and consider asking previous employers for reviews. Regularly update your profile to show you're active on the platform.",
  },
  {
    question: "How will I know if I'm hired?",
    answer:
      "When an employer is interested in hiring you, they'll send you a message through our platform. You'll receive an email notification and can respond directly through Parttimejob. Once you and the employer agree on the terms, you can accept the job offer through the platform.",
  },
  {
    question: "How do I get paid for jobs?",
    answer:
      "Payment methods vary depending on the employer. Some employers pay through our secure payment system, while others may pay directly. The payment method and schedule will be specified in the job details. For jobs paid through Parttimejob, you'll receive funds in your connected bank account or payment service.",
  },
  {
    question: "Can I work remotely through Parttimejob?",
    answer:
      "Yes, many jobs on Parttimejob can be done remotely. You can filter job listings to show only remote opportunities. Make sure to indicate in your profile if you're available for remote work.",
  },
];

const employerFaqs = [
  {
    question: "How do I post a job on Parttimejob?",
    answer:
      "To post a job, click the 'Post a Job' button in the navigation bar. You'll need to provide details about the position, including job title, description, requirements, location, pay rate, and duration. Once submitted, your job will be reviewed and published, typically within 24 hours.",
  },
  {
    question: "How much does it cost to post a job?",
    answer:
      "The cost depends on your subscription plan. We offer plans starting at $49 per month for a single job posting. You can also purchase individual job postings without a subscription. Visit our Pricing page for detailed information on our plans and features.",
  },
  {
    question: "How do I find the right candidates?",
    answer:
      "After posting a job, you'll receive applications from interested candidates. You can review their profiles, work history, skills, and availability to determine if they're a good fit. You can also use our search feature to proactively find candidates with specific skills and invite them to apply.",
  },
  {
    question: "Can I message candidates before hiring them?",
    answer:
      "Yes, you can message candidates through our platform to ask additional questions, discuss details, or schedule interviews. This helps ensure you find the right person for your job before making a hiring decision.",
  },
  {
    question: "How do I pay workers through Parttimejob?",
    answer:
      "You can pay workers directly or use our secure payment system. If you choose to use our payment system, you'll need to add a payment method to your account. You can then create payment requests for completed work, and the funds will be transferred to the worker once approved.",
  },
  {
    question: "What if the job doesn't work out?",
    answer:
      "If a job doesn't work out, you can end the engagement through the platform. For ongoing positions, we recommend providing notice according to the terms agreed upon. If there are issues with a worker's performance, please contact our support team for assistance.",
  },
];

const billingFaqs = [
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and bank transfers for annual plans. Payment information is securely stored and processed in compliance with PCI standards.",
  },
  {
    question: "When will I be billed?",
    answer:
      "For monthly subscriptions, you'll be billed on the same day each month. For annual subscriptions, you'll be billed once per year on your subscription anniversary. One-time job postings are billed at the time of purchase.",
  },
  {
    question: "How do I update my billing information?",
    answer:
      "You can update your billing information in your account settings under the 'Billing' tab. There, you can change your payment method, update card details, and view your billing history.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "We offer a 30-day money-back guarantee for new subscribers. If you're not satisfied with our service within the first 30 days, contact our support team for a full refund. After 30 days, subscriptions are non-refundable for the current billing period.",
  },
  {
    question: "Do you offer discounts for non-profits?",
    answer:
      "Yes, we offer special pricing for registered non-profit organizations. Please contact our sales team at sales@Parttimejob.com with proof of your non-profit status to learn more about our discounted rates.",
  },
  {
    question: "Will I receive an invoice for my payment?",
    answer:
      "Yes, we automatically send an invoice to your registered email address after each payment. You can also access and download all your invoices from your account settings under the 'Billing' tab.",
  },
];
