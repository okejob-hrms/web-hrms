'use client';

import * as React from 'react';
import OrganizationChart from '@/components/pages/organization-structure';

export const SectionOrganization = () => {
  return (
    <div className="font-sans min-h-screen flex flex-col py-6 px-6 md:px-12">
      <OrganizationChart isEmployee />
    </div>
  );
};
