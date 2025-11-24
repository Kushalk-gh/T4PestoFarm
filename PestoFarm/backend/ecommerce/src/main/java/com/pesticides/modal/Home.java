package com.pesticides.modal;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Home {
    
    private List<HomeCategory> Flowers;

    private List<HomeCategory> Fruits;

    private List<HomeCategory> Vegetables;

    private List<HomeCategory> dealCategories;
    
    private List<Deal> deals;
    
}
