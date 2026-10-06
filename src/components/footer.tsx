export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-zinc-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} <span className="font-display font-bold tracking-wider uppercase text-white">PLANET PLUTO</span> · Bleach Archive
        </p>
        <p>
          Data from{" "}
          <a
            href="https://anilist.co"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-4 hover:underline"
          >
            AniList
          </a>
          . Not affiliated.
        </p>
      </div>
    </footer>
  );
}
