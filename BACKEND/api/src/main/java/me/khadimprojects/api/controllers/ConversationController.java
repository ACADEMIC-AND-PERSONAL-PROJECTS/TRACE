package me.khadimprojects.api.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.khadimprojects.api.models.dto.ConversationRequest;
import me.khadimprojects.api.models.dto.ConversationResponse;
import me.khadimprojects.api.services.ConversationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    public ResponseEntity<ConversationResponse> chat(@RequestBody @Valid ConversationRequest request) {
        return ResponseEntity.ok(conversationService.chat(request.content(), request.conversationId()));
    }

}