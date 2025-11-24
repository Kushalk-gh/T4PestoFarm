package com.pesticides.service;

import java.util.List;

import com.pesticides.modal.Order;
import com.pesticides.modal.Seller;
import com.pesticides.modal.Transaction;

public interface TransactionService {
    
    Transaction createTransaction(Order order);
    List<Transaction> getTransactionsBySellerId(Seller seller);
    List<Transaction> getAllTransactions();
}
