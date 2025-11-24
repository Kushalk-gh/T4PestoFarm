package com.pesticides.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface FileService {
    
    // Uploads a file and returns its public URL.
    String uploadFile(MultipartFile file, String folder) throws IOException;
}