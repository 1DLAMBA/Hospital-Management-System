import { SeoMetadata } from '../services/seo.service';

export const SEO_CONFIG: { [key: string]: SeoMetadata } = {
  home: {
    title: 'Phoenix - AI Health Assistant & Online Doctor Booking',
    description: 'Ask your AI health assistant 24/7, book a doctor in minutes, and manage your medical records securely. Phoenix puts your healthcare in your hands.',
    keywords: 'AI health assistant, book doctor online, online medical consultation, AI doctor chat, healthcare platform, medical records',
    ogTitle: 'Phoenix - AI Health Assistant & Online Doctor Booking',
    ogDescription: 'Ask your AI health assistant 24/7, book a doctor in minutes, and manage your medical records securely.',
    ogImage: 'https://phoenixmed.online/assets/heroimg.png',
    ogUrl: 'https://phoenixmed.online',
    canonical: 'https://phoenixmed.online',
    robotsIndex: true
  },

  services: {
    title: 'Phoenix Services - AI Doctor, Appointments & Medical Records',
    description: 'Explore Phoenix healthcare services including AI health assistant, online doctor booking, and medical records management.',
    keywords: 'online doctor booking, AI health assistant, medical records, healthcare services, appointment booking, specialist finder',
    ogTitle: 'Phoenix Services - AI Doctor, Appointments & Medical Records',
    ogDescription: 'Explore our comprehensive healthcare services: AI health assistant, online doctor booking, and secure medical records access.',
    ogImage: 'https://phoenixmed.online/assets/servicenurse1.png',
    ogUrl: 'https://phoenixmed.online/services',
    canonical: 'https://phoenixmed.online/services',
    robotsIndex: true
  },

  about: {
    title: 'About Phoenix - Transforming Healthcare with AI',
    description: 'Learn about Phoenix\'s mission to revolutionize healthcare through AI technology, online doctor access, and patient empowerment.',
    keywords: 'about Phoenix, healthcare innovation, AI healthcare, medical technology, online healthcare platform',
    ogTitle: 'About Phoenix - Transforming Healthcare with AI',
    ogDescription: 'Discover Phoenix\'s mission to make healthcare accessible, affordable, and empowered through AI and technology.',
    ogImage: 'https://phoenixmed.online/assets/mission.png',
    ogUrl: 'https://phoenixmed.online/about',
    canonical: 'https://phoenixmed.online/about',
    robotsIndex: true
  },

  contact: {
    title: 'Contact Phoenix - Get Support',
    description: 'Have questions? Get in touch with the Phoenix team. We\'re here to help with customer support and inquiries.',
    keywords: 'contact us, Phoenix support, healthcare support, customer service',
    ogTitle: 'Contact Phoenix - Get Support',
    ogDescription: 'Have questions about Phoenix? Contact our customer support team today.',
    ogImage: 'https://phoenixmed.online/assets/Phoenix.png',
    ogUrl: 'https://phoenixmed.online/contact',
    canonical: 'https://phoenixmed.online/contact',
    robotsIndex: true
  },

  login: {
    title: 'Login - Phoenix Healthcare',
    description: 'Sign in to your Phoenix account to access your medical records, appointments, and AI health assistant.',
    keywords: 'login, sign in, Phoenix account, healthcare login',
    ogTitle: 'Login - Phoenix Healthcare',
    ogDescription: 'Sign in to Phoenix to access your healthcare dashboard.',
    ogUrl: 'https://phoenixmed.online/login',
    canonical: 'https://phoenixmed.online/login',
    robotsIndex: false
  },

  register: {
    title: 'Register - Create Your Phoenix Account',
    description: 'Create a Phoenix account to book doctors, access medical records, and use our AI health assistant.',
    keywords: 'register, sign up, create account, Phoenix registration',
    ogTitle: 'Register - Create Your Phoenix Account',
    ogDescription: 'Sign up for Phoenix to get instant access to online doctors and AI health guidance.',
    ogUrl: 'https://phoenixmed.online/register',
    canonical: 'https://phoenixmed.online/register',
    robotsIndex: false
  },

  panel: {
    title: 'Phoenix Dashboard',
    description: 'Your Phoenix healthcare dashboard. Manage appointments, medical records, and connect with healthcare providers.',
    keywords: 'dashboard, appointments, medical records, healthcare management',
    ogUrl: 'https://phoenixmed.online/panel',
    canonical: 'https://phoenixmed.online/panel',
    robotsIndex: false
  }
};

/**
 * Get SEO metadata for a specific page by route path
 */
export function getSeoConfigByRoute(path: string): SeoMetadata {
  const pathKey = path.split('/')[1] || 'home';
  return SEO_CONFIG[pathKey] || SEO_CONFIG['home'];
}
