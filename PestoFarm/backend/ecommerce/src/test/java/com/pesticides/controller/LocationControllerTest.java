package com.pesticides.controller;

import org.springframework.lang.NonNull;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pesticides.modal.User;
import com.pesticides.domain.USER_ROLE;
import com.pesticides.modal.UserLocation;
import com.pesticides.modal.UserLocationPreference;
import com.pesticides.service.LocationService;
import com.pesticides.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@WebMvcTest(controllers = LocationController.class)
@AutoConfigureMockMvc(addFilters = false)
public class LocationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LocationService locationService;

    @SuppressWarnings("deprecation")
    @MockBean
    private UserService userService;

    @Test
    public void saveLocation_ReturnsCreated_WhenUserFound() throws Exception {
        @SuppressWarnings("null")
        User fakeUser = new User();
        fakeUser.setEmail("test@example.com");
            fakeUser.setRole(USER_ROLE.ROLE_USER);

        Mockito.when(userService.findUserByJwtToken(Mockito.anyString())).thenReturn(fakeUser);

        UserLocation saved = new UserLocation();
        saved.setLatitude(28.6139);
        saved.setLongitude(77.2090);
        saved.setId(1L);

        Mockito.when(locationService.saveLocation(any(User.class), any(Double.class), any(Double.class), any(Long.class))).thenReturn(saved); 

        String payload = objectMapper.writeValueAsString(new java.util.HashMap<String, Object>() {{
            put("latitude", 28.6139);
            put("longitude", 77.2090);
            put("timestamp", 1699564800000L);
        }});

        mockMvc.perform(post("/api/users/location")
                        .header("Authorization", "Bearer faketoken")
                        .contentType(MediaType.APPLICATION_JSON) 
                        .content(payload)) 
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)); 
    }

    @Test
    public void getLocation_ReturnsOk_WhenLocationPresent() throws Exception {
        @SuppressWarnings("null")
        User fakeUser = new User();
        fakeUser.setEmail("test@example.com");

        UserLocation loc = new UserLocation();
        loc.setId(2L);
        loc.setLatitude(12.34);
        loc.setLongitude(56.78);

        Mockito.when(userService.findUserByJwtToken(Mockito.anyString())).thenReturn(fakeUser);
        Mockito.when(locationService.getLatestLocation(any(User.class))).thenReturn(Optional.of(loc));

        mockMvc.perform(get("/api/users/location").header("Authorization", "Bearer token"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)); 
    }

    @Test
    public void savePreference_ReturnsCreated() throws Exception {
        @SuppressWarnings("null")
        User fakeUser = new User();
        fakeUser.setEmail("pref@example.com");

        UserLocationPreference pref = new UserLocationPreference();
        pref.setId(3L);
        pref.setChoice("allowWhileVisiting");

        Mockito.when(userService.findUserByJwtToken(Mockito.anyString())).thenReturn(fakeUser);
        Mockito.when(locationService.saveLocationPreference(any(User.class), eq("allowWhileVisiting"))).thenReturn(pref);

        String payload = objectMapper.writeValueAsString(new java.util.HashMap<String, String>() {{ put("choice", "allowWhileVisiting"); }});

        mockMvc.perform(post("/api/users/location-preference")
                        .header("Authorization", "Bearer token")
                        .contentType(MediaType.APPLICATION_JSON) 
                        .content(payload)) 
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON)); 
    }

    @Test
    public void getLocation_ReturnsUnauthorized_WhenUserMissing() throws Exception {
        Mockito.when(userService.findUserByJwtToken(Mockito.anyString())).thenReturn(null);

        mockMvc.perform(get("/api/users/location").header("Authorization", "Bearer badtoken"))
                .andExpect(status().isUnauthorized());
    }
}
