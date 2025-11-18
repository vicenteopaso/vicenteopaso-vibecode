import { NavigationMenu } from "./NavigationMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border-subtle)] bg-[color:var(--bg-app)]/90 backdrop-blur-lg">
      <nav className="shell flex items-center justify-between py-4">
        <NavigationMenu />
      </nav>
    </header>
  );
}
