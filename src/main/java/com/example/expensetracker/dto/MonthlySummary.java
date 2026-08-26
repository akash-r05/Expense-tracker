package com.example.expensetracker.dto;

import java.math.BigDecimal;
import java.util.List;

public class MonthlySummary {

    private String month;
    private BigDecimal totalExpenses;
    private BigDecimal totalBudget;
    private List<CategoryTotal> categoryTotals;
    private List<BudgetAlert> budgetAlerts;

    public MonthlySummary(
            String month,
            BigDecimal totalExpenses,
            BigDecimal totalBudget,
            List<CategoryTotal> categoryTotals,
            List<BudgetAlert> budgetAlerts) {

        this.month = month;
        this.totalExpenses = totalExpenses;
        this.totalBudget = totalBudget;
        this.categoryTotals = categoryTotals;
        this.budgetAlerts = budgetAlerts;
    }

    public String getMonth() {
        return month;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public BigDecimal getTotalBudget() {
        return totalBudget;
    }

    public List<CategoryTotal> getCategoryTotals() {
        return categoryTotals;
    }

    public List<BudgetAlert> getBudgetAlerts() {
        return budgetAlerts;
    }

    // ==========================================
    // CATEGORY TOTAL
    // ==========================================

    public static class CategoryTotal {

        private String categoryName;
        private BigDecimal amount;
        private BigDecimal budgetLimit;
        private Integer alertThreshold;

        public CategoryTotal(
                String categoryName,
                BigDecimal amount,
                BigDecimal budgetLimit,
                Integer alertThreshold) {

            this.categoryName = categoryName;
            this.amount = amount;
            this.budgetLimit = budgetLimit;
            this.alertThreshold = alertThreshold;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public BigDecimal getBudgetLimit() {
            return budgetLimit;
        }

        public Integer getAlertThreshold() {
            return alertThreshold;
        }
    }

    // ==========================================
    // BUDGET ALERT
    // ==========================================

    public static class BudgetAlert {

        private String categoryName;
        private BigDecimal amount;
        private BigDecimal budgetLimit;
        private Integer alertThreshold;

        private boolean alertTriggered;
        private boolean exceeded;

        private BigDecimal percentageUsed;

        public BudgetAlert(
                String categoryName,
                BigDecimal amount,
                BigDecimal budgetLimit,
                Integer alertThreshold,
                boolean alertTriggered,
                boolean exceeded,
                BigDecimal percentageUsed) {

            this.categoryName = categoryName;
            this.amount = amount;
            this.budgetLimit = budgetLimit;
            this.alertThreshold = alertThreshold;
            this.alertTriggered = alertTriggered;
            this.exceeded = exceeded;
            this.percentageUsed = percentageUsed;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public BigDecimal getBudgetLimit() {
            return budgetLimit;
        }

        public Integer getAlertThreshold() {
            return alertThreshold;
        }

        public boolean isAlertTriggered() {
            return alertTriggered;
        }

        public boolean isExceeded() {
            return exceeded;
        }

        public BigDecimal getPercentageUsed() {
            return percentageUsed;
        }
    }
}