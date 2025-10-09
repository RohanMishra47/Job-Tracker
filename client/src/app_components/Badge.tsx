export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-muted text-muted-foreground">
      {children}
    </span>
  );
}
