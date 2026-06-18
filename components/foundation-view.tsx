"use client";

const PAYPAL_PAYMENT_LINK = "https://www.paypal.com/ncp/payment/8W7FN8HVGWYXE";

const foundationPillars = [
  {
    title: "Inclusive Learning",
    text: "Little Genius is designed for every learner stage, from kindergarten to university, inside one adaptive platform."
  },
  {
    title: "AI-Powered Guidance",
    text: "The foundation is powered by server-side Gemini capability to support smarter tutoring, adaptive question generation, and personalized study flow."
  },
  {
    title: "Real-World Access",
    text: "Microphone and geolocation support open the door for spoken interaction, location-aware experiences, and richer learner participation."
  }
];

const impactAreas = [
  "Adaptive learning for toddlers, primary, secondary, and tertiary levels",
  "AI tutoring and guided explanations for difficult questions",
  "Voice-enabled learning experiences using microphone access",
  "Location-aware education programs using geolocation support",
  "A single learning ecosystem that can scale into a global education network"
];

const treasuryStats = [
  {
    label: "Education Treasury",
    value: "1,250,000 GENI",
    hint: "Allocated for learner incentives and growth."
  },
  {
    label: "Learners Supported",
    value: "12,480",
    hint: "Projected learners reached through the ecosystem."
  },
  {
    label: "Rewards Distributed",
    value: "248,300 GENI",
    hint: "Tracked rewards for learning and performance."
  },
  {
    label: "Active Sponsors",
    value: "36",
    hint: "Partners helping scale access and impact."
  }
];

function openPaypalCheckout(flow: "subscription" | "donation") {
  try {
    window.localStorage.setItem("little_genius_last_checkout_type", flow);
    window.localStorage.setItem("little_genius_last_checkout_amount", "10");
  } catch {}

  window.open(PAYPAL_PAYMENT_LINK, "_blank", "noopener,noreferrer");
}

export default function FoundationView() {
  return (
    <section className="space-y-6">
      <section className="rounded-[32px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
        <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-200">
          Foundation
        </div>
        <h2 className="mt-3 text-4xl font-black text-white">Little Genius Foundation</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">
          Little Genius is an all-in-one adaptive learning platform built to serve learners across all age groups,
          from kindergarten to university. The foundation vision is to combine AI tutoring, curriculum access,
          rewards, and inclusive digital education into one intelligent ecosystem.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.08fr,0.92fr]">
        <section className="space-y-6">
          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/80">
              Mission
            </div>
            <h3 className="mt-2 text-2xl font-bold text-white">
              Build a universal AI learning ecosystem
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/75">
              The foundation exists to expand access to intelligent education tools, support learners at every stage,
              and make advanced tutoring available through modern AI systems. The long-term goal is to create a scalable
              education environment where learning, evaluation, and opportunity connect in one place.
            </p>

            <div className="mt-6 grid gap-4">
              {foundationPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="text-lg font-semibold text-white">{pillar.title}</div>
                  <div className="mt-2 text-sm leading-6 text-white/75">{pillar.text}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">
              Impact Areas
            </div>
            <div className="mt-4 space-y-3">
              {impactAreas.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="space-y-6">
          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">
              Treasury Stats
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {treasuryStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                    {stat.label}
                  </div>
                  <div className="mt-2 text-2xl font-black text-white">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-white/65">{stat.hint}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-100">
              Lifetime Subscription
            </div>
            <h3 className="mt-2 text-2xl font-bold text-white">
              $10 One-Time Lifetime Access
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Learners can unlock a one-time lifetime subscription for <span className="font-semibold text-white">$10</span>
              using the payment method below.
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                Payment Method
              </div>
              <div className="mt-2 text-lg font-semibold text-white">PayPal Hosted Checkout</div>
              <div className="mt-2 text-sm text-white/70">
                Amount: $10 only
              </div>
            </div>

            <button
              type="button"
              onClick={() => openPaypalCheckout("subscription")}
              className="mt-5 w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
            >
              Subscribe for $10
            </button>
          </section>

          <section className="rounded-[28px] border border-fuchsia-300/20 bg-fuchsia-400/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-100">
              Appreciation Donation
            </div>
            <h3 className="mt-2 text-2xl font-bold text-white">
              $10 Donation Only
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Learners who want to show appreciation to the project can make a single <span className="font-semibold text-white">$10</span> donation using the same payment method.
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                Donation Policy
              </div>
              <div className="mt-2 text-sm text-white/75">
                Only one donation category is available here: <span className="font-semibold text-white">$10 donation</span>.
              </div>
            </div>

            <button
              type="button"
              onClick={() => openPaypalCheckout("donation")}
              className="mt-5 w-full rounded-2xl border border-cyan-300/30 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
            >
              Donate $10
            </button>
          </section>

          <section className="rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="text-xs uppercase tracking-[0.25em] text-white/70">
              Sponsor Call
            </div>
            <h3 className="mt-2 text-2xl font-bold text-white">
              Support the Little Genius Mission
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Help Little Genius expand access to AI-powered education, learner rewards, and inclusive digital learning across all age groups.
            </p>
          </section>
        </section>
      </div>
    </section>
  );
}

