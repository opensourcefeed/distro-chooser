import { describe, it, expect } from "vitest";
import {
  scoreDistros,
  getMaxPossibleScore,
  getMatchPercent,
  type Question,
  type Answers,
} from "./scoring";
import { distrosSchema, type Distro } from "../schemas/distro";
import { questionsSchema } from "../schemas/question";
import distrosData from "../data/distros.json";
import questionsData from "../data/questions.json";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeDistro(overrides: Partial<Distro> & { id: string }): Distro {
  return {
    platforms: ["pc"],
    baseDistro: "Independent",
    packageManager: "test",
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
      pageUrl: `https://www.opensourcefeed.org/distribution/${overrides.id}`,
      officialUrl: `https://example.org/${overrides.id}`,
    },
    ...overrides,
  } as Distro;
}

function makeQuestion(
  id: string,
  options: { optionId: string; effects: { distroTag: string; weight: number }[] }[],
  type: "single-select" | "multi-select" = "single-select",
): Question {
  return {
    id,
    text: "Test question",
    shortLabel: id,
    type,
    options: options.map((o) => ({
      id: o.optionId,
      label: `Option ${o.optionId}`,
      scoreEffects: o.effects,
    })),
  };
}

// ── Fixtures ───────────────────────────────────────────────────────────────

const ubuntu = makeDistro({ id: "ubuntu", name: "Ubuntu" });
const mint = makeDistro({ id: "linux-mint", name: "Linux Mint" });
const arch = makeDistro({
  id: "arch-linux",
  name: "Arch Linux",
  experienceLevel: "advanced",
  useCases: ["development"],
  releaseModel: "rolling",
});

// ── scoreDistros ───────────────────────────────────────────────────────────

describe("scoreDistros", () => {
  it("produces a clear winner when answers strongly favor one distro", () => {
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

    const answers: Answers = { exp: "beginner", "use-case": "everyday", philosophy: "stable" };
    const results = scoreDistros(answers, [ubuntu, arch, mint], questions);

    expect(results.map((r) => r.distro.id)).toEqual(["ubuntu", "linux-mint", "arch-linux"]);
  });

  it("keeps the input order for tied scores (deterministic tie-break)", () => {
    const a = makeDistro({ id: "distro-a" });
    const b = makeDistro({ id: "distro-b" });
    const questions = [
      makeQuestion("q1", [
        { optionId: "opt1", effects: [
          { distroTag: "distro-a", weight: 2 },
          { distroTag: "distro-b", weight: 2 },
        ]},
        { optionId: "opt2", effects: [] },
      ]),
    ];

    expect(scoreDistros({ q1: "opt1" }, [a, b], questions).map((r) => r.distro.id)).toEqual(["distro-a", "distro-b"]);
    expect(scoreDistros({ q1: "opt1" }, [b, a], questions).map((r) => r.distro.id)).toEqual(["distro-b", "distro-a"]);
  });

  it("sums effects across all selected options on a multi-select question", () => {
    const question = makeQuestion(
      "use-cases",
      [
        { optionId: "everyday", effects: [{ distroTag: "ubuntu", weight: 3 }, { distroTag: "arch-linux", weight: 1 }] },
        { optionId: "development", effects: [{ distroTag: "ubuntu", weight: 2 }, { distroTag: "arch-linux", weight: 2 }] },
        { optionId: "gaming", effects: [{ distroTag: "ubuntu", weight: 2 }, { distroTag: "arch-linux", weight: 1 }] },
      ],
      "multi-select",
    );

    const results = scoreDistros({ "use-cases": ["everyday", "development"] }, [ubuntu, arch], [question]);

    expect(results.find((r) => r.distro.id === "ubuntu")!.score).toBe(5); // 3 + 2
    expect(results.find((r) => r.distro.id === "arch-linux")!.score).toBe(3); // 1 + 2
  });

  it("ignores unknown option ids and unknown distro tags", () => {
    const questions = [
      makeQuestion("q1", [
        { optionId: "opt1", effects: [{ distroTag: "ubuntu", weight: 2 }, { distroTag: "ghost", weight: 5 }] },
        { optionId: "opt2", effects: [] },
      ]),
    ];
    const results = scoreDistros({ q1: ["opt1", "does-not-exist"] }, [ubuntu], questions);
    expect(results[0].score).toBe(2);
  });
});

