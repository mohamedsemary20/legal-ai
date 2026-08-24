import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, Loader2, StickyNote, FileSignature } from "lucide-react";
import { toast } from "sonner";
import {
  contractDownloadUrl,
  generateContract,
  type ApiContractType,
  type GeneratedContract,
} from "@/lib/api";
import { type ContractType } from "@/lib/legal-mock";

const types: { id: ContractType; label: string; emoji: string; hint: string }[] = [
  { id: "rent", label: "عقد إيجار", emoji: "🏠", hint: "سكني أو تجاري" },
  { id: "job", label: "عقد عمل", emoji: "💼", hint: "محدد أو غير محدد المدة" },
  { id: "nda", label: "اتفاقية سرية", emoji: "🔒", hint: "عدم إفشاء المعلومات" },
];

const apiTypes: Record<ContractType, ApiContractType> = {
  rent: "rent",
  job: "employment",
  nda: "nda",
};

function buildTerms(type: ContractType, data: Record<string, string>): Record<string, string> {
  const notes = data["notes"] ?? "";
  if (type === "rent") {
    return {
      property_address: data["address"] ?? "",
      rent_amount: data["rent"] ?? "",
      duration: data["duration"] ?? "",
      notes,
    };
  }
  if (type === "job") {
    return {
      job_title: data["jobTitle"] ?? "",
      salary: data["salary"] ?? "",
      duration: data["duration"] ?? "",
      notes,
    };
  }
  return {
    purpose: data["purpose"] ?? "",
    duration: data["duration"] ?? "",
    notes,
  };
}

type Props = { open: boolean; onOpenChange: (v: boolean) => void };

export function ContractModal({ open, onOpenChange }: Props) {
  const [type, setType] = useState<ContractType>("rent");
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContract | null>(null);

  const set = (k: string) => (e: { target: { value: string } }) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const field = (k: string, label: string, placeholder: string) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input
        value={data[k] ?? ""}
        onChange={set(k)}
        placeholder={placeholder}
        className="h-10 rounded-lg border-hairline bg-surface text-sm shadow-none focus-visible:border-primary-soft focus-visible:ring-2 focus-visible:ring-primary-soft/25"
      />
    </div>
  );

  async function submit() {
    if (!data["partyA"] || !data["partyB"]) {
      toast.error("يرجى إدخال اسمي الطرف الأول والطرف الثاني");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const contract = await generateContract({
        contractType: apiTypes[type],
        party1Name: data["partyA"] ?? "",
        party2Name: data["partyB"] ?? "",
        terms: buildTerms(type, data),
      });
      setResult(contract);
      toast.success("تم إنشاء العقد بنجاح");
    } catch (err) {
      toast.error("تعذر صياغة العقد", {
        description: err instanceof Error ? err.message : "يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = contractDownloadUrl(result.contract_id);
    a.download = result.filename;
    a.click();
    toast.success("تم تنزيل العقد");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-h-[92vh] overflow-y-auto rounded-xl border-hairline bg-surface p-0 sm:max-w-2xl"
      >
        <DialogHeader className="hairline-y px-6 pb-4 pt-6 text-right">
          <DialogTitle className="flex items-center gap-2 text-right text-lg font-semibold text-primary">
            <FileSignature className="size-5 text-gold" />
            إنشاء عقد قانوني
          </DialogTitle>
          <p className="text-xs font-light text-muted-foreground">
            اختر نوع العقد واملأ البيانات، وسيقوم المساعد بصياغة مسودة قابلة للتعديل.
          </p>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-3 gap-2.5">
            {types.map((t) => {
              const active = t.id === type;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setType(t.id);
                    setResult(null);
                  }}
                  className={`rounded-lg border p-3 text-center transition-all duration-200 ${
                    active
                      ? "border-primary-soft bg-accent shadow-soft"
                      : "border-hairline bg-card hover:border-primary-soft/50 hover:shadow-soft"
                  }`}
                >
                  <div className="text-2xl">{t.emoji}</div>
                  <div
                    className={`mt-1.5 text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}
                  >
                    {t.label}
                  </div>
                  <div className="mt-0.5 text-[10px] font-light text-muted-foreground">
                    {t.hint}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {field("partyA", "الطرف الأول", "الاسم الكامل / الشركة")}
            {field("partyB", "الطرف الثاني", "الاسم الكامل / الشركة")}
            {type === "rent" && field("address", "عنوان العقار", "المحافظة، الحي، رقم العقار")}
            {type === "rent" && field("rent", "قيمة الإيجار الشهري", "٥٠٠٠ جنيه")}
            {type === "job" && field("jobTitle", "المسمى الوظيفي", "مهندس برمجيات")}
            {type === "job" && field("salary", "الراتب الشهري", "١٥٠٠٠ جنيه")}
            {type === "nda" && field("purpose", "الغرض من الاتفاقية", "مناقشة شراكة تجارية")}
            {field("duration", "المدة", "سنة ميلادية واحدة")}
          </div>

          <div className="rounded-lg border border-dashed border-gold/50 bg-gold-soft/25 p-4">
            <div className="mb-2 flex items-center gap-2">
              <StickyNote className="size-4 text-gold" />
              <span className="text-xs font-semibold text-foreground">ملاحظات إضافية</span>
              <span className="rounded-sm bg-card px-1.5 py-0.5 text-[10px] font-light text-muted-foreground">
                اختياري
              </span>
            </div>
            <Textarea
              value={data["notes"] ?? ""}
              onChange={set("notes")}
              rows={3}
              placeholder="أضف أي شروط أو بنود خاصة تريد إضافتها للعقد (اختياري)"
              className="resize-none rounded-lg border-hairline bg-surface text-sm shadow-none focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20"
            />
            <p className="mt-2 text-[11px] font-light text-muted-foreground">
              ستُرسل هذه الملاحظات للمساعد ليضيف بنودًا مخصصة داخل العقد.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={submit}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "جارٍ الصياغة..." : "إنشاء العقد"}
            </button>
            {result && (
              <button
                onClick={download}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gold/60 bg-card px-4 text-sm font-medium text-gold transition-all hover:bg-gold-soft/40"
              >
                <Download className="size-4" />
                تنزيل العقد
              </button>
            )}
          </div>

          {result && (
            <div className="rise-in flex items-center gap-3 rounded-xl border border-hairline bg-card p-5 shadow-soft">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                <FileSignature className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-primary">{result.filename}</div>
                <p className="mt-0.5 text-[11px] font-light text-muted-foreground">
                  مسودة تم إنشاؤها بالذكاء الاصطناعي — تحتاج لمراجعة محامٍ مختص قبل الاستخدام الرسمي
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
