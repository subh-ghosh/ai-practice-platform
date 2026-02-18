package com.practice.aiplatform.studyplan;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class YouTubeService {

    private final WebClient webClient;
    private final String apiKey;
    private final ObjectMapper objectMapper;

    public YouTubeService(@Qualifier("youtubeWebClient") WebClient webClient,
            @Value("${youtube.api.key}") String apiKey,
            ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
    }

    /**
     * Search YouTube for educational videos on a given topic.
     * Returns a list of video metadata maps.
     */
    public List<Map<String, String>> searchVideos(String query, int maxResults) {
        try {
            // Step 1: Search for videos
            String searchResponse = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("part", "snippet")
                            .queryParam("q", query + " tutorial educational")
                            .queryParam("type", "video")
                            .queryParam("videoDuration", "medium") // 4-20 min videos
                            .queryParam("relevanceLanguage", "en")
                            .queryParam("order", "relevance")
                            .queryParam("maxResults", maxResults)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode searchRoot = objectMapper.readTree(searchResponse);
            JsonNode items = searchRoot.path("items");

            if (!items.isArray() || items.isEmpty()) {
                System.err.println("YouTube: No results for query: " + query);
                return List.of();
            }

            // Collect video IDs for duration lookup
            List<String> videoIds = new ArrayList<>();
            for (JsonNode item : items) {
                videoIds.add(item.path("id").path("videoId").asText());
            }

            return fetchVideoDetails(videoIds);

        } catch (Exception e) {
            System.err.println("YouTube API Error (searchVideos): " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * Search for playlists on a given topic.
     */
    public List<Map<String, String>> searchPlaylists(String query, int maxResults) {
        try {
            String searchResponse = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("part", "snippet")
                            .queryParam("q", query + " full course")
                            .queryParam("type", "playlist")
                            .queryParam("maxResults", maxResults)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode searchRoot = objectMapper.readTree(searchResponse);
            JsonNode items = searchRoot.path("items");

            List<Map<String, String>> playlists = new ArrayList<>();
            for (JsonNode item : items) {
                playlists.add(Map.of(
                        "playlistId", item.path("id").path("playlistId").asText(),
                        "title", item.path("snippet").path("title").asText()));
            }
            return playlists;
        } catch (Exception e) {
            System.err.println("YouTube API Error (searchPlaylists): " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Get videos from a specific playlist.
     */
    public List<Map<String, String>> getPlaylistItems(String playlistId, int maxResults) {
        try {
            String response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/playlistItems")
                            .queryParam("part", "snippet,contentDetails")
                            .queryParam("playlistId", playlistId)
                            .queryParam("maxResults", maxResults)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.path("items");

            List<String> videoIds = new ArrayList<>();
            for (JsonNode item : items) {
                videoIds.add(item.path("contentDetails").path("videoId").asText());
            }

            return fetchVideoDetails(videoIds);
        } catch (Exception e) {
            System.err.println("YouTube API Error (getPlaylistItems): " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Helper to fetch full video details (duration, channel, etc.) for a list of
     * video IDs.
     */
    private List<Map<String, String>> fetchVideoDetails(List<String> videoIds) {
        if (videoIds.isEmpty())
            return List.of();
        try {
            String videoIdsStr = String.join(",", videoIds);
            String detailsResponse = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/videos")
                            .queryParam("part", "contentDetails,snippet")
                            .queryParam("id", videoIdsStr)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode detailsRoot = objectMapper.readTree(detailsResponse);
            JsonNode detailItems = detailsRoot.path("items");

            List<Map<String, String>> videos = new ArrayList<>();
            for (JsonNode video : detailItems) {
                String videoId = video.path("id").asText();
                JsonNode snippet = video.path("snippet");
                String duration = video.path("contentDetails").path("duration").asText();

                videos.add(Map.of(
                        "videoId", videoId,
                        "title", snippet.path("title").asText(),
                        "channelTitle", snippet.path("channelTitle").asText(),
                        "thumbnailUrl", snippet.path("thumbnails").path("high").path("url").asText(
                                snippet.path("thumbnails").path("default").path("url").asText("")),
                        "description", snippet.path("description").asText(""),
                        "duration", duration));
            }
            return videos;
        } catch (Exception e) {
            System.err.println("YouTube API Error (fetchVideoDetails): " + e.getMessage());
            return List.of();
        }
    }
}
