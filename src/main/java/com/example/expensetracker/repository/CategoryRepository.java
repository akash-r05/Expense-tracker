package com.example.expensetracker.repository;

import com.example.expensetracker.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUserId(Long userId);

    Category findByNameAndUserId(String name, Long userId);
}