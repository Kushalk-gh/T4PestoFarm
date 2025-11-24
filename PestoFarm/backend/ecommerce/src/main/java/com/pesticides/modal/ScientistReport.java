package com.pesticides.modal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScientistReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "scientist_id")
    private Scientist scientist;

    private Long totalConsultations = 0L;
    private Long totalMessages = 0L;
    private Long totalActiveChats = 0L;
    private Long totalCompletedChats = 0L;
}
