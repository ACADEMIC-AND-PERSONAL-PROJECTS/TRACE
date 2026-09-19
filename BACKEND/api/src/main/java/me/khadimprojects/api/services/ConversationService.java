package me.khadimprojects.api.services;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.model.openaiofficial.OpenAiOfficialChatModel;
import lombok.RequiredArgsConstructor;
import me.khadimprojects.api.models.dto.ConversationRequest;
import me.khadimprojects.api.models.dto.ConversationResponse;
import me.khadimprojects.api.models.entities.Conversation;
import me.khadimprojects.api.models.entities.Message;
import me.khadimprojects.api.models.entities.Role;
import me.khadimprojects.api.repositories.ConversationRepository;
import me.khadimprojects.api.repositories.MessageRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationService {

    // Dependancies injected
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final OpenAiOfficialChatModel chatModel;

    // Max context limit
    private static final int MAX_MESSAGES = 30;

    // chat management
    public ConversationResponse chat(String content, String conversationId) {

        // global id
        String globalConversationId = null;

        // Create a conversation
        if (conversationId == null || conversationId.isEmpty()) {

            // Generate a new conversation id
            String id = generateConversationId();

            Conversation conversation = Conversation.builder()
                    .id(id)
                    .messages(null)
                    .build();

            Message message = Message.builder()
                    .conversation(conversation)
                    .content(content)
                    .role(Role.USER)
                    .build();

            conversation.setMessages(List.of(message));

            // Create the conversation in the database
            Conversation sevedConversation = conversationRepository.save(conversation);

            globalConversationId = id;

        } else {
            // Save the message if the conversation id already exist
            Conversation existingConversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found"));
            messageRepository.save(Message.builder()
                            .conversation(existingConversation)
                            .role(Role.USER)
                            .content(content)
                    .build());
        }

        // Determine the ID of the conversation
        globalConversationId = globalConversationId != null ? globalConversationId : conversationId;

        // Retrieve history
        List<Message> history = messageRepository.findAllByConversation_Id(
                globalConversationId, PageRequest.of(0, MAX_MESSAGES, Sort.by(Sort.Direction.DESC, "id"))
        ).reversed();

        // Convert into a ChatMessage
        List<ChatMessage> context = history.stream().map(message -> {
            if (message.getRole().equals(Role.USER)) return UserMessage.from(message.getContent());
            return AiMessage.from(message.getContent());
        }).toList();

        // Send To LLM
        AiMessage aiMessage = chatModel.chat(context).aiMessage();

        // Save that response into the database
        Conversation currentConversation = conversationRepository.findById(globalConversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        messageRepository.save(Message.builder()
                .role(Role.AGENT)
                .conversation(currentConversation)
                .content(aiMessage.text())
                .build()
        );

        // Return the response
        return toConversationResponse(aiMessage.text(), globalConversationId);

    }

    // Generate a conversationId
    private String generateConversationId() {
        return UUID.randomUUID().toString();
    }

    // Parse the response into a conversation reponse dto
    private ConversationResponse toConversationResponse(String response, String id) {
        return ConversationResponse.builder()
                .aiResponse(response)
                .conversationId(id)
                .build();
    }

}