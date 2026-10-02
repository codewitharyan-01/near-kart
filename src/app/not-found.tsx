import Link from "next/link";
import { Button } from "@/components/ui/base";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-6xl">🛵</span>
      <h1 className="font-display text-3xl font-extrabold">This street doesn&apos;t exist</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for took a wrong turn. Let&apos;s get you back to your neighbourhood.
      </p>
      <div className="flex gap-2">
        <Link href="/"><Button>Back home</Button></Link>
        <Link href="/customer"><Button variant="outline">Browse shops</Button></Link>
      </div>
    </div>
  );
}
