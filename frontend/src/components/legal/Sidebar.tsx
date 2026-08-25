import { MessageSquarePlus, FileSignature, X } from "lucide-react";
import { Scales } from "./Scales";
import { type Conversation } from "@/lib/legal-mock";
import { useLang, relativeDate } from "@/lib/i18n";

type Props = {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onContract: () => void;
  onClose?: () => void;
};

export function Sidebar({ conversations, activeId, onSelect, onNew, onContract, onClose }: Props) {
  const { t } = useLang();
  return (
    <aside className="flex h-full w-full flex-col bg-sidebar">
      <div className="hairline-y flex items-start gap-3 px-5 py-5">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-soft">
          <Scales className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[0.95rem] font-semibold tracking-tight text-primary">
            {t.appName}
          </h1>
          <p className="truncate text-[11px] font-light text-muted-foreground">{t.appTagline}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label={t.closeMenu}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-primary lg:hidden"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="space-y-2 px-4 py-4">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-2.5 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-soft/40"
        >
          <MessageSquarePlus className="size-4" />
          {t.newChat}
        </button>
        <button
          onClick={onContract}
          className="flex w-full items-center gap-2.5 rounded-lg border border-gold/50 bg-card px-3.5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-gold-soft/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30"
        >
          <FileSignature className="size-4 text-gold" />
          {t.createContract}
        </button>
      </div>

      <div className="px-5 pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {t.conversations}
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {conversations.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`group relative w-full rounded-lg px-3 py-2.5 text-right transition-all duration-200 rtl:text-right ltr:text-left ${
                active ? "bg-card shadow-soft" : "hover:bg-accent/70"
              }`}
            >
              {active && (
                <span className="absolute inset-y-2 right-0 w-[3px] rounded-full bg-gold" />
              )}
              <div
                className={`truncate text-[13px] ${active ? "font-semibold text-primary" : "font-medium text-foreground"}`}
              >
                {c.title}
              </div>
              <div className="mt-0.5 truncate text-[11px] font-light text-muted-foreground">
                {c.preview}
              </div>
              <div className="mt-1 text-[10px] font-light text-muted-foreground/80">
                {relativeDate(c.date, t)}
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
