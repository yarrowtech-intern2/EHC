export interface FAQItem {
  question: string;
  answer: string;
}

export const faqData: FAQItem[] = [
  {
    question: "What services are available through EHC?",
    answer:
      "EHC provides doctor appointment booking, emergency ambulance services, blood bank search and requests, medicine ordering, diagnostic test booking, digital health records management, prescription tracking, and AI-assisted health insights -- all through one integrated platform.",
  },
  {
    question: "How do I request an ambulance?",
    answer:
      "You can request an ambulance directly from the landing page or through the emergency section. Click the 'Request Ambulance' button, share your location, and the system will match you with the nearest available ambulance provider. You'll receive real-time updates on the vehicle's arrival.",
  },
  {
    question: "Can I track an ambulance after booking?",
    answer:
      "Yes. Once an ambulance is dispatched, you receive live tracking with the vehicle's location, estimated arrival time, driver details, and trip updates in real time.",
  },
  {
    question: "How do I book a doctor appointment?",
    answer:
      "Sign in to your EHC account, navigate to the Doctor section, browse available doctors by speciality or location, select a convenient time slot, and confirm your appointment. You'll receive confirmation and reminder notifications.",
  },
  {
    question: "Can doctors access my reports?",
    answer:
      "Doctors can only access your medical reports and health records when you grant them permission through the platform's role-based access system. You maintain control over who can view your health information.",
  },
  {
    question: "How can I order prescription medicine?",
    answer:
      "After signing in, go to the Pharmacy section, upload or select your prescription, choose your medicines, and place your order. You can track delivery status and manage refills through the platform.",
  },
  {
    question: "How can a healthcare provider join EHC?",
    answer:
      "Healthcare providers including doctors, ambulance services, blood banks, pharmacies, and diagnostic centres can join by clicking 'Become an EHC Partner' and completing the registration process. You can also request a demo to learn more before joining.",
  },
  {
    question: "How is patient information protected?",
    answer:
      "EHC uses role-based access controls, encrypted data storage, secure health records management, and activity audit logs. Access to patient information is restricted based on the user's role and permissions within the platform.",
  },
  {
    question: "Is EHC available on mobile devices?",
    answer:
      "Yes, EHC is designed with a mobile-first approach. The platform is fully responsive and works seamlessly across desktop, tablet, and mobile devices through your web browser.",
  },
  {
    question: "Do I need to sign in to use the platform?",
    answer:
      "You can browse service information, FAQs, and request emergency ambulance support without signing in. However, features like appointment booking, health records, prescription management, and order tracking require authentication for security.",
  },
];
