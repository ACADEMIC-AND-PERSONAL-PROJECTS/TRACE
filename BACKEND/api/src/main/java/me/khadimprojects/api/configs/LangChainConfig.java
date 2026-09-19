package me.khadimprojects.api.configs;

import dev.langchain4j.model.openaiofficial.OpenAiOfficialChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class LangChainConfig {

    @Value("${provider.model.endpoint}")
    private String endpoint;

    @Value("${provider.model.api-key}")
    private String apiKey;

    @Value("${provider.model.model-name}")
    private String modelName;

    @Bean
    public OpenAiOfficialChatModel openAiOfficialChatModel() {
        return OpenAiOfficialChatModel.builder()
                .baseUrl(endpoint)
                .apiKey(apiKey)
                .modelName(modelName)
                .timeout(Duration.ofMinutes(5))
                .maxRetries(3)
                .build();
    }

}