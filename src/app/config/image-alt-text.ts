/**
 * Image alt text mapping for accessibility and SEO
 * All images should have descriptive alt text to improve accessibility and SEO
 */

export const IMAGE_ALT_TEXT = {
  // Logo and branding
  logo: 'Phoenix AI health assistant logo',
  
  // Hero images
  heroImg: 'Phoenix AI health assistant dashboard interface on mobile device',
  heroImg2: 'Phoenix online doctor booking platform interface',
  doctorBg2: 'Healthcare professional consulting with patient on Phoenix platform',

  // Service images
  serviceNurse1: 'Doctor booking consultation appointment on Phoenix platform',
  serviceNurse2: 'Healthcare provider conducting online appointment',
  physiotherapy: 'Physiotherapy and rehabilitation services through Phoenix',
  surgery: 'Surgical consultation available through Phoenix online doctors',

  // About section images
  mission: 'Phoenix mission - Making healthcare accessible and affordable',
  vision: 'Phoenix vision - Healthcare innovation and patient empowerment',
  values: 'Phoenix core values - Trust, care, and innovation',

  // Team images
  teamDoc1: 'Team member from Phoenix healthcare platform',
  teamDoc2: 'Phoenix healthcare professional team member',
  teamDoc3: 'Phoenix team member providing healthcare services',

  // Icons
  hospitalIcon: 'Phoenix hospital healthcare icon',
  waves: 'Decorative waves design element',
  
  // Dashboard/Panel images
  medicalAI: 'Phoenix AI medical assistant interface',
  appointmentCalendar: 'Medical appointment scheduling calendar',
  medicalRecords: 'Digital medical records management system',
  doctorProfile: 'Doctor profile for online consultation',

  // Generic images
  generic: 'Phoenix healthcare platform interface'
};

/**
 * Get alt text for an image
 * @param key The key of the image from IMAGE_ALT_TEXT
 * @returns The descriptive alt text, or generic alt text if key not found
 */
export function getAltText(key: string): string {
  return IMAGE_ALT_TEXT[key as keyof typeof IMAGE_ALT_TEXT] || IMAGE_ALT_TEXT.generic;
}
