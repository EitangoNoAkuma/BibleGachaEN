import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";

const STORAGE_KEY = "word-gacha-album";
const DB_NAME = "english-vocab-gacha";
const DB_VERSION = 2;
const STORE_NAME = "cards";

const POS_JA = {
  noun: "名詞",
  verb: "動詞",
  adjective: "形容詞",
  adverb: "副詞",
};

const openCardDb = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const storeCount = (db) => {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const seedCardsIfEmpty = async (db) => {
  const count = await storeCount(db);
  if (count > 0) {
    return count;
  }

  const response = await fetch("/wordCards.seed.json");
  const cards = await response.json();

  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    cards.forEach((card) => store.put(card));
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });

  return cards.length;
};

const getRandomCardFromDb = (db, count) => {
  return new Promise((resolve, reject) => {
    if (!count) {
      resolve(null);
      return;
    }

    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const target = Math.floor(Math.random() * count);
    let index = 0;

    const request = store.openCursor();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(null);
        return;
      }
      if (index === target) {
        resolve(cursor.value);
        return;
      }
      index += 1;
      cursor.continue();
    };
  });
};

const loadAlbum = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const rollRarityNumber = () => Math.floor(Math.random() * 10000);

export default function App() {
  const dbRef = useRef(null);
  const [cardCount, setCardCount] = useState(0);
  const [isDbReady, setIsDbReady] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [rarityNumber, setRarityNumber] = useState(rollRarityNumber);
  const [album, setAlbum] = useState([]);
  const [packKey, setPackKey] = useState(0);
  const [isPackOpened, setIsPackOpened] = useState(false);

  useEffect(() => {
    setAlbum(loadAlbum());
  }, []);

  useEffect(() => {
    let active = true;

    const initDb = async () => {
      const db = await openCardDb();
      const count = await seedCardsIfEmpty(db);
      const randomCard = await getRandomCardFromDb(db, count);

      if (!active) {
        db.close();
        return;
      }

      dbRef.current = db;
      setCardCount(count);
      setCurrentCard(randomCard);
      setRarityNumber(rollRarityNumber());
      setIsDbReady(true);
    };

    initDb();

    return () => {
      active = false;
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, []);

  const hasInAlbum = useMemo(() => {
    if (!currentCard) {
      return false;
    }
    return album.some((entry) => entry.id === currentCard.id);
  }, [album, currentCard]);

  const drawCard = async () => {
    if (!dbRef.current || cardCount === 0) {
      return;
    }

    const randomCard = await getRandomCardFromDb(dbRef.current, cardCount);
    setCurrentCard(randomCard);
    setRarityNumber(rollRarityNumber());
    setIsPackOpened(false);
    setPackKey((prev) => prev + 1);
  };

  const addToAlbum = () => {
    if (!currentCard || hasInAlbum) {
      return;
    }
    const updated = [{ ...currentCard, rarityNumber }, ...album];
    setAlbum(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeFromAlbum = (id) => {
    const updated = album.filter((entry) => entry.id !== id);
    setAlbum(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-10">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-300/80">English Vocab Gacha</p>
          <h1 className="mt-2 text-4xl font-bold text-amber-100 drop-shadow">英単語ガチャ</h1>
          <p className="mt-3 text-sm text-slate-300">英単語をコレクションしよう</p>
        </header>

        <section className="grid items-start gap-8 lg:grid-cols-[340px_1fr]">
          <div
            key={packKey}
            className="animate-fadeIn rounded-[22px] border-4 border-black bg-black p-[8px] shadow-[0_16px_50px_rgba(0,0,0,0.55)]"
          >
            {currentCard ? (
              isPackOpened ? (
                <article className="flex aspect-[63/88] flex-col rounded-[14px] border-2 border-zinc-900 bg-[#efe5cf] p-2.5 text-zinc-900">
                  <div className="mt-2 flex min-h-[40%] items-center justify-center rounded border border-zinc-700 bg-gradient-to-b from-[#d9c8a2] via-[#c7af83] to-[#aa8e62] px-2">
                    <p className="w-full whitespace-nowrap text-center text-[clamp(1.7rem,7vw,3rem)] font-black lowercase tracking-[0.06em] text-zinc-900">
                      {currentCard.headword.toLowerCase()}
                    </p>
                  </div>

                  <div className="mt-2 rounded border border-zinc-700 bg-[#f5ecd6] px-2.5 py-2 text-xs leading-relaxed text-zinc-800">
                    {currentCard.definition}
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-zinc-900">
                    <div className="rounded border border-zinc-700 bg-[#f7f0dc] px-2 py-1">ATK {currentCard.attack}</div>
                    <div className="rounded border border-zinc-700 bg-[#f7f0dc] px-2 py-1">DEF {currentCard.defense}</div>
                    <div className="rounded border border-zinc-700 bg-[#f7f0dc] px-2 py-1">HP {currentCard.hp}</div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-zinc-400 pt-2 text-[11px] font-semibold text-zinc-800">
                    <span>{currentCard.rarity}</span>
                    <span>Rarity {rarityNumber}</span>
                  </div>
                </article>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPackOpened(true)}
                  className="flex aspect-[63/88] w-full flex-col items-center justify-center rounded-[14px] border-2 border-amber-600 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 px-4 text-center text-slate-900 shadow-inner transition hover:brightness-110"
                >
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-900">English Vocab</span>
                  <span className="mt-3 text-3xl font-black">PACK</span>
                  <span className="mt-8 rounded-full bg-black/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-amber-200">
                    Open Pack
                  </span>
                </button>
              )
            ) : (
              <div className="flex aspect-[63/88] items-center justify-center rounded-[14px] bg-[#efe5cf] text-sm text-zinc-700">
                loading cards...
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-amber-200/20 bg-slate-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Summon Controls</p>
            <div className="mt-4 flex flex-col gap-3 sm:max-w-sm">
              <button
                type="button"
                onClick={drawCard}
                disabled={!isDbReady}
                className="flex items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                Draw Pack
              </button>
              <button
                type="button"
                onClick={addToAlbum}
                disabled={hasInAlbum || !currentCard}
                className="rounded-full border border-amber-500/40 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:border-amber-300 hover:text-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add to Album
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-amber-100">Collection</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
              {album.length} Card{album.length === 1 ? "" : "s"}
            </span>
          </div>

          {album.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200/30 px-4 py-6 text-center text-sm text-slate-400">
              まだコレクションがありません。お気に入りの単語カードを保存しましょう。
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {album.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-amber-200/20 bg-slate-900/70 p-4 shadow"
                >
                  <p className="whitespace-nowrap text-lg font-semibold lowercase text-slate-100">
                    {entry.headword.toLowerCase()}
                  </p>
                  <p className="mt-1 text-xs tracking-wide text-amber-200/80">
                    {POS_JA[entry.partOfSpeech] ?? entry.partOfSpeech} · レベル {entry.cefr}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">{entry.definition}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-amber-200/80">
                    <span>{entry.gradeBand}</span>
                    <span>レアリティ {entry.rarityNumber ?? 0}</span>
                    <button
                      type="button"
                      onClick={() => removeFromAlbum(entry.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 text-amber-200 transition hover:border-amber-200/60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
