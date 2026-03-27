import React from 'react';

interface CapturePageLogoProps {
  card: {
    logoImage?: string;
  };
  logoImage?: string;
}

export default function CapturePageLogo({ card, logoImage }: CapturePageLogoProps) {
  return (
    <section style={{ marginBottom: '16px' }}>
      {card.logoImage ? (
        <img src={logoImage} alt="logo" style={{ maxWidth: '200px' }} />
      ) : null}
    </section>
  );
}
