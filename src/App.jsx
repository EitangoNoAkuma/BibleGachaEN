import { useEffect, useMemo, useState } from "react";
import { Package, Sparkles, Shield, Swords, HeartPulse, Trash2 } from "lucide-react";
import wordCards from "./data/wordCards.json";

const STORAGE_KEY = "word-battle-gacha-album-v1";

const rarityStyles = {
  Common: "bg-slate-500/20 text-slate-200 border-slate-300/30",
  Rare: "bg-sky-500/20 text-sky-100 border-sky-300/40",
  Epic: "bg-violet-500/20 text-violet-100 border-violet-300/40",
  Legendary: "bg-amber-500/20 text-amber-100 border-amber-300/40",
};

const getRandomCard = () => {
  const index = Math.floor(Math.random() * wordCards.length);
  return wordCards[index];
};

const sanitizeCard = (entry) => {
  if (!entry || typeof entry !== "object") return null;
  const keys = ["id", "headword", "definition", "attack", "defense", "hp", "rarity"];
  const valid = keys.every((k) => Object.prototype.hasOwnProperty.call(entry, k));
  return valid ? entry : null;
};

const loadAlbum = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeCard).filter(Boolean);
  } catch {
    return [];
  }
};

const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-600/60 bg-slate-800/80 px-3 py-2">
    <div className="flex items-center justify-between text-xs text-slate-300">
      <span className="inline-flex items-center gap-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-semibold text-slate-100">{value}</span>
    </div>
  </div>
);

export default function App() {
  const [currentCard, setCurrentCard] = useState(() => getRandomCard());
  const [isPackOpened, setIsPackOpened] = useState(false);
  const [album, setAlbum] = useState([]);
  const [revealKey, setRevealKey] = useState(0);

  useEffect(() => {
    setAlbum(loadAlbum());
  }, []);

  const hasInAlbum = useMemo(() => {
    return album.some((entry) => entry.id === currentCard.id);
  }, [album, currentCard]);

  const drawPack = () => {
    setCurrentCard(getRandomCard());
    setIsPackOpened(false);
    setRevealKey((prev) => prev + 1);
  };

  const openPack = () => {
    setIsPackOpened(true);
  };

  const addToAlbum = () => {
    if (!isPackOpened || hasInAlbum) return;
    const updated = [currentCard, ...album];
    setAlbum(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeFromAlbum = (id) => {
    const updated = album.filter((entry) => entry.id !== id);
    setAlbum(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const rarityClass = rarityStyles[currentCard.rarity] ?? rarityStyles.Common;

  return (
    <div className="min-h-screen bg-battle text-slate-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-10">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/80">Word Battle Gacha</p>
          <h1 className="mt-2 text-4xl font-black text-white drop-shadow">英単語バトルガチャ</h1>
          <p className="mt-3 text-sm text-slate-300">
            Draw a pack, click to open it, and reveal your new English Word Card.
          </p>
        </header>

        <section className="rounded-3xl border border-cyan-300/20 bg-slate-900/50 px-6 py-8 shadow-2xl">
          <div className="flex items-center gap-3 text-cyan-200/90">
            <Package className="h-5 w-5" />
            <span className="text-xs uppercase tracking-[0.3em]">Battle Pack</span>
          </div>

          {!isPackOpened ? (
            <button
              type="button"
              key={revealKey}
              onClick={openPack}
              className="pack mt-6 flex w-full animate-fadeIn flex-col items-center justify-center rounded-2xl border px-6 py-10 text-center transition hover:-translate-y-1"
            >
              <Sparkles className="h-10 w-10 text-cyan-200" />
              <p className="mt-4 text-xl font-bold text-white">Sealed Word Pack</p>
              <p className="mt-2 text-sm text-slate-300">Click to Open</p>
            </button>
          ) : (
            <div key={revealKey} className="word-card mt-6 animate-fadeIn space-y-4 rounded-2xl border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Headword</p>
                  <h2 className="mt-1 text-3xl font-bold text-white">{currentCard.headword}</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${rarityClass}`}>
                  {currentCard.rarity}
                </span>
              </div>

              <p className="rounded-xl bg-slate-900/60 px-4 py-3 text-sm leading-relaxed text-slate-200">
                {currentCard.definition}
              </p>

              <div className="grid grid-cols-3 gap-3">
                <Stat icon={Swords} label="Attack" value={currentCard.attack} />
                <Stat icon={Shield} label="Defense" value={currentCard.defense} />
                <Stat icon={HeartPulse} label="HP" value={currentCard.hp} />
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={drawPack}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-cyan-400"
            >
              <Sparkles className="h-4 w-4" />
              Draw New Pack
            </button>
            <button
              type="button"
              onClick={addToAlbum}
              disabled={!isPackOpened || hasInAlbum}
              className="flex-1 rounded-full border border-cyan-300/40 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to Collection
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Collection</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">
              {album.length} Card{album.length === 1 ? "" : "s"}
            </span>
          </div>

          {album.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-cyan-200/30 px-4 py-6 text-center text-sm text-slate-400">
              No cards yet. Open a pack and save your favorites.
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {album.map((entry) => (
                <li key={entry.id} className="rounded-2xl border border-slate-600 bg-slate-900/70 px-4 py-4 shadow">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-white">{entry.headword}</h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        rarityStyles[entry.rarity] ?? rarityStyles.Common
                      }`}
                    >
                      {entry.rarity}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-300">{entry.definition}</p>
                  <p className="mt-3 text-xs text-slate-300">
                    ATK {entry.attack} / DEF {entry.defense} / HP {entry.hp}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFromAlbum(entry.id)}
                    className="mt-3 inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-xs text-slate-300 transition hover:border-slate-400 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
