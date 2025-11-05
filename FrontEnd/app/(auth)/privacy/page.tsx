"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-3xl font-bold text-center">
              Privacy Policy
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Last updated: November 5, 2025
            </p>
          </CardHeader>

          <CardContent className="prose prose-gray max-w-none p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to EMC Library. We respect your privacy and are committed to protecting
                your personal data. This privacy policy will inform you about how we look after
                your personal data when you visit our platform and tell you about your privacy
                rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed">
                We may collect, use, store and transfer different kinds of personal data about you:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>
                  <strong>Identity Data:</strong> Full name, username or similar identifier
                </li>
                <li>
                  <strong>Contact Data:</strong> Email address
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, browser type, device information
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you use our platform
                </li>
                <li>
                  <strong>Content Data:</strong> Documents and materials you upload
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We will only use your personal data when the law allows us to. Most commonly, we
                will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>To register you as a new user</li>
                <li>To provide and manage your account</li>
                <li>To deliver content and services you request</li>
                <li>To send you notifications about your account or documents</li>
                <li>To improve our platform and user experience</li>
                <li>To detect and prevent fraud or abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We have put in place appropriate security measures to prevent your personal data
                from being accidentally lost, used or accessed in an unauthorized way, altered or
                disclosed. We use encryption and secure protocols to protect your data during
                transmission and storage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We will only retain your personal data for as long as necessary to fulfill the
                purposes we collected it for, including for the purposes of satisfying any legal,
                accounting, or reporting requirements. When you delete your account, we will remove
                your personal data from our active databases.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Your Legal Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                Under certain circumstances, you have rights under data protection laws in relation
                to your personal data:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Request access to your personal data</li>
                <li>Request correction of your personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Right to withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform uses cookies to distinguish you from other users. This helps us to
                provide you with a good experience when you browse our platform and also allows us
                to improve our site. Cookies are small text files that are placed on your device to
                help the platform provide a better user experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform may include links to third-party websites, plug-ins and applications.
                Clicking on those links or enabling those connections may allow third parties to
                collect or share data about you. We do not control these third-party websites and
                are not responsible for their privacy statements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform is not intended for children under 13 years of age. We do not knowingly
                collect personal information from children under 13. If you are a parent or guardian
                and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the &quot;Last
                updated&quot; date at the top of this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:privacy@emclibrary.com" className="text-blue-600 hover:underline">
                  privacy@emclibrary.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
