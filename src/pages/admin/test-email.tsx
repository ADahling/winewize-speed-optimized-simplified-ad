import React from 'react';
import SendTestEmail from '@/components/emails/SendTestEmail'; // Adjust path if you placed it elsewhere

export default function TestEmailPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Email Testing</h1>
      <div className="max-w-md">
        <SendTestEmail />
      </div>
    </div>
  );
}
