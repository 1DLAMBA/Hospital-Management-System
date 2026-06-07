# Phoenix SEO Fixes - phoenixmed.online

## 🔴 Critical Issues to Fix Now

---

### 1. Page Title (Currently broken)

**Current:** `HospitalManagementSystem`
**Problem:** This is a developer placeholder - it's what Google shows in search results. It destroys trust and kills click-through rates.

**Fix - update your `<title>` tag in your Next.js layout:**

```jsx
// app/layout.tsx or pages/_document.tsx
export const metadata = {
  title: "Phoenix - AI Health Assistant & Online Doctor Booking",
  description: "Get instant health guidance from your AI doctor assistant, book appointments with licensed specialists, and access your medical records - all in one place.",
};
```

---

### 2. Meta Description (Likely missing)

**Fix - add to your root layout metadata:**

```jsx
export const metadata = {
  title: "Phoenix - AI Health Assistant & Online Doctor Booking",
  description: "Ask your AI health assistant 24/7, book a doctor in minutes, and manage your medical records securely. Phoenix puts your healthcare in your hands.",
};
```

Keep it under **155 characters**. This is what appears in Google search results beneath your title.

---

### 3. Open Graph Tags (For social sharing)

When someone shares your link on WhatsApp, Twitter, or LinkedIn, these tags control what the preview looks like. Add them to your layout:

```jsx
export const metadata = {
  title: "Phoenix - AI Health Assistant & Online Doctor Booking",
  description: "Ask your AI health assistant 24/7, book a doctor in minutes, and manage your medical records securely.",
  openGraph: {
    title: "Phoenix - AI Health Assistant & Online Doctor Booking",
    description: "Ask your AI health assistant 24/7, book a doctor in minutes, and manage your medical records securely.",
    url: "https://phoenixmed.online",
    siteName: "Phoenix",
    images: [
      {
        url: "https://phoenixmed.online/assets/mockup.png",
        width: 1200,
        height: 630,
        alt: "Phoenix Health Platform",
      },
    ],
    type: "website",
  },
};
```

---

### 4. Structured Data (Helps Google understand your site)

Add a JSON-LD script to your homepage to tell Google this is a health service. Place it in your `<head>`:

```jsx
// In your layout or page component
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "Phoenix",
  "url": "https://phoenixmed.online",
  "description": "AI-powered healthcare platform for online doctor booking, medical records, and health guidance.",
  "medicalSpecialty": "General Practice",
  "availableService": [
    { "@type": "MedicalTherapy", "name": "Online Doctor Appointments" },
    { "@type": "MedicalTherapy", "name": "AI Health Assistant" },
    { "@type": "MedicalTherapy", "name": "Medical Records Access" }
  ]
};

// Render it in your JSX:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

---

### 5. Target Keywords to Build Around

These are the terms people are actually searching. Use them naturally in headings, page copy, and alt text:

| Keyword | Monthly Intent |
|---|---|
| `book doctor online` | High - direct booking intent |
| `AI health assistant` | High - your differentiator |
| `online medical records` | Medium - feature-driven |
| `find specialist near me` | High - local intent |
| `chat with a doctor online` | High - real-time care intent |
| `AI doctor chat` | Growing - your hook |

**Action:** Make sure at least 2–3 of these appear naturally in your homepage headings (H1, H2) and in your meta tags.

---

### 6. Image Alt Text

Your images currently use generic filenames (mockup.png, servicenurse1.png). Add descriptive alt text:

```jsx
// Instead of:
<img src="/assets/mockup.png" alt="Phoenix app mockup" />

// Use:
<img src="/assets/mockup.png" alt="Phoenix AI health assistant dashboard on mobile" />
<img src="/assets/servicenurse1.png" alt="Doctor booking appointment on Phoenix platform" />
```

---

## ✅ Implementation Checklist

- [ ] Fix page title (remove "HospitalManagementSystem")
- [ ] Add meta description to root layout
- [ ] Add Open Graph tags
- [ ] Add JSON-LD structured data to homepage
- [ ] Update image alt text across all pages
- [ ] Add target keywords naturally to H1 and H2 headings
- [ ] Add legal pages (Privacy Policy, Terms of Service, Medical Disclaimer) and link them in the footer

---

## 📁 Legal Pages (Already Generated)

Add these pages to your Next.js project and link them in the footer:

- `/privacy-policy` → Privacy Policy
- `/terms-of-service` → Terms of Service
- `/medical-disclaimer` → Medical Disclaimer
