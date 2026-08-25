import { type Conversation } from "@/lib/legal-mock";
import { useLang, relativeDate, groupKey, type GroupKey } from "@/lib/i18n";

const order: GroupKey[] = ["today", "yesterday", "older"];

export function HistoryPanel({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useLang();
  const labels: Record<GroupKey, string> = {
    today: t.today,
    yesterday: t.yesterday,
    older: t.older,
  };

  const groups = order
    .map((g) => ({ g, items: conversations.filter((c) => groupKey(c.date) === g) }))
    .filter((x) => x.items.length > 0);

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-l border-hairline bg-surface xl:flex">
      <div className="hairline-y px-5 py-5">
        <h2 className="text-[13px] font-semibold text-primary">{t.activityLog}</h2>
        <p className="mt-0.5 text-[11px] font-light text-muted-foreground">{t.recentChats}</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {groups.map(({ g, items }) => (
          <div key={g}>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-gold">
                {labels[g]}
              </span>
              <span className="h-px flex-1 bg-hairline" />
            </div>
            <ol className="relative space-y-4 pr-4 rtl:pr-4 ltr:pl-4">
              <span className="absolute inset-y-1 right-[3px] w-px bg-hairline rtl:right-[3px] ltr:left-[3px]" />
              {items.map((c) => {
                const active = c.id === activeId;
                return (
                  <li key={c.id} className="relative">
                    <span
                      className={`absolute top-1.5 size-[7px] rounded-full ring-2 ring-surface rtl:-right-[15px] ltr:-left-[15px] ${
                        active ? "bg-gold" : "bg-primary-soft/50"
                      }`}
                    />
                    <button
                      onClick={() => onSelect(c.id)}
                      className="w-full text-right transition-colors rtl:text-right ltr:text-left"
                    >
                      <div
                        className={`line-clamp-2 text-[12px] leading-relaxed ${
                          active
                            ? "font-semibold text-primary"
                            : "font-light text-foreground hover:text-primary"
                        }`}
                      >
                        {c.title}
                      </div>
                      <div className="mt-0.5 text-[10px] font-light text-muted-foreground">
                        {relativeDate(c.date, t)}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </aside>
  );
}
