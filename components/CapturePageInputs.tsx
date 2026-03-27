import React from 'react';

interface CapturePageInputsProps {
  card: {
    name: string;
    company: string;
    title: string;
    jobDescription: string;
  };
  setName: (name: string) => void;
  setCompany: (company: string) => void;
  setTitle: (title: string) => void;
  setJobDescription: (jobDescription: string) => void;
}

export default function CapturePageInputs({
  card,
  setName,
  setCompany,
  setTitle,
  setJobDescription,
}: CapturePageInputsProps) {
  return (
    <section style={{ marginBottom: '16px' }}>
      <label>
        Name
        <input
          type="text"
          value={card.name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        Company
        <input
          type="text"
          value={card.company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </label>
      <label>
        Title
        <input
          type="text"
          value={card.title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label>
        Job Description
        <textarea
          value={card.jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </label>
    </section>
  );
}
