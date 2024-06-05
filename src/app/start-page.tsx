"use client";

import { useState } from "react";
//import Header from "./component/Header";
import Main from "./component/Main";
import { useControls } from "leva";

export default function StartPage() {
  const {
    amountPoints,
    randomSeed,
    widthFieldSize,
    heightFieldSize,
    connectionControl,
    workspacePaddingX,
    workspacePaddingY,
  } = useControls({
    amountPoints: {
      value: 100,
      min: 2,
      step: 1,
    },
    widthFieldSize: {
      value: 1024,
      min: 128,
      max: 8192,
      step: 1,
    },
    heightFieldSize: {
      value: 1024,
      min: 128,
      max: 8192,
      step: 1,
    },
    randomSeed: {
      value: 0,
      step: 1,
    },
    connectionControl: {
      value: 50,
      min: 0,
      max: 100,
      step: 1,
    },
    workspacePaddingX: {
      value: 50,
      min: 0,
      max: 200,
      step: 1,
    },
    workspacePaddingY: {
      value: 50,
      min: 0,
      max: 200,
      step: 1,
    },
  });

  return (
    <>
      <Main
        amountPoints={amountPoints}
        randomSeed={randomSeed}
        widthFieldSize={widthFieldSize}
        heightFieldSize={heightFieldSize}
        connectionControl={connectionControl}
        workspacePaddingX={workspacePaddingX}
        workspacePaddingY={workspacePaddingY}
      />
    </>
  );
}
