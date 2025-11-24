package com.pesticides.service;

import com.pesticides.modal.Scientist;
import com.pesticides.modal.ScientistReport;

public interface ScientistReportService {
    
    ScientistReport getScientistReport(Scientist scientist);
    ScientistReport updateScientistReport(ScientistReport scientistReport);
}
