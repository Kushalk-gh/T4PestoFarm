package com.pesticides.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pesticides.modal.ScientistReport;

public interface ScientistReportRepository extends JpaRepository<ScientistReport, Long> {

    ScientistReport findByScientistId(Long scientistId);
}
