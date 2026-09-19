package me.khadimprojects.api.models.dto;

public record ConversationResponse(
        String aiResponse,
        String conversationId
) {}