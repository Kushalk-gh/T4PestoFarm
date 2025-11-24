package com.pesticides.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.pesticides.domain.HomeCategorySection;
import com.pesticides.modal.Deal;
import com.pesticides.modal.Home;
import com.pesticides.modal.HomeCategory;
import com.pesticides.repository.DealRepository;
import com.pesticides.service.HomeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HomeServiceImpl implements HomeService {

    private final DealRepository dealRepository;

    @Override
    public Home createHomePageData(List<HomeCategory> allCategories) {
        // TODO Auto-generated method stub
        // throw new UnsupportedOperationException("Unimplemented method 'createHomePageData'");

        List<HomeCategory> flowerCategories = allCategories.stream()
        .filter(category ->
        category.getSection() == HomeCategorySection.FLOWERS)
        .collect(Collectors.toList());

        List<HomeCategory> fruitsCategories = allCategories.stream()
        .filter(category ->
        category.getSection() == HomeCategorySection.FRUITS)
        .collect(Collectors.toList());

        List<HomeCategory> vegetablesCategories = allCategories.stream()
        .filter(category ->
        category.getSection() == HomeCategorySection.VEGETABLES)
        .collect(Collectors.toList());
    

    List<Deal> createdDeals = new ArrayList<>();

    if(dealRepository.findAll().isEmpty()){
        List<Deal> deals = allCategories.stream()
        .filter(category -> category.getSection() == HomeCategorySection.DEALS)
        .map(category -> new Deal(null,10, category))
        .collect(Collectors.toList());

        createdDeals = dealRepository.saveAll(deals);
    }
    else createdDeals = dealRepository.findAll();
    
    Home home = new Home();
    home.setFlowers(flowerCategories);
    home.setFruits(fruitsCategories);
    home.setVegetables(vegetablesCategories);
    home.setDeals(createdDeals);

    return home;
}
}
