"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsOfUsePage() {
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
              Terms of Use
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Last updated: November 5, 2025
            </p>
          </CardHeader>

          <CardContent className="prose prose-gray max-w-none p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using EMC Library, you accept and agree to be bound by the terms
                and provision of this agreement. If you do not agree to these terms, please do not
                use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed">
                Permission is granted to temporarily access the materials (information or software)
                on EMC Library for personal, non-commercial transitory viewing only. This is the
                grant of a license, not a transfer of title.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>You may not modify or copy the materials</li>
                <li>You may not use the materials for any commercial purpose</li>
                <li>You may not attempt to decompile or reverse engineer any software</li>
                <li>You may not remove any copyright or other proprietary notations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Account</h2>
              <p className="text-gray-700 leading-relaxed">
                To access certain features of the service, you must register for an account. You
                agree to provide accurate, current, and complete information during registration
                and to update such information to keep it accurate, current, and complete.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Content Upload</h2>
              <p className="text-gray-700 leading-relaxed">
                Users may upload documents to EMC Library. By uploading content, you grant us a
                non-exclusive, worldwide, royalty-free license to use, display, and distribute
                your content on the platform. You are responsible for ensuring that you have the
                necessary rights to upload the content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Upload any content that infringes on intellectual property rights</li>
                <li>Upload malicious software or harmful content</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to the system</li>
                <li>Use the service for any illegal purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your account and bar access to the service immediately,
                without prior notice or liability, under our sole discretion, for any reason
                whatsoever, including without limitation if you breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                The materials on EMC Library are provided on an &apos;as is&apos; basis. EMC Library makes
                no warranties, expressed or implied, and hereby disclaims and negates all other
                warranties including, without limitation, implied warranties or conditions of
                merchantability, fitness for a particular purpose, or non-infringement of
                intellectual property.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Limitations</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall EMC Library or its suppliers be liable for any damages (including,
                without limitation, damages for loss of data or profit, or due to business
                interruption) arising out of the use or inability to use the materials on EMC
                Library.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                EMC Library reserves the right to revise these terms of use at any time without
                notice. By using this service, you are agreeing to be bound by the then current
                version of these Terms of Use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms, please contact us at{" "}
                <a href="mailto:support@emclibrary.com" className="text-blue-600 hover:underline">
                  support@emclibrary.com
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
