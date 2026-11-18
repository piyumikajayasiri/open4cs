import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Open 4Cs",
  description:
    "Contact the Ceylon Academy of Gemmological Science in Malabe for course enquiries, campus visits, and general information.",
};

const contactDetails = [
  {
    label: "Email",
    value: "info@cags.lk",
    href: "mailto:info@cags.lk",
    description: "Email CAGS for course information and general enquiries.",
    Icon: Mail,
  },
  {
    label: "Phone",
    value: "+94 777 572 970",
    href: "tel:+94777572970",
    description: "Call the academy to ask about upcoming classes or a campus visit.",
    Icon: Phone,
  },
  {
    label: "Campus address",
    value: "No. 867/9, Kaduwela Road, Malabe, Sri Lanka",
    href: "https://maps.app.goo.gl/iWEwi6E2p98wfNBt8",
    description: "Select the address for directions to the Malabe campus.",
    Icon: MapPin,
  },
];

const enquiryTopics = [
  {
    title: "Courses and enrolment",
    description:
      "Tell CAGS which course interests you. You can ask about upcoming intakes, fees, entry requirements, and whether classes are available online or in person.",
    Icon: BookOpen,
  },
  {
    title: "Campus and lab visits",
    description:
      "If you would like to see the training facilities in Malabe, contact the academy first to ask about visit availability and arrange a time.",
    Icon: MapPin,
  },
  {
    title: "Open 4Cs feedback",
    description:
      "If your enquiry is about Open 4Cs, mention the project name and the page you were using. If something went wrong, include the steps you took and what you saw.",
    Icon: MessageSquare,
  },
];

export default function ContactPage() {
  return (
    <main className="bg-[#F8FAFC] text-slate-900">
      <section className="border-b border-slate-200 bg-white py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
            Contact Us
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Get in touch with the Ceylon Academy of Gemmological Science (CAGS)
            in Malabe, Sri Lanka. Ask about gemmology courses, practical
            training, or visiting the academy.
          </p>

          <a
            href="https://cags.lk/contact-us/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0B1530] px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Open CAGS enquiry form
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section
        aria-labelledby="contact-details-heading"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      >
        <h2
          id="contact-details-heading"
          className="text-3xl font-extrabold tracking-tight"
        >
          Academy contact details
        </h2>

        <dl className="mt-6 grid gap-4 md:grid-cols-3">
          {contactDetails.map(({ label, value, href, description, Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>

              <dt className="mt-4 font-bold">{label}</dt>
              <dd className="mt-2 text-sm leading-relaxed">
                <a href={href} className="font-semibold text-blue-700 hover:underline">
                  {value}
                </a>
                <p className="mt-2 text-slate-600">{description}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        aria-labelledby="enquiries-heading"
        className="border-t border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h2
            id="enquiries-heading"
            className="text-3xl font-extrabold tracking-tight"
          >
            What can we help you with?
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {enquiryTopics.map(({ title, description, Icon }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <div className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </div>

                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>

          <a
            href="https://cags.lk/"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
          >
            Visit the official CAGS website
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}