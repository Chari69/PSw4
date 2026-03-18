import { container } from "@sapphire/framework";
import { TextChannel } from "discord.js";
import { createAudioResource, createAudioPlayer, AudioPlayerStatus, joinVoiceChannel, DiscordGatewayAdapterCreator, VoiceConnection, VoiceConnectionStatus, StreamType, entersState } from "@discordjs/voice";
import prism from "prism-media";
import { ChildProcess, spawn } from "child_process";

import * as Utils from "./utils";
import * as YT from "./yt";

let queue: { id: number; url: string; title: string | null; duration: number }[] = [];

const activeConnections = new Map<string, VoiceConnection>();

let songID: number = 0;
let totalTime: number = 0;

let currentProcess: ChildProcess | null = null;

let currentlyPlaying: boolean = false;
let destroy: boolean = false;
let skipDestroy: boolean = false;

const player = createAudioPlayer();

async function executeYtDlp(args: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		const process = spawn("yt-dlp", args);
		let stdout = "";
		let stderr = "";

		process.stdout.on("data", (data) => {
			stdout += data.toString();
		});

		process.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		process.on("close", (code) => {
			if (code === 0) {
				resolve(stdout.trim());
			} else {
				reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
			}
		});

		process.on("error", (err) => {
			reject(err);
		});
	});
}

/**
 * Get the video title
 */
async function getVideoTitle(url: string): Promise<string> {
	try {
		return await executeYtDlp(["--cookies", "./enc/cookies.txt", "--print", "title", url]);
	} catch (error) {
		console.error("Error al obtener título:", error);
		throw new Error("Error al obtener título");
	}
}

/**
 * Get the video duration
 * @param url video url
 * @returns video duration in HH:MM:SS format
 * @example 3:40 or 10:03:40
 */
async function getVideoSeconds(url: string): Promise<string> {
	try {
		return await executeYtDlp(["--cookies", "./enc/cookies.txt", "--print", "duration_string", url]);
	} catch (error) {
		console.error("Error al obtener duración:", error);
		throw new Error("Error al obtener duración");
	}
}

export async function addToQueue(url: string, title: string | null = null, duration: string | null = null): Promise<string> {
	songID++;

	if (duration === null) {
		duration = await getVideoSeconds(url);
	}

	if (title === null) {
		title = await getVideoTitle(url);
	}

	totalTime += Utils.timeToSeconds(duration);
	queue.push({ id: songID, url, title, duration: Utils.timeToSeconds(duration) });

	return "Cancion añadida a la cola. " + title;
}

export async function playlistAddToQueue(playlistID: string, voiceID: string, guildID: string, gateway: DiscordGatewayAdapterCreator, channelId: string) {
	let playlistVideos: { title: string, url: string, duration: string }[] = [];

	try {
		playlistVideos = await YT.getAllPlaylistVideos(playlistID);
	} catch (error) {
		console.error("Error al obtener la playlist:", error);
		return "Error al obtener la playlist.";
	}

	playlistVideos = playlistVideos.filter((video) => video.title !== "Private video" && video.title !== "Deleted video");

	console.log(`Total videos to process: ${playlistVideos.length}`);

	playlistVideos.map(async (video) => {
		await addToQueue(video.url, video.title, video.duration);
	})

	if (!currentlyPlaying) {
		await play(voiceID, guildID, gateway, channelId);
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

function killCurrentProcess() {
	if (currentProcess) {
		try { currentProcess.kill(); } catch (e) {}
		currentProcess = null;
	}
}

function destroySong() {
	if (queue.length === 0) {
		console.log("No hay canciones en la cola.");
		return;
	}

	const song = queue.shift();
	if (!song) return;

	totalTime -= song.duration;
	console.log("Canción eliminada." + " Canción: " + song.title);
}

export function skipSong() {
	if (queue.length === 0 || queue.length === 1) {
		return queue.length === 0 ? "No hay canciones en la cola." : "Esta reproduciendose la ultima cancion. No hay más canciones en la cola.";
	}

	queue.shift();
	skipDestroy = true;
	killCurrentProcess();
	player.stop(true);

	return `**Canción saltada:** ${queue[0].title}`;
}

export function shuffle() {
	queue = Utils.shuffArrNoFI(queue);
	return "Cola de canciones mezclada.";
}

export async function join(voiceID: string, guildID: string, gateway: DiscordGatewayAdapterCreator, mode: "play" | "join" = "play"): Promise<VoiceConnection> {
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
	
	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 20e3);
		return connection;
	} catch (error) {
		console.error("No se pudo conectar al canal de voz a tiempo.", error);
		cleanupConnection(guildID);
		throw error;
	}
}

export function cleanupConnection(guildID: string) {
	const connection = activeConnections.get(guildID);
	if (connection) {
		try {
			connection.removeAllListeners();
			connection.destroy();
			player.stop(true);
			killCurrentProcess();
		} catch (error) {
			console.log("[ERROR] Ha ocurrido un error.");
		}
		activeConnections.delete(guildID);
		currentlyPlaying = false;
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

		killCurrentProcess();

		destroy = false;
	}

	if (queue.length === 0) {
		currentlyPlaying = false;
		cleanupConnection(guildID);
		return "No hay canciones en la cola.";
	}

	if (!currentlyPlaying) {
		currentlyPlaying = true;

		if (channelId !== "") {
			const sendMessage = `Reproduciendo: **${queue[0].title}**\nDuracion: ${Utils.formatSeconds(queue[0].duration)}`;
			const channel: TextChannel = container.client.channels.cache.get(channelId) as TextChannel;
			await channel.send(sendMessage);
		}

		currentProcess = spawn("yt-dlp", [
			queue[0].url,
			"-o", "-",
			"-f", "bestaudio/best",
			"--limit-rate", "1M",
			"--cookies", "./enc/cookies.txt"
		], { stdio: ["ignore", "pipe", "ignore"] });

		if (!currentProcess.stdout) {
			console.error("No stdout from yt-dlp process.");
			skipSong();
			return;
		}

		const ffmpeg = new prism.FFmpeg({
			args: [
				'-analyzeduration', '0',
				'-loglevel', '0',
				'-acodec', 'libopus',
				'-f', 'opus',
				'-ar', '48000',
				'-ac', '2'
			]
		});
		
		const stream = currentProcess.stdout.pipe(ffmpeg).pipe(new prism.opus.OggDemuxer());
		
		const resource = createAudioResource(stream, { inputType: StreamType.Opus, inlineVolume: false });
		player.play(resource);

		try {
			await join(voiceID, guildID, gateway);
		} catch (error) {
			currentlyPlaying = false;
			return "Error al intentar unirse al canal de voz.";
		}

		player.on(AudioPlayerStatus.Playing, () => {
			console.log("Reproduciendo...");
		});

		player.on(AudioPlayerStatus.Idle, () => {
			currentlyPlaying = false;
			destroy = true;
			play(voiceID, guildID, gateway, channelId);
		});
		
		player.on('error', (error) => {
			console.error("Player Error:", error);
			killCurrentProcess();
			skipSong();
		});
	}

	return;
}
