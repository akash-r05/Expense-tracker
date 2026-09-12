package com.example.expensetracker.service;

import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.exception.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    // CREATE CATEGORY
    public Category createCategory(
            Category category,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        }

        Category existingCategory =
                categoryRepository.findByNameAndUserId(
                        category.getName(),
                        user.getId()
                );

        if (existingCategory != null) {
            throw new IllegalArgumentException(
                    "Category already exists for this user"
            );
        }

        // Always assign the category to the logged-in user
        category.setUser(user);

        return categoryRepository.save(category);
    }

    // GET ALL CATEGORIES FOR USER
    public List<Category> getUserCategories(
            String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        }

        return categoryRepository.findByUserId(
                user.getId()
        );
    }

    // GET CATEGORY BY ID FOR USER
    public Category getCategoryById(
            Long id,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        }

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"
                                )
                        );

        // Prevent one user from accessing another user's category
        if (category.getUser() == null ||
                !category.getUser().getId()
                        .equals(user.getId())) {

            throw new IllegalAccessError(
                    "You don't have permission to view this category"
            );
        }

        return category;
    }

    // UPDATE CATEGORY
    public Category updateCategory(
            Long id,
            Category category,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        }

        Category existingCategory =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"
                                )
                        );

        // Make sure the category belongs to this user
        if (existingCategory.getUser() == null ||
                !existingCategory.getUser().getId()
                        .equals(user.getId())) {

            throw new IllegalAccessError(
                    "You don't have permission to update this category"
            );
        }

        // Check duplicate name for the same user
        Category duplicate =
                categoryRepository.findByNameAndUserId(
                        category.getName(),
                        user.getId()
                );

        if (duplicate != null &&
                !duplicate.getId()
                        .equals(existingCategory.getId())) {

            throw new IllegalArgumentException(
                    "Category already exists for this user"
            );
        }

        existingCategory.setName(
                category.getName()
        );

        existingCategory.setDescription(
                category.getDescription()
        );

        return categoryRepository.save(
                existingCategory
        );
    }

    // DELETE CATEGORY
    public void deleteCategory(
            Long id,
            String userEmail) {

        User user = userRepository.findByEmail(userEmail);

        if (user == null) {
            throw new ResourceNotFoundException(
                    "User not found"
            );
        }

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"
                                )
                        );

        // Make sure the category belongs to this user
        if (category.getUser() == null ||
                !category.getUser().getId()
                        .equals(user.getId())) {

            throw new IllegalAccessError(
                    "You don't have permission to delete this category"
            );
        }

        categoryRepository.delete(category);
    }
}