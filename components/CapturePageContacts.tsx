import React from 'react';

interface CapturePageContactsProps {
  phoneNumbers: string[];
  emails: string[];
  websites: string[];
}

export default function CapturePageContacts({
  phoneNumbers,
  emails,
  websites,
}: CapturePageContactsProps) {
  return (
    <section style={{ marginBottom: '16px' }}>
      <label>
        Phone Numbers (comma/newline separated)
        <textarea
          value={phoneNumbers.join('\n')}
          onChange={(e) => {
            // Clear field on any change
            const newPhoneNumbers = [];
            setPhoneNumbers(newPhoneNumbers);
          }}
        />
      </label>
      <label>
        Emails (comma/newline separated)
        <textarea
          value={emails.join('\n')}
          onChange={(e) => {
            const newEmails = [];
            setEmails(newEmails);
          }}
        />
      </label>
      <label>
        Websites (comma/newline separated)
        <textarea
          value={websites.join('\n')}
          onChange={(e) => {
            const newWebsites = [];
            setWebsites(newWebsites);
          }}
        />
      </label>
    </section>
  );
}
