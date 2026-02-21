package com.practice.aiplatform.studyplan;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class YouTubeService {

    private final WebClient webClient;
    private final String apiKey;
    private final ObjectMapper objectMapper;

    public YouTubeService(
            @Qualifier("youtubeWebClient") WebClient webClient,
            @Value("${youtube.api.key}") String apiKey,
            ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
    }

    public List<Map<String, String>> searchVideos(String query, int maxResults) {
        try {
            String responseBody = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("part", "snippet")
                            .queryParam("q", query + " tutorial educational")
                            .queryParam("type", "video")
                            .queryParam("videoDuration", "medium")
                            .queryParam("relevanceLanguage", "en")
                            .queryParam("order", "relevance")
                            .queryParam("maxResults", maxResults)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode items = root.path("items");

            if (!items.isArray() || items.isEmpty()) {
                return List.of();
            }

            List<String> videoIds = new ArrayList<>();
            for (JsonNode item : items) {
                String videoId = item.path("id").path("videoId").asText("");
                if (!videoId.isBlank()) {
                    videoIds.add(videoId);
                }
            }

            return fetchVideoDetails(videoIds);
        } catch (Exception e) {
            System.err.println("YouTube searchVideos error: " + e.getMessage());
            return List.of();
        }
    }

    public List<Map<String, String>> searchPlaylists(String query, int maxResults) {
        try {
            String responseBody = webClient.get()
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

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode items = root.path("items");

            List<Map<String, String>> playlists = new ArrayList<>();
            if (!items.isArray()) {
                return playlists;
            }

            for (JsonNode item : items) {
                Map<String, String> playlist = new HashMap<>();
                playlist.put("playlistId", item.path("id").path("playlistId").asText(""));
                playlist.put("title", item.path("snippet").path("title").asText(""));
                playlists.add(playlist);
            }

            return playlists;
        } catch (Exception e) {
            System.err.println("YouTube searchPlaylists error: " + e.getMessage());
            return List.of();
        }
    }

    public List<Map<String, String>> getPlaylistItems(String playlistId, int maxResults) {
        try {
            String responseBody = webClient.get()
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

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode items = root.path("items");

            List<String> videoIds = new ArrayList<>();
            if (items.isArray()) {
                for (JsonNode item : items) {
                    String videoId = item.path("contentDetails").path("videoId").asText("");
                    if (!videoId.isBlank()) {
                        videoIds.add(videoId);
                    }
                }
            }

            return fetchVideoDetails(videoIds);
        } catch (Exception e) {
            System.err.println("YouTube getPlaylistItems error: " + e.getMessage());
            return List.of();
        }
    }

    private List<Map<String, String>> fetchVideoDetails(List<String> videoIds) {
        if (videoIds == null || videoIds.isEmpty()) {
            return List.of();
        }

        try {
            String ids = String.join(",", videoIds);

            String responseBody = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/videos")
                            .queryParam("part", "contentDetails,snippet")
                            .queryParam("id", ids)
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode items = root.path("items");

            List<Map<String, String>> videos = new ArrayList<>();
            if (!items.isArray()) {
                return videos;
            }

            for (JsonNode video : items) {
                String videoId = video.path("id").asText("");
                JsonNode snippet = video.path("snippet");
                String duration = video.path("contentDetails").path("duration").asText("");

                String highThumb = snippet.path("thumbnails").path("high").path("url").asText("");
                String defaultThumb = snippet.path("thumbnails").path("default").path("url").asText("");
                String thumbnailUrl = !highThumb.isBlank() ? highThumb : defaultThumb;

                Map<String, String> videoMap = new HashMap<>();
                videoMap.put("videoId", videoId);
                videoMap.put("title", snippet.path("title").asText(""));
                videoMap.put("channelTitle", snippet.path("channelTitle").asText(""));
                videoMap.put("thumbnailUrl", thumbnailUrl);
                videoMap.put("description", snippet.path("description").asText(""));
                videoMap.put("duration", duration);

                videos.add(videoMap);
            }

            return videos;
        } catch (Exception e) {
            System.err.println("YouTube fetchVideoDetails error: " + e.getMessage());
            return List.of();
        }
    }
}