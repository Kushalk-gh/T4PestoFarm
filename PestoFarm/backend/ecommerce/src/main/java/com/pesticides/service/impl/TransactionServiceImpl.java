package com.pesticides.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pesticides.modal.Order;
import com.pesticides.modal.Seller;
import com.pesticides.modal.Transaction;
import com.pesticides.repository.SellerRepository;
import com.pesticides.repository.TransactionRepository;
import com.pesticides.service.TransactionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
    
    private final TransactionRepository transactionRepository;
    private final SellerRepository sellerRepository;
    
    @Override
    public Transaction createTransaction(Order order) {
        Seller seller = sellerRepository.findById(order.getSellerId()).get();

        Transaction transaction = new Transaction();
        transaction.setSeller(seller);
        transaction.setCustomer(order.getUser());
        transaction.setOrder(order);

        return transactionRepository.save(transaction);
    }

    @Override
    public List<Transaction> getTransactionsBySellerId(Seller seller) {
        return transactionRepository.findBySellerId(seller.getId());
    }

    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
    
}
