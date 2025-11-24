package com.pesticides.service;

import java.util.List;

import com.pesticides.modal.Home;
import com.pesticides.modal.HomeCategory;

public interface HomeService {
    public Home createHomePageData(List<HomeCategory> allCategories);
}
