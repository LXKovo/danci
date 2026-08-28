'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Word = {
  id: number;
  wordRank: number | null;
  headWord: string | null;
  content: any;
  bookId: string;
};

function getContent(word: Word) {
  return word.content?.word?.content ?? word.content?.content ?? {};
}

function getHeadWord(word: Word) {
  return word.content?.word?.wordHead ?? word.content?.wordHead ?? word.headWord;
}

function playPronunciation(word: string, type: 1 | 2) {
  const audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`);
  void audio.play();
}

export default function WordCard({
  bookId,
  words,
  initialIndex,
}: {
  bookId: string;
  words: Word[];
  initialIndex: number;
}) {
  const total = words.length;
  const [index, setIndex] = useState(
    initialIndex >= 0 && initialIndex < total ? initialIndex : 0,
  );
  const [revealed, setRevealed] = useState(false);
  const indexRef = useRef(index);
  indexRef.current = index;

  const sync = useCallback(
    async (i: number) => {
      try {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, currentWordIndex: i, wordId: words[i]?.id }),
        });
        if (!response.ok) return;
      } catch {
        // 同步失败静默，下次继续
      }
    },
    [bookId, words],
  );

  // 翻页：上一个/下一个
  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(total - 1, i));
    if (next === index) return;
    setRevealed(false);
    setIndex(next);
    indexRef.current = next;
    sync(next);
  };

  // 卸载/页面隐藏时 sendBeacon 强制同步一次
  useEffect(() => {
    const beacon = () => {
      const body = new Blob(
        [JSON.stringify({ bookId, currentWordIndex: indexRef.current, wordId: words[indexRef.current]?.id })],
        { type: 'application/json' },
      );
      navigator.sendBeacon('/api/progress', body);
    };
    window.addEventListener('pagehide', beacon);
    return () => {
      window.removeEventListener('pagehide', beacon);
      beacon();
    };
  }, [bookId, words]);

  if (total === 0) {
    return (
      <div className="mt-20 text-center text-sm text-ink/45">
        本书暂无单词
      </div>
    );
  }

  const word = words[index];
  const content = getContent(word);
  const sentence = content.sentence?.sentences?.[0];
  const progress = total ? Math.round(((index + 1) / total) * 100) : 0;

  return (
    <div className="mt-4 pb-2">
      {/* 进度条 */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-ink/50">
          {index + 1} / {total}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand to-sun transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-bold text-leaf">{progress}%</span>
      </div>

      {/* 单词卡片 */}
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="card mt-4 block w-full p-6 text-left transition-transform duration-200 active:scale-[.99]"
        aria-label={revealed ? '收起释义' : '显示释义'}
      >
        {/* 卡片头部装饰 */}
        <div className="mb-4 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest text-ink/30">
          <span className="h-px w-8 bg-ink/15" />
          看词想意
          <span className="h-px w-8 bg-ink/15" />
        </div>

        <p className="text-center text-4xl font-extrabold tracking-tight text-ink">
          {getHeadWord(word)}
        </p>
        {getHeadWord(word) && (
          <div className="mt-3 flex justify-center gap-2">
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark">美音</span>
            <button type="button" aria-label="播放美式发音" onClick={(event) => { event.stopPropagation(); playPronunciation(getHeadWord(word)!, 2); }} className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark">🔊</button>
            <span className="rounded-full bg-leaf-soft px-3 py-1 text-xs font-bold text-leaf-dark">英音</span>
            <button type="button" aria-label="播放英式发音" onClick={(event) => { event.stopPropagation(); playPronunciation(getHeadWord(word)!, 1); }} className="rounded-full bg-leaf-soft px-3 py-1 text-xs font-bold text-leaf-dark">🔊</button>
          </div>
        )}
        {content.usphone && (
          <p className="mt-2 text-center text-sm font-medium text-leaf-dark">
            /{content.usphone}/
          </p>
        )}

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: revealed ? 240 : 0, opacity: revealed ? 1 : 0 }}
        >
          {content.trans?.[0]?.tranCn && (
            <p className="mt-4 text-center text-lg font-semibold text-ink/85">
              {content.trans[0].tranCn}
            </p>
          )}
          {sentence?.sContent && (
            <div className="mx-auto mt-4 max-w-xs rounded-2xl bg-cream px-4 py-3 text-center">
              <p className="text-[15px] font-medium text-ink/80">
                {sentence.sContent}
              </p>
              {sentence.sCn && (
                <p className="mt-1 text-xs text-ink/45">{sentence.sCn}</p>
              )}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs font-medium text-brand">
          {revealed ? '轻点卡片收起结果' : '轻点卡片看释义'}
        </p>
      </button>

      <Link
        href={`/study/${bookId}/${word.id}?start=${index}`}
        className="mt-3 flex min-h-11 items-center justify-center rounded-2xl border border-brand/20 bg-white text-sm font-bold text-brand-dark transition-colors hover:bg-brand-soft"
      >
        查看完整单词详情
      </Link>

      {/* 翻页按钮 */}
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="btn-secondary flex-1"
        >
          上一个
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={index === total - 1}
          className="btn-primary flex-1"
        >
          下一个
        </button>
      </div>
    </div>
  );
}