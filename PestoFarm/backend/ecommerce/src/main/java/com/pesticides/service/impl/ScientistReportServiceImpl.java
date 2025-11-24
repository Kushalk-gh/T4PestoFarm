package com.pesticides.service.impl;

import org.springframework.stereotype.Service;

import com.pesticides.modal.Scientist;
import com.pesticides.modal.ScientistReport;
import com.pesticides.repository.ScientistReportRepository;
import com.pesticides.service.ScientistReportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScientistReportServiceImpl implements ScientistReportService {

    private final ScientistReportRepository scientistReportRepository;

    @Override
    public ScientistReport getScientistReport(Scientist scientist) {
        ScientistReport sr = scientistReportRepository.findByScientistId(scientist.getId());

        if(sr == null) {
            ScientistReport newReport = new ScientistReport();
            newReport.setScientist(scientist);
            return scientistReportRepository.save(newReport);
        }
        return sr;
    }

    @Override
    public ScientistReport updateScientistReport(ScientistReport scientistReport) {
        return scientistReportRepository.save(scientistReport);
    }

}
