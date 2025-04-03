import { ActivityType } from "discord.js";
import { SapphireClient } from "@sapphire/framework";
import { readdir, unlink } from "fs/promises";

import * as Booru from "booru";

import _ from "lodash-es";
import path from "path";
import quotes from "../quotes.json";

export function timeToSeconds(time: string | null): number {
	if (!time) {
		throw new Error("Time cannot be null or undefined.");
	}

	const timeParts = time.split(":").map(Number);

	if (timeParts.length === 2) {
		return timeParts[0] * 60 + timeParts[1];
	} else if (timeParts.length === 3) {
		return timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
	} else if (timeParts.length === 1) {
		return timeParts[0];
	} else {
		throw new Error("Invalid time format. Expected 'mm:ss' or 'hh:mm:ss'.");
	}
}

/** Convierte los segundos en un formato legible
 * @param seconds Segundos a convertir.
 * @returns Formato legible.
 * @example 3600 -> 01:00:00 */
export function formatSeconds(seconds: number): string {
	let hours = 0;
	let minutes = 0;

	if (seconds >= 3600) {
		hours = Math.floor(seconds / 3600);
		seconds %= 3600;
	}
	if (seconds >= 60) {
		minutes = Math.floor(seconds / 60);
		seconds %= 60;
	}
	const remainingSeconds = seconds;

	return `${hours > 0 ? `${hours}:` : ""}${minutes < 10 ? "0" : ""}${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

/** Randomiza el array
 * @param arr Array a randomizar.
 * @returns Array randomizado. */
export function shuffleArray(arr: any[]): any[] {
	return _.shuffle(arr);
}

/** Randomiza el array y mantiene el primer elemento en su posicion.
 * @param arr Array a randomizar.
 * @returns Array randomizado. */
export function shuffArrNoFI(arr: any[]): any[] {
	let fPos = arr.shift();
	arr = shuffleArray(arr);
	arr.unshift(fPos);
	return arr;
}

function getRandomQuote(client: SapphireClient) {
	const randomIndex = Math.floor(Math.random() * quotes.length);
	const quote = quotes[randomIndex];
	client.logger.info(`Quote cambiada a: ${quote}`);
	client.user?.setActivity(quote, { type: ActivityType.Custom });
	return;
}

export async function rollQuote(minutes: number, client: SapphireClient) {
	minutes = minutes * 60 * 1000;
	getRandomQuote(client);
	setInterval(() => {
		getRandomQuote(client);
	}, minutes);
}

export async function deleteAllFilesInSongsFolder(client: SapphireClient) {
	const songsFolder = path.join("./songs");
	try {
		const files = await readdir(songsFolder);
		const deletePromises = files.map((file) => unlink(path.join(songsFolder, file)));
		await Promise.all(deletePromises);
		client.logger.info("All files in the songs folder have been deleted.");
	} catch (error) {
		client.logger.error("Error deleting files in the songs folder:", error);
	}
}

export async function booruSearch(site: string, tags: string[]) {
	return Booru.search(site, tags, { limit: 1, random: true }).then((posts) => {
		if (posts.length > 0) {
			const post = posts[0];
			let rating = post.rating;

			site == "r34" ? (site = "Rule 34") : (site = "Safebooru");

			if (rating == "e") {
				rating = "explicit";
			} else if (rating == "s") {
				rating = "safe";
			} else if (rating == "q") {
				rating = "questionable";
			} else {
				rating = "unrated";
			}

			const object = {
				title: site,
				url: post.postView,
				image: post.fileUrl,
				tags: `Tags: ${post.tags.join(", ")}`,
				rating: rating,
			};

			return object;
		} else {
			console.log("No posts found");
			return "no posts found";
		}
	});
}
