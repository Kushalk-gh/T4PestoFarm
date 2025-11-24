package com.pesticides.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ProductDTO {
    private long id;
    private String title;
    private String description;
    private int mrpPrice;
    private int sellingPrice;
    private int discountPercent;
    private int quantity;
    private List<String> images;
    private int numRatings;
    private String category;
    private String sellerName;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private LocalDateTime createdAt;
    private String sizes;
    private String location;
}
