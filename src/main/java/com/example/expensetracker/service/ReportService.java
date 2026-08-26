package com.example.expensetracker.service;

import com.example.expensetracker.dto.MonthlySummary;
import com.example.expensetracker.entity.Budget;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.ResourceNotFoundException;
import com.example.expensetracker.repository.BudgetRepository;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@Transactional(readOnly = true)
public class ReportService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;


    // ==========================================
    // MONTHLY SUMMARY
    // ==========================================

    public MonthlySummary getMonthlySummary(
            String yearMonth,
            String userEmail) {

        log.info(
                "Generating monthly summary for: {} - User: {}",
                yearMonth,
                userEmail
        );


        // ==========================================
        // FIND USER
        // ==========================================

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }


        // ==========================================
        // CONVERT YEAR-MONTH
        // ==========================================

        YearMonth ym = YearMonth.parse(yearMonth);

        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.plusMonths(1).atDay(1);


        log.info(
                "Report date range: {} to {}",
                startDate,
                endDate
        );


        // ==========================================
        // GET MONTHLY EXPENSES
        // ==========================================

        List<Expense> expenses =
                expenseRepository.findByUserIdAndExpenseDateBetween(
                        user.getId(),
                        startDate,
                        endDate.minusDays(1)
                );


        log.info(
                "Found {} expenses for report",
                expenses.size()
        );


        // ==========================================
        // GET ALL USER BUDGETS
        // ==========================================

        List<Budget> budgets =
                budgetRepository.findByUserId(user.getId());


        log.info(
                "Found {} budgets for report",
                budgets.size()
        );


        // ==========================================
        // TOTAL EXPENSES
        // ==========================================

        BigDecimal totalExpenses =
                expenses.stream()
                        .map(Expense::getAmount)
                        .filter(amount -> amount != null)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        // ==========================================
        // TOTAL BUDGET
        // ==========================================

        BigDecimal totalBudget =
                budgets.stream()
                        .map(Budget::getLimitAmount)
                        .filter(amount -> amount != null)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        // ==========================================
        // CATEGORY EXPENSE MAP
        // ==========================================

        Map<Long, BigDecimal> categoryExpenseMap =
                new LinkedHashMap<>();

        Map<Long, String> categoryNameMap =
                new LinkedHashMap<>();


        for (Expense expense : expenses) {

            if (expense.getCategory() == null) {
                continue;
            }

            Long categoryId =
                    expense.getCategory().getId();

            String categoryName =
                    expense.getCategory().getName();

            BigDecimal amount =
                    expense.getAmount() != null
                            ? expense.getAmount()
                            : BigDecimal.ZERO;


            categoryNameMap.put(
                    categoryId,
                    categoryName
            );


            categoryExpenseMap.merge(
                    categoryId,
                    amount,
                    BigDecimal::add
            );
        }


        // ==========================================
        // CATEGORY BUDGET MAP
        // ==========================================

        Map<Long, Budget> categoryBudgetMap =
                new LinkedHashMap<>();


        for (Budget budget : budgets) {

            if (budget.getCategory() == null) {
                continue;
            }

            Long categoryId =
                    budget.getCategory().getId();


            categoryBudgetMap.put(
                    categoryId,
                    budget
            );


            categoryNameMap.putIfAbsent(
                    categoryId,
                    budget.getCategory().getName()
            );
        }


        // ==========================================
        // COMBINE EXPENSE + BUDGET CATEGORIES
        // ==========================================

        Map<Long, Boolean> categoryIds =
                new LinkedHashMap<>();


        for (Long categoryId :
                categoryExpenseMap.keySet()) {

            categoryIds.put(
                    categoryId,
                    true
            );
        }


        for (Long categoryId :
                categoryBudgetMap.keySet()) {

            categoryIds.put(
                    categoryId,
                    true
            );
        }


        // ==========================================
        // CREATE CATEGORY TOTALS
        // ==========================================

        List<MonthlySummary.CategoryTotal>
                categoryTotals =
                new ArrayList<>();


        for (Long categoryId :
                categoryIds.keySet()) {

            String categoryName =
                    categoryNameMap.get(categoryId);


            BigDecimal amount =
                    categoryExpenseMap.getOrDefault(
                            categoryId,
                            BigDecimal.ZERO
                    );


            Budget budget =
                    categoryBudgetMap.get(categoryId);


            BigDecimal budgetLimit =
                    BigDecimal.ZERO;


            Integer alertThreshold =
                    80;


            if (budget != null) {

                if (budget.getLimitAmount() != null) {

                    budgetLimit =
                            budget.getLimitAmount();

                }


                if (budget.getAlertThreshold() != null) {

                    alertThreshold =
                            budget.getAlertThreshold();

                }

            }


            categoryTotals.add(
                    new MonthlySummary.CategoryTotal(
                            categoryName,
                            amount,
                            budgetLimit,
                            alertThreshold
                    )
            );
        }


        // ==========================================
        // BUDGET ALERTS
        // ==========================================

        List<MonthlySummary.BudgetAlert>
                budgetAlerts =
                new ArrayList<>();


        for (Budget budget : budgets) {

            if (budget.getCategory() == null) {
                continue;
            }


            Long categoryId =
                    budget.getCategory().getId();


            String categoryName =
                    budget.getCategory().getName();


            BigDecimal amount =
                    categoryExpenseMap.getOrDefault(
                            categoryId,
                            BigDecimal.ZERO
                    );


            BigDecimal budgetLimit =
                    budget.getLimitAmount() != null
                            ? budget.getLimitAmount()
                            : BigDecimal.ZERO;


            Integer threshold =
                    budget.getAlertThreshold() != null
                            ? budget.getAlertThreshold()
                            : 80;


            boolean alertTriggered =
                    false;

            boolean exceeded =
                    false;


            BigDecimal percentageUsed =
                    BigDecimal.ZERO;


            // ==========================================
            // ONLY CALCULATE WHEN BUDGET > 0
            // ==========================================

            if (budgetLimit.compareTo(BigDecimal.ZERO) > 0) {

                percentageUsed =
                        amount
                                .multiply(
                                        BigDecimal.valueOf(100)
                                )
                                .divide(
                                        budgetLimit,
                                        2,
                                        RoundingMode.HALF_UP
                                );


                BigDecimal thresholdAmount =
                        budgetLimit
                                .multiply(
                                        BigDecimal.valueOf(
                                                threshold
                                        )
                                )
                                .divide(
                                        BigDecimal.valueOf(100),
                                        2,
                                        RoundingMode.HALF_UP
                                );


                alertTriggered =
                        amount.compareTo(
                                thresholdAmount
                        ) >= 0;


                exceeded =
                        amount.compareTo(
                                budgetLimit
                        ) > 0;
            }


            // ==========================================
            // RESPECT ALERT ENABLED SETTING
            // ==========================================

            if (Boolean.FALSE.equals(
                    budget.getAlertEnabled())) {

                alertTriggered = false;
            }


            // ==========================================
            // CREATE ALERT
            // ==========================================

            budgetAlerts.add(
                    new MonthlySummary.BudgetAlert(
                            categoryName,
                            amount,
                            budgetLimit,
                            threshold,
                            alertTriggered,
                            exceeded,
                            percentageUsed
                    )
            );
        }


        // ==========================================
        // RETURN MONTHLY SUMMARY
        // ==========================================

        return new MonthlySummary(
                yearMonth,
                totalExpenses,
                totalBudget,
                categoryTotals,
                budgetAlerts
        );
    }


    // ==========================================
    // YEARLY SUMMARY
    // ==========================================

    public List<MonthlySummary> getYearlySummary(
            int year,
            String userEmail) {

        log.info(
                "Generating yearly summary for: {} - User: {}",
                year,
                userEmail
        );


        return java.util.stream.IntStream
                .rangeClosed(1, 12)
                .mapToObj(
                        month ->
                                getMonthlySummary(
                                        String.format(
                                                "%d-%02d",
                                                year,
                                                month
                                        ),
                                        userEmail
                                )
                )
                .toList();
    }
}