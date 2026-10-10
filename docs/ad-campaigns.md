# Phoenix Ad Campaigns

Operating plan for paid acquisition on phoenixmed.online. Two campaigns:
**patients** (primary) and **health professionals** (secondary).

Everything in "Before you spend anything" has to be true before the first
naira/dollar goes out, or the spend is unmeasurable.

---

## 1. Before you spend anything

The code side is done and shipped (see section 6). These are the account-side
steps, which need your logins and are yours to do.

| # | Step | Where | Result |
|---|------|-------|--------|
| 1 | Create a GA4 property for phoenixmed.online | analytics.google.com → Admin → Data Streams | Measurement ID `G-XXXXXXX` |
| 2 | Create a Meta Pixel | Meta Events Manager → Data Sources | Pixel ID (15–16 digits) |
| 3 | Paste both IDs into `environment.production.ts` and set `analytics.enabled: true` | this repo | Tags start loading after consent |
| 4 | Deploy | your normal deploy | Tracking live |
| 5 | Mark `sign_up` as a **conversion** in GA4 | GA4 → Admin → Events | Google Ads can optimise on signups |
| 6 | Link GA4 to Google Ads | GA4 → Admin → Product Links | Conversion import available |
| 7 | Verify your domain in Meta Business Manager | Business Settings → Brand Safety | Required for iOS conversion tracking |

**Verify before launching.** Open the site with `?utm_source=test&utm_medium=cpc`,
accept the cookie prompt, and confirm in GA4 Realtime that `campaign_landing_view`
and `page_view` arrive. Then complete a test registration and confirm `sign_up`
fires with the right `user_type`.

### Policy check — do this first

Healthcare and telehealth advertising is a restricted category on both
platforms, and approval rules vary by the country you target.

- **Google Ads**: telehealth and healthcare advertising is restricted; some
  countries require advertiser certification before ads can serve. Check
  eligibility for every country you plan to target *before* you build campaigns.
- **Meta**: health-related targeting options are limited, and you cannot imply
  knowledge of a person's medical condition in ad copy. Write about the service,
  never about the reader's health ("See a doctor online", not "Still coughing?").

The copy in this document is written to stay on the right side of both. Keep it
that way if you rewrite it.

---

## 2. Landing pages

| Audience | URL | Route data |
|----------|-----|------------|
| Patients | `https://phoenixmed.online/consult` | `{ campaign: 'patients' }` |
| Professionals | `https://phoenixmed.online/practice` | `{ campaign: 'professionals' }` |

Send paid traffic to these, **not** to the homepage. The homepage sells the
whole product to everyone; these pages make one promise and offer one action.
They also put the CTA above the fold on mobile, which the homepage does not.

Both pages link to `/register` with the role pre-selected (`?type=client`,
`?type=doctor`), so the visitor does not re-answer a question the ad already
settled.

### Always tag your URLs

Every ad destination gets UTMs. Without them, attribution falls back to
guesswork.

```
https://phoenixmed.online/consult?utm_source=google&utm_medium=cpc&utm_campaign=patients-search&utm_content=symptoms-rsa
https://phoenixmed.online/consult?utm_source=meta&utm_medium=paid_social&utm_campaign=patients-prospecting&utm_content=video-consult
https://phoenixmed.online/practice?utm_source=google&utm_medium=cpc&utm_campaign=pros-search&utm_content=earn-rsa
```

Use auto-tagging (`gclid`) on Google Ads as well — the app captures `gclid` and
`fbclid` alongside the UTMs and holds them for 30 days.

---

## 3. Campaign one — patients (primary)

**Objective:** registered patient accounts.
**Primary conversion:** `sign_up` with `user_type = client`.

### 3.1 Google Search

Structure — three ad groups, tight themes, one RSA each:

| Ad group | Intent | Example keywords (phrase match) |
|----------|--------|--------------------------------|
| Online consultation | Ready to book | "online doctor consultation", "talk to a doctor online", "see a doctor online" |
| Book appointment | Comparing options | "book doctor appointment online", "online doctor appointment", "virtual doctor visit" |
| Specialist access | Looking for a type of care | "online specialist consultation", "consult a doctor online", "telemedicine consultation" |

Start on **phrase match** only. Broad match without a conversion history will
burn budget on irrelevant queries. Add a negative list from day one:
`free`, `jobs`, `salary`, `student`, `course`, `certification`, `insurance claim`,
`near me` (if you are not offering in-person), plus any competitor brand names
you do not want to bid on.

**Responsive Search Ad — headlines** (30 char limit each):

