package com.pesticides.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pesticides.modal.Deal;
import com.pesticides.response.Apiresponse;
import com.pesticides.service.DealService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/deals")
public class DealController {
    
    private final DealService dealService;
    @PostMapping
    public ResponseEntity<Deal> createDeals(
        @RequestBody Deal deals) {
        Deal createdDeals = dealService.createDeal(deals);

        return new ResponseEntity<>(createdDeals,HttpStatus.ACCEPTED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Deal> updateDeal(
        @PathVariable Long id,
        @RequestBody Deal deal)
        throws Exception{

            Deal updatedDeal = dealService.updateDeal(deal, id);
            return ResponseEntity.ok(updatedDeal);
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Apiresponse> deleteDeals(
            @PathVariable Long id)
            throws Exception{

                dealService.deleteDeal(id);

                Apiresponse apiresponse = new Apiresponse();
                apiresponse.setMessage("Deal deleted");

                return new ResponseEntity<>(apiresponse,HttpStatus.ACCEPTED);
            }
        
    
}
