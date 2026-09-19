package me.khadimprojects.api.services;

import lombok.RequiredArgsConstructor;
import me.khadimprojects.api.models.dto.ConversationRequest;
import me.khadimprojects.api.models.dto.ConversationResponse;
import me.khadimprojects.api.models.entities.Conversation;
import me.khadimprojects.api.models.entities.Message;
import me.khadimprojects.api.repositories.ConversationRepository;
import me.khadimprojects.api.repositories.MessageRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    // chat management
    public ConversationResponse chat(String content, String conversationId) {
        if (conversationId.isEmpty()) {
            String id = generateConversationId();
            ConversationRequest conversation = ConversationRequest.builder()
                    .conversationId(id)
                    .content(content)
                    .build();
        }
    }

    // Generate a conversationId
    private String generateConversationId() {
        return UUID.randomUUID().toString();
    }

    // Parse a conversation dto into a conversation entity
    private Conversation toConversation(ConversationRequest request) {
        Message message = Message.builder()
                .conversationId()
                .build()
    }

}