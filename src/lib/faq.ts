import { dataLastReviewed, formatDate } from "./data";

/** FAQ shown under the quiz and published as FAQPage structured data. */
export const faqs = [
	{
		q: "Which Linux distro is best for beginners?",
		a: "For most people new to Linux, Linux Mint, Ubuntu, Zorin OS and Pop!_OS are the safest starting points: they install easily, have large communities and handle drivers for you. The quiz weighs your hardware and preferences to pick between them.",
	},
	{
		q: "Which Linux distro is best for gaming?",
		a: "Pop!_OS and Ubuntu are solid general-purpose choices with good NVIDIA support. If gaming is your main use, newer gaming-focused distributions such as Bazzite, Nobara and CachyOS ship recent drivers, Steam and gaming tweaks out of the box. On a Steam Deck, SteamOS is the official choice.",
	},
	{
		q: "Which Linux distro is best for an old laptop or PC?",
		a: "Lightweight desktops make the biggest difference on old hardware. Lubuntu, Xubuntu, Linux Lite, MX Linux, antiX and Puppy Linux are built to run well with little memory. Pick \"Old hardware revival\" and your hardware age in the quiz to rank them.",
	},
	{
		q: "Can I try a Linux distro without installing it?",
		a: "Yes. Most distributions offer a live USB image: write it to a USB stick, boot from it and try the desktop without touching your current system. You can also test a distro in a virtual machine such as VirtualBox or GNOME Boxes.",
	},
	{
		q: "Is the Distro Chooser free, and what happens to my answers?",
		a: "The quiz is free and needs no account. Your answers are scored in your browser and are never sent to a server. They only appear in the page address so you can share or bookmark your results.",
	},
	{
		q: "How often is the distro data updated?",
		a: `Each distribution has a "last verified" date and the whole list is reviewed regularly against official project sources. The data was last reviewed on ${formatDate(dataLastReviewed)}. If you spot something out of date, please report it using the link in the footer.`,
	},
];

export const faqJsonLd = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};
