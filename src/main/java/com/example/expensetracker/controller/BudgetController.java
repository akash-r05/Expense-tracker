package com.example.expensetracker.controller;

import com.example.expensetracker.entity.Budget;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.exception.DuplicateResourceException;
import com.example.expensetracker.exception.ResourceNotFoundException;
import com.example.expensetracker.service.BudgetAlertService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BudgetAlertService budgetAlertService;


    // ===============================
    // CREATE BUDGET
    // ===============================
    @PostMapping
    public ResponseEntity<Budget> createBudget(
            @RequestParam Long categoryId,
            @RequestParam String userEmail,
            @RequestBody Budget budget) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        }


        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found"
                        )
                );


        // Prevent duplicate budget
        if (budgetRepository
                .findByUserAndCategoryId(user, categoryId)
                .isPresent()) {

            throw new DuplicateResourceException(
                    "A budget already exists for this category"
            );
        }


        // Validate budget amount
        if (budget.getLimitAmount() == null ||
                budget.getLimitAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Budget amount must be greater than zero"
            );
        }


        // Validate alert threshold
        if (budget.getAlertThreshold() == null ||
                budget.getAlertThreshold() < 1 ||
                budget.getAlertThreshold() > 100) {

            throw new IllegalArgumentException(
                    "Alert threshold must be between 1 and 100"
            );
        }


        // Set user and category
        budget.setUser(user);
        budget.setCategory(category);


        // Save budget
        Budget savedBudget =
                budgetRepository.save(budget);


        return ResponseEntity.ok(savedBudget);
    }


    // ===============================
    // GET ALL USER BUDGETS
    // ===============================
    @GetMapping
    public ResponseEntity<List<Budget>> getUserBudgets(
            @RequestParam String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        }

        return ResponseEntity.ok(
                budgetRepository.findByUserId(user.getId())
        );
    }


    // ===============================
    // GET BUDGET BY ID
    // ===============================
    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(
            @PathVariable Long id,
            @RequestParam String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        }


        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Budget not found"
                        )
                );


        // Check ownership
        if (!budget.getUser().getId()
                .equals(user.getId())) {

            throw new IllegalAccessError(
                    "You don't have permission to view this budget"
            );
        }


        return ResponseEntity.ok(budget);
    }


    // ===============================
    // DELETE BUDGET
    // ===============================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBudget(
            @PathVariable Long id,
            @RequestParam String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        }


        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Budget not found"
                        )
                );


        // Check ownership
        if (!budget.getUser().getId()
                .equals(user.getId())) {

            throw new IllegalAccessError(
                    "You don't have permission to delete this budget"
            );
        }


        budgetRepository.delete(budget);


        return ResponseEntity.ok(
                "Budget deleted successfully"
        );
    }

    // ===============================
// UPDATE BUDGET
// ===============================
@PutMapping("/{id}")
public ResponseEntity<Budget> updateBudget(
        @PathVariable Long id,
        @RequestParam String userEmail,
        @RequestBody Budget updatedBudget) {

    User user = userRepository.findByEmail(userEmail);

    if (user == null) {
        throw new ResourceNotFoundException(
                "User not found"
        );
    }

    Budget existingBudget = budgetRepository.findById(id)
            .orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Budget not found"
                    )
            );

    // Check ownership
    if (!existingBudget.getUser().getId()
            .equals(user.getId())) {

        throw new IllegalAccessError(
                "You don't have permission to update this budget"
        );
    }

    // Validate budget amount
    if (updatedBudget.getLimitAmount() == null ||
            updatedBudget.getLimitAmount()
                    .compareTo(BigDecimal.ZERO) <= 0) {

        throw new IllegalArgumentException(
                "Budget amount must be greater than zero"
        );
    }

    // Validate alert threshold
    if (updatedBudget.getAlertThreshold() == null ||
            updatedBudget.getAlertThreshold() < 1 ||
            updatedBudget.getAlertThreshold() > 100) {

        throw new IllegalArgumentException(
                "Alert threshold must be between 1 and 100"
        );
    }

    // Update allowed fields
    existingBudget.setLimitAmount(
            updatedBudget.getLimitAmount()
    );

    existingBudget.setAlertThreshold(
            updatedBudget.getAlertThreshold()
    );

    existingBudget.setAlertEnabled(
            updatedBudget.getAlertEnabled()
    );

    Budget savedBudget =
            budgetRepository.save(existingBudget);

    return ResponseEntity.ok(savedBudget);
}


    // ===============================
    // CHECK BUDGET ALERTS
    // ===============================
    @PostMapping("/check-alerts")
    public ResponseEntity<String> checkBudgetAlerts(
            @RequestParam String userEmail) {

        budgetAlertService.checkBudgetAlerts(userEmail);

        return ResponseEntity.ok(
                "Budget alerts checked successfully"
        );
    }
}