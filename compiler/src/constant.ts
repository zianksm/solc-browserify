import { version } from "./compiler";

const DEFAULT_COMPILER_VERSION = "0.8.20";

export const SUPPORTED_VERSIONS = [
  "0.8.17",
  "0.8.18",
  "0.8.19",
  "0.8.20",
] as const;

export type SupportedVersion = (typeof SUPPORTED_VERSIONS)[number];

/**
 * compiler version used
 */
export const _version: version = {
  default: DEFAULT_COMPILER_VERSION,
} as const;
