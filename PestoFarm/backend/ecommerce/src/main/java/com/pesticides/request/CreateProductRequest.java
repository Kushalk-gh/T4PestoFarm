package com.pesticides.request;

import java.util.List;

import lombok.Data;

@Data
public class CreateProductRequest {

    private String title;
    private String description;
    private int mrpPrice;
    private int sellingPrice;
    private List<String> images;
    private String sizes;
    private String category;
    private String category2;
    private int quantity;
    private String location;

}
