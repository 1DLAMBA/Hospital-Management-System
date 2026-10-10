import { SeoMetadata } from '../services/seo.service';

/**
 * Content for the paid-traffic landing pages. These are deliberately separate
 * from the homepage: an ad promises one thing, and the page the click lands on
 * has to deliver exactly that thing with one action available. Adding another
 * campaign means adding an entry here and a route - no new component.
 */

export interface CampaignCta {
  label: string;
  route: string;
  queryParams?: Record<string, string>;
}

export interface CampaignStep {
  number: string;
  title: string;
  body: string;
}

export interface CampaignValueProp {
  icon: string;
  title: string;
  body: string;
}

export interface CampaignFaq {
  question: string;
  answer: string;
}

export interface CampaignContent {
  key: string;
  audience: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subhead: string;
  primaryCta: CampaignCta;
  secondaryCta: CampaignCta;
  reassurance: string;
  heroImage: string;
  heroAlt: string;
  proofPoints: string[];
  stepsTitle: string;
  steps: CampaignStep[];
  valuePropsTitle: string;
  valueProps: CampaignValueProp[];
  testimonial: { quote: string; attribution: string };
  faqTitle: string;
  faqs: CampaignFaq[];
  closingHeadline: string;
  closingBody: string;
  seo: SeoMetadata;
}

const BASE_URL = 'https://phoenixmed.online';

