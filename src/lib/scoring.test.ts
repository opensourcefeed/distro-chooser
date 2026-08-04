import { describe, it, expect } from "vitest";
import { scoreDistros, type Question, type Answers } from "./scoring";
import type { Distro } from "../schemas/distro";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeDistro(overrides: Partial<Distro> & { id: string }): Distro {
  return {
    name: overrides.id,
    slug: overrides.id,
    description: "A test distro",
    experienceLevel: "beginner",
    useCases: ["everyday"],
    releaseModel: "stable",
    desktopEnvironments: ["GNOME"],
    nvidiaFriendly: false,
    lastVerifiedDate: "2026-01-01",
    links: {
      pageUrl: "https://www.opensourcefeed.org/distribution/test",
    },
    ...overrides,
  } as Distro;
}

function makeQuestion(
  id: string,
  options: { optionId: string; effects: { distroTag: string; weight: number }[] }[],
): Question {
  return {
    id,
    text: "Test question",
    type: "single-select",
    options: options.map((o) => ({
      id: o.optionId,
      label: `Option ${o.optionId}`,
      scoreEffects: o.effects,
    })),
  };
}

// ── Fixtures ───────────────────────────────────────────────────────────────

const ubuntu = makeDistro({
  id: "ubuntu",
  name: "Ubuntu",
  links: {
    pageUrl: "https://www.opensourcefeed.org/distribution/ubuntu",
    overviewUrl: "https://www.opensourcefeed.org/distribution/ubuntu",
    installGuideUrl: "https://www.opensourcefeed.org/distribution/ubuntu",
    latestReleaseUrl: "https://www.opensourcefeed.org/distribution/ubuntu",
    comparisonUrls: ["https://www.opensourcefeed.org/distribution/ubuntu"],
  },
});

const arch = makeDistro({
  id: "arch-linux",
  name: "Arch Linux",
  experienceLevel: "advanced",
  useCases: ["development", "privacy"],
  releaseModel: "rolling",
  links: {
    pageUrl: "https://www.opensourcefeed.org/distribution/arch-linux",
    // sparse — no extra fields
  },
});

const mint = makeDistro({
  id: "linux-mint",
  name: "Linux Mint",
  links: {
    pageUrl: "https://www.opensourcefeed.org/distribution/linux-mint",
    overviewUrl: "https://www.opensourcefeed.org/distribution/linux-mint",
    installGuideUrl: "https://www.opensourcefeed.org/distribution/linux-mint",
    latestReleaseUrl: "https://www.opensourcefeed.org/distribution/linux-mint",
    comparisonUrls: ["https://www.opensourcefeed.org/distribution/linux-mint"],
  },
});

