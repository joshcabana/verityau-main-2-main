import { PageLayout } from "@/components/PageLayout";

const Privacy = () => {
  return (
    <PageLayout
      contentMaxWidth="max-w-4xl"
      contentPadding="py-32 md:py-40"
    >

        <article className="prose prose-invert max-w-none">
          <h1 className="section-header text-4xl sm:text-5xl mb-6 text-white">Privacy Policy</h1>
          <p className="body-large text-white/50 mb-12">Last updated: January 2025</p>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">Introduction</h2>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              At Verity, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our video-first dating application. This policy complies with the Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs).
            </p>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              Verity is operated by Verity Australia Pty Ltd, based in Canberra, ACT, Australia. We are committed to protecting your personal information and being transparent about our data practices.
            </p>
            <p className="body-base text-white/70 leading-relaxed">
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">Information We Collect</h2>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-white/70 leading-relaxed space-y-2 mb-4">
              <li><strong className="text-white">Profile information:</strong> Name, date of birth, gender, location (city-level only), photos, bio, preferences</li>
              <li><strong className="text-white">Video content:</strong> Temporary video data during 10-minute "Verity Dates" (not recorded or stored)</li>
              <li><strong className="text-white">Communications:</strong> Chat messages, reports, and feedback you submit</li>
              <li><strong className="text-white">Payment information:</strong> Processed securely by Stripe (we never store full card details)</li>
              <li><strong className="text-white">Device and usage data:</strong> IP address, device type, browser type, activity logs, interaction patterns</li>
              <li><strong className="text-white">Location data:</strong> City/suburb for matching purposes (we do not track precise GPS coordinates)</li>
            </ul>
            <p className="body-base text-white/70 leading-relaxed">
              We collect this information when you create an account, update your profile, use video dates, send messages, or interact with other users.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">How We Use Your Information</h2>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-white/70 leading-relaxed space-y-2 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Match you with compatible users</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
              <li>Detect and prevent fraudulent or illegal activity</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">Video Content & Safety</h2>
            <p className="body-base text-white leading-relaxed mb-4 font-semibold">
              IMPORTANT: Verity video dates are NOT recorded. All video calls use end-to-end encryption via Daily.co and are automatically deleted after the 10-minute session ends.
            </p>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              We may temporarily process video content for safety and moderation purposes only when specifically reported by users, including:
            </p>
            <ul className="list-disc list-inside text-white/70 leading-relaxed space-y-2 mb-4">
              <li>Reviewing reported content for community guidelines violations</li>
              <li>Detecting inappropriate behavior using AI safety systems (AWS Rekognition for photos only)</li>
              <li>Verifying user authenticity during the verification process</li>
            </ul>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              Recording, screenshotting, or sharing video date content without explicit consent is strictly prohibited and may result in immediate account termination and legal action.
            </p>
            <p className="body-base text-white/70 leading-relaxed">
              Video metadata (call duration, participants, timestamps) is retained for 90 days for safety and quality assurance purposes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">Data Sharing</h2>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information in the following situations:
            </p>
            <ul className="list-disc list-inside text-white/70 leading-relaxed space-y-2 mb-4">
              <li>With other users as part of the matching service</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect the rights and safety of Verity and our users</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">Your Rights Under Australian Privacy Law</h2>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              Under the Australian Privacy Act and Australian Privacy Principles, you have the right to:
            </p>
            <ul className="list-disc list-inside text-white/70 leading-relaxed space-y-2 mb-4">
              <li><strong className="text-white">Access:</strong> Request access to the personal information we hold about you</li>
              <li><strong className="text-white">Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong className="text-white">Deletion:</strong> Request deletion of your account and associated data (data will be deleted within 30 days)</li>
              <li><strong className="text-white">Data portability:</strong> Request a copy of your data in a portable format (JSON or CSV)</li>
              <li><strong className="text-white">Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
              <li><strong className="text-white">Object:</strong> Object to certain data processing activities</li>
              <li><strong className="text-white">Complain:</strong> Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)</li>
            </ul>
            <p className="body-base text-white/70 leading-relaxed">
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@getverity.com.au" className="text-accent hover:text-accent/80 underline transition-smooth">
                privacy@getverity.com.au
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">Data Retention</h2>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
            </p>
            <ul className="list-disc list-inside text-white/70 leading-relaxed space-y-2 mb-4">
              <li><strong className="text-white">Active accounts:</strong> Retained until you delete your account</li>
              <li><strong className="text-white">Deleted accounts:</strong> Permanently deleted within 30 days (except data required for legal compliance)</li>
              <li><strong className="text-white">Chat messages:</strong> Deleted when either party deletes their account</li>
              <li><strong className="text-white">Video call metadata:</strong> Retained for 90 days for safety purposes</li>
              <li><strong className="text-white">Payment records:</strong> Retained for 7 years as required by Australian tax law</li>
              <li><strong className="text-white">Safety reports:</strong> Retained for 2 years for investigation and legal purposes</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">International Data Transfers</h2>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              Your data is primarily stored in Australia using Supabase (AWS ap-southeast-2 region). We may transfer data internationally to:
            </p>
            <ul className="list-disc list-inside text-white/70 leading-relaxed space-y-2 mb-4">
              <li><strong className="text-white">Daily.co (USA):</strong> For video call infrastructure (ephemeral data only, not stored)</li>
              <li><strong className="text-white">Stripe (USA):</strong> For payment processing (industry-standard security)</li>
              <li><strong className="text-white">AWS Rekognition (USA):</strong> For photo moderation (images deleted after processing)</li>
            </ul>
            <p className="body-base text-white/70 leading-relaxed">
              All international transfers comply with APP 8 and use appropriate safeguards including encryption and contractual protections.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">Security</h2>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              We implement industry-leading security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-white/70 leading-relaxed space-y-2 mb-4">
              <li>End-to-end encryption for video calls</li>
              <li>SSL/TLS encryption for all data transmission</li>
              <li>Encrypted database storage with row-level security</li>
              <li>Regular security audits and penetration testing</li>
              <li>Multi-factor authentication for account access</li>
              <li>Rate limiting to prevent abuse and spam</li>
            </ul>
            <p className="body-base text-white/70 leading-relaxed">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">Children's Privacy</h2>
            <p className="body-base text-white/70 leading-relaxed">
              Verity is not intended for users under 18 years of age. We do not knowingly collect personal information from anyone under 18. If we discover that we have collected information from a person under 18, we will immediately delete that information.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">Changes to This Policy</h2>
            <p className="body-base text-white/70 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or prominent notice in the app. Your continued use after changes constitutes acceptance of the updated policy. The "Last updated" date at the top indicates when changes were made.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="section-header text-2xl sm:text-3xl mb-4 text-white">Contact Us</h2>
            <p className="body-base text-white/70 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us at:
            </p>
            <div className="text-white/70 leading-relaxed space-y-2">
              <p>
                <strong className="text-white">Email:</strong>{" "}
                <a href="mailto:privacy@getverity.com.au" className="text-accent hover:text-accent/80 underline transition-smooth">
                  privacy@getverity.com.au
                </a>
              </p>
              <p className="text-white/70"><strong className="text-white">Postal Address:</strong> Verity Australia Pty Ltd, Canberra, ACT, Australia</p>
              <p className="mt-4 text-white/70">
                If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC) at{" "}
                <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 underline transition-smooth">
                  www.oaic.gov.au
                </a>
              </p>
            </div>
          </section>
        </article>
      </PageLayout>
  );
};

export default Privacy;
