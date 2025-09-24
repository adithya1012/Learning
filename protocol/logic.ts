/**
 * Protocol Logic Utilities
 * Contains utility functions for protocol version checking and validation
 */

/**
 * Checks if a given version is within the specified range
 * @param version - The version to check (e.g., "1.0", "1.2.3")
 * @param minVersion - Minimum acceptable version
 * @param maxVersion - Maximum acceptable version
 * @returns true if version is within range, false otherwise
 */
export function isVersionInRange(
  version: string,
  minVersion: string,
  maxVersion: string
): boolean {
  const parseVersion = (v: string): number[] => {
    return v.split(".").map((part) => parseInt(part, 10) || 0);
  };

  const compareVersions = (v1: number[], v2: number[]): number => {
    const maxLength = Math.max(v1.length, v2.length);

    for (let i = 0; i < maxLength; i++) {
      const part1 = v1[i] || 0;
      const part2 = v2[i] || 0;

      if (part1 < part2) return -1;
      if (part1 > part2) return 1;
    }

    return 0;
  };

  try {
    const versionParts = parseVersion(version);
    const minVersionParts = parseVersion(minVersion);
    const maxVersionParts = parseVersion(maxVersion);

    const isAboveMin = compareVersions(versionParts, minVersionParts) >= 0;
    const isBelowMax = compareVersions(versionParts, maxVersionParts) <= 0;

    return isAboveMin && isBelowMax;
  } catch (error) {
    console.error("Error parsing version strings:", error);
    return false;
  }
}
