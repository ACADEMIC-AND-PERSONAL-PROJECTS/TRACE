package me.khadimprojects.api.models.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "conversations")
@Data
@NoArgsConstructor
public class Conversation {
    @Id
    private String id;

    @CreationTimestamp
    private LocalDateTime timestamp;

    @OneToMany(mappedBy = "conversation")
    @JsonManagedReference
    private List<Message> messages;

}