// ── Match percentage ───────────────────────────────────────────────────────

describe("getMaxPossibleScore / getMatchPercent", () => {
  const questions: Question[] = [
    makeQuestion("exp", [
      { optionId: "beginner", effects: [{ distroTag: "ubuntu", weight: 3 }, { distroTag: "linux-mint", weight: 2 }] },
      { optionId: "advanced", effects: [{ distroTag: "arch-linux", weight: 3 }] },
    ]),
    makeQuestion(
      "use",
      [
        { optionId: "everyday", effects: [{ distroTag: "ubuntu", weight: 3 }] },
        { optionId: "gaming", effects: [{ distroTag: "linux-mint", weight: 2 }] },
        { optionId: "privacy", effects: [{ distroTag: "arch-linux", weight: 3 }] },
      ],
      "multi-select",
    ),
    makeQuestion("de", [
      { optionId: "gnome", effects: [{ distroTag: "ubuntu", weight: 3 }] },
      { optionId: "no-preference", effects: [] },
    ]),
  ];

  it("only counts the options the user actually selected", () => {
    // beginner (3) + everyday (3) + no-preference (0); unselected "gaming" and "privacy" don't count.
    expect(getMaxPossibleScore(questions, { exp: "beginner", use: ["everyday"], de: "no-preference" })).toBe(6);
    // beginner (3) + everyday (3) + gaming (2) + gnome (3)
    expect(getMaxPossibleScore(questions, { exp: "beginner", use: ["everyday", "gaming"], de: "gnome" })).toBe(11);
  });

  it("gives 100% to a distro that is the top pick on every selected option", () => {
    const answers: Answers = { exp: "beginner", use: ["everyday"], de: "gnome" };
    const max = getMaxPossibleScore(questions, answers);
    const [top] = scoreDistros(answers, [ubuntu, mint, arch], questions);
    expect(top.distro.id).toBe("ubuntu");
    expect(getMatchPercent(top.score, max)).toBe(100);
  });

  it("clamps to the 0–100 range and handles a zero denominator", () => {
    expect(getMatchPercent(-4, 10)).toBe(0);
    expect(getMatchPercent(12, 10)).toBe(100);
    expect(getMatchPercent(5, 0)).toBe(0);
    expect(getMatchPercent(7, 10)).toBe(70);
  });
});

// ── Hard platform filter ───────────────────────────────────────────────────

describe("getEligibleDistros via scoreDistros", () => {
  const pcOnly = makeDistro({ id: "pc-only" });
  const piToo = makeDistro({ id: "pi-too", platforms: ["pc", "raspberry-pi"] });
  const device: Question = {
    id: "device",
    text: "Device",
    shortLabel: "Device",
    type: "single-select",
    options: [
      { id: "pc", label: "PC", filterPlatform: "pc", scoreEffects: [] },
      { id: "raspberry-pi", label: "Pi", filterPlatform: "raspberry-pi", scoreEffects: [] },
    ],
  };

  it("drops distros that don't support the chosen device", () => {
    expect(scoreDistros({ device: "raspberry-pi" }, [pcOnly, piToo], [device]).map((r) => r.distro.id)).toEqual(["pi-too"]);
    expect(scoreDistros({ device: "pc" }, [pcOnly, piToo], [device])).toHaveLength(2);
  });

  it("ignores weights of filtered-out distros when computing the max score", () => {
    const q = makeQuestion("q", [{ optionId: "a", effects: [{ distroTag: "pc-only", weight: 5 }, { distroTag: "pi-too", weight: 2 }] }, { optionId: "b", effects: [] }]);
    const answers: Answers = { device: "raspberry-pi", q: "a" };
    expect(getMaxPossibleScore([device, q], answers, [pcOnly, piToo])).toBe(2);
    expect(getMaxPossibleScore([device, q], answers)).toBe(5);
  });
});

