import type { Context, IntentResult } from "./types";

const MIN_TEXT_LENGTH = 8;

const PASSWORD_REGEX =
  /(password|passwd|otp|2fa|secret|token|apikey|api[_-]?key|bearer|authorization)/i;

const TERMINAL_ERROR_REGEX =
  /(error|exception|panic|failed|cannot|undefined|null|ENOENT|ECONNREFUSED|ERR_)/i;

const CODE_REGEX =
  /(const|let|function|class|import|export|=>|interface|type\s+)/;

const TECH_TERM_REGEX =
  /\b(redis|kafka|docker|kubernetes|postgres|mongodb|graphql|grpc|websocket|jwt|oauth|aws|azure|react|nextjs|node|typescript|rust|solana|pubsub|queue|cache)\b/i;


export function decideIntent(context: Context): IntentResult {
  const text =
    context.selectedText ||
    context.clipboardText ||
    "";

  if (!text.trim()) {
    return {
      action: "ignore",
      confidence: 1,
      reason: "Empty text",
    };
  }

  if (PASSWORD_REGEX.test(text)) {
    return {
      action: "ignore",
      confidence: 0.99,
      reason: "Sensitive content",
    };
  }

  if (TERMINAL_ERROR_REGEX.test(text)) {
    return {
      action: "store_search",
      confidence: 0.95,
      reason: "Terminal error",
    };
  }

  if (CODE_REGEX.test(text)) {
    return {
      action: "store",
      confidence: 0.9,
      reason: "Code snippet",
    };
  }

  const isDeveloperContext =
    context.source === "vscode" ||
    context.source === "browser" ||
    context.windowTitle?.toLowerCase().includes("visual studio code") ||
    context.windowTitle?.toLowerCase().includes("code");


  if (TECH_TERM_REGEX.test(text) && isDeveloperContext) {
    return {
      action: "store_search",
      confidence: 0.85,
      reason: "Technical concept in developer context",
    };
  }


  if (isDeveloperContext) {
    return {
      action: "search",
      confidence: 0.8,
      reason: "Developer selection",
    };
  }


  if (text.length < MIN_TEXT_LENGTH) {
    return {
      action: "ignore",
      confidence: 0.9,
      reason: "Too short",
    };
  }


  if (text.length > 40) {
    return {
      action: "store",
      confidence: 0.75,
      reason: "Meaningful clipboard",
    };
  }


  return {
    action: "ignore",
    confidence: 0.5,
    reason: "Low value",
  };
}