const fedora = makeDistro({
  id: "fedora",
  name: "Fedora",
  links: {
    pageUrl: "https://www.opensourcefeed.org/distribution/fedora",
    overviewUrl: "https://www.opensourcefeed.org/distribution/fedora",
    installGuideUrl: "https://www.opensourcefeed.org/distribution/fedora",
    // missing latestReleaseUrl and comparisonUrls → partial (2 fields)
  },
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("scoreDistros", () => {
  it("produces a clear winner when answers strongly favor one distro", () => {
    // Give Ubuntu all the high positive weights, Mint gets slightly less
    const distros = [ubuntu, arch, mint];
    const questions: Question[] = [
      makeQuestion("exp", [
        { optionId: "beginner", effects: [
          { distroTag: "ubuntu", weight: 3 },
          { distroTag: "linux-mint", weight: 3 },
          { distroTag: "arch-linux", weight: -3 },
        ]},
        { optionId: "advanced", effects: [
          { distroTag: "arch-linux", weight: 3 },
          { distroTag: "ubuntu", weight: -2 },
          { distroTag: "linux-mint", weight: -3 },
        ]},
      ]),
      makeQuestion("use-case", [
        { optionId: "everyday", effects: [
          { distroTag: "ubuntu", weight: 3 },
          { distroTag: "linux-mint", weight: 3 },
          { distroTag: "arch-linux", weight: 1 },
        ]},
      ]),
      makeQuestion("philosophy", [
        { optionId: "stable", effects: [
          { distroTag: "ubuntu", weight: 3 },
          { distroTag: "linux-mint", weight: 1 },
          { distroTag: "arch-linux", weight: -3 },
        ]},
      ]),
    ];

    const answers: Answers = {
      exp: "beginner",
      "use-case": "everyday",
      philosophy: "stable",
    };

    const results = scoreDistros(answers, distros, questions);

    // Ubuntu and Mint both get high scores, but Arch should be last
    expect(results[0].distro.id).toBe("ubuntu");
    expect(results[1].distro.id).toBe("linux-mint");
    expect(results[2].distro.id).toBe("arch-linux");
    expect(results[0].adjustedScore).toBeGreaterThan(results[2].adjustedScore);
  });

  it("produces a tie when two distros have identical scores and multipliers", () => {
    // Two identical distros with same links → should tie
    const distroA = makeDistro({
      id: "distro-a",
      links: {
        pageUrl: "https://example.com/a",
        overviewUrl: "https://example.com/a",
        installGuideUrl: "https://example.com/a",
        latestReleaseUrl: "https://example.com/a",
        comparisonUrls: ["https://example.com/a"],
      },
    });
    const distroB = makeDistro({
      id: "distro-b",
      links: {
        pageUrl: "https://example.com/b",
        overviewUrl: "https://example.com/b",
        installGuideUrl: "https://example.com/b",
        latestReleaseUrl: "https://example.com/b",
        comparisonUrls: ["https://example.com/b"],
      },
    });

    const questions: Question[] = [
      makeQuestion("q1", [
        { optionId: "opt1", effects: [
          { distroTag: "distro-a", weight: 2 },
          { distroTag: "distro-b", weight: 2 },
        ]},
        { optionId: "opt2", effects: [
          { distroTag: "distro-a", weight: -1 },
          { distroTag: "distro-b", weight: -1 },
        ]},
      ]),
    ];

    const answers: Answers = { q1: "opt1" };
    const results = scoreDistros(answers, [distroA, distroB], questions);

    expect(results[0].adjustedScore).toBe(results[1].adjustedScore);
    expect(results[0].score).toBe(results[1].score);
    expect(results[0].contentDepthMultiplier).toBe(results[1].contentDepthMultiplier);
  });

  it("lets a high-fit distro with sparse links be overtaken by a slightly-lower-fit distro with full content depth", () => {
    // Distro A: high raw score (10) but sparse links → multiplier 1.0 → adjusted = 10
    // Distro B: lower raw score (9) but full links → multiplier 1.15 → adjusted = 10.35
    const distroA = makeDistro({
      id: "high-fit-sparse",
      links: {
        pageUrl: "https://example.com/a",
        // only pageUrl → sparse (0 extra fields)
      },
    });
    const distroB = makeDistro({
      id: "lower-fit-full",
      links: {
        pageUrl: "https://example.com/b",
        overviewUrl: "https://example.com/b",
        installGuideUrl: "https://example.com/b",
        latestReleaseUrl: "https://example.com/b",
        comparisonUrls: ["https://example.com/b"],
      },
    });

    const questions: Question[] = [
      makeQuestion("q1", [
        { optionId: "boost-a", effects: [
          { distroTag: "high-fit-sparse", weight: 10 },
          { distroTag: "lower-fit-full", weight: 9 },
        ]},
      ]),
    ];

    const answers: Answers = { q1: "boost-a" };
    const results = scoreDistros(answers, [distroA, distroB], questions);

    // Raw scores: A=10, B=9
    expect(results.find((r) => r.distro.id === "high-fit-sparse")!.score).toBe(10);
    expect(results.find((r) => r.distro.id === "lower-fit-full")!.score).toBe(9);

    // Multipliers: A=1.0 (sparse), B=1.15 (full)
    expect(results.find((r) => r.distro.id === "high-fit-sparse")!.contentDepthMultiplier).toBe(1.0);
    expect(results.find((r) => r.distro.id === "lower-fit-full")!.contentDepthMultiplier).toBe(1.15);

    // Adjusted: A=10, B=10.35 → B should win
    expect(results[0].distro.id).toBe("lower-fit-full");
    expect(results[1].distro.id).toBe("high-fit-sparse");
    expect(results[0].adjustedScore).toBeGreaterThan(results[1].adjustedScore);
  });
});