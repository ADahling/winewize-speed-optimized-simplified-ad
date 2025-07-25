
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wine } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Wine className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Wine Wize
              </span>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy for WINE WIZE LLC</h1>
          
          <p className="text-gray-600 mb-8">
            <strong>Last Updated:</strong> June 11, 2025
          </p>

          <div className="prose prose-gray max-w-none">
            <p className="mb-6">
              This Privacy Policy describes how WINE WIZE LLC ("we," "us," or "our") collects, uses, and discloses your information when you use our website and services (the "Service"). We are committed to protecting your privacy and handling your data in a transparent and secure manner. By using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect various types of information to provide and improve our Service to you. The types of information we collect depend on how you interact with our Service.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">a. Personal Information You Provide to Us</h3>
            <p className="mb-4">
              When you create an account or interact with our Service, you may provide us with personal information that can be used to identify you. This may include:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Contact Information:</strong> Such as your name and email address.</li>
              <li><strong>Demographic Information:</strong> Such as your age or date of birth, which we collect to verify you are of legal drinking age.</li>
              <li><strong>Account Credentials:</strong> Such as your username and password.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">b. Information Collected Automatically</h3>
            <p className="mb-4">
              When you access and use the Service, we may automatically collect certain information about your device and usage patterns. This information may include:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Log Data:</strong> Information that your browser sends whenever you visit our Service, such as your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other statistics.</li>
              <li><strong>Usage Data:</strong> Information about how you use the Service, such as the types of wine recommendations you request, wine styles you search for, and features you interact with.</li>
              <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the collected information for various purposes, including:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>To Provide and Maintain the Service:</strong> To operate, maintain, and improve the functionality of our website and AI wine recommendation tool.</li>
              <li><strong>To Personalize Your Experience:</strong> To tailor wine recommendations and content based on your preferences and usage patterns.</li>
              <li><strong>To Communicate with You:</strong> To send you updates, newsletters, marketing or promotional materials, and other information that may be of interest to you. You may opt out of receiving any, or all, of these communications from us by following the unsubscribe link or instructions provided in any email we send.</li>
              <li><strong>For Age Verification:</strong> To confirm that you meet the legal drinking age requirement.</li>
              <li><strong>For Analytics and Research:</strong> To understand how users interact with our Service, analyze trends, and gather demographic information for internal research and development.</li>
              <li><strong>To Ensure Security:</strong> To detect, prevent, and address technical issues and protect against fraudulent or illegal activity.</li>
              <li><strong>To Comply with Legal Obligations:</strong> To meet our legal and regulatory requirements.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Sharing and Disclosure of Your Information</h2>
            <p className="mb-4">We may share your information in the following situations:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>With Service Providers:</strong> We may employ third-party companies and individuals to facilitate our Service, provide the Service on our behalf, perform Service-related services, or assist us in analyzing how our Service is used. These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</li>
              <li><strong>For Business Transfers:</strong> If WINE WIZE LLC is involved in a merger, acquisition, or asset sale, your Personal Information may be transferred. We will provide notice before your Personal Information is transferred and becomes subject to a different Privacy Policy.</li>
              <li><strong>For Legal Requirements:</strong> We may disclose your Personal Information in the good faith belief that such action is necessary to:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Comply with a legal obligation (e.g., a subpoena or court order).</li>
                  <li>Protect and defend the rights or property of WINE WIZE LLC.</li>
                  <li>Prevent or investigate possible wrongdoing in connection with the Service.</li>
                  <li>Protect the personal safety of users of the Service or the public.</li>
                  <li>Protect against legal liability.</li>
                </ul>
              </li>
              <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your explicit consent.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p className="mb-6">
              The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Data Retention</h2>
            <p className="mb-6">
              We will retain your Personal Information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Information to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Your Data Protection Rights</h2>
            <p className="mb-6">
              Depending on your location, you may have certain data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Information. If you wish to be informed what Personal Information we hold about you and if you want it to be removed from our systems, please contact us.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">a. California Consumer Privacy Act (CCPA) Rights</h3>
            <p className="mb-4">If you are a California resident, you have the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Right to Know:</strong> You have the right to request that we disclose to you the categories and/or specific pieces of personal information we have collected about you, the categories of sources for that personal information, the purposes for which we use that information, the categories of third parties with whom we disclose the information, and the categories of information that we sell or share to third parties.</li>
              <li><strong>Right to Delete:</strong> You have the right to request that we delete personal information we collected from you, subject to certain exceptions.</li>
              <li><strong>Right to Opt-Out of Sale or Sharing:</strong> You have the right to request that we stop selling or sharing your personal information. WINE WIZE LLC does not sell or share personal information as defined by the CCPA.</li>
              <li><strong>Right to Correct:</strong> You have the right to ask us to correct inaccurate information that we have about you.</li>
              <li><strong>Right to Limit Use and Disclosure of Sensitive Personal Information:</strong> You can direct us to only use your sensitive personal information for limited purposes, such as providing you with the services you requested. WINE WIZE LLC does not collect sensitive personal information as defined by the CCPA.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">b. General Data Protection Regulation (GDPR) Rights</h3>
            <p className="mb-4">If you are located in the European Economic Area (EEA), you have certain data protection rights under GDPR. These include:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>The right to access:</strong> The right to request copies of your personal data.</li>
              <li><strong>The right to rectification:</strong> The right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
              <li><strong>The right to erasure:</strong> The right to request that we erase your personal data, under certain conditions.</li>
              <li><strong>The right to restrict processing:</strong> The right to request that we restrict the processing of your personal data, under certain conditions.</li>
              <li><strong>The right to object to processing:</strong> The right to object to our processing of your personal data, under certain conditions.</li>
              <li><strong>The right to data portability:</strong> The right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">c. Texas Data Privacy and Security Act (TDPSA) Rights</h3>
            <p className="mb-4">If you are a Texas resident, you have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Right to Know:</strong> You have the right to know whether we are processing your personal data and to obtain your personal data in a readable format.</li>
              <li><strong>Right to Correct:</strong> You have the right to correct inaccuracies in your personal data.</li>
              <li><strong>Right to Delete:</strong> You have the right to delete personal data provided by or obtained about you.</li>
              <li><strong>Right to Opt-Out:</strong> You have the right to opt-out of the processing of personal data for purposes of targeted advertising, the sale of personal data, or profiling. WINE WIZE LLC does not engage in targeted advertising, sell personal data, or use profiling for decisions that result in the provision or denial of services.</li>
              <li><strong>Right to Not Face Retaliation or Discrimination:</strong> You have the right to not face retaliation or discrimination for exercising these rights.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Children's Privacy</h2>
            <p className="mb-6">
              Our Service is not intended for use by individuals under the age of 21. We do not knowingly collect personally identifiable information from anyone under the age of 21. If you are a parent or guardian and you are aware that your child has provided us with Personal Information, please contact us. If we become aware that we have collected Personal Information from children without verification of parental consent, we take steps to remove that information from our servers.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Links to Other Sites</h2>
            <p className="mb-6">
              Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to This Privacy Policy</h2>
            <p className="mb-6">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. We will let you know via email and/or a prominent notice on our Service, prior to the change becoming effective and update the "Last Updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
            <p className="mb-6">
              If you have any questions about this Privacy Policy, please contact us at: admin@wine-wize.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
