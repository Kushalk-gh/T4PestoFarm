package com.pesticides.service;

import java.util.List;

import com.pesticides.modal.HomeCategory;

public interface HomeCategoryService {
    
    HomeCategory createHomeCategory(HomeCategory homeCategory);
    List<HomeCategory> createCategories(List<HomeCategory> homeCategories);
    HomeCategory updateHomeCategory(HomeCategory category,Long id) throws Exception;
    List<HomeCategory> getAllHomeCategories();
}
