import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
          <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

          <div className="prose max-w-none">
            <p>Last Updated: March 27, 2023</p>

            <p>
              Please read these Terms and Conditions ("Terms", "Terms and
              Conditions") carefully before using the Parttimejob website and
              service operated by Parttimejob Inc.
            </p>

            <p>
              Your access to and use of the Service is conditioned on your
              acceptance of and compliance with these Terms. These Terms apply
              to all visitors, users, and others who access or use the Service.
            </p>

            <p>
              By accessing or using the Service you agree to be bound by these
              Terms. If you disagree with any part of the terms, you may not
              access the Service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">1. Accounts</h2>

            <p>
              When you create an account with us, you must provide information
              that is accurate, complete, and current at all times. Failure to
              do so constitutes a breach of the Terms, which may result in
              immediate termination of your account on our Service.
            </p>

            <p>
              You are responsible for safeguarding the password that you use to
              access the Service and for any activities or actions under your
              password, whether your password is with our Service or a
              third-party service.
            </p>

            <p>
              You agree not to disclose your password to any third party. You
              must notify us immediately upon becoming aware of any breach of
              security or unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              2. Job Listings and Applications
            </h2>

            <p>
              Employers are responsible for the content of their job listings.
              All job listings must comply with applicable laws and regulations,
              including but not limited to labor laws, anti-discrimination laws,
              and minimum wage requirements.
            </p>

            <p>
              Job seekers are responsible for the accuracy of their profiles and
              applications. By applying for a job, you consent to the employer
              viewing your profile information and application materials.
            </p>

            <p>
              Parttimejob does not guarantee employment or the quality of job
              listings. We serve as a platform connecting employers and job
              seekers, but we are not responsible for employment outcomes or
              relationships formed through our Service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              3. Fees and Payments
            </h2>

            <p>
              Certain aspects of the Service may be subject to fees. You agree
              to pay all fees associated with the services you use. All fees are
              non-refundable unless otherwise specified.
            </p>

            <p>
              We use third-party payment processors to handle all financial
              transactions. By using our paid services, you agree to the terms
              and privacy policies of these payment processors.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              4. Intellectual Property
            </h2>

            <p>
              The Service and its original content, features, and functionality
              are and will remain the exclusive property of Parttimejob Inc. and
              its licensors. The Service is protected by copyright, trademark,
              and other laws of both the United States and foreign countries.
            </p>

            <p>
              Our trademarks and trade dress may not be used in connection with
              any product or service without the prior written consent of
              Parttimejob Inc.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              5. Links To Other Web Sites
            </h2>

            <p>
              Our Service may contain links to third-party web sites or services
              that are not owned or controlled by Parttimejob Inc.
            </p>

            <p>
              Parttimejob Inc. has no control over, and assumes no
              responsibility for, the content, privacy policies, or practices of
              any third-party web sites or services. You further acknowledge and
              agree that Parttimejob Inc. shall not be responsible or liable,
              directly or indirectly, for any damage or loss caused or alleged
              to be caused by or in connection with use of or reliance on any
              such content, goods or services available on or through any such
              web sites or services.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Termination</h2>

            <p>
              We may terminate or suspend your account immediately, without
              prior notice or liability, for any reason whatsoever, including
              without limitation if you breach the Terms.
            </p>

            <p>
              Upon termination, your right to use the Service will immediately
              cease. If you wish to terminate your account, you may simply
              discontinue using the Service or contact us to request account
              deletion.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              7. Limitation Of Liability
            </h2>

            <p>
              In no event shall Parttimejob Inc., nor its directors, employees,
              partners, agents, suppliers, or affiliates, be liable for any
              indirect, incidental, special, consequential or punitive damages,
              including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses, resulting from your access
              to or use of or inability to access or use the Service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes</h2>

            <p>
              We reserve the right, at our sole discretion, to modify or replace
              these Terms at any time. If a revision is material, we will try to
              provide at least 30 days' notice prior to any new terms taking
              effect. What constitutes a material change will be determined at
              our sole discretion.
            </p>

            <p>
              By continuing to access or use our Service after those revisions
              become effective, you agree to be bound by the revised terms. If
              you do not agree to the new terms, please stop using the Service.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>

            <p>
              If you have any questions about these Terms, please contact us at
              legal@Parttimejob.com.
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
