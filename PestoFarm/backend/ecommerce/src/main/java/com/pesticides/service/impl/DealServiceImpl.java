package com.pesticides.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pesticides.modal.Deal;
import com.pesticides.modal.HomeCategory;
import com.pesticides.repository.DealRepository;
import com.pesticides.repository.HomeCategoryRepository;
import com.pesticides.service.DealService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DealServiceImpl implements DealService {
    
    private final DealRepository dealRepository;
    private final HomeCategoryRepository homeCategoryRepository;
    
    @Override
    public List<Deal> getDeals() {
        // TODO Auto-generated method stub
        // throw new UnsupportedOperationException("Unimplemented method 'getDeals'");
        return dealRepository.findAll();
    }

    @Override
    public Deal createDeal(Deal deal) {
        // TODO Auto-generated method stub
        // throw new UnsupportedOperationException("Unimplemented method 'createDeal'");

        HomeCategory category = homeCategoryRepository.findById(deal.getCategory().getId()).orElse(null);

        Deal newDeal = dealRepository.save(deal);
        newDeal.setCategory(category);
        newDeal.setDiscount(deal.getDiscount());
        return dealRepository.save(newDeal);
    }

    @Override
    public Deal updateDeal(Deal deal,Long id) throws Exception {
        // TODO Auto-generated method stub
        // throw new UnsupportedOperationException("Unimplemented method 'updateDeal'");
        Deal existingDeal = dealRepository.findById(id).orElse(null);
        HomeCategory category = homeCategoryRepository.findById(deal.getCategory().getId()).orElse(null);

        if(existingDeal!=null){
            if(deal.getDiscount()!=null){
                existingDeal.setDiscount(deal.getDiscount());
            }
            if(category!=null){
                existingDeal.setCategory(category);
            }
            return dealRepository.save(existingDeal);
        }
        throw new Exception("Deal not found");
    }

    @Override
    public void deleteDeal(Long id) throws Exception {
        // TODO Auto-generated method stub
        // throw new UnsupportedOperationException("Unimplemented method 'deleteDeal'");
                Deal deal = dealRepository.findById(id).orElseThrow(()->
                new Exception("deal not found"));
                dealRepository.delete(deal);

    }

    
    
}
