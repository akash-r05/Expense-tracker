package com.example.expensetracker.controller;

import com.example.expensetracker.dto.ExpenseRequest;
import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.service.ExpenseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    // CREATE EXPENSE
    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @RequestBody ExpenseRequest request,
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                expenseService.createExpense(request, userEmail)
        );
    }

    // UPDATE EXPENSE
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @RequestBody ExpenseRequest request,
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                expenseService.updateExpense(id, request, userEmail)
        );
    }

    // DELETE EXPENSE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExpense(
            @PathVariable Long id,
            @RequestParam String userEmail) {

        expenseService.deleteExpense(id, userEmail);

        return ResponseEntity.ok(
                "Expense deleted successfully"
        );
    }

    // GET EXPENSE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(
            @PathVariable Long id,
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                expenseService.getExpenseById(id, userEmail)
        );
    }

    // GET ALL USER EXPENSES
    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getUserExpenses(
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                expenseService.getUserExpenses(userEmail)
        );
    }

    // GET EXPENSES BY DATE RANGE
    @GetMapping("/date-range")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByDateRange(
            @RequestParam LocalDate start,
            @RequestParam LocalDate end,
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                expenseService.getExpensesByDateRange(
                        start,
                        end,
                        userEmail
                )
        );
    }
}