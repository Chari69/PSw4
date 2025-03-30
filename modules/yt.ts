import "dotenv/config";
import { google } from "googleapis";

const apiKey = process.env.YOUTUBE_API_KEY;
const youtube = google.youtube({ version: "v3" });

/**
 * Fetches the first video link from YouTube based on a search query.
 * @param searchQuery - The search query to find the video link.
 * @returns The first video link found or an error message.
 * @example const video = await getFirstVideoLink("TypeScript tutorial");
 */
export async function getFirstVideoLink(searchQuery: string): Promise<string> {
	try {
		const response = await youtube.search.list({
			auth: apiKey,
			part: ["snippet"],
			q: searchQuery,
			type: ["video"],
			maxResults: 1,
		});

		if (!response.data.items || response.data.items.length === 0) {
			return "No se han encontrado resultados";
		}

		const videoId = response.data.items[0].id?.videoId;
		return `https://www.youtube.com/watch?v=${videoId}`;
	} catch (error) {
		if (error instanceof Error) {
			console.error("YouTube API Error:", error.message);
		}
		return "Error al buscar el video";
	}
}

export async function getAllPlaylistVideos(playlistId: string) {
	const videos: { title: string; url: string }[] = [];
	let nextPageToken: string | undefined = undefined;

	try {
		do {
			const response = await youtube.playlistItems.list({
				auth: apiKey,
				part: ["snippet"],
				playlistId,
				maxResults: 50,
				pageToken: nextPageToken,
			});

			const items = response.data.items || [];

			items.forEach((item: any) => {
				if (item.snippet && item.snippet.resourceId) {
					videos.push({
						title: item.snippet.title || "Untitled",
						url: `https://youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
					});
				}
			});

			nextPageToken = response.data.nextPageToken;
		} while (nextPageToken);

		return videos;
	} catch (error) {
		console.error("Error fetching playlist:", error);
		return [];
	}
}
