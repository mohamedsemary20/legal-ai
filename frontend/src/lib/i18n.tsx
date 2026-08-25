import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const ar = {
  appName: "المساعد القانوني الذكي",
  appTagline: "متخصص في القانون المصري",
  newChat: "محادثة جديدة",
  createContract: "إنشاء عقد",
  conversations: "المحادثات",
  openMenu: "فتح القائمة",
  closeMenu: "إغلاق القائمة",
  activityLog: "سجل النشاط",
  recentChats: "آخر المحادثات مرتبة زمنيًا",
  today: "اليوم",
  yesterday: "أمس",
  older: "أقدم",
  minutesAgo: "منذ دقائق",
  hoursAgo: (n: number) => `منذ ${n} ساعة`,
  daysAgo: (n: number) => `منذ ${n} أيام`,
  betaVersion: "نسخة تجريبية",
  basedOnLaw: "مبني على التشريعات المصرية السارية",
  greeting: "كيف يمكنني مساعدتك قانونيًا اليوم؟",
  greetingSub:
    "اطرح سؤالك بالعربية، أو أرفق مستندًا لتحليله. إجابات مبنية على القانون المصري بصياغة واضحة ومباشرة.",
  defaultTitle: "محادثة جديدة",
  defaultPreview: "ابدأ بطرح سؤالك القانوني",
  placeholder: "اكتب سؤالك القانوني هنا...",
  send: "إرسال",
  attachDoc: "إرفاق مستند",
  removeAttachment: "إزالة المرفق",
  disclaimer: "هذه معلومات قانونية عامة وليست مشورة قانونية رسمية ⚖️",
  kb: "ك.ب",
  suggestedQuestions: [
    { icon: "🏠", title: "ما حقوقي كمستأجر؟", sub: "قانون الإيجار المصري وحماية المستأجر" },
    {
      icon: "💼",
      title: "كيف أُنشئ عقد عمل؟",
      sub: "البنود الإلزامية وفق قانون العمل ١٢ لسنة ٢٠٠٣",
    },
    { icon: "⚖️", title: "ما إجراءات رفع دعوى مدنية؟", sub: "الخطوات والرسوم والمواعيد القانونية" },
    { icon: "📜", title: "متى يسقط الحق بالتقادم؟", sub: "مدد التقادم في القانون المدني المصري" },
  ],
  chatError: "تعذر الحصول على إجابة",
  chatErrorDesc: "تأكد من تشغيل الخادم على المنفذ ٨٠٠٠ ثم حاول مجددًا.",
  fileTypeError: "نوع الملف غير مدعوم",
  fileTypeDesc: "المسموح: PDF أو Word (DOCX) فقط",
  sizeError: "حجم الملف كبير جدًا",
  sizeErrorDesc: "الحد الأقصى ١٠ ميجابايت",
  uploadSuccess: "تم إرفاق المستند وتحليله",
  uploadError: "تعذر رفع المستند",
  retryHint: "يرجى المحاولة مرة أخرى.",
  contractTitle: "إنشاء عقد قانوني",
  contractSub: "اختر نوع العقد واملأ البيانات، وسيقوم المساعد بصياغة مسودة قابلة للتعديل.",
  rentLabel: "عقد إيجار",
  rentHint: "سكني أو تجاري",
  jobLabel: "عقد عمل",
  jobHint: "محدد أو غير محدد المدة",
  ndaLabel: "اتفاقية سرية",
  ndaHint: "عدم إفشاء المعلومات",
  partyA: "الطرف الأول",
  partyB: "الطرف الثاني",
  namePlaceholder: "الاسم الكامل / الشركة",
  addressLabel: "عنوان العقار",
  addressPlaceholder: "المحافظة، الحي، رقم العقار",
  rentAmountLabel: "قيمة الإيجار الشهري",
  rentAmountPlaceholder: "٥٠٠٠ جنيه",
  jobTitleLabel: "المسمى الوظيفي",
  jobTitlePlaceholder: "مهندس برمجيات",
  salaryLabel: "الراتب الشهري",
  salaryPlaceholder: "١٥٠٠٠ جنيه",
  purposeLabel: "الغرض من الاتفاقية",
  purposePlaceholder: "مناقشة شراكة تجارية",
  durationLabel: "المدة",
  durationPlaceholder: "سنة ميلادية واحدة",
  notesLabel: "ملاحظات إضافية",
  optional: "اختياري",
  notesPlaceholder: "أضف أي شروط أو بنود خاصة تريد إضافتها للعقد (اختياري)",
  notesHint: "ستُرسل هذه الملاحظات للمساعد ليضيف بنودًا مخصصة داخل العقد.",
  generating: "جارٍ الصياغة...",
  generateBtn: "إنشاء العقد",
  downloadBtn: "تنزيل العقد",
  partiesRequired: "يرجى إدخال اسمي الطرف الأول والطرف الثاني",
  contractSuccess: "تم إنشاء العقد بنجاح",
  contractError: "تعذر صياغة العقد",
  downloadSuccess: "تم تنزيل العقد",
  draftNotice: "مسودة تم إنشاؤها بالذكاء الاصطناعي — تحتاج لمراجعة محامٍ مختص قبل الاستخدام الرسمي",
  notFoundCode: "٤٠٤",
  notFoundTitle: "الصفحة غير موجودة",
  notFoundDesc: "الصفحة التي تبحث عنها غير متاحة أو تم نقلها.",
  backHome: "العودة للرئيسية",
  loadErrorTitle: "تعذّر تحميل هذه الصفحة",
  loadErrorDesc: "حدث خطأ غير متوقع. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.",
  tryAgain: "حاول مجددًا",
  home: "الرئيسية",
  serverError: "فشل الاتصال بالخادم",
  invalidReply: "رد غير صالح من الخادم",
  signinTitle: "المساعد القانوني الذكي",
  signinTagline: "متخصص في القانون المصري",
  signinSub: "استشارات قانونية فورية وصياغة عقود وفق القانون المصري",
  signinButton: "المتابعة باستخدام Google",
  signinTrust: "محادثاتك خاصة بيك، وبتتحفظ في حسابك بس",
  signinExpired: "انتهت الجلسة، سجّل دخول تاني",
  signinError: "تعذّر تسجيل الدخول",
  signinWorking: "جارٍ تسجيل الدخول...",
  signOut: "تسجيل الخروج",
};

