package com.example.expensetracker.service;

import com.example.expensetracker.entity.Budget;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.exception.ResourceNotFoundException;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Slf4j
@Service
@Transactional
public class BudgetAlertService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public void checkBudgetAlerts(String userEmail) {

        log.info("Checking budget alerts for user: {}", userEmail);

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        List<Budget> budgets =
                budgetRepository.findByUserId(user.getId());

        YearMonth currentMonth = YearMonth.now();

        LocalDate startDate = currentMonth.atDay(1);
        LocalDate endDate = currentMonth.atEndOfMonth();

        List<Expense> expenses =
                expenseRepository.findByUserIdAndExpenseDateBetween(
                        user.getId(),
                        startDate,
                        endDate
                );

        for (Budget budget : budgets) {

            if (!budget.getAlertEnabled()) {
                continue;
            }

            BigDecimal spent = expenses.stream()
                    .filter(expense ->
                            expense.getCategory().getId()
                                    .equals(budget.getCategory().getId()))
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal limit = budget.getLimitAmount();

            if (limit == null || limit.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            BigDecimal percentage =
                    spent.divide(
                            limit,
                            2,
                            java.math.RoundingMode.HALF_UP
                    )
                    .multiply(BigDecimal.valueOf(100));

            if (percentage.intValue()
                    >= budget.getAlertThreshold()) {

                sendAlert(
                        user,
                        budget,
                        spent,
                        percentage
                );
            }
        }
    }

    private void sendAlert(
            User user,
            Budget budget,
            BigDecimal spent,
            BigDecimal percentage) {

        log.warn(
                "Budget alert for user: {} - Category: {} - {}% spent",
                user.getEmail(),
                budget.getCategory().getName(),
                percentage
        );

        // TODO: Implement email notification
    }
}