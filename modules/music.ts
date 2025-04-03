import { container } from "@sapphire/framework";
import { TextChannel } from "discord.js";
import { createAudioResource, createAudioPlayer, AudioPlayerStatus, joinVoiceChannel, DiscordGatewayAdapterCreator, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { unlinkSync } from "fs";

import * as ytdl from "youtube-dl-exec";

import * as Utils from "./utils";
import * as YT from "./yt";

ytdl.create("yt-dlp");

let queue: { id: number; url: string; title: string | null; duration: number; path: string }[] = [];
// let playlistVideos: { title: string; url: string }[] = [];

const activeConnections = new Map<string, VoiceConnection>();

let songID: number = 0;
let totalTime: number = 0;

const songPath: string = "./songs/";

let currentlyPlaying: boolean = false;
let destroy: boolean = false;
let skipDestroy: boolean = false;

const player = createAudioPlayer();

/**
 * Get the video title
 */
async function getVideoTitle(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		ytdl
			.youtubeDl(url, {
				getTitle: true,
				simulate: true,
			})
			.then((info) => {
				resolve(info.toString().trim());
			})
			.catch((error) => {
				console.error("Error al obtener título:", error);
				reject(new Error("Error al obtener título"));
			});
	});
}

/**
 * Get the video duration
 * @param url video url
 * @returns video duration in HH:MM:SS format
 * @example 3:40 or 10:03:40
 */
async function getVideoSeconds(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		ytdl
			.youtubeDl(url, {
				getDuration: true,
				simulate: true,
			})
			.then((info) => {
				resolve(info.toString().trim());
			})
			.catch((error) => {
				console.error("Error al obtener duración:", error);
				reject(new Error("Error al obtener duración"));
			});
	});
}

/**
 * Download a song from youtube using yt-dlp
 * @param url
 * @returns
 */
async function downloadSong(url: string): Promise<string> {
	songID++;
	return new Promise((resolve, reject) => {
		const songName: string = `song-${songID}.opus`;

		const download = ytdl
			.youtubeDl(url, {
				extractAudio: true,
				audioFormat: "opus",
				audioQuality: 0,
				keepVideo: false,
				output: songPath + songName,
			})
			.then((info) => {
				console.log("Descargando canción...");
			});

		download.catch((error) => {
			console.error("Error al descargar la canción:", error);
			reject(new Error("Error al descargar la canción"));
		});

		download.then(() => {
			console.log("Canción descargada correctamente.");
			resolve(songName);
		});
	});
}

/**
 * Add a song to the queue
 * @param url
 * @param title
 * @returns
 */
export async function addToQueue(url: string, title: string | null = null): Promise<string> {
	const song = await downloadSong(url);
	const duration = await getVideoSeconds(url);

	if (title === null) {
		title = await getVideoTitle(url);
	}

	totalTime += Utils.timeToSeconds(duration);
	queue.push({ id: songID, url, title, duration: Utils.timeToSeconds(duration), path: song });

	return "Cancion añadida a la cola. " + title;
}

export async function playlistAddToQueue(playlistID: string, voiceID: string, guildID: string, gateway: DiscordGatewayAdapterCreator, channelId: string) {
	let playlistVideos: { title: string; url: string }[] = [];

	try {
		playlistVideos = await YT.getAllPlaylistVideos(playlistID);
	} catch (error) {
		console.error("Error al obtener la playlist:", error);
		return "Error al obtener la playlist.";
	}

	playlistVideos = playlistVideos.filter((video) => video.title !== "Private video" && video.title !== "Deleted video");

	console.log(`Total videos to process: ${playlistVideos.length}`);

	for (let i = 0; i < playlistVideos.length; i += 5) {
		const batch = playlistVideos.slice(i, i + 5);

		await Promise.all(
			batch.map(async (video) => {
				console.log(`Processing: ${video.title}, URL: ${video.url}`);
				await addToQueue(video.url, video.title);
			})
		);

		// Start playing the first 5 songs if not already playing
		if (!currentlyPlaying) {
			await play(voiceID, guildID, gateway, channelId);
		}
	}

	return "Se han añadido los videos de la playlist a la cola";
}

