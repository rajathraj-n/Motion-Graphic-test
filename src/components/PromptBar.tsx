import React from "react";
import { C, FONT } from "../theme";
import { Glass } from "./Glass";
import { IconArrowUp, IconMic, IconPlus } from "./Icons";

type Props = {
  x: number; // center x
  y: number; // center y
  width: number;
  height?: number;
  text?: string;
  placeholder?: string;
  caret?: boolean;
  caretOn?: boolean;
  /** 0..1 – send button turns active white */
  sendActive?: number;
  /** 0..1 press animation */
  press?: number;
  /** 0..1 fade of the chrome (icons/buttons) */
  chrome?: number;
  sweep?: number;
  fontSize?: number;
  attachment?: React.ReactNode;
  style?: React.CSSProperties;
};

/** The floating ChatGPT-style prompt composer. */
export const PromptBar: React.FC<Props> = ({
  x,
  y,
  width,
  height = 64,
  text = "",
  placeholder = "Ask anything",
  caret = true,
  caretOn = true,
  sendActive = 0,
  press = 0,
  chrome = 1,
  sweep,
  fontSize = 20,
  attachment,
  style,
}) => {
  const btn = height * 0.62;
  return (
    <Glass
      radius={height / 2}
      sweep={sweep}
      fill={0.11}
      style={{
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          padding: `0 ${height * 0.2}px 0 ${height * 0.32}px`,
          gap: 14,
          fontFamily: FONT,
        }}
      >
        <div style={{ opacity: chrome, flexShrink: 0 }}>
          <IconPlus size={height * 0.36} />
        </div>
        {attachment}
        <div
          style={{
            flex: 1,
            fontSize,
            color: text ? C.white : C.silver,
            fontWeight: 400,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span>{text || placeholder}</span>
          {caret && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: fontSize * 1.25,
                marginLeft: text ? 2 : 0,
                background: C.white,
                opacity: caretOn ? 1 : 0,
                order: text ? 1 : -1,
                marginRight: text ? 0 : 6,
              }}
            />
          )}
        </div>
        <div style={{ opacity: chrome, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <IconMic size={height * 0.34} />
          <div
            style={{
              width: btn,
              height: btn,
              borderRadius: btn,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `rgba(255,255,255,${0.18 + 0.82 * sendActive})`,
              transform: `scale(${1 - 0.12 * Math.sin(Math.PI * press)})`,
              boxShadow: sendActive > 0.5 ? `0 0 ${24 * sendActive}px rgba(255,255,255,${0.25 * sendActive})` : undefined,
            }}
          >
            <IconArrowUp size={btn * 0.55} color={sendActive > 0.5 ? C.black : "#3F3F46"} />
          </div>
        </div>
      </div>
    </Glass>
  );
};