type Dict = typeof ar;

const en: Dict = {
  appName: "AI Legal Assistant",
  appTagline: "Specialized in Egyptian law",
  newChat: "New Chat",
  createContract: "Create Contract",
  conversations: "Conversations",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  activityLog: "Activity Log",
  recentChats: "Recent chats by date",
  today: "Today",
  yesterday: "Yesterday",
  older: "Older",
  minutesAgo: "Minutes ago",
  hoursAgo: (n) => `${n} hour${n === 1 ? "" : "s"} ago`,
  daysAgo: (n) => `${n} day${n === 1 ? "" : "s"} ago`,
  betaVersion: "Beta version",
  basedOnLaw: "Based on current Egyptian legislation",
  greeting: "How can I help you legally today?",
  greetingSub:
    "Ask your question in English, or attach a document for analysis. Answers are based on Egyptian law in clear, direct language.",
  defaultTitle: "New Chat",
  defaultPreview: "Start by asking your legal question",
  placeholder: "Type your legal question here...",
  send: "Send",
  attachDoc: "Attach document",
  removeAttachment: "Remove attachment",
  disclaimer: "This is general legal information, not formal legal advice ⚖️",
  kb: "KB",
  suggestedQuestions: [
    {
      icon: "🏠",
      title: "What are my rights as a tenant?",
      sub: "Egyptian rent law and tenant protection",
    },
    {
      icon: "💼",
      title: "How do I create an employment contract?",
      sub: "Mandatory clauses under Labor Law 12/2003",
    },
    { icon: "⚖️", title: "How do I file a civil lawsuit?", sub: "Steps, fees and legal deadlines" },
    {
      icon: "📜",
      title: "When does a right expire?",
      sub: "Limitation periods under Egyptian civil law",
    },
  ],
  chatError: "Could not get an answer",
  chatErrorDesc: "Make sure the server is running on port 8000, then try again.",
  fileTypeError: "Unsupported file type",
  fileTypeDesc: "Allowed: PDF or Word (DOCX) only",
  sizeError: "File is too large",
  sizeErrorDesc: "Maximum size is 10 MB",
  uploadSuccess: "Document attached and analyzed",
  uploadError: "Could not upload document",
  retryHint: "Please try again.",
  contractTitle: "Create a Legal Contract",
  contractSub:
    "Pick a contract type and fill in the details — the assistant will draft an editable version.",
  rentLabel: "Rent Contract",
  rentHint: "Residential or commercial",
  jobLabel: "Employment Contract",
  jobHint: "Fixed or indefinite term",
  ndaLabel: "NDA",
  ndaHint: "Non-disclosure agreement",
  partyA: "First Party",
  partyB: "Second Party",
  namePlaceholder: "Full name / Company",
  addressLabel: "Property Address",
  addressPlaceholder: "Governorate, district, building no.",
  rentAmountLabel: "Monthly Rent Amount",
  rentAmountPlaceholder: "5,000 EGP",
  jobTitleLabel: "Job Title",
  jobTitlePlaceholder: "Software Engineer",
  salaryLabel: "Monthly Salary",
  salaryPlaceholder: "15,000 EGP",
  purposeLabel: "Purpose of the Agreement",
  purposePlaceholder: "Discussing a business partnership",
  durationLabel: "Duration",
  durationPlaceholder: "One calendar year",
  notesLabel: "Additional Notes",
  optional: "Optional",
  notesPlaceholder: "Add any special terms or clauses you want included (optional)",
  notesHint: "These notes will be sent to the assistant to add custom clauses to the contract.",
  generating: "Drafting...",
  generateBtn: "Create Contract",
  downloadBtn: "Download Contract",
  partiesRequired: "Please enter the names of both the first and second party",
  contractSuccess: "Contract created successfully",
  contractError: "Could not draft the contract",
  downloadSuccess: "Contract downloaded",
  draftNotice: "AI-generated draft — must be reviewed by a licensed lawyer before official use",
  notFoundCode: "404",
  notFoundTitle: "Page Not Found",
  notFoundDesc: "The page you are looking for is unavailable or has been moved.",
  backHome: "Back to Home",
  loadErrorTitle: "Failed to Load This Page",
  loadErrorDesc: "An unexpected error occurred. You can try again or go back home.",
  tryAgain: "Try Again",
  home: "Home",
  serverError: "Server connection failed",
  invalidReply: "Invalid response from the server",
  signinTitle: "AI Legal Assistant",
  signinTagline: "Specialized in Egyptian law",
  signinSub: "Instant legal consultations and contract drafting under Egyptian law",
  signinButton: "Continue with Google",
  signinTrust: "Your chats are private and saved to your account only",
  signinExpired: "Your session ended — please sign in again",
  signinError: "Sign-in failed",
  signinWorking: "Signing in...",
  signOut: "Sign out",
};

const dicts: Record<Lang, Dict> = { ar, en };

const STORAGE_KEY = "app-lang";

function readInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ar") return saved;
  } catch {
    /* ignore */
  }
  return "ar";
}

type Ctx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: Dict;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    document.title = dicts[lang].appName;
  }, [lang, dir]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  return (
    <LangContext.Provider
      value={{
        lang,
        dir,
        t: dicts[lang],
        setLang,
        toggle: () => setLang(lang === "ar" ? "en" : "ar"),
      }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}

export function relativeDate(d: Date, t: Dict) {
  const diff = (Date.now() - d.getTime()) / 3600_000;
  if (diff < 1) return t.minutesAgo;
  if (diff < 24) return t.hoursAgo(Math.round(diff));
  if (diff < 48) return t.yesterday;
  return t.daysAgo(Math.round(diff / 24));
}

export function groupKey(d: Date): "today" | "yesterday" | "older" {
  const diff = (Date.now() - d.getTime()) / 3600_000;
  if (diff < 24) return "today";
  if (diff < 48) return "yesterday";
  return "older";
}

export type GroupKey = ReturnType<typeof groupKey>;
