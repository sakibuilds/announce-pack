"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnnounceInput,
  AnnounceType,
  BLANK,
  EXAMPLE,
  TYPE_LABEL,
  buildPack,
} from "@/lib/announce";

const ALL_TYPES: AnnounceType[] = [
  "product",
  "partnership",
  "funding",
  "event",
  "milestone",
  "award",
  "policy",
];

function Field({
  label,
  textarea,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  textarea?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const base =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-600">{label}</span>
      {textarea ? (
        <textarea
          className={base}
          rows={rows ?? 3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={base}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export default function Page() {
  const [input, setInput] = useState<AnnounceInput>(BLANK);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("announce-draft-v1");
    if (saved) {
      try {
        setInput({ ...BLANK, ...JSON.parse(saved) });
      } catch {
        /* ignore corrupt draft */
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("announce-draft-v1", JSON.stringify(input));
    } catch {
      /* storage not available */
    }
  }, [input]);

  const set = (patch: Partial<AnnounceInput>) =>
    setInput((p) => ({ ...p, ...patch }));

  const toggleType = (t: AnnounceType) => {
    setInput((p) => {
      const has = p.types.includes(t);
      const types = has ? p.types.filter((x) => x !== t) : [...p.types, t];
      return { ...p, types: types.length ? types : ["product"] };
    });
  };

  const blocks = useMemo(() => buildPack(input), [input]);

  const copy = async (id: string, body: string) => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(id);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      /* clipboard blocked */
    }
  };

  const copyAll = () => {
    const text = blocks.map((b) => `${b.title}\n${b.body}`).join("\n\n----\n\n");
    navigateOrCopy(text);
  };

  const navigateOrCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("all");
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Announce Pack</h1>
            <p className="text-sm text-zinc-500">
              One announcement brief → press release, pitch, and social copy.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setInput(EXAMPLE)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Load example
            </button>
            <button
              onClick={() => setInput(BLANK)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Clear
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-6 md:grid-cols-2">
        {/* Inputs */}
        <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Brief
          </h2>

          <div>
            <span className="mb-1 block text-xs font-medium text-zinc-600">
              Announcement type
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TYPES.map((t) => {
                const active = input.types.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={
                      active
                        ? "rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white"
                        : "rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                    }
                  >
                    {TYPE_LABEL[t]}
                  </button>
                );
              })}
            </div>
          </div>

          <Field
            label="Organization / company"
            value={input.org}
            onChange={(v) => set({ org: v })}
            placeholder="Company A"
          />
          <Field
            label="What's the news? (one or two sentences)"
            textarea
            value={input.what}
            onChange={(v) => set({ what: v })}
            placeholder="Company A has released the next version of its product, adding a new workflow engine and faster setup."
          />
          <Field
            label="Company one-liner (for About block)"
            value={input.orgAbout}
            onChange={(v) => set({ orgAbout: v })}
            placeholder="Company A builds tools that help teams move faster."
          />

          <div className="grid grid-cols-1 gap-4">
            {(["detailOne", "detailTwo", "detailThree"] as const).map(
              (k, idx) => (
                <Field
                  key={k}
                  label={`Supporting point ${idx + 1} (optional)`}
                  value={input[k]}
                  onChange={(v) => set({ [k]: v })}
                  placeholder="One concrete, specific detail."
                />
              )
            )}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Quote (optional)
            </p>
            <div className="space-y-3">
              <Field
                label="Spokesperson name"
                value={input.quoteSpeaker}
                onChange={(v) => set({ quoteSpeaker: v })}
              />
              <Field
                label="Title"
                value={input.quoteTitle}
                onChange={(v) => set({ quoteTitle: v })}
              />
              <Field
                label="Quote text"
                textarea
                rows={2}
                value={input.quoteText}
                onChange={(v) => set({ quoteText: v })}
                placeholder="One strong, quotable sentence."
              />
            </div>
          </div>

          <Field
            label="Timing / embargo note"
            value={input.dateNote}
            onChange={(v) => set({ dateNote: v })}
            placeholder="Available now to press on request; public access opens next month."
          />
          <Field
            label="Region / industry context (optional)"
            value={input.context}
            onChange={(v) => set({ context: v })}
            placeholder="Manager and small-team software remains a fast-moving segment."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Press contact name"
              value={input.contactName}
              onChange={(v) => set({ contactName: v })}
            />
            <Field
              label="Press contact email"
              value={input.contactEmail}
              onChange={(v) => set({ contactEmail: v })}
            />
          </div>
        </section>

        {/* Output */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Copy pack
            </h2>
            <button
              onClick={copyAll}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              {copied === "all" ? "Copied ✓" : "Copy all"}
            </button>
          </div>

          {blocks.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">{b.title}</h3>
                  <p className="text-xs text-zinc-500">{b.hint}</p>
                </div>
                <button
                  onClick={() => copy(b.id, b.body)}
                  className="shrink-0 rounded-md border border-zinc-300 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                >
                  {copied === b.id ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 font-sans text-sm text-zinc-800">
                {b.body}
              </pre>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
