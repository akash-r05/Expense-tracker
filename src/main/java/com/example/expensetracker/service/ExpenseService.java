package com.example.expensetracker.service;

import com.example.expensetracker.dto.ExpenseRequest;
import com.example.expensetracker.dto.ExpenseResponse;
import com.example.expensetracker.entity.Expense;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.ExpenseRepository;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.exception.ResourceNotFoundException;

import lombok.extern.slf4j.Slf4j;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    // CREATE EXPENSE
    public ExpenseResponse createExpense(
            ExpenseRequest request,
            String userEmail) {

        log.info("Creating expense for user: {}", userEmail);

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        Expense expense = new Expense();

        expense.setUser(user);

        expense.setCategory(
                categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"))
        );

        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setNotes(request.getNotes());
        expense.setRecurring(request.getRecurring());

        expense.setCreatedAt(LocalDateTime.now());
        expense.setUpdatedAt(LocalDateTime.now());

        Expense savedExpense = expenseRepository.save(expense);

        log.info(
                "Expense created with ID: {}",
                savedExpense.getId()
        );

        return modelMapper.map(
                savedExpense,
                ExpenseResponse.class
        );
    }

    // UPDATE EXPENSE
    public ExpenseResponse updateExpense(
            Long id,
            ExpenseRequest request,
            String userEmail) {

        log.info(
                "Updating expense ID: {} for user: {}",
                id,
                userEmail
        );

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Expense not found"));

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found");
        }

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new IllegalAccessError(
                    "You don't have permission to update this expense"
            );
        }

        expense.setCategory(
                categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"))
        );

        expense.setDescription(request.getDescription());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setPaymentMethod(request.getPaymentMethod());
        expense.setNotes(request.getNotes());
        expense.setRecurring(request.getRecurring());
        expense.setUpdatedAt(LocalDateTime.now());

        Expense updatedExpense =
                expenseRepository.save(expense);

        return modelMapper.map(
                updatedExpense,
                ExpenseResponse.class
        );
    }

    // DELETE EXPENSE
    public void deleteExpense(
            Long id,
            String userEmail) {

        log.info(
                "Deleting expense ID: {} for user: {}",
                id,
                userEmail
        );

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Expense not found"));

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found");
        }

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new IllegalAccessError(
                    "You don't have permission to delete this expense"
            );
        }

        expenseRepository.delete(expense);
    }

    // GET EXPENSE BY ID
    public ExpenseResponse getExpenseById(
            Long id,
            String userEmail) {

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Expense not found"));

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found");
        }

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new IllegalAccessError(
                    "You don't have permission to view this expense"
            );
        }

        return modelMapper.map(
                expense,
                ExpenseResponse.class
        );
    }

    // GET ALL USER EXPENSES
    public List<ExpenseResponse> getUserExpenses(
            String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found");
        }

        return expenseRepository
                .findByUserId(user.getId())
                .stream()
                .map(expense ->
                        modelMapper.map(
                                expense,
                                ExpenseResponse.class))
                .collect(Collectors.toList());
    }

    // GET EXPENSES BY DATE RANGE
    public List<ExpenseResponse> getExpensesByDateRange(
            LocalDate start,
            LocalDate end,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found");
        }

        return expenseRepository
                .findByUserIdAndExpenseDateBetween(
                        user.getId(),
                        start,
                        end
                )
                .stream()
                .map(expense ->
                        modelMapper.map(
                                expense,
                                ExpenseResponse.class))
                .collect(Collectors.toList());
    }
}