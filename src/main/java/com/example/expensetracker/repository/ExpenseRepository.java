package com.example.expensetracker.repository;

import com.example.expensetracker.dto.MonthlySummary;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(User user);

    List<Expense> findByUserId(Long userId);

    List<Expense> findByUserAndExpenseDateBetween(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );

    List<Expense> findByUserIdAndExpenseDateBetween(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<Expense> findByUserAndCategoryId(
            User user,
            Long categoryId
    );

    // ==========================================
    // MONTHLY CATEGORY TOTALS
    // ==========================================

    @Query("""
        SELECT new com.example.expensetracker.dto.MonthlySummary$CategoryTotal(
            e.category.name,
            SUM(e.amount),
            COALESCE(b.limitAmount, 0),
            COALESCE(b.alertThreshold, 80)
        )
        FROM Expense e
        LEFT JOIN Budget b
            ON b.user.id = e.user.id
            AND b.category.id = e.category.id
        WHERE e.user.id = :userId
        AND e.expenseDate >= :startDate
        AND e.expenseDate < :endDate
        GROUP BY e.category.name, b.limitAmount, b.alertThreshold
    """)
    List<MonthlySummary.CategoryTotal> getMonthlyCategoryTotals(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}