// Rule-based announcement pack builder. No LLM, no backend, no CRUD.

export type AnnounceType =
  | "product"
  | "partnership"
  | "funding"
  | "event"
  | "milestone"
  | "award"
  | "policy";

export interface AnnounceInput {
  org: string;
  orgAbout: string;
  what: string; // the core news, one or two sentences
  types: AnnounceType[];
  detailOne: string;
  detailTwo: string;
  detailThree: string;
  quoteSpeaker: string;
  quoteTitle: string;
  quoteText: string;
  dateNote: string; // "available from" / embargo
  context: string; // region/industry line
  contactEmail: string;
  contactName: string;
}

export const BLANK: AnnounceInput = {
  org: "",
  orgAbout: "",
  what: "",
  types: ["product"],
  detailOne: "",
  detailTwo: "",
  detailThree: "",
  quoteSpeaker: "",
  quoteTitle: "",
  quoteText: "",
  dateNote: "",
  context: "",
  contactEmail: "",
  contactName: "",
};

export const TYPE_LABEL: Record<AnnounceType, string> = {
  product: "Product launch",
  partnership: "Partnership",
  funding: "Funding",
  event: "Event",
  milestone: "Milestone",
  award: "Award",
  policy: "Position / policy",
};

// Generic, obviously-fake demo data — anonymized by standing convention.
export const EXAMPLE: AnnounceInput = {
  org: "Company A",
  orgAbout: "Company A builds tools that help teams move faster.",
  what: "Company A has released the next version of its core product, adding a new workflow engine and faster setup.",
  types: ["product", "funding"],
  detailOne: "Setup time drops from hours to minutes for typical teams.",
  detailTwo: "The new workflow engine runs fully in the browser, with no separate install.",
  detailThree: "Early access begins next month, with general availability in the quarter after.",
  quoteSpeaker: "Person One",
  quoteTitle: "Founder, Company A",
  quoteText: "We built this version for teams who are tired of slow, rigid tools. The result is dramatically faster to get started.",
  dateNote: "Available now to press on request; public access opens next month.",
  context: "Manager and small-team software remains one of the fastest-moving segments.",
  contactEmail: "press@example.com",
  contactName: "Press Office",
};

function sentence(t: string): string {
  const s = t.trim().replace(/\s+/g, " ");
  if (!s) return s;
  const c = s[0].toUpperCase() + s.slice(1);
  return c.endsWith(".") ? c : c + ".";
}

function joinSentences(parts: string[]): string {
  return parts.map(sentence).filter(Boolean).join(" ");
}

export interface PackBlock {
  id: string;
  title: string;
  hint: string;
  body: string;
}

function firstSentence(raw: string): string {
  const s = raw.trim().replace(/\s+/g, " ");
  return s.split(".")[0].replace(/\.$/, "").trim();
}

function buildHeadlines(i: AnnounceInput): string[] {
  const label = i.types.map((t) => TYPE_LABEL[t]).join(" & ") || "Announcement";
  const who = i.org.trim().replace(/\.$/, "") || "The organization";
  const core = firstSentence(i.what) || "an update";
  return [
    `${who} ${label}: ${core}.`,
    `${who} Unveils ${core}.`,
    `${core}, ${who} Says.`,
  ];
}

export function buildPack(i: AnnounceInput): PackBlock[] {
  const org = i.org.trim() || "The organization";
  const who = org.replace(/\.$/, "");
  const verbPast = i.types.includes("funding") ? "has announced" : "is announcing";
  const core = firstSentence(i.what) || "an update";
  const topic = core;
  const aboutLine = i.orgAbout.trim()
    ? `${who} — ${sentence(i.orgAbout)}`
    : `${who}.`;

  const lede = joinSentences([
    `${who} ${verbPast} ${core}.`,
    i.context ? i.context : "",
    i.dateNote ? i.dateNote : "",
  ]);

  const details: string[] = [i.detailOne, i.detailTwo, i.detailThree]
    .map((d) => d.trim())
    .filter(Boolean);
  const keyPoints = details.length > 0 ? details : [sentence(i.what)];
  const body =
    "Key points:\n" + keyPoints.map((d) => "• " + sentence(d)).join("\n");

  let quoteBlock = "";
  if (i.quoteText.trim()) {
    const attribution = [i.quoteSpeaker.trim(), i.quoteTitle.trim()]
      .filter(Boolean)
      .join(", ");
    quoteBlock =
      `"${sentence(i.quoteText).replace(/\.$/, "")}."` +
      (attribution ? `\n— ${attribution}` : "");
  }

  const contactLine = [i.contactName.trim(), i.contactEmail.trim()]
    .filter(Boolean)
    .join(" — ");

  const pitchParts = [
    "Hi,",
    "",
    `Sharing that ${who} ${i.types.includes("funding") ? "is announcing" : "is announcing"} ${topic}. ${core}.`,
  ];
  if (i.quoteText.trim()) {
    const headWords = i.quoteText.trim().split(" ").slice(0, 4).join(" ");
    pitchParts.push(`A line from ${i.quoteSpeaker.trim() || "the spokesperson"}: "${sentence(i.quoteText).replace(/\.$/, "")}."`);
  }
  if (i.dateNote.trim()) pitchParts.push(`Timing: ${sentence(i.dateNote).replace(/\.$/, "")}.`);
  pitchParts.push("", "Happy to set up a quick call or send more detail.");
  if (contactLine) pitchParts.push("", contactLine);
  const pitchText = pitchParts.join("\n");

  const socialLabel =
    i.types.map((t) => TYPE_LABEL[t].toLowerCase()).join(" + ") || "news";
  const social = [
    sentence(`${who} ${verbPast} ${topic}.`),
    details[0] ? sentence(details[0]) : "",
    i.quoteText.trim() ? `"${sentence(i.quoteText).replace(/\.$/, "")}."` : "",
    `#${i.org.trim().replace(/[^a-zA-Z0-9]/g, "") || "news"} #${socialLabel.replace(/ /g, "")}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const blocks: PackBlock[] = [
    {
      id: "headline",
      title: "Headlines",
      hint: "Pick one; keep the strongest keyword early.",
      body: buildHeadlines(i).map((h, idx) => `${idx + 1}. ${h}`).join("\n"),
    },
    { id: "lede", title: "Lede", hint: "First paragraph — who, what, when, where.", body: lede },
    { id: "body", title: "Body", hint: "Key points to expand into paragraphs.", body },
    {
      id: "quote",
      title: "Quote",
      hint: "Spokesperson attribution, if provided.",
      body: quoteBlock || "— (no quote provided — add one) —",
    },
    { id: "about", title: "About / boilerplate", hint: "Generic org block for the release footer.", body: aboutLine },
    { id: "pitch", title: "Outreach pitch", hint: "Short email note to a journalist.", body: pitchText },
    { id: "social", title: "Social post", hint: "Short distribution post with hashtags.", body: social },
  ];
  return blocks;
}
