import type { Context, IntentResult } from "./types";


const MIN_TEXT_LENGTH = 8;


const PASSWORD_REGEX =
  /(password|passwd|otp|2fa|secret|token|apikey|api[_-]?key|bearer|authorization|private[_-]?key)/i;


const TERMINAL_ERROR_REGEX =
  /(error|exception|panic|failed|cannot|undefined|null|ENOENT|ECONNREFUSED|ERR_|traceback|stack trace)/i;


const CODE_REGEX =
  /(const|let|var|function|class|import|export|=>|interface|type\s+)/;


const TECH_TERM_REGEX =
  /\b(redis|kafka|docker|kubernetes|postgres|mongodb|graphql|grpc|websocket|jwt|oauth|aws|azure|react|nextjs|node|typescript|rust|solana|pubsub|queue|cache|database|api|sdk|terraform|nginx|linux)\b/i;


const MUSIC_REGEX =
  /(spotify|apple music|youtube music|soundcloud|playlist|album|song|artist|lyrics)/i;


const VIDEO_REGEX =
  /(youtube|netflix|prime video|video|tutorial|course|lecture|watch)/i;


const ARTICLE_REGEX =
  /(medium|dev\.to|substack|blog|documentation|docs|wikipedia|article|research paper)/i;


const SHOPPING_REGEX =
  /(amazon|flipkart|myntra|ebay|product|price|cart|buy|shopping)/i;


const URL_REGEX =
  /(https?:\/\/[^\s]+)/i;


const IMPORTANT_APP_REGEX =
  /(spotify|youtube|chrome|brave|firefox|safari|edge|code|cursor|terminal|notion|obsidian|pdf|reader)/i;



export function decideIntent(
  context: Context
): IntentResult {


  const text =
    context.selectedText ||
    context.clipboardText ||
    "";


  const normalizedText =
    text.trim();


  const appContext =
    `${context.app ?? ""} ${context.windowTitle ?? ""}`;


  const fullContext =
    `${normalizedText} ${appContext}`;



  if (!normalizedText) {

    return {
      action: "ignore",
      confidence: 1,
      reason: "Empty text",
    };

  }



  /*
    Never store secrets
  */
  if (PASSWORD_REGEX.test(fullContext)) {

    return {
      action: "ignore",
      confidence: 0.99,
      reason: "Sensitive content",
    };

  }



  /*
    Terminal failures are valuable memories
  */
  if (TERMINAL_ERROR_REGEX.test(normalizedText)) {

    return {
      action: "store",
      confidence: 0.95,
      reason: "Terminal error",
    };

  }



  /*
    Code snippets
  */
  if (CODE_REGEX.test(normalizedText)) {

    return {
      action: "store",
      confidence: 0.9,
      reason: "Code snippet",
    };

  }



  /*
    Technical knowledge
  */
  if (TECH_TERM_REGEX.test(fullContext)) {

    return {
      action: "store",
      confidence: 0.85,
      reason: "Technical concept",
    };

  }



  /*
    Music memory
    Example:
    Spotify - Blinding Lights
  */
  if (MUSIC_REGEX.test(fullContext)) {

    return {
      action: "store",
      confidence: 0.85,
      reason: "Music context",
    };

  }



  /*
    Video / learning content
  */
  if (VIDEO_REGEX.test(fullContext)) {

    return {
      action: "store",
      confidence: 0.8,
      reason: "Video content",
    };

  }



  /*
    Articles and documentation
  */
  if (ARTICLE_REGEX.test(fullContext)) {

    return {
      action: "store",
      confidence: 0.8,
      reason: "Learning material",
    };

  }



  /*
    Shopping/product memory
  */
  if (SHOPPING_REGEX.test(fullContext)) {

    return {
      action: "store",
      confidence: 0.75,
      reason: "Shopping context",
    };

  }



  /*
    URLs are usually valuable
  */
  if (URL_REGEX.test(normalizedText)) {

    return {
      action: "store",
      confidence: 0.75,
      reason: "URL captured",
    };

  }



  /*
    Known useful apps
  */
  if (
    IMPORTANT_APP_REGEX.test(appContext) &&
    normalizedText.length > MIN_TEXT_LENGTH
  ) {

    return {
      action: "store",
      confidence: 0.7,
      reason: "Application context",
    };

  }



  /*
    Long meaningful clipboard text
  */
  if (normalizedText.length > 80) {

    return {
      action: "store",
      confidence: 0.7,
      reason: "Long meaningful content",
    };

  }



  return {
    action: "ignore",
    confidence: 0.5,
    reason: "Low value",
  };

}