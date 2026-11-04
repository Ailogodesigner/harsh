"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { playCyberClick } from "./ui/SoundEffects";

export function ThreeDCardDemo() {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-[#090815] relative group/card border-purple-500/30 hover:border-lime-400/50 hover:shadow-2xl hover:shadow-purple-500/[0.2] w-auto sm:w-[30rem] h-auto rounded-3xl p-6 border transition-all">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-white font-sans tracking-tight"
        >
          High-Velocity 3D Perspective Card
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-purple-300/80 text-xs sm:text-sm max-w-sm mt-2 font-mono"
        >
          Hover over this card to unleash full CSS &amp; Framer Motion 3D depth.
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-4">
          <img
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop"
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-2xl group-hover/card:shadow-xl border border-purple-500/20"
            alt="3D Technology Visual"
          />
        </CardItem>
        <div className="flex justify-between items-center mt-12">
          <CardItem
            translateZ={20}
            as="a"
            href="#projects"
            onClick={() => playCyberClick()}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-lime-400 hover:text-lime-300 transition-colors"
          >
            Explore Projects →
          </CardItem>
          <CardItem
            translateZ={20}
            as="a"
            href="#contact"
            onClick={() => playCyberClick()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-400 via-fuchsia-400 to-lime-400 text-slate-950 text-xs font-bold shadow-md shadow-purple-500/20 hover:brightness-110 transition-all"
          >
            Start Project
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
