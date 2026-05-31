type ConflictBannerProps = {
  count: number;
};

export function ConflictBanner({ count }: ConflictBannerProps) {
  if (!count) return null;

  return (
    <div
      className="rounded-[12px] border border-[rgba(220,98,64,0.18)] bg-[rgba(220,98,64,0.08)] px-4 py-3 text-sm text-midnight"
      data-testid="conflict-banner"
    >
      <p className="font-display text-base font-semibold">Schedule overlap to review</p>
      <p className="mt-1 text-midnight/72">
        {count} saved session{count === 1 ? "" : "s"} overlap on your agenda. You can keep both for now and decide later which stop to attend.
      </p>
    </div>
  );
}
