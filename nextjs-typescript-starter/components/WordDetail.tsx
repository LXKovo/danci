'use client';

import { useRef, useState } from 'react';

type Word = {
  id: number;
  headWord: string | null;
  content: any;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-4 w-1 rounded-full bg-brand" />
        <h2 className="text-base font-extrabold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SpeakButton({ text, label, type }: { text: string; label: string; type: 1 | 2 }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const speak = () => {
    audioRef.current?.pause();
    const audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=${type}`);
    audioRef.current = audio;
    setPlaying(true);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => setPlaying(false);
    void audio.play();
  };

  return (
    <button type="button" onClick={speak} aria-label={label} className="flex min-h-11 items-center gap-2 rounded-full bg-brand-soft px-4 text-sm font-bold text-brand-dark">
      <span aria-hidden="true">{playing ? '◼' : '🔊'}</span>{label}
    </button>
  );
}

export default function WordDetail({ word }: { word: Word }) {
  const content = word.content?.word?.content ?? word.content?.content ?? {};
  const headWord = word.content?.word?.wordHead ?? word.content?.wordHead ?? word.headWord ?? '';
  const translations = Array.isArray(content.trans) ? content.trans : [];
  const sentences = content.sentence?.sentences ?? [];
  const phrases = content.phrase?.phrases ?? [];
  const related = content.relWord?.rels ?? [];

  return (
    <div className="space-y-4 pb-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-light p-6 text-white shadow-floaty">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-white/70">WORD DETAIL</p>
        <h1 className="mt-3 break-words text-4xl font-extrabold tracking-tight">{headWord}</h1>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-white/90">
          {content.usphone && <span className="rounded-full bg-white/15 px-3 py-1">美 /{content.usphone}/</span>}
          {content.ukphone && <span className="rounded-full bg-white/15 px-3 py-1">英 /{content.ukphone}/</span>}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <SpeakButton text={headWord} label="美式发音" type={2} />
          <SpeakButton text={headWord} label="英式发音" type={1} />
        </div>
      </section>

      <Section title="释义">
        <div className="space-y-3">
          {translations.length ? translations.map((item: any, index: number) => (
            <div key={index} className="border-b border-ink/10 pb-3 last:border-0 last:pb-0">
              <p className="text-base font-bold text-ink">{item.tranCn}</p>
              {item.tranOther && <p className="mt-1 text-sm leading-6 text-ink/55">{item.tranOther}</p>}
            </div>
          )) : <p className="text-sm text-ink/45">暂无释义</p>}
        </div>
      </Section>

      <Section title="例句">
        <div className="space-y-4">
          {sentences.length ? sentences.map((item: any, index: number) => (
            <div key={index} className="rounded-2xl bg-cream p-4">
              <p className="font-medium leading-6 text-ink/85">{item.sContent}</p>
              {item.sCn && <p className="mt-1 text-sm text-ink/50">{item.sCn}</p>}
            </div>
          )) : <p className="text-sm text-ink/45">暂无例句</p>}
        </div>
      </Section>

      <Section title="短语">
        <div className="space-y-3">
          {phrases.length ? phrases.map((item: any, index: number) => (
            <div key={index} className="flex items-baseline justify-between gap-4 border-b border-ink/10 pb-3 last:border-0 last:pb-0">
              <span className="font-semibold text-ink">{item.pContent}</span><span className="text-sm text-ink/50">{item.pCn}</span>
            </div>
          )) : <p className="text-sm text-ink/45">暂无短语</p>}
        </div>
      </Section>

      <Section title="同根词">
        <div className="space-y-4">
          {related.length ? related.map((group: any, index: number) => (
            <div key={index}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand">{group.pos || '相关词'}</p>
              <div className="flex flex-wrap gap-2">
                {(group.words ?? []).map((item: any, wordIndex: number) => <span key={wordIndex} className="rounded-xl bg-ink/5 px-3 py-2 text-sm"><b>{item.hwd}</b><span className="ml-1 text-ink/50">{item.tran}</span></span>)}
              </div>
            </div>
          )) : <p className="text-sm text-ink/45">暂无同根词</p>}
        </div>
      </Section>
    </div>
  );
}