// ── Personas against the real dataset ──────────────────────────────────────

describe("real-data personas", () => {
  const distros = distrosSchema.parse(distrosData);
  const realQuestions = questionsSchema.parse(questionsData);

  function top(answers: Answers, n = 3) {
    const results = scoreDistros(answers, distros, realQuestions);
    const max = getMaxPossibleScore(realQuestions, answers, distros);
    return results.slice(0, n).map((r) => ({ id: r.distro.id, percent: getMatchPercent(r.score, max) }));
  }

  it("beginner on an old PC never gets Raspberry Pi OS (an ARM-only OS)", () => {
    const picks = top({
      device: "pc",
      "experience-level": "beginner",
      "primary-use-case": ["everyday"],
      "hardware-age": "10-plus",
      "nvidia-gpu": "no",
      "update-philosophy": "stable",
      "desktop-environment": "no-preference",
    }, 6);
    expect(picks.map((p) => p.id)).not.toContain("raspberry-pi-os");
    expect(picks[0].percent).toBeGreaterThanOrEqual(70);
  });

  it("privacy-focused users are not sent to Kali Linux", () => {
    const picks = top({
      device: "pc",
      "experience-level": "advanced",
      "primary-use-case": ["privacy"],
      "hardware-age": "2-to-5",
      "nvidia-gpu": "no",
      "update-philosophy": "rolling",
      "desktop-environment": "xfce",
    }, 6);
    expect(picks.map((p) => p.id)).not.toContain("kali-linux");
  });

  it("security testers do get Kali Linux", () => {
    const picks = top({
      device: "pc",
      "experience-level": "advanced",
      "primary-use-case": ["security-testing"],
      "hardware-age": "2-to-5",
      "nvidia-gpu": "not-sure",
      "update-philosophy": "rolling",
      "desktop-environment": "xfce",
    });
    expect(picks[0].id).toBe("kali-linux");
  });

  it("Raspberry Pi owners get Raspberry Pi OS first and only Pi-capable distros", () => {
    const answers: Answers = {
      device: "raspberry-pi",
      "experience-level": "beginner",
      "primary-use-case": ["everyday"],
      "hardware-age": "not-sure",
      "nvidia-gpu": "no",
      "update-philosophy": "stable",
      "desktop-environment": "no-preference",
    };
    const results = scoreDistros(answers, distros, realQuestions);
    expect(results[0].distro.id).toBe("raspberry-pi-os");
    expect(results.every((r) => r.distro.platforms.includes("raspberry-pi"))).toBe(true);
  });

  it("Apple Silicon Mac owners only get Asahi", () => {
    const results = scoreDistros({ device: "apple-silicon" }, distros, realQuestions);
    expect(results.map((r) => r.distro.id)).toEqual(["fedora-asahi-remix"]);
  });

  it("beginner gamers on a PC get a beginner-friendly gaming distro first", () => {
    const picks = top({
      device: "pc",
      "experience-level": "beginner",
      "primary-use-case": ["gaming"],
      "hardware-age": "less-than-2",
      "nvidia-gpu": "yes",
      "update-philosophy": "balanced",
      "desktop-environment": "kde-plasma",
    });
    expect(picks[0].id).toBe("bazzite");
  });

  it("a typical beginner sees a top match well above the old 28–45% range", () => {
    const picks = top({
      device: "pc",
      "experience-level": "beginner",
      "primary-use-case": ["everyday", "gaming"],
      "hardware-age": "less-than-2",
      "nvidia-gpu": "yes",
      "update-philosophy": "balanced",
      "desktop-environment": "kde-plasma",
    });
    // Previously ~31% ("Fair match"); now at least the "Good match" tier.
    expect(picks[0].percent).toBeGreaterThanOrEqual(50);
    expect(picks[0].percent).toBeLessThanOrEqual(100);
  });
});
