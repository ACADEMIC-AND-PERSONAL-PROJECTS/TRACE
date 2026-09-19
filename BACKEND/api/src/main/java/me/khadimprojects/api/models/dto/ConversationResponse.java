package me.khadimprojects.api.models.dto;

import lombok.Builder;

@Builder
public record ConversationResponse(
        String aiResponse,
        String conversationId
) {}