export interface FAQItem {
  question: string;
  answer: string;
}

export const faqData: FAQItem[] = [
  {
    question: "What is EHC?",
    answer:
      "EHC (Electronic Healthcare) is a connected SaaS healthcare platform that brings together patients, doctors, ambulance services, blood banks, pharmacies, and diagnostic centres into one integrated digital ecosystem.",
  },
  {
    question: "Which healthcare services are available?",
    answer:
      "EHC offers doctor appointment booking, emergency ambulance services, blood bank search and requests, medicine ordering, diagnostic test booking, digital health records, prescription management, and AI-assisted health insights.",
  },
  {
    question: "Do I need an account to access EHC?",
    answer:
      "You can browse service information and request emergency ambulance support without an account. Booking appointments, managing prescriptions, accessing health records, and ordering medicine require authentication for security.",
  },
  {
    question: "How can I request an ambulance?",
    answer:
      "Click the Emergency Ambulance button available throughout the platform. Share your location, provide basic details, and the system will match you with the nearest available ambulance. You will receive real-time tracking and arrival updates.",
  },
  {
    question: "Can I track an ambulance in real time?",
    answer:
      "Yes. After requesting an ambulance, you receive live tracking with the vehicle location, estimated arrival time, driver and vehicle details, and trip status updates.",
  },
  {
    question: "How do I book a doctor appointment?",
    answer:
      "Sign in to your EHC account, browse available doctors by speciality or location, select a convenient time slot, and confirm your booking. You will receive confirmation and reminder notifications.",
  },
  {
    question: "Can doctors access my medical reports?",
    answer:
      "Doctors can only access your reports when you grant permission through the platform's role-based access system. You maintain control over who sees your health information.",
  },
  {
    question: "How do I order medicines?",
    answer:
      "After signing in, navigate to the Pharmacy section, upload or select your prescription, choose your medicines, and place your order. Track delivery status and manage refills through your dashboard.",
  },
  {
    question: "How can a healthcare provider join EHC?",
    answer:
      "Healthcare providers can apply by visiting the Partner Registration page. Doctors, ambulance services, blood banks, pharmacies, and diagnostic centres are all welcome. You can also request a demo before committing.",
  },
  {
    question: "How is patient information protected?",
    answer:
      "EHC uses role-based access controls, encrypted data storage, secure health record management, and comprehensive activity audit logs. Access to patient data is restricted based on verified roles and explicit permissions.",
  },
  {
    question: "Is EHC available on mobile devices?",
    answer:
      "Yes. EHC is built with a responsive, mobile-first approach and works seamlessly across desktop, tablet, and mobile devices through your web browser.",
  },
  {
    question: "What should I do during a life-threatening emergency?",
    answer:
      "Contact your local emergency services immediately. You can also use EHC's emergency ambulance feature to request additional support, but always prioritise calling your local emergency number first.",
  },
];
