export type PropertyMedia = {
  url: string;
  alt: string;
  sortOrder: number;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  project: string;
  phase: string;
  block: string;
  lotNumber: string;
  areaSqm: number | null;
  displayPrice: number | null;
  municipality: string;
  province: string;
  description: string;
  media: PropertyMedia[];
  updatedAt: string | null;
};

export type InquiryInput = {
  propertyId: string | null;
  fullName: string;
  mobileNumber: string;
  email: string;
  inquiryType: string;
  preferredDate: string;
  preferredContactMethod: string;
  message: string;
  consent: boolean;
};

export type InquiryResult = {
  requestId: string;
  message: string;
};

export type Attribution = {
  source: 'renoleads';
  landingPage: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
};
