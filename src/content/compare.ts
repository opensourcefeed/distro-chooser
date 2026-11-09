import type { Comparison } from "../schemas/guide";

/**
 * "X vs Y" comparisons. Each page is about the trade-offs between two
 * distros; "what is X" stays on the OpenSourceFeed /distribution/ pages.
 *
 * Deliberately NOT covered, because OpenSourceFeed already has an article:
 *   - Ubuntu vs Fedora → https://www.opensourcefeed.org/ubuntu-25-04-vs-fedora-42-workstation/
 * See OSF_COVERED_PAIRS in src/content/guides.test.ts.
 */
export const comparisons: Comparison[] = [
  // ── Ubuntu vs Linux Mint ─────────────────────────────────────────────────
  {
    slug: "ubuntu-vs-linux-mint",
    a: "ubuntu",
    b: "linux-mint",
    metaTitle: "Ubuntu vs Linux Mint: Which Should You Use?",
    metaDescription:
      "Ubuntu vs Linux Mint compared: desktop, Snap vs Flatpak, release schedule and support. Find out which one fits you, with a clear verdict for each kind of user.",
    answer:
      "Choose Linux Mint if you want a Windows-like desktop that stays out of your way. Choose Ubuntu if you prefer a modern GNOME desktop, newer releases every six months and the widest vendor support.",
    intro: [
      "Linux Mint is built on top of Ubuntu's long-term support releases, so the two share drivers, most software and a huge amount of online help. The differences are in the desktop you see, how apps are packaged and how often big changes arrive.",
      "That makes this less a question of which is better and more of which defaults suit you. Both are excellent first distributions, and both are maintained for years.",
    ],
    chooseA: [
      "You like GNOME's clean, dock-based desktop and touchpad gestures.",
      "You want new features every six months through Ubuntu's interim releases, or the long-term release every two years.",
      "You rely on software whose vendor documents Ubuntu specifically, such as some commercial and developer tools.",
      "You are fine with Snap packages, which Ubuntu uses for apps such as Firefox.",
    ],
    chooseB: [
      "You are coming from Windows and want a start menu, taskbar and system tray from the first minute.",
      "You prefer to avoid Snap: Mint disables it by default and uses Flatpak and traditional packages instead.",
      "You value a calm system: Mint only builds on Ubuntu's long-term releases and changes little between versions.",
      "You want built-in tools such as Timeshift snapshots, Driver Manager and a very clear Update Manager.",
    ],
    differences: [
      {
        title: "Desktop and look",
        text: "Ubuntu uses GNOME with a few Ubuntu changes, most visibly a dock on the left and desktop icons. It is modern and gesture-friendly but quite different from Windows. Linux Mint's flagship Cinnamon desktop, with MATE and Xfce editions, uses a traditional bottom panel and menu that most Windows users understand immediately.",
      },
      {
        title: "Snap and Flatpak",
        text: "Ubuntu delivers some apps, including Firefox, as Snaps from Canonical's Snap Store, which bundle their own dependencies and update automatically. Linux Mint blocks snapd by default and its Software Manager offers Flatpaks from Flathub alongside regular packages. Both approaches work; Snaps can be slower to start the first time.",
      },
      {
        title: "Release schedule",
        text: "Ubuntu publishes a release every six months and a long-term support release every two years. Linux Mint follows only the long-term releases: a new major version every two years and smaller point releases in between, all on the same base. Mint therefore changes less often but can lag on very new hardware.",
      },
      {
        title: "Support and who is behind it",
        text: "Ubuntu is developed by Canonical, which offers five years of standard security updates for long-term releases and extended coverage through Ubuntu Pro. Linux Mint is a community project funded by donations and sponsors, and supports each major version for as long as the Ubuntu release beneath it.",
      },
      {
        title: "A Debian option",
        text: "Linux Mint also offers LMDE, an edition based directly on Debian instead of Ubuntu, as a backup plan in case Ubuntu ever changes direction. Ubuntu has no equivalent; if you want Debian, see our [Debian vs Ubuntu comparison](/distro-chooser/compare/debian-vs-ubuntu/).",
      },
    ],
    faqs: [
      {
        q: "Is Linux Mint just Ubuntu with a different desktop?",
        a: "Mostly, but not only. Mint uses Ubuntu's base and repositories, then adds its own desktop, apps, update tools and package policy, for example blocking Snap. It also offers a Debian-based edition, LMDE.",
      },
      {
        q: "Which is faster, Ubuntu or Linux Mint?",
        a: "Linux Mint usually feels lighter, especially with its MATE or Xfce editions, because GNOME uses more memory. On modern hardware the difference is small; on older machines Mint's lighter editions help.",
      },
      {
        q: "Can I switch from Ubuntu to Mint without reinstalling?",
        a: "Not cleanly. The safest way is to back up your home folder, install Mint fresh and restore your files. Because both use the same package base, your apps will be available again.",
      },
    ],
    related: [
      { label: "Best Linux distros for beginners", href: "/distro-chooser/best-for/beginners/" },
      { label: "Linux Mint vs Zorin OS", href: "/distro-chooser/compare/linux-mint-vs-zorin-os/" },
      { label: "Pop!_OS vs Ubuntu", href: "/distro-chooser/compare/pop-os-vs-ubuntu/" },
    ],
    lastReviewed: "2026-11-09",
  },

  // ── Debian vs Ubuntu ─────────────────────────────────────────────────────
  {
    slug: "debian-vs-ubuntu",
    a: "debian",
    b: "ubuntu",
    metaTitle: "Debian vs Ubuntu: Differences and Which to Choose",
    metaDescription:
      "Debian vs Ubuntu compared: release cycles, support length, Snap, drivers and who runs each project. A plain-English verdict for desktops and servers.",
    answer:
      "Choose Debian for a community-run, very stable system without Snap. Choose Ubuntu for newer hardware support, easier drivers and the widest commercial backing.",
    intro: [
      "Ubuntu is built from Debian: every Ubuntu release starts from a snapshot of Debian's development branch, then adds Canonical's own changes. The two share the .deb package format and the APT tools, so skills transfer directly.",
      "They differ in who decides, how often things change and how much is done for you. Those differences matter more on a desktop than on a server.",
    ],
    chooseA: [
      "You want a system that barely changes for two years and never surprises you.",
      "You prefer a community project with no company deciding its direction.",
      "You want to choose your desktop at install time, without Snap packages.",
      "You deploy to Debian servers or Debian-based container images.",
    ],
    chooseB: [
      "You have recent hardware and want newer kernels and drivers without extra steps.",
      "You want the NVIDIA driver and codecs installable from a settings screen.",
      "You need software that vendors certify on Ubuntu, or optional paid support.",
      "You'd like new features every six months through interim releases.",
    ],
    differences: [
      {
        title: "Release cycle and support",
        text: "Debian releases a new stable version roughly every two years, supported for about three years plus two more years of long-term security support. Ubuntu releases every six months, with a long-term support release every two years that gets five years of standard security updates, extendable through Ubuntu Pro, which is free for personal use on a few machines.",
      },
      {
        title: "Freshness and hardware support",
        text: "Debian stable freezes its package versions for the whole release, which is why it is so dependable and also why software can be old by the end of a cycle. Ubuntu's long-term releases gain newer kernels and graphics stacks during their life, so recent laptops and GPUs tend to work sooner on Ubuntu.",
      },
      {
        title: "Who is behind it",
        text: "Debian is run by volunteers under a social contract and its own constitution, with decisions made in the open. Ubuntu is led by Canonical, a company that sets its direction, funds development and sells support. Both are open source; it's a question of whether you prefer community governance or a commercial backer.",
      },
      {
        title: "Packaging: Snap or not",
        text: "Ubuntu ships some apps, including Firefox, as Snaps from Canonical's store. Debian doesn't use Snap by default; you get traditional packages and can add Flatpak if you want newer desktop apps. If you dislike Snap but want Ubuntu's base, Linux Mint is another option.",
      },
      {
        title: "Installation and defaults",
        text: "Ubuntu's installer is polished and opinionated, landing you on its customised GNOME desktop. Debian's installer offers more choices, including which desktop to use, and installs a fairly plain system. Since Debian 12, the installer includes non-free firmware, so Wi-Fi works on far more laptops than it used to.",
      },
    ],
    faqs: [
      {
        q: "Is Ubuntu based on Debian?",
        a: "Yes. Each Ubuntu release starts from Debian's unstable branch, and Canonical then adds its own packages, kernel builds, installer and desktop changes. Many fixes flow back into Debian.",
      },
      {
        q: "Which is better for a server?",
        a: "Both are widely used. Debian is prized for stability and minimalism; Ubuntu Server for its long support, newer kernels and commercial support options. Pick the one your team and tooling already know.",
      },
      {
        q: "Is Debian good for beginners?",
        a: "It is usable, but Ubuntu or Linux Mint are easier because they handle drivers and codecs for you. See our [best Linux distros for beginners](/distro-chooser/best-for/beginners/).",
      },
    ],
    related: [
      { label: "Ubuntu vs Linux Mint", href: "/distro-chooser/compare/ubuntu-vs-linux-mint/" },
      { label: "Fedora vs Debian", href: "/distro-chooser/compare/fedora-vs-debian/" },
      { label: "Best Linux distros for programming", href: "/distro-chooser/best-for/programming/" },
    ],
    lastReviewed: "2026-11-09",
  },

  // ── Pop!_OS vs Ubuntu ────────────────────────────────────────────────────
  {
    slug: "pop-os-vs-ubuntu",
    a: "pop-os",
    b: "ubuntu",
    metaTitle: "Pop!_OS vs Ubuntu: COSMIC, NVIDIA and Which to Pick",
    metaDescription:
      "Pop!_OS vs Ubuntu compared: the COSMIC desktop vs GNOME, NVIDIA drivers, tiling, apps and release schedule. Which one fits gaming, work and everyday use.",
    answer:
      "Choose Pop!_OS for its COSMIC desktop with built-in tiling and a ready-made NVIDIA image. Choose Ubuntu for the more mature GNOME desktop, interim releases and the widest support.",
    intro: [
      "Pop!_OS, made by the Linux hardware company System76, is built on Ubuntu's long-term support releases. Underneath, both share packages, drivers and most documentation.",
      "The big split is the desktop. Pop!_OS now ships COSMIC, System76's own desktop written in Rust, while Ubuntu keeps its customised GNOME. That choice shapes everyday use far more than anything else on this page.",
    ],
    chooseA: [
      "You have an NVIDIA GPU and want the driver installed from the start.",
      "You like window tiling but don't want to learn a separate tiling window manager.",
      "You want a fast, modern desktop and don't mind it being newer and less mature.",
      "You own or plan to buy System76 hardware.",
    ],
    chooseB: [
      "You want the most mature, best-documented desktop experience on this base.",
      "You need Secure Boot left on without extra steps.",
      "You want interim releases every six months, not only long-term releases.",
      "You rely on GNOME extensions or software that targets Ubuntu specifically.",
    ],
    differences: [
      {
        title: "COSMIC vs GNOME",
        text: "COSMIC is a new desktop built by System76, with per-workspace tiling you can switch on or off, a configurable panel and dock, and quick performance. Being young, it still lacks some settings and extensions that GNOME users take for granted. Ubuntu's GNOME is mature and polished, with a dock on the left and many extensions, but no built-in tiling.",
      },
      {
        title: "NVIDIA drivers",
        text: "Pop!_OS offers a separate download with NVIDIA's driver pre-installed, which avoids a common setup problem on gaming laptops and desktops. Ubuntu installs the NVIDIA driver through its Additional Drivers tool or during installation. Both work; Pop!_OS just makes it the default path.",
      },
      {
        title: "Releases",
        text: "Pop!_OS only builds on Ubuntu's long-term support releases, so it changes less often. Ubuntu also offers interim releases every six months for people who want new features sooner, alongside the long-term release every two years.",
      },
      {
        title: "Apps and packaging",
        text: "Pop!_OS's COSMIC Store offers Flatpak apps from Flathub alongside regular packages, and Pop doesn't push Snaps. Ubuntu's App Center centres on Snap packages, including for Firefox. If you have a preference between Snap and Flatpak, this is a real difference.",
      },
      {
        title: "Installation details",
        text: "System76's download page asks you to disable Secure Boot to install Pop!_OS, while Ubuntu supports Secure Boot out of the box. Pop!_OS also sets up a recovery partition, which lets you reinstall or repair the system without a USB stick.",
      },
      {
        title: `Hardware vendors`,
        text: `System76 sells laptops and desktops with Pop!_OS pre-installed and delivers firmware updates for them through Pop!_OS's settings. Ubuntu is pre-installed or certified on machines from several large PC makers, and Canonical publishes a list of certified hardware. Either runs well on most PCs; the vendor link matters mainly if you buy from one of them.`,
      },
    ],
    faqs: [
      {
        q: "Is Pop!_OS better than Ubuntu for gaming?",
        a: "For NVIDIA owners, Pop!_OS is easier because the driver comes pre-installed. Game performance is otherwise similar, since both use the same base. See our [best Linux distros for gaming](/distro-chooser/best-for/gaming/).",
      },
      {
        q: "Can I use COSMIC on Ubuntu?",
        a: "COSMIC is developed in the open and community packages exist for other distributions, but Pop!_OS is where it is integrated and supported by System76.",
      },
      {
        q: "Does Pop!_OS still use GNOME?",
        a: "Pop!_OS's current release uses COSMIC instead of GNOME. Older Pop!_OS versions were based on a customised GNOME, which is why many older guides mention it.",
      },
      {
        q: "Is it as easy to get NVIDIA drivers on Ubuntu?",
        a: "Nearly. Ubuntu's installer can add third-party drivers during setup, and its Additional Drivers tool installs or switches NVIDIA driver versions later. Pop!_OS simply removes that step by shipping a separate image with the driver already included.",
      },
    ],
    related: [
      { label: "Ubuntu vs Linux Mint", href: "/distro-chooser/compare/ubuntu-vs-linux-mint/" },
      { label: "Best Linux distros for gaming", href: "/distro-chooser/best-for/gaming/" },
      { label: "Best Linux distros for programming", href: "/distro-chooser/best-for/programming/" },
    ],
    lastReviewed: "2026-11-09",
  },

  // ── Linux Mint vs Zorin OS ───────────────────────────────────────────────
  {
    slug: "linux-mint-vs-zorin-os",
    a: "linux-mint",
    b: "zorin-os",
    metaTitle: "Linux Mint vs Zorin OS: Best for Windows Switchers?",
    metaDescription:
      "Linux Mint vs Zorin OS compared for people leaving Windows: desktop layouts, Windows app support, free vs Pro editions, updates and older hardware.",
    answer:
      "Choose Linux Mint for a free, very stable desktop with a classic Windows-like layout. Choose Zorin OS if you want it to look as much like Windows (or macOS) as possible and run some Windows programs easily.",
    intro: [
      "Linux Mint and Zorin OS are the two distributions most often recommended to people leaving Windows. Both are built on Ubuntu's long-term support releases, both run on modest hardware and both try hard to feel familiar.",
      "They take different routes. Mint uses its own traditional desktop and keeps things conservative; Zorin OS reshapes a GNOME-based desktop into layouts that imitate Windows and macOS, and adds tools aimed squarely at switchers.",
    ],
    chooseA: [
      "You want everything free, with no paid edition.",
      "You like a classic start-menu desktop and don't need it to copy Windows exactly.",
      "You value tools like Timeshift snapshots and Mint's clear Update Manager.",
      "You want new versions to arrive on a predictable two-year rhythm.",
    ],
    chooseB: [
      "You want your new desktop to look as close to Windows, or macOS, as possible.",
      "You need to run a few small Windows programs and want help setting that up.",
      "You'd like phone integration out of the box with Zorin Connect.",
      "You are happy to optionally pay for the Pro edition's extra layouts and apps.",
    ],
    differences: [
      {
        title: "Desktop layouts",
        text: "Linux Mint's Cinnamon desktop has one well-tuned, Windows-style layout you can adjust. Zorin OS's Appearance settings switch the whole desktop between layouts, including Windows-like and macOS-like ones, in a click. The free Core edition includes a Windows-style layout; the paid Pro edition adds more.",
      },
      {
        title: "Running Windows programs",
        text: "Zorin OS includes Windows app support: open an .exe or .msi file and it offers to install it through Wine, or suggests a native alternative. On Linux Mint you can install Wine or Bottles yourself. Neither runs every Windows program; complex apps such as Adobe's suites still won't work.",
      },
      {
        title: "Cost and editions",
        text: "Linux Mint is entirely free and funded by donations and sponsors. Zorin OS Core and the lightweight Lite edition are free; Zorin OS Pro is a one-off purchase that adds layouts, apps and installation support. You don't need Pro to have a complete system.",
      },
      {
        title: "Update rhythm",
        text: "Linux Mint publishes a major version on each new Ubuntu long-term release, with point releases in between. Zorin OS publishes major versions less often, which means fewer upgrades to do but also a longer wait for the newest kernels and hardware support.",
      },
      {
        title: "Older hardware",
        text: "Both have lighter options: Linux Mint's Xfce edition and Zorin OS Lite, which also uses Xfce. For very old computers, OpenSourceFeed's [guide to Linux on old PCs](https://www.opensourcefeed.org/revive-old-pc-linux-distros/) covers even lighter distros.",
      },
    ],
    faqs: [
      {
        q: "Is Zorin OS free?",
        a: "Zorin OS Core and Zorin OS Lite are free to download and use. Zorin OS Pro is a paid edition with extra layouts and bundled software; buying it also supports the project.",
      },
      {
        q: "Which is better for an older laptop?",
        a: "Linux Mint Xfce and Zorin OS Lite both run well on older machines. Mint's update cycle tends to bring newer kernels sooner, while Zorin OS Lite has the more Windows-like look.",
      },
      {
        q: "Can Zorin OS run Microsoft Office?",
        a: "Not the desktop version reliably. Microsoft 365 works in the browser on any distro, and LibreOffice opens and saves Office files.",
      },
      {
        q: "Which one is supported for longer?",
        a: "Both get security updates until the Ubuntu long-term release they are built on reaches the end of standard support. Because Zorin OS tends to release later in that cycle, each Zorin OS version usually has less remaining support time than a Mint version released early in the cycle.",
      },
    ],
    related: [
      { label: "Best Linux distros for Windows switchers", href: "/distro-chooser/best-for/windows-switchers/" },
      { label: "Ubuntu vs Linux Mint", href: "/distro-chooser/compare/ubuntu-vs-linux-mint/" },
      { label: "Best Linux distros for beginners", href: "/distro-chooser/best-for/beginners/" },
    ],
    lastReviewed: "2026-11-09",
  },

  // ── Arch Linux vs EndeavourOS ────────────────────────────────────────────
  {
    slug: "arch-linux-vs-endeavouros",
    a: "arch-linux",
    b: "endeavour",
    metaTitle: "Arch Linux vs EndeavourOS: What's the Difference?",
    metaDescription:
      "Arch Linux vs EndeavourOS: same packages, different install and defaults. When the manual Arch install is worth it and when EndeavourOS saves you time.",
    answer:
      "EndeavourOS is Arch Linux with a graphical installer and a few helper tools on top. Choose Arch if you want to build the system yourself; choose EndeavourOS if you want Arch's packages without the manual setup.",
    intro: [
      "EndeavourOS uses Arch Linux's own package repositories, plus a small repository of its own tools. Once installed, you update with pacman, use the Arch Wiki and the AUR exactly as on Arch. Most of the time, an EndeavourOS system is an Arch system.",
      "The difference is how you get there and what you start with. Arch hands you a minimal base and lets you choose everything; EndeavourOS makes those choices with you in a graphical installer and adds a welcome app for common tasks.",
    ],
    chooseA: [
      "You want to learn how a Linux system fits together by assembling it yourself.",
      "You want nothing installed that you didn't choose.",
      "You prefer to rely only on Arch's own repositories and support channels.",
      "You're happy using the guided archinstall script or a fully manual install.",
    ],
    chooseB: [
      "You want Arch's rolling packages and AUR access with a graphical installer.",
      "You'd like a ready-to-use desktop, with KDE Plasma by default or others to choose from.",
      "You want helper tools for updates, mirrors and common fixes in a welcome app.",
      "You value a friendly forum where newer Arch users are welcome.",
    ],
    differences: [
      {
        title: "Installation",
        text: "Arch ships a minimal live image with the archinstall guided script; you pick partitions, bootloader, desktop and packages yourself, or follow the Installation Guide step by step. EndeavourOS uses the graphical Calamares installer, with an offline option for KDE Plasma and an online option to choose other desktops.",
      },
      {
        title: "Packages and updates",
        text: "Both use Arch's official repositories directly, so package versions are the same on the same day. EndeavourOS adds a small repository for its own tools and themes, and includes the yay helper for the AUR. Updates and occasional manual interventions are the same, which is why reading Arch news matters on both.",
      },
      {
        title: "Defaults and extra tools",
        text: "A fresh Arch install has only what you selected. EndeavourOS adds a Welcome app with shortcuts for updating, changing mirrors, installing drivers and fixing common problems, plus sensible defaults such as a firewall and printer support selectable during install.",
      },
      {
        title: "Support",
        text: "Arch's forums and wiki expect you to have read the documentation and to be running Arch as installed by you. EndeavourOS describes itself as terminal-centric but has a forum that is known for being welcoming to people still learning. The Arch Wiki is the main reference for both.",
      },
      {
        title: `Choosing a desktop`,
        text: `On Arch, you install whichever desktop, display manager and apps you want as packages. EndeavourOS's online installer offers a menu of desktops, including KDE Plasma, GNOME, Xfce, Cinnamon and i3, with light default theming. After installation, adding or switching desktops works exactly as on Arch.`,
      },
    ],
    faqs: [
      {
        q: "Is EndeavourOS just Arch?",
        a: "Very nearly. It installs from Arch's repositories with a graphical installer and adds a few tools of its own. You can use Arch's documentation for almost everything.",
      },
      {
        q: "Is EndeavourOS good for beginners?",
        a: "It is easier than Arch to install, but it is still a rolling-release system that expects you to read update news and use the terminal sometimes. Complete beginners usually do better with a fixed-release distro.",
      },
      {
        q: "How is EndeavourOS different from Manjaro?",
        a: "EndeavourOS uses Arch's repositories directly; Manjaro holds packages in its own repositories for extra testing. See [Manjaro vs EndeavourOS](/distro-chooser/compare/manjaro-vs-endeavouros/).",
      },
    ],
    related: [
      { label: "Arch Linux vs Manjaro", href: "/distro-chooser/compare/arch-linux-vs-manjaro/" },
      { label: "CachyOS vs EndeavourOS", href: "/distro-chooser/compare/cachyos-vs-endeavouros/" },
      { label: "Fedora vs Arch Linux", href: "/distro-chooser/compare/fedora-vs-arch-linux/" },
    ],
    lastReviewed: "2026-11-09",
  },

  // ── Arch Linux vs Manjaro ────────────────────────────────────────────────
  {
    slug: "arch-linux-vs-manjaro",
    a: "arch-linux",
    b: "manjaro",
    metaTitle: "Arch Linux vs Manjaro: Which Arch Should You Run?",
    metaDescription:
      "Arch Linux vs Manjaro compared: Manjaro's own repositories and delayed updates, AUR compatibility, hardware tools and installers. Which suits you better.",
    answer:
      "Choose Arch for the newest packages straight from the source and full control. Choose Manjaro for a ready-made desktop, graphical tools and updates that are held back for extra testing.",
    intro: [
      "Manjaro is based on Arch Linux but, unlike EndeavourOS, it does not use Arch's repositories directly. Manjaro rebuilds and tests packages in its own branches and releases them to its stable users in batches, usually a couple of weeks after Arch.",
      "That one decision explains most of the differences: Manjaro trades some freshness for a buffer against breakage, and adds its own tools to make the system easier to manage.",
    ],
    chooseA: [
      "You want packages as soon as Arch publishes them.",
      "You use the AUR a lot and want it to match your system's package versions.",
      "You prefer to configure everything yourself from a minimal base.",
      "You want one source of truth: Arch's repositories, wiki and news.",
    ],
    chooseB: [
      "You want a graphical installer and a complete desktop out of the box.",
      "You'd like graphical tools to switch kernels and install drivers.",
      "You prefer updates that arrive in tested batches rather than continuously.",
      "You want a GUI package manager, Pamac, with optional Flatpak and AUR support.",
    ],
    differences: [
      {
        title: "Repositories and timing",
        text: "Arch users get packages as soon as they land in Arch's repositories. Manjaro takes Arch's packages through its own unstable and testing branches before releasing them to the stable branch in batches, typically a couple of weeks later. The delay catches some problems, but it also means security fixes and new versions arrive later.",
      },
      {
        title: "The AUR",
        text: "The Arch User Repository's build scripts are written for current Arch. Because Manjaro's packages can be a little behind, some AUR packages fail to build or misbehave on Manjaro until it catches up. Manjaro's own documentation warns about this, and Pamac can enable AUR support if you accept the risk.",
      },
      {
        title: "Tools and installation",
        text: "Manjaro installs through the graphical Calamares installer and includes a Settings Manager for switching between several kernels and installing hardware drivers, including NVIDIA's. On Arch you install kernels and drivers with pacman following the Arch Wiki.",
      },
      {
        title: "Who it suits",
        text: "Manjaro is often recommended as a friendly way into the Arch world. In practice, it still needs attention: rolling updates can require manual steps, and mixing Manjaro and Arch instructions can cause confusion. Arch is more work up front but has one consistent set of documentation.",
      },
      {
        title: `Kernels`,
        text: `Manjaro maintains several kernel series at once, including long-term versions, and lets you install them side by side from its Settings Manager, which is handy if a new kernel breaks your hardware. Arch offers a few official kernel packages, such as the current kernel, a long-term kernel and a hardened one, installed with pacman.`,
      },
    ],
    faqs: [
      {
        q: "Is Manjaro more stable than Arch?",
        a: "Its stable branch is tested longer, which can catch some problems. But the delay can also cause issues, especially with the AUR, so in practice both need similar care with updates.",
      },
      {
        q: "Can I use the Arch Wiki on Manjaro?",
        a: "Mostly, yes. Watch for differences in kernel and driver management, where Manjaro's own tools and documentation apply.",
      },
      {
        q: "What's an easier way to get plain Arch?",
        a: "EndeavourOS uses Arch's repositories directly with a graphical installer. See [Arch Linux vs EndeavourOS](/distro-chooser/compare/arch-linux-vs-endeavouros/).",
      },
      {
        q: "Which is better for gaming?",
        a: "Both run Steam and current drivers well. Arch gets new kernels and Mesa versions first, which helps with the newest GPUs; Manjaro's driver tool makes installing NVIDIA's driver easier. For an Arch base tuned for gaming, see [CachyOS vs EndeavourOS](/distro-chooser/compare/cachyos-vs-endeavouros/).",
      },
    ],
    related: [
      { label: "Manjaro vs EndeavourOS", href: "/distro-chooser/compare/manjaro-vs-endeavouros/" },
      { label: "Arch Linux vs EndeavourOS", href: "/distro-chooser/compare/arch-linux-vs-endeavouros/" },
      { label: "Best Linux distros for programming", href: "/distro-chooser/best-for/programming/" },
    ],
    lastReviewed: "2026-11-09",
  },

  // ── Manjaro vs EndeavourOS ───────────────────────────────────────────────
  {
    slug: "manjaro-vs-endeavouros",
    a: "manjaro",
    b: "endeavour",
    metaTitle: "Manjaro vs EndeavourOS: Which Arch-Based Distro?",
    metaDescription:
      "Manjaro vs EndeavourOS: the two most popular Arch-based desktops compared on repositories, updates, AUR, tools and defaults, with a verdict for each user.",
    answer:
      "Choose EndeavourOS if you want real Arch with an easy installer. Choose Manjaro if you prefer more graphical tools and updates held back in tested batches.",
    intro: [
      "Manjaro and EndeavourOS are the two Arch-based distributions people weigh most often. Both offer a graphical installer, rolling updates and access to the Arch User Repository, and both offer KDE Plasma as a main edition.",
      "Under the hood they take opposite approaches. EndeavourOS stays as close to Arch as possible; Manjaro builds its own layer on top. That shapes updates, compatibility and support.",
    ],
    chooseA: [
      "You want graphical tools for kernels and drivers rather than terminal commands.",
      "You like the idea of updates arriving in tested batches.",
      "You want Pamac, a graphical package manager with optional Flatpak and AUR support.",
      "You want editions for many desktops maintained by the project and its community.",
    ],
    chooseB: [
      "You want packages straight from Arch's repositories, on Arch's timing.",
      "You use the AUR often and want it to work as on Arch.",
      "You're comfortable with the terminal for updates and fixes.",
      "You want the Arch Wiki to apply without exceptions.",
    ],
    differences: [
      {
        title: "Where packages come from",
        text: "EndeavourOS installs from Arch's repositories plus a small repository of its own tools. Manjaro uses its own repositories, moving Arch packages through unstable and testing branches before releasing them to stable, usually a couple of weeks after Arch.",
      },
      {
        title: "AUR compatibility",
        text: "AUR build scripts target current Arch, so they work as expected on EndeavourOS. On Manjaro, some AUR packages can fail until Manjaro's repositories catch up with Arch's versions.",
      },
      {
        title: "Everyday tools",
        text: "Manjaro is more graphical: Pamac for software, and a Settings Manager for kernels, drivers and language packs. EndeavourOS offers a Welcome app with update and maintenance shortcuts and the yay AUR helper, but expects more terminal use.",
      },
      {
        title: "Philosophy",
        text: "EndeavourOS calls itself terminal-centric and aims to be a lightly assisted Arch. Manjaro aims to be a user-friendly distribution in its own right, built on Arch technology. If you plan to learn Arch over time, EndeavourOS transfers more directly.",
      },
      {
        title: `Desktop editions`,
        text: `Manjaro publishes official editions with KDE Plasma, GNOME and Xfce, plus community-maintained editions with other desktops, each with its own Manjaro theming. EndeavourOS has one installer that offers several desktops to choose from, with only light theming. Both let you add other desktops later.`,
      },
    ],
    faqs: [
      {
        q: "Which is better for gaming?",
        a: "Both run Steam and the latest drivers well. If gaming is your main use, a tuned Arch-based distro such as CachyOS may suit you better; see [CachyOS vs EndeavourOS](/distro-chooser/compare/cachyos-vs-endeavouros/).",
      },
      {
        q: "Which is easier for a newcomer?",
        a: "Manjaro has more graphical tools, so it can feel easier at first. EndeavourOS has a welcoming community and simpler compatibility with Arch documentation. Total beginners are usually better off with a fixed-release distro.",
      },
      {
        q: "Do both support NVIDIA?",
        a: "Yes. Manjaro can install NVIDIA's driver from its Settings Manager; EndeavourOS can install it during setup or afterwards following the Arch Wiki.",
      },
      {
        q: "Can I switch from Manjaro to EndeavourOS without reinstalling?",
        a: "It isn't recommended. Manjaro's repositories and tools differ from Arch's, so converting a live system is error-prone. Back up your home folder, install EndeavourOS fresh and restore your files.",
      },
      {
        q: "Which has better documentation?",
        a: "EndeavourOS relies mainly on the Arch Wiki, which applies almost unchanged, plus its own wiki for its tools. Manjaro has its own wiki and forum; the Arch Wiki mostly applies too, except for kernels, drivers and anything affected by Manjaro's delayed packages.",
      },
    ],
    related: [
      { label: "Arch Linux vs Manjaro", href: "/distro-chooser/compare/arch-linux-vs-manjaro/" },
      { label: "Arch Linux vs EndeavourOS", href: "/distro-chooser/compare/arch-linux-vs-endeavouros/" },
      { label: "Best Linux distros for gaming", href: "/distro-chooser/best-for/gaming/" },
    ],
    lastReviewed: "2026-11-09",
  },

  // ── Fedora vs Arch Linux ─────────────────────────────────────────────────
  {
    slug: "fedora-vs-arch-linux",
    a: "fedora",
    b: "arch-linux",
    metaTitle: "Fedora vs Arch Linux: Fresh Packages, Two Approaches",
    metaDescription:
      "Fedora vs Arch Linux compared: fixed six-month releases vs rolling updates, installation, SELinux, AUR vs COPR and maintenance. Which modern distro fits you?",
    answer:
      "Choose Fedora for a recent, polished system that works out of the box and upgrades twice a year. Choose Arch for rolling updates, the AUR and a system you build yourself.",
    intro: [
      "Fedora and Arch Linux both stay close to upstream: they ship recent kernels, desktops and toolchains with few changes. Developers often shortlist them for exactly that reason.",
      "Where they differ is in how updates are delivered and how much is set up for you. Fedora is a curated, tested release you install in minutes; Arch is a continuously updated base you assemble.",
    ],
    chooseA: [
      "You want a ready-to-use desktop, GNOME or KDE Plasma, minutes after installing.",
      "You prefer tested releases and one planned upgrade every six months.",
      "You want SELinux and other security defaults set up for you.",
      "You work with Red Hat-family systems such as RHEL, CentOS Stream or Rocky Linux.",
    ],
    chooseB: [
      "You want every package as soon as it is released, without waiting for a new version.",
      "You want access to the AUR's huge collection of build scripts.",
      "You enjoy choosing every component of your system.",
      "You prefer to never do a big version upgrade.",
    ],
    differences: [
      {
        title: "Fixed releases vs rolling",
        text: "Fedora publishes a new version roughly every six months and supports each for about 13 months, so you upgrade once or twice a year. Arch has no versions: packages update continuously and a system installed years ago is identical to a new one once updated. Arch occasionally needs manual steps, announced on its news page.",
      },
      {
        title: "Installation and defaults",
        text: "Fedora's installer sets up a complete desktop with sensible defaults, including SELinux, firewalld and Btrfs on Workstation. Arch gives you a minimal system via archinstall or a manual install; you choose the desktop, services and security setup yourself.",
      },
      {
        title: "Extra software",
        text: "Arch's AUR offers community build scripts for almost anything. Fedora has COPR for community repositories, and Flathub for desktop apps. Fedora leaves out patent-encumbered codecs and NVIDIA's driver; most users add them from the RPM Fusion repositories.",
      },
      {
        title: "Who is behind it",
        text: "Fedora is a community project sponsored by Red Hat and is the upstream for Red Hat Enterprise Linux, so it gets new technology early and is well tested. Arch is a volunteer-run project with one of the best wikis in the Linux world, useful to users of every distribution.",
      },
      {
        title: `Hardware support`,
        text: `Both run recent kernels, which helps with new laptops and GPUs. Arch packages a new kernel shortly after upstream releases it. Fedora tests new kernel versions first and then moves each supported release to them during its life, so it is usually only a few weeks behind.`,
      },
    ],
    faqs: [
      {
        q: "Is Fedora a rolling release?",
        a: "No. Fedora has fixed releases about every six months, but they ship recent software. If you want rolling updates on a Fedora base, look at Fedora's Rawhide development branch, which is not meant for daily use.",
      },
      {
        q: "Which is better for programming?",
        a: "Both are excellent. Fedora is less maintenance and has container tools built in; Arch gives you the newest everything and the AUR. See our [best Linux distros for programming](/distro-chooser/best-for/programming/).",
      },
      {
        q: "Which breaks less often?",
        a: "Fedora, generally, because each release is tested as a whole. Arch is reliable when you follow its news and update regularly, but it gives you more chances to make mistakes.",
      },
      {
        q: "Can I use the Arch Wiki on Fedora?",
        a: "Partly. Much of the Arch Wiki explains upstream software and applies to any distribution, but package names, install commands and some paths differ. Fedora's own documentation covers its tools, such as DNF and the release upgrade process.",
      },
    ],
    related: [
      { label: "Fedora vs Debian", href: "/distro-chooser/compare/fedora-vs-debian/" },
      { label: "Arch Linux vs EndeavourOS", href: "/distro-chooser/compare/arch-linux-vs-endeavouros/" },
      { label: "Ubuntu vs Fedora (OpenSourceFeed)", href: "https://www.opensourcefeed.org/ubuntu-25-04-vs-fedora-42-workstation/" },
    ],
    lastReviewed: "2026-11-09",
  },

  // ── Fedora vs Debian ─────────────────────────────────────────────────────
  {
    slug: "fedora-vs-debian",
    a: "fedora",
    b: "debian",
    metaTitle: "Fedora vs Debian: New Software or Long Stability?",
    metaDescription:
      "Fedora vs Debian compared: release cycles, support length, package freshness, security defaults and drivers. A clear verdict for desktop and server users.",
    answer:
      "Choose Fedora for recent software and new hardware support with a yearly upgrade. Choose Debian for maximum stability and years between major upgrades.",
    intro: [
      "Fedora and Debian are two of the oldest and most influential community distributions, and the roots of the two big Linux families: Red Hat's RPM world and Debian's DEB world, which includes Ubuntu and Linux Mint.",
      "They sit at opposite ends of the freshness scale. Fedora tracks new upstream releases closely; Debian stable freezes its software and supports it for years.",
    ],
    chooseA: [
      "You want recent kernels, desktops and developer tools.",
      "You have new hardware that needs the latest drivers.",
      "You're fine upgrading to a new release about once a year.",
      "You work with Red Hat-family systems in your job.",
    ],
    chooseB: [
      "You want a system that stays the same for two years or more.",
      "You run servers, or a desktop you never want to babysit.",
      "You prefer a community project with no corporate sponsor.",
      "You want the widest package selection with APT.",
    ],
    differences: [
      {
        title: "Release cycle and support",
        text: "Fedora releases about every six months and supports each release for roughly 13 months. Debian releases a new stable version roughly every two years, with about three years of regular support and two more of long-term security support.",
      },
      {
        title: "Package freshness",
        text: "Fedora ships new versions of GNOME, KDE Plasma, kernels and toolchains soon after upstream. Debian stable freezes versions for its whole life and only backports security and important fixes, so software can be two years old by the end of a cycle. Debian's backports and Flatpak can fill gaps.",
      },
      {
        title: "Security defaults",
        text: "Fedora enables SELinux and firewalld by default. Debian enables AppArmor by default and installs a minimal set of services. Both offer full-disk encryption in their installers and publish security updates promptly.",
      },
      {
        title: "Drivers and codecs",
        text: "Fedora excludes patent-encumbered codecs and NVIDIA's driver from its repositories; most users add RPM Fusion to get them. Debian includes non-free firmware in its installer and offers NVIDIA's driver in its non-free section, which you enable once.",
      },
      {
        title: "Package tools",
        text: "Fedora uses DNF and RPM packages, the same family as RHEL. Debian uses APT and .deb packages, the same family as Ubuntu and Mint. Skills, scripts and Dockerfiles carry over within each family.",
      },
    ],
    faqs: [
      {
        q: "Is Fedora less stable than Debian?",
        a: "Fedora releases are well tested and stable in daily use, but they change more often. Debian stable changes very little, which is what people usually mean by stability.",
      },
      {
        q: "Which is better for gaming?",
        a: "Fedora, generally, because newer kernels and Mesa versions help with recent games and GPUs. Fedora-based gaming distros such as Bazzite and Nobara build on that. See our [gaming guide](/distro-chooser/best-for/gaming/).",
      },
      {
        q: "Which is better for a home server?",
        a: "Debian is a classic choice for servers thanks to its long support and minimal changes. Fedora also has a server edition, but its short support window means more frequent upgrades.",
      },
      {
        q: "Can I get newer software on Debian?",
        a: "Yes. Debian's backports repository offers newer versions of selected packages for stable, Flatpak gives you current desktop apps from Flathub, and containers let you run newer toolchains. Debian testing is also an option, but it receives security fixes more slowly than stable.",
      },
      {
        q: "Which is easier to install?",
        a: "Fedora's installer is short and sets up a complete desktop with few questions. Debian's classic installer asks more, but Debian also offers live images with a simpler graphical installer for each desktop.",
      },
    ],
    related: [
      { label: "Debian vs Ubuntu", href: "/distro-chooser/compare/debian-vs-ubuntu/" },
      { label: "Fedora vs Arch Linux", href: "/distro-chooser/compare/fedora-vs-arch-linux/" },
      { label: "Best Linux distros for privacy and security", href: "/distro-chooser/best-for/privacy/" },
    ],
    lastReviewed: "2026-11-09",
  },

  // ── CachyOS vs EndeavourOS ───────────────────────────────────────────────
  {
    slug: "cachyos-vs-endeavouros",
    a: "cachyos",
    b: "endeavour",
    metaTitle: "CachyOS vs EndeavourOS: Speed Tuning or Plain Arch?",
    metaDescription:
      "CachyOS vs EndeavourOS: two Arch-based distros with easy installers. Compare optimised packages, tuned kernels, gaming focus and how close each stays to Arch.",
    answer:
      "Choose CachyOS if you want a performance-tuned, gaming-ready Arch system. Choose EndeavourOS if you want the closest thing to plain Arch with an easy installer.",
    intro: [
      "CachyOS and EndeavourOS are both Arch-based, rolling-release distributions with graphical installers and KDE Plasma as their default desktop. Both give you Arch's software and access to the AUR.",
      "CachyOS goes further than EndeavourOS in changing what you run: it rebuilds packages for modern CPUs and ships its own tuned kernels. EndeavourOS deliberately keeps Arch's packages untouched.",
    ],
    chooseA: [
      "You game on Linux and want gaming packages offered at install.",
      "You want packages built for your CPU's newer instruction sets.",
      "You'd like a choice of tuned kernels and CPU schedulers.",
      "You have a handheld and want an image built for it.",
    ],
    chooseB: [
      "You want Arch's packages exactly as Arch builds them.",
      "You want the Arch Wiki and Arch's news to apply directly.",
      "You prefer a light-touch distro with few extra moving parts.",
      "You value a long-established, welcoming community.",
    ],
    differences: [
      {
        title: "Packages and performance",
        text: "CachyOS rebuilds many packages for newer x86-64 instruction set levels (and specific CPU families where it can), and installs the right repository for your processor automatically. EndeavourOS uses Arch's generic x86-64 packages unchanged. CachyOS's tuning can give small speedups, mostly in CPU-heavy tasks.",
      },
      {
        title: "Kernels",
        text: "CachyOS ships its own kernel builds with performance patches and lets you choose between CPU schedulers, with a graphical kernel manager. EndeavourOS uses Arch's standard kernels, and you can add others yourself.",
      },
      {
        title: "Gaming focus",
        text: "CachyOS offers gaming packages such as Steam and Proton tools during setup and has a handheld edition. EndeavourOS is a general-purpose system: gaming works well, but you install the tools yourself, as described in the Arch Wiki.",
      },
      {
        title: "How close to Arch",
        text: "EndeavourOS is as close to Arch as an installer-based distro gets, so Arch documentation applies directly. CachyOS adds its own repositories in front of Arch's, so when something breaks you may need to check whether the cause is Arch or a CachyOS build.",
      },
      {
        title: `Welcome apps and tools`,
        text: `Both greet you with a welcome app after installation. CachyOS's includes shortcuts for gaming packages, kernel and scheduler settings and system tweaks. EndeavourOS's focuses on maintenance: updates, mirror ranking, driver installation and links to its documentation and forum.`,
      },
    ],
    faqs: [
      {
        q: "Is CachyOS faster than EndeavourOS?",
        a: "Often slightly, for CPU-heavy work, because of its optimised packages and kernels. For games the GPU driver usually matters more, and the difference is small.",
      },
      {
        q: "Will CachyOS run on my older CPU?",
        a: "Yes. Its installer detects your CPU and uses generic packages if it doesn't support the newer instruction sets.",
      },
      {
        q: "Are there other gaming-focused distros?",
        a: "Yes: Bazzite and Nobara are Fedora-based options, and Pop!_OS is a general-purpose choice with easy NVIDIA support. See our [best Linux distros for gaming](/distro-chooser/best-for/gaming/).",
      },
      {
        q: "Can I add CachyOS's packages to an existing Arch or EndeavourOS system?",
        a: "CachyOS provides a script that adds its repositories to an existing Arch-based install. Mixing repositories adds another source of updates to keep track of, so many people prefer to choose one distro instead.",
      },
      {
        q: "Is CachyOS good for beginners?",
        a: "It is one of the friendlier Arch-based distros, with a graphical installer and helper apps, but it is still a rolling release that needs regular updates and the occasional fix. Complete beginners usually do better with a fixed-release distro such as Linux Mint or Pop!_OS.",
      },
      {
        q: "Does CachyOS set up NVIDIA drivers?",
        a: "Yes. Its hardware detection installs a suitable driver for NVIDIA cards during setup. On EndeavourOS you can choose the NVIDIA driver in the installer or add it later following the Arch Wiki.",
      },
    ],
    related: [
      { label: "Best Linux distros for gaming", href: "/distro-chooser/best-for/gaming/" },
      { label: "Arch Linux vs EndeavourOS", href: "/distro-chooser/compare/arch-linux-vs-endeavouros/" },
      { label: "Manjaro vs EndeavourOS", href: "/distro-chooser/compare/manjaro-vs-endeavouros/" },
    ],
    lastReviewed: "2026-11-09",
  },
];
