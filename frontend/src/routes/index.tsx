import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, Paperclip, Send, X, FileText, Languages } from "lucide-react";
import { toast } from "sonner";

import { Sidebar } from "@/components/legal/Sidebar";
import { HistoryPanel } from "@/components/legal/HistoryPanel";
import { ContractModal } from "@/components/legal/ContractModal";
import { Markdown } from "@/components/legal/Markdown";
import { Scales } from "@/components/legal/Scales";
import { sendChat, uploadDocument } from "@/lib/api";
import { type Conversation, type Message } from "@/lib/legal-mock";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "المساعد القانوني الذكي | استشارات وعقود وفق القانون المصري" },
      {
        name: "description",
        content:
          "مساعد قانوني ذكي بالعربية متخصص في القانون المصري: إجابات فورية عن حقوقك وصياغة عقود إيجار وعمل واتفاقيات سرية.",
      },
      { property: "og:title", content: "المساعد القانوني الذكي" },
      {
        property: "og:description",
        content: "استشارات قانونية فورية وصياغة عقود وفق القانون المصري.",
      },
      { property: "og:type", content: "website" },
      { property: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const MAX_SIZE = 10 * 1024 * 1024;

function Index() {
  const { t, lang, dir, toggle } = useLang();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{
    name: string;
    size: number;
    documentId: string;
  } | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Seed/reset the default conversation whenever the language changes
  useEffect(() => {
    setConversations((cs) => {
      if (cs.length === 1 && cs[0].messages.length === 0) {
        return [
          {
            id: cs[0].id,
            title: t.defaultTitle,
            preview: t.defaultPreview,
            date: new Date(),
            messages: [],
          },
        ];
      }
      return cs;
    });
    if (!activeId) {
      const c: Conversation = {
        id: crypto.randomUUID(),
        title: t.defaultTitle,
        preview: t.defaultPreview,
        date: new Date(),
        messages: [],
      };
      setConversations([c]);
      setActiveId(c.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length, thinking]);

  function updateActive(fn: (c: Conversation) => Conversation) {
    setConversations((cs) => cs.map((c) => (c.id === activeId ? fn(c) : c)));
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || thinking || !active) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      ...(attachment ? { attachment: { name: attachment.name, size: attachment.size } } : {}),
    };
    const history = active.messages.map((m) => ({ role: m.role, content: m.content }));
    const documentId = attachment?.documentId ?? null;
    updateActive((c) => ({
      ...c,
      title: c.messages.length === 0 ? content.slice(0, 40) : c.title,
      preview: content,
      messages: [...c.messages, userMsg],
    }));
    setInput("");
    setAttachment(null);
    setThinking(true);
    try {
      const answer = await sendChat({ message: content, history, documentId, lang });
      updateActive((c) => ({
        ...c,
        messages: [...c.messages, { id: crypto.randomUUID(), role: "assistant", content: answer }],
      }));
    } catch (err) {
      toast.error(t.chatError, {
        description: err instanceof Error ? err.message : t.chatErrorDesc,
      });
    } finally {
      setThinking(false);
    }
  }

  function newChat() {
    const c: Conversation = {
      id: crypto.randomUUID(),
      title: t.defaultTitle,
      preview: t.defaultPreview,
      date: new Date(),
      messages: [],
    };
    setConversations((cs) => [c, ...cs]);
    setActiveId(c.id);
    setDrawer(false);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const ok = /\.(pdf|docx)$/i.test(f.name);
    if (!ok) {
      toast.error(t.fileTypeError, { description: t.fileTypeDesc });
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error(t.sizeError, { description: t.sizeErrorDesc });
      return;
    }
    setUploading(true);
    try {
      const doc = await uploadDocument(f);
      setAttachment({ name: doc.filename, size: f.size, documentId: doc.document_id });
      toast.success(t.uploadSuccess);
    } catch (err) {
      toast.error(t.uploadError, {
        description: err instanceof Error ? err.message : t.retryHint,
      });
    } finally {
      setUploading(false);
    }
  }

  const sidebar = (
    <Sidebar
      conversations={conversations}
      activeId={activeId}
      onSelect={(id) => {
        setActiveId(id);
        setDrawer(false);
      }}
      onNew={newChat}
      onContract={() => {
        setContractOpen(true);
        setDrawer(false);
      }}
      {...(drawer ? { onClose: () => setDrawer(false) } : {})}
    />
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background" dir={dir}>
      {/* Sidebar (right in RTL / left in LTR) */}
      <div className="order-1 hidden w-72 shrink-0 border-l border-hairline lg:block">
        {sidebar}
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
            onClick={() => setDrawer(false)}
          />
          <div className="rise-in absolute inset-y-0 right-0 w-[82%] max-w-xs border-l border-hairline shadow-lifted">
            {sidebar}
          </div>
        </div>
      )}

      {/* Chat */}
      <main className="order-2 flex min-w-0 flex-1 flex-col">
        <header className="hairline-y flex items-center gap-3 bg-surface/80 px-4 py-3.5 backdrop-blur sm:px-6">
          <button
            onClick={() => setDrawer(true)}
            aria-label={t.openMenu}
            className="rounded-md p-2 text-primary hover:bg-accent lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <span className="hidden size-8 shrink-0 place-items-center rounded-md bg-accent text-primary lg:grid">
              <Scales className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-primary">{active?.title}</h2>
              <p className="truncate text-[11px] font-light text-muted-foreground">
                {t.basedOnLaw}
              </p>
            </div>
          </div>
          <button
            onClick={toggle}
            aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            title={lang === "ar" ? "English" : "العربية"}
            className="inline-flex h-8 items-center gap-1.5 self-center rounded-full border border-hairline bg-card px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
          >
            <Languages className="size-4" />
            {lang === "ar" ? "EN" : "ع"}
          </button>
          <span className="hidden shrink-0 items-center gap-1.5 self-center rounded-full border border-gold/40 bg-gold-soft/30 px-2.5 py-1 text-[11px] font-medium text-gold sm:inline-flex">
            ⚖️ {t.betaVersion}
          </span>
        </header>

        <div className="paper flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          <div className="mx-auto max-w-3xl">
            {(!active || active.messages.length === 0) && !thinking ? (
              <div className="rise-in flex flex-col items-center pt-8 text-center sm:pt-16">
                <div className="grid size-20 place-items-center rounded-2xl bg-card text-primary shadow-soft">
                  <Scales className="size-11" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight text-primary sm:text-[1.75rem]">
                  {t.greeting}
                </h3>
                <p className="mt-2.5 max-w-md text-sm font-extralight leading-relaxed text-muted-foreground">
                  {t.greetingSub}
                </p>
                <div className="mt-9 grid w-full gap-3 sm:grid-cols-2">
                  {t.suggestedQuestions.map((q) => (
                    <button
                      key={q.title}
                      onClick={() => send(q.title)}
                      className="group rounded-xl border border-hairline bg-card p-4 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-soft/40 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft/30 rtl:text-right ltr:text-left"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-base transition-colors group-hover:bg-gold-soft/60">
                          {q.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-foreground">{q.title}</div>
                          <div className="mt-0.5 text-[11px] font-light text-muted-foreground">
                            {q.sub}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {active?.messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} className="rise-in flex justify-end">
                      <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-primary px-4 py-3 text-primary-foreground shadow-soft">
                        {m.attachment && (
                          <div className="mb-2 flex items-center gap-2 rounded-md bg-primary-foreground/12 px-2.5 py-1.5 text-[11px]">
                            <FileText className="size-3.5" />
                            <span className="truncate">{m.attachment.name}</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap text-sm font-light leading-relaxed">
                          {m.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="rise-in flex items-start gap-3">
                      <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-md bg-accent text-primary">
                        <Scales className="size-5" />
                      </span>
                      <div className="min-w-0 max-w-[92%] rounded-xl rounded-tl-sm border border-hairline bg-card px-5 py-4 shadow-soft">
                        <Markdown>{m.content}</Markdown>
                      </div>
                    </div>
                  ),
                )}

                {thinking && (
                  <div className="flex items-start gap-3">
                    <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-md bg-accent text-primary">
                      <Scales className="size-5" />
                    </span>
                    <div className="flex items-center gap-1.5 rounded-xl rounded-tl-sm border border-hairline bg-card px-4 py-4 shadow-soft">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="typing-dot size-1.5 rounded-full bg-primary-soft"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-hairline bg-surface px-4 py-4 sm:px-8">
          <div className="mx-auto max-w-3xl">
            {attachment && (
              <div className="mb-2.5 inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold-soft/30 px-3 py-1.5 text-[12px]">
                <FileText className="size-3.5 text-gold" />
                <span className="max-w-[220px] truncate font-medium">{attachment.name}</span>
                <span className="font-light text-muted-foreground">
                  {(attachment.size / 1024).toFixed(0)} {t.kb}
                </span>
                <button
                  onClick={() => setAttachment(null)}
                  aria-label={t.removeAttachment}
                  className="rounded-sm p-0.5 text-muted-foreground hover:bg-card hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2 rounded-xl border border-hairline bg-card p-2 shadow-soft transition-shadow focus-within:border-primary-soft/50 focus-within:shadow-lifted">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label={t.attachDoc}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Paperclip className={uploading ? "size-[18px] animate-pulse" : "size-[18px]"} />
              </button>
              <input ref={fileRef} type="file" className="hidden" onChange={onFile} />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder={t.placeholder}
                className="max-h-40 min-h-[38px] flex-1 resize-none bg-transparent py-2 text-sm font-light leading-relaxed outline-none placeholder:text-muted-foreground/70"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || thinking}
                aria-label={t.send}
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary-soft disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                <Send className={`size-[17px] ${dir === "rtl" ? "-scale-x-100" : ""}`} />
              </button>
            </div>

            <p className="mt-2.5 text-center text-[11px] font-light text-muted-foreground">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </main>

      {/* History */}
      <div className="order-3">
        <HistoryPanel conversations={conversations} activeId={activeId} onSelect={setActiveId} />
      </div>

      <ContractModal open={contractOpen} onOpenChange={setContractOpen} />
    </div>
  );
}
