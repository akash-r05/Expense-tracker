package com.example.expensetracker.controller;

import com.example.expensetracker.entity.Category;
import com.example.expensetracker.service.CategoryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // CREATE CATEGORY
    @PostMapping
    public ResponseEntity<Category> createCategory(
            @RequestBody Category category,
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                categoryService.createCategory(
                        category,
                        userEmail
                )
        );
    }

    // GET ALL CATEGORIES FOR USER
    @GetMapping
    public ResponseEntity<List<Category>> getUserCategories(
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                categoryService.getUserCategories(
                        userEmail
                )
        );
    }

    // GET CATEGORY BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(
            @PathVariable Long id,
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                categoryService.getCategoryById(
                        id,
                        userEmail
                )
        );
    }

    // UPDATE CATEGORY
    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category,
            @RequestParam String userEmail) {

        return ResponseEntity.ok(
                categoryService.updateCategory(
                        id,
                        category,
                        userEmail
                )
        );
    }

    // DELETE CATEGORY
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(
            @PathVariable Long id,
            @RequestParam String userEmail) {

        categoryService.deleteCategory(
                id,
                userEmail
        );

        return ResponseEntity.ok(
                "Category deleted successfully"
        );
    }
}