export function getQueue(): string {
	let tempQueue = queue;

	if (queue.length === 0) {
		return "No hay canciones en la cola.";
	}

	let queueMessage: string = ``;
	queueMessage += queue
		.map((song) => {
			return `#${queue.indexOf(song) + 1} - **${song.title}** - Duracion: ${Utils.formatSeconds(song.duration)}`;
		})
		.join("\n");
	queueMessage += `\n\n**Tiempo total: ${Utils.formatSeconds(totalTime)}**`;

	return queueMessage;
}

function destroySong() {
	if (queue.length === 0) {
		console.log("No hay canciones en la cola.");
		return;
	}

	const song = queue.shift();
	if (!song) return;

	unlinkSync(songPath + song.path);

	totalTime -= song.duration;
	console.log("Canción eliminada." + " Canción: " + song.title);
}

export function skipSong() {
	if (queue.length === 0 || queue.length === 1) {
		return queue.length === 0 ? "No hay canciones en la cola." : "Esta reproduciendose la ultima cancion. No hay más canciones en la cola.";
	}

	queue.shift();
	skipDestroy = true;
	player.stop(true);

	return `**Canción saltada:** ${queue[0].title}`;
}

export function shuffle() {
	queue = Utils.shuffArrNoFI(queue);
	return "Cola de canciones mezclada.";
}

export async function join(voiceID: string, guildID: string, gateway: DiscordGatewayAdapterCreator, mode: "play" | "join" = "play") {
	const existingConnection = activeConnections.get(guildID);
	if (existingConnection) {
		cleanupConnection(guildID);
	}

	const connection = joinVoiceChannel({
		channelId: voiceID,
		guildId: guildID,
		adapterCreator: gateway,
	});

	connection.on("error", (error) => {
		console.error(`Voice connection error in guild ${guildID}:`, error);
		cleanupConnection(guildID);
	});

	connection.on("stateChange", (oldState, newState) => {
		if (newState.status === VoiceConnectionStatus.Disconnected) {
			cleanupConnection(guildID);
		}
	});

	activeConnections.set(guildID, connection);
	connection.subscribe(player);

	if (mode === "join") {
		play(voiceID, guildID, gateway);
	}
}

export function cleanupConnection(guildID: string) {
	const connection = activeConnections.get(guildID);
	if (connection) {
		try {
			connection.removeAllListeners();
			connection.destroy();
		} catch (error) {
			console.log("[ERROR] Ha ocurrido un error.");
		}
		activeConnections.delete(guildID);
	}
}

export function getActiveConnection(guildID: string): VoiceConnection | undefined {
	return activeConnections.get(guildID);
}

export async function play(voiceID: string, guildID: string, gateway: DiscordGatewayAdapterCreator, channelId: string = "") {
	// Fix weird bug where deletes all songs??????

	if (destroy === true) {
		player.removeAllListeners();

		if (skipDestroy === true) {
			skipDestroy = false;
		} else {
			destroySong();
		}

		destroy = false;
	}

	if (queue.length === 0) {
		currentlyPlaying = false;
		cleanupConnection(guildID);
		return "No hay canciones en la cola.";
	}

	if (!currentlyPlaying) {
		join(voiceID, guildID, gateway);

		currentlyPlaying = true;

		if (channelId !== "") {
			const sendMessage = `Reproduciendo: **${queue[0].title}**\nDuracion: ${Utils.formatSeconds(queue[0].duration)}`;
			const channel: TextChannel = container.client.channels.cache.get(channelId) as TextChannel;
			await channel.send(sendMessage);
		}

		const resource = createAudioResource(songPath + queue[0].path);
		player.play(resource);

		player.on(AudioPlayerStatus.Playing, () => {
			console.log("Reproduciendo...");
		});

		player.on(AudioPlayerStatus.Idle, () => {
			currentlyPlaying = false;
			destroy = true;
			play(voiceID, guildID, gateway, channelId);
		});
	}

	return;
}