export const CAMPAIGN_CONTENT: { [key: string]: CampaignContent } = {
  patients: {
    key: 'patients',
    audience: 'patients',
    eyebrow: 'Online consultations',
    headline: 'See a licensed doctor',
    headlineAccent: 'without leaving home',
    subhead:
      'Describe your symptoms, get matched to the right specialist, and hold your consultation by chat or video. Most patients are booked within the hour.',
    primaryCta: { label: 'Book a consultation', route: '/register', queryParams: { type: 'client' } },
    secondaryCta: { label: 'See how it works', route: '/services' },
    reassurance: 'Free to join. No card required to create an account.',
    heroImage: 'assets/mockup.png',
    heroAlt: 'Phoenix consultation booking shown on a phone and laptop',
    proofPoints: [
      'Licensed, verified professionals',
      'Chat or video consultations',
      'Records stored securely in your account',
    ],
    stepsTitle: 'Three steps to your consultation',
    steps: [
      {
        number: '01',
        title: 'Tell us what is wrong',
        body: 'Answer a few questions about your symptoms. The AI health assistant helps you describe them clearly and points you to the right kind of specialist.',
      },
      {
        number: '02',
        title: 'Pick a doctor and a time',
        body: 'Browse verified doctors by specialty, see who is available, and choose a slot that fits your day. You get confirmation immediately.',
      },
      {
        number: '03',
        title: 'Consult from wherever you are',
        body: 'Meet your doctor by secure chat or video at the booked time. Notes, prescriptions, and history stay in your Phoenix records afterwards.',
      },
    ],
    valuePropsTitle: 'Why patients choose Phoenix',
    valueProps: [
      {
        icon: 'assets/icons8-ai-100.png',
        title: 'Answers at 2am',
        body: 'The AI health assistant is available around the clock for questions that do not need an appointment, and tells you honestly when something does.',
      },
      {
        icon: 'assets/onlineappointment.png',
        title: 'No phone queues',
        body: 'Booking takes minutes instead of a morning. Availability is live, so the slot you see is the slot you get.',
      },
      {
        icon: 'assets/icons8-document-100.png',
        title: 'Your records, in one place',
        body: 'Every consultation, prescription, and doctor note is saved to your account and shareable with your care team when you need it.',
      },
    ],
    testimonial: {
      quote:
        'I used to spend hours on the phone trying to book an appointment. With Phoenix I found a specialist, picked a time, and had it confirmed in under two minutes.',
      attribution: 'Adaeze Nwosu, 34',
    },
    faqTitle: 'Before you book',
    faqs: [
      {
        question: 'Are the doctors actually licensed?',
        answer:
          'Yes. Every professional on Phoenix submits their licence number, medical school, and identification, and is verified before they can accept patients.',
      },
      {
        question: 'What does a consultation cost?',
        answer:
          'Creating an account is free. Consultation fees are set by the individual doctor and shown to you before you confirm a booking, so there is nothing hidden.',
      },
      {
        question: 'Is the AI assistant a replacement for a doctor?',
        answer:
          'No, and it will tell you so. It helps you understand symptoms and prepare for a visit. Diagnosis and treatment come from a licensed professional.',
      },
      {
        question: 'Is my health information private?',
        answer:
          'Your records are encrypted and visible only to you and the professionals you consult. You control what is shared and with whom.',
      },
    ],
    closingHeadline: 'Your consultation is a few minutes away',
    closingBody:
      'Create your free account, describe your symptoms, and pick a doctor who is available today.',
    seo: {
      title: 'Online Doctor Consultation | Talk to a Licensed Doctor Today - Phoenix',
      description:
        'Book an online consultation with a licensed doctor in minutes. Chat or video appointments, verified specialists, and secure medical records. Free to join.',
      keywords:
        'online doctor consultation, talk to a doctor online, virtual doctor appointment, telemedicine, book doctor online, online medical consultation',
      ogTitle: 'See a Licensed Doctor Online - Phoenix',
      ogDescription:
        'Describe your symptoms, get matched to the right specialist, and consult by chat or video. Most patients are booked within the hour.',
      ogImage: BASE_URL + '/assets/heroimg.png',
      ogUrl: BASE_URL + '/consult',
      canonical: BASE_URL + '/consult',
      robotsIndex: true,
    },
  },

  professionals: {
    key: 'professionals',
    audience: 'health professionals',
    eyebrow: 'For health professionals',
    headline: 'Earn from your practice',
    headlineAccent: 'on your own schedule',
    subhead:
      'Doctors, nurses, and allied health professionals use Phoenix to consult with patients online, set their own availability, and get paid for the hours they choose to work.',
    primaryCta: { label: 'Join as a professional', route: '/register', queryParams: { type: 'doctor' } },
    secondaryCta: { label: 'How Phoenix works', route: '/about' },
    reassurance: 'No listing fee. Verification usually completes within a few working days.',
    heroImage: 'assets/logdoctor.png',
    heroAlt: 'A doctor consulting with a patient through Phoenix',
    proofPoints: [
      'You set your own hours and rates',
      'Patients come to you, already triaged',
      'Consult by chat or video from anywhere',
    ],
    stepsTitle: 'From application to first patient',
    steps: [
      {
        number: '01',
        title: 'Create your account',
        body: 'Register in a couple of minutes with your name, email, and phone number. You will confirm your email with a one-time code.',
      },
      {
        number: '02',
        title: 'Get verified',
        body: 'Upload your licence number, qualification, signature, and ID. Our team reviews credentials before your profile goes live to patients.',
      },
      {
        number: '03',
        title: 'Set availability and start earning',
        body: 'Publish the hours you want to work. Patients book the slots you have opened, and you consult by secure chat or video.',
      },
    ],
    valuePropsTitle: 'Built around how clinicians actually work',
    valueProps: [
      {
        icon: 'assets/onlineappointment.png',
        title: 'Fill the gaps in your week',
        body: 'Open an hour between ward rounds or a weekend evening. Your calendar only shows patients the time you have deliberately made available.',
      },
      {
        icon: 'assets/icons8-ai-100.png',
        title: 'Patients arrive prepared',
        body: 'The AI health assistant helps patients describe symptoms before the consultation, so you spend the appointment on clinical judgement, not history-taking.',
      },
      {
        icon: 'assets/icons8-document-100.png',
        title: 'Notes and records handled',
        body: 'Consultation notes, prescriptions, and patient history live in one place, so follow-ups do not start from nothing.',
      },
    ],
    testimonial: {
      quote:
        'The scheduling is the part that changed things for me. I open the hours I actually have, and the bookings fit around my hospital shifts instead of competing with them.',
      attribution: 'Verified Phoenix professional',
    },
    faqTitle: 'Common questions from professionals',
    faqs: [
      {
        question: 'Who can join?',
        answer:
          'Licensed doctors and nurses, plus allied professionals including pharmacists, physiotherapists, radiologists, laboratory scientists, nutritionists, and medical social workers.',
      },
      {
        question: 'What do I need to sign up?',
        answer:
          'Your licence number, the medical school or institution you qualified from, your graduation year, a copy of your certificate, your signature, and a valid ID.',
      },
      {
        question: 'How long does verification take?',
        answer:
          'Most applications are reviewed within a few working days. You will be notified by email once your profile is live and able to accept bookings.',
      },
      {
        question: 'Do I have to commit to set hours?',
        answer:
          'No. You publish availability whenever it suits you, and you can change or withdraw it at any time. There is no minimum number of consultations.',
      },
    ],
    closingHeadline: 'Put your open hours to work',
    closingBody:
      'Create your professional account today. Verification is straightforward, and there is no cost to list your practice.',
    seo: {
      title: 'Work as an Online Doctor or Nurse | Earn on Your Schedule - Phoenix',
      description:
        'Join Phoenix as a doctor, nurse, or allied health professional. Set your own hours and rates, consult patients online, and get paid for the time you choose to work.',
      keywords:
        'online doctor jobs, telemedicine jobs for doctors, remote nursing jobs, work as an online doctor, healthcare professional platform, locum online consultations',
      ogTitle: 'Earn From Your Practice on Your Own Schedule - Phoenix',
      ogDescription:
        'Doctors, nurses, and allied health professionals consult online through Phoenix, set their own availability, and get paid for the hours they choose.',
      ogImage: BASE_URL + '/assets/logdoctor.png',
      ogUrl: BASE_URL + '/practice',
      canonical: BASE_URL + '/practice',
      robotsIndex: true,
    },
  },
};

export function getCampaignContent(key: string): CampaignContent {
  return CAMPAIGN_CONTENT[key] ?? CAMPAIGN_CONTENT['patients'];
}
