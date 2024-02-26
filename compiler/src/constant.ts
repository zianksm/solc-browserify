import { version } from "./browser.solidity.worker";

const DEFAULT_COMPILER_VERSION = "0.8.20";

/**
 * compiler version used
 */
export const _version: version = {
  default: DEFAULT_COMPILER_VERSION,
} as const;
