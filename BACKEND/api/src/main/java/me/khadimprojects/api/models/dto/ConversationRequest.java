package me.khadimprojects.api.models.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record ConversationRequest(
        String conversationId,

        @NotNull(message = "There is no content")
        String content
) {}