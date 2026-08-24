import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-[0.95rem] leading-[1.9] text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => (
            <h1
              className="mb-3 mt-1 text-xl font-semibold tracking-tight text-primary"
              {...p}
            />
          ),
          h2: (p) => (
            <h2
              className="mb-2 mt-5 border-b border-hairline pb-1.5 text-[1.05rem] font-semibold text-primary"
              {...p}
            />
          ),
          h3: (p) => (
            <h3 className="mb-1.5 mt-4 text-sm font-semibold text-gold" {...p} />
          ),
          p: (p) => <p className="my-2.5 font-light" {...p} />,
          strong: (p) => <strong className="font-semibold text-foreground" {...p} />,
          ul: (p) => <ul className="my-2.5 space-y-1.5 pr-5 [&>li]:list-disc" {...p} />,
          ol: (p) => <ol className="my-2.5 space-y-1.5 pr-5 [&>li]:list-decimal" {...p} />,
          li: (p) => <li className="marker:text-gold font-light" {...p} />,
          blockquote: (p) => (
            <blockquote
              className="my-3 rounded-l-md border-r-2 border-gold bg-gold-soft/40 px-4 py-2.5 text-sm font-light text-foreground/80"
              {...p}
            />
          ),
          a: (p) => <a className="text-primary-soft underline underline-offset-4" {...p} />,
          table: (p) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-hairline">
              <table className="w-full text-right text-sm" {...p} />
            </div>
          ),
          thead: (p) => <thead className="bg-secondary/70" {...p} />,
          th: (p) => (
            <th
              className="border-b border-hairline px-3 py-2 text-right text-xs font-semibold text-primary"
              {...p}
            />
          ),
          td: (p) => (
            <td className="border-b border-hairline/70 px-3 py-2 font-light" {...p} />
          ),
          code: (p) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-[0.85em]" {...p} />
          ),
          hr: () => <hr className="my-4 border-hairline" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
