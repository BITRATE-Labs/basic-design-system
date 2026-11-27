import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TitleAttribute() {
  return (
    <div title="Allowed on a plain element">
      <Button title="Copies the link">Copy</Button>
      <a href="/sample" title="Opens the sample">
        Sample
      </a>
      <Input name="code" pattern="[a-z]+" title="Lowercase letters only" />
      <abbr title="Sample Abbreviation">SA</abbr>
      <SampleCard title="Allowed component prop" />
    </div>
  );
}

function SampleCard({ title }: { title: string }) {
  return <section aria-label={title} />;
}
