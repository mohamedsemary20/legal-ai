export function Scales({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M32 8v44M20 54h24M14 20h36M32 12a3 3 0 100 6 3 3 0 000-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 20 6 36a8 8 0 0016 0L14 20ZM50 20l-8 16a8 8 0 0016 0L50 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M24 54h16l2 4H22l2-4Z" fill="currentColor" opacity="0.18" />
    </svg>
  );
}
