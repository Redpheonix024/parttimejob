import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
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

      <main className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

          <div className="prose max-w-none">
            <p>Last Updated: March 27, 2023</p>

            <p>
              Parttimejob Inc. ("Parttimejob," "we," "us," or "our") is
              committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when
              you visit our website or use our services.
            </p>

            <p>
              Please read this Privacy Policy carefully. By accessing or using
              our Service, you acknowledge that you have read, understood, and
              agree to be bound by all the terms of this Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              1. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              Personal Information
            </h3>

            <p>
              We may collect personal information that you voluntarily provide
              to us when you:
            </p>

            <ul className="list-disc pl-6 my-4 space-y-1">
              <li>Register for an account</li>
              <li>Post or apply for jobs</li>
              <li>Complete profile information</li>
              <li>Contact us or provide feedback</li>
              <li>Subscribe to our newsletters</li>
              <li>Participate in surveys or promotions</li>
            </ul>

            <p>This information may include:</p>

            <ul className="list-disc pl-6 my-4 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>Billing information and payment details</li>
              <li>Resume/CV and work history</li>
              <li>Education and qualifications</li>
              <li>Profile photos</li>
              <li>Job preferences and availability</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              Automatically Collected Information
            </h3>

            <p>
              When you access our Service, we may automatically collect certain
              information about your device and usage, including:
            </p>

            <ul className="list-disc pl-6 my-4 space-y-1">
              <li>IP address and device identifiers</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent</li>
              <li>Referring websites</li>
              <li>Click patterns and interactions</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              2. How We Use Your Information
            </h2>

            <p>
              We may use the information we collect for various purposes,
              including to:
            </p>

            <ul className="list-disc pl-6 my-4 space-y-1">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process transactions and manage your account</li>
              <li>Connect job seekers with employers</li>
              <li>
                Send administrative information, updates, and promotional
                materials
              </li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>
                Protect against, identify, and prevent fraud and other illegal
                activity
              </li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              3. Sharing Your Information
            </h2>

            <p>We may share your information in the following circumstances:</p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              With Your Consent
            </h3>

            <p>
              When you apply for a job, your profile information and application
              materials will be shared with the employer. When you post a job,
              certain information will be visible to potential applicants.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              Service Providers
            </h3>

            <p>
              We may share your information with third-party vendors, service
              providers, and contractors who perform services on our behalf,
              such as payment processing, data analysis, email delivery,
              hosting, and customer service.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              Business Transfers
            </h3>

            <p>
              If we are involved in a merger, acquisition, financing, or sale of
              assets, your information may be transferred as part of that
              transaction.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-2">
              Legal Requirements
            </h3>

            <p>
              We may disclose your information if required to do so by law or in
              response to valid requests by public authorities (e.g., a court or
              government agency).
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Security</h2>

            <p>
              We implement appropriate technical and organizational measures to
              protect the security of your personal information. However, please
              be aware that no method of transmission over the Internet or
              electronic storage is 100% secure, and we cannot guarantee
              absolute security.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              5. Your Data Protection Rights
            </h2>

            <p>
              Depending on your location, you may have certain rights regarding
              your personal information, including:
            </p>

            <ul className="list-disc pl-6 my-4 space-y-1">
              <li>
                The right to access and receive a copy of your personal
                information
              </li>
              <li>The right to rectify or update your personal information</li>
              <li>The right to delete your personal information</li>
              <li>
                The right to restrict or object to processing of your personal
                information
              </li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>

            <p>
              To exercise these rights, please contact us using the information
              provided in the "Contact Us" section below.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              6. Cookies and Tracking Technologies
            </h2>

            <p>
              We use cookies and similar tracking technologies to track activity
              on our Service and hold certain information. Cookies are files
              with a small amount of data that may include an anonymous unique
              identifier.
            </p>

            <p>
              You can instruct your browser to refuse all cookies or to indicate
              when a cookie is being sent. However, if you do not accept
              cookies, you may not be able to use some portions of our Service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              7. Children's Privacy
            </h2>

            <p>
              Our Service is not directed to individuals under the age of 18. We
              do not knowingly collect personal information from children under
              18. If you become aware that a child has provided us with personal
              information, please contact us. If we become aware that we have
              collected personal information from children without verification
              of parental consent, we will take steps to remove that information
              from our servers.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              8. Changes to This Privacy Policy
            </h2>

            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last Updated" date. You are advised to review
              this Privacy Policy periodically for any changes.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>

            <p>
              If you have any questions about this Privacy Policy, please
              contact us at:
            </p>

            <p>
              Parttimejob Inc.
              <br />
              123 Main Street, Suite 101
              <br />
              San Francisco, CA 94105
              <br />
              Email: privacy@Parttimejob.com
              <br />
              Phone: (555) 123-4567
            </p>
          </div>
        </div>
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