```
See a Doctor Online Today
Talk to a Doctor Online
Book a Doctor in Minutes
Licensed Doctors Online
Online Consultation 24/7
Verified Doctors, Real Care
No Queues, No Waiting Room
Chat or Video Consultation
Free to Join Phoenix
Your AI Health Assistant
Get Medical Advice Online
Consult From Home
Secure Medical Records
Phoenix Online Clinic
Booked Within the Hour
```

**Descriptions** (90 char limit each):

```
Describe your symptoms, match with the right specialist, consult by chat or video.
Licensed, verified doctors. Book in minutes, records kept in one secure place.
Free to create an account. Fees are shown before you book, with nothing hidden.
Skip the phone queue. Live availability means the slot you see is the slot you get.
```

Display path: `/consult` and `/online-doctor`.

**Sitelinks:** How it works (`/services`), About Phoenix (`/about`),
Privacy (`/privacy-policy`), Contact (`/contact`).

### 3.2 Meta (Facebook/Instagram)

Objective: **Conversions**, optimising for `CompleteRegistration`. If the pixel
has fewer than ~50 conversions/week, optimise for `Lead` first and switch once
volume supports it.

Audiences, one ad set each:
1. **Broad** — country, 25–55, no interest targeting. Let the algorithm work.
2. **Interest** — health and wellness, telemedicine, health insurance.
3. **Retargeting** — visited `/consult` but did not reach `/register` (build from
   the pixel's PageView + a URL-contains rule).

**Primary text (option A):**
> Booking a doctor should not cost you a morning. Describe your symptoms on
> Phoenix, get matched with the right licensed specialist, and hold your
> consultation by chat or video — most patients are booked within the hour.
> Free to join.

**Primary text (option B):**
> A licensed doctor, without the waiting room. Phoenix matches you to the right
> specialist, shows you who is available now, and keeps every consultation note
> and prescription in one secure place.

**Headlines (40 char limit):**
```
See a licensed doctor online
Book a doctor in minutes
Your consultation, from home
```

**Descriptions (30 char limit):**
```
Free to join
Verified doctors only
Chat or video
```

**CTA button:** Sign Up.

### 3.3 Creative direction

Use `assets/mockup.png` (product on device) for at least one variant and a real
consultation scene for another. Test product-shot vs human-face; on health
products the human face usually wins on CTR and the product shot usually wins on
conversion rate, so judge on cost per signup, not clicks.

---

## 4. Campaign two — health professionals (secondary)

**Objective:** verified professional accounts.
**Primary conversion:** `sign_up` with `user_type` in `doctor | nurse | other_professional`.

This audience is smaller and cheaper to reach on search than patients, because
the intent is explicit ("online doctor jobs") and competition is thinner. It also
has a longer payoff: a verified professional serves many patients.

### 4.1 Google Search

| Ad group | Example keywords (phrase match) |
|----------|-------------------------------|
| Online doctor work | "online doctor jobs", "telemedicine jobs for doctors", "work as an online doctor" |
| Remote nursing | "remote nursing jobs", "online nurse jobs", "telehealth nurse" |
| Allied health | "remote pharmacist jobs", "online healthcare jobs", "telehealth jobs" |

Negatives: `training`, `course`, `degree`, `how to become`, `salary in`,
`government`, `recruitment form`, `scholarship`.

**Headlines** (30 chars):
```
Earn on Your Own Schedule
Consult Patients Online
Set Your Own Hours
Join Phoenix as a Doctor
Remote Work for Nurses
No Listing Fees
Fill Gaps in Your Week
Verified in a Few Days
Telemedicine, Your Way
Extra Income for Clinicians
Allied Health Welcome
Work From Anywhere
Your Practice, Online
See Patients Between Shifts
Free to List Your Practice
```

**Descriptions** (90 chars):
```
Publish the hours you want to work. Patients book only the slots you have opened.
Doctors, nurses and allied professionals consult online and get paid for the time.
No listing fee. Upload your licence and ID, and go live once verification is done.
Patients arrive prepared, so the appointment goes on judgement, not history taking.
```

Display path: `/practice` and `/for-doctors`.

### 4.2 LinkedIn (optional, once the search campaign proves the offer)

Target by job title (Physician, General Practitioner, Registered Nurse,
Pharmacist) and industry (Hospital & Health Care). LinkedIn costs more per click
than Search but reaches qualified professionals who are not actively job
searching. Only worth it once `/practice` has a proven conversion rate.

**Primary text:**
> Your open hours are worth something. Phoenix lets doctors, nurses, and allied
> health professionals consult with patients online, set their own availability
> and rates, and get paid for the time they choose to work. No listing fee, and
> verification usually completes within a few working days.

---

## 5. Budget, sequencing, and what "working" looks like

**Do not launch both campaigns at once.** Run patients first. You need one
funnel producing clean conversion data before you split attention and budget.

Sequence:

1. **Week 0 — instrument.** Complete section 1. Ship. Verify events arrive.
2. **Weeks 1–2 — Google Search, patients only, small daily budget.** Search
   catches people already looking, so it tells you fastest whether the offer and
   the landing page convert at all. Change nothing for the first 7 days; you are
   collecting a baseline, and early edits just reset learning.
3. **Weeks 3–4 — add Meta prospecting for patients** if Search is producing
   signups at a cost you can live with. If Search is not converting, the problem
   is the page or the offer, and more channels will not fix it.
4. **Week 5+ — add the professionals Search campaign**, and add Meta
   retargeting for patients once the pixel has enough traffic.

**Split when both are running:** roughly 70% patients / 30% professionals.
Patients are the demand side, and the marketplace fails faster without them.

**Numbers to watch, in order of how much they matter:**

1. **Cost per signup**, split by `user_type`. This is the number. Everything else
   is diagnosis.
2. **Landing page → register rate** (`campaign_landing_view` → `sign_up_form_view`).
   Below ~10% and the page or the ad promise is wrong.
3. **Register start → complete** (`sign_up_form_view` → `sign_up`). This is where
   the multi-step form leaks, especially for professionals who must upload a
   licence, certificate, signature, and ID.
4. **Click-through rate.** Only useful for judging creative against creative.

Set a cost-per-signup ceiling *before* you launch, based on what a patient or a
verified professional is actually worth to Phoenix over a year. Without that
number you cannot tell a good campaign from a bad one, and you will end up
judging ads on clicks, which is how ad budgets get wasted.

**Pause rule:** if an ad group spends 3× your target cost per signup with zero
signups, pause it and look at the landing page before you rewrite the ad.

---

## 6. What is already implemented in the app

| Piece | File |
|-------|------|
| GA4 + Meta Pixel loader, Consent Mode v2, event taxonomy | `src/app/services/analytics.service.ts` |
| UTM / `gclid` / `fbclid` capture, 30-day window, last-paid-click | `src/app/services/attribution.service.ts` |
| Cookie consent prompt (tags do not load until accepted) | `src/app/consent/consent-banner.component.ts` |
| Landing pages (both audiences, one component) | `src/app/campaign/` |
| Campaign copy and SEO metadata | `src/app/campaign/campaign-content.ts` |
| Route wiring | `src/app/app.routes.ts` |
| Conversion events in the signup funnel | `src/app/register/register.component.ts` |
| Page-view tracking, attribution bootstrap | `src/app/app.component.ts` |
| Measurement IDs | `src/environments/environment*.ts` |

### Event taxonomy

| Event | Fires when | Key params |
|-------|-----------|------------|
| `page_view` | every route change | `page_path` |
| `campaign_landing_view` | a landing page renders | `campaign_page`, `traffic_source` |
| `cta_click` | any landing-page CTA | `cta_name`, `cta_location` |
| `sign_up_started` | CTA that leads to `/register` | `audience` |
| `sign_up_form_view` | `/register` opens | `prefilled_type`, `traffic_source` |
| `sign_up_role_selected` | role pre-filled from an ad | `user_type` |
| `sign_up` **(conversion)** | account created | `user_type`, `method` |

Meta equivalents: `Lead` on `sign_up_started`, `CompleteRegistration` on `sign_up`.

---

## 7. Known gaps

Worth knowing before you rely on the numbers.

- **Attribution is not stored server-side.** `UserController::create` persists
  only validated fields, so campaign data sent in the register payload would be
  silently dropped. Attribution currently lives in the browser and in GA4/Meta.
  To tie a campaign to a specific account in your own database you need a
  migration adding the UTM columns, plus matching validation rules. Worth doing
  before you scale spend, because platform-reported conversions always flatter.
- **Consent gates everything.** A visitor who declines is invisible to GA4 and
  Meta. That is the correct behaviour, and it means platform numbers will
  under-report. Do not "fix" it by removing the gate.
- **The homepage mobile hero buries its CTA.** The product mockup fills the first
  screen and the buttons land far below the fold. The campaign pages avoid this,
  but organic mobile traffic still hits it.
- **The homepage "Get Started" button routes to `/login`, not `/register`.**
  New visitors land on a sign-in form. Not on the ad path, but it costs organic
  signups.
