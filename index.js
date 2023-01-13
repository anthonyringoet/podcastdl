import path from "node:path";
import { fileURLToPath } from "url";
import { mkdir, writeFile } from "node:fs/promises";
import fs from "node:fs";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import { XMLParser } from "fast-xml-parser";

function logger(verbose, args) {
	if (!verbose) return () => {};
	return (...args) => console.log(...args);
}

async function podcastDownloader(
	feedURL,
	outputFolder = "out",
	verbose = false
) {
	if (!feedURL) throw new Error("Feed URL is required");

	const log = logger(verbose);

	log("✅ input", { feedURL, outputFolder });

	// fetch rss feed
	const response = await fetch(feedURL);
	if (!response.ok) {
		throw new Error("Failed to fetch feed");
	}

	log("✅ got feed response");
	const XMLBody = await response.text();

	log("✅ start parsing XML");
	const parser = new XMLParser({
		ignoreAttributes: false,
	});
	const objectBody = parser.parse(XMLBody);
	log("✅ end parsing XML");

	const channel = objectBody?.rss?.channel;
	const summary = {
		title: channel?.title.trim(),
		link: channel?.link,
		description: channel?.description.trim(),
		image: channel?.podcast_image,
	};
	log("✅ summary", summary);
	log("✅ item example", channel?.item[0]);
	const episodes = channel?.item.map((item) => {
		return {
			season: item["itunes:season"]["#text"],
			episode: item["itunes:episode"]["#text"],
			title: item?.title.trim(),
			description: item?.description_item_stripped.trim(),
			link: item?.link,
			audio: item?.enclosure["@_url"],
			pubDate: item?.pubDate_friendly,
			pubDate_sortable: item?.pubDate_sortable,
		};
	});
	log("✅ episode count", episodes.length);
	log("✅ episode example", episodes[0]);

	// make an output folder if it does not exist
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const outputPath = path.resolve(__dirname, outputFolder);
	log("✅ about to create output path", outputPath);
	try {
		await mkdir(outputPath, { recursive: true });
	} catch (error) {
		log("⛔️ output error", error);
		throw new Error("Failed to create output folder");
	}

	// save all podcast+episode info in text files
	const xmlPromise = writeFile(
		path.resolve(outputPath, "response.xml"),
		XMLBody
	);
	const summaryPromise = writeFile(
		path.resolve(outputPath, "summary.json"),
		JSON.stringify(summary, null, 4)
	);
	const episodesPromise = writeFile(
		path.resolve(outputPath, "episodes.json"),
		JSON.stringify(episodes, null, 4)
	);
	await Promise.all([xmlPromise, summaryPromise, episodesPromise]);

	let loopIndex = 0;
	// download podcast episode audio from url
	for (const episode of episodes) {
		loopIndex++;
		log(
			`Fetching ${loopIndex}/${episodes.length} S${episode.season}E${episode.episode}`
		);
		const fileName =
			`${summary.title}-${episode.season}-${episode.episode}.mp3`.replace(
				" ",
				"_"
			);
		const stream = fs.createWriteStream(path.resolve(outputPath, fileName));
		const { body } = await fetch(episode.audio);
		await finished(Readable.fromWeb(body).pipe(stream));
	}

	log("✅ all done");
}

export default podcastDownloader;
