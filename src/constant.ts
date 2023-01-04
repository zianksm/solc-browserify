import { version } from "./browser.solidity.worker";

const DEFAULT_COMPILER_VERSION = "0.8.17";

/**
 * compiler version used
 */
export const _version: version = {
  default: DEFAULT_COMPILER_VERSION,
} as const;
