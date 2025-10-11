function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <h3 className="text-lg font-semibold text-muted-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}
export default Section;
