"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { playCyberHover, playCyberClick } from "./SoundEffects";

export type CardType = {
  title: string;
  tagline: string;
  src: string;
  category: string;
  stats?: string;
};

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    onSelect,
  }: {
    card: CardType;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    onSelect?: (card: CardType) => void;
  }) => (
    <div
      onMouseEnter={() => {
        setHovered(index);
        playCyberHover();
      }}
      onMouseLeave={() => setHovered(null)}
      onClick={() => {
        if (onSelect) onSelect(card);
        playCyberClick();
      }}
      className={cn(
        "rounded-3xl relative bg-[#090815] overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out border border-purple-500/25 cursor-pointer shadow-xl",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98] opacity-50",
        hovered === index && "border-lime-400 shadow-[0_0_30px_-5px_rgba(163,230,53,0.4)] scale-[1.02]"
      )}
    >
      <div className="absolute inset-0 bg-[#0c0921]" />
      <img
        src={card.src}
        alt={card.title}
        className="object-cover absolute inset-0 size-full brightness-75 hover:brightness-90 transition-all z-0"
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06050e] via-[#06050e]/60 to-transparent" />
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between p-6 transition-opacity duration-300 font-mono text-left"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase">
            {card.category}
          </span>
          {card.stats && (
            <span className="text-xs text-lime-400 font-bold">
              {card.stats}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-white font-sans tracking-tight">
            {card.title}
          </h3>
          <p className="text-xs text-purple-200/80 font-sans">
            {card.tagline}
          </p>
        </div>
      </div>
    </div>
  )
);

Card.displayName = "Card";

export function FocusCards({
  cards,
  onSelect,
}: {
  cards: CardType[];
  onSelect?: (card: CardType) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

