package com.example.expensetracker.service;

import com.example.expensetracker.entity.Category;
import com.example.expensetracker.repository.CategoryRepository;
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

    // CREATE CATEGORY
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    // GET ALL CATEGORIES
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // GET CATEGORY BY ID
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found"
                        )
                );
    }

    // UPDATE CATEGORY
    public Category updateCategory(
            Long id,
            Category category) {

        Category existingCategory =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"
                                )
                        );

        existingCategory.setName(category.getName());
        existingCategory.setDescription(
                category.getDescription()
        );

        return categoryRepository.save(existingCategory);
    }

    // DELETE CATEGORY
    public void deleteCategory(Long id) {

        Category category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Category not found"
                                )
                        );

        categoryRepository.delete(category);
    }
}