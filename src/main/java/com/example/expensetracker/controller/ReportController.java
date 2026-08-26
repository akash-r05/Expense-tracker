package com.example.expensetracker.controller;

import com.example.expensetracker.dto.MonthlySummary;
import com.example.expensetracker.service.ReportService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // GET MONTHLY SUMMARY
    @GetMapping("/monthly")
    public ResponseEntity<MonthlySummary> getMonthlySummary(
            @RequestParam String yearMonth,
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                reportService.getMonthlySummary(
                        yearMonth,
                        userEmail
                )
        );
    }

    // GET YEARLY SUMMARY
    @GetMapping("/yearly")
    public ResponseEntity<List<MonthlySummary>> getYearlySummary(
            @RequestParam int year,
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                reportService.getYearlySummary(
                        year,
                        userEmail
                )
        );
    }
}