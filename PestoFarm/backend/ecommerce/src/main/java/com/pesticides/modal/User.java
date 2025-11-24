package com.pesticides.modal;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.pesticides.domain.USER_ROLE;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
private String password;

private String email;

private String fullname;

private String mobile;

private String address;

@Enumerated(EnumType.STRING)
private USER_ROLE role = USER_ROLE.ROLE_USER;

private boolean isEmailVerified = false;

@OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
@JsonIgnore
@ToString.Exclude
@EqualsAndHashCode.Exclude
private List<Address> adresses = new ArrayList<>();

@ElementCollection
@CollectionTable(name = "payment_information", joinColumns = @JoinColumn(name = "user_id"))
private List<PaymentInformation> paymentInformation = new ArrayList<>();

@OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
@JsonIgnore
@ToString.Exclude
@EqualsAndHashCode.Exclude
private List<Rating> ratings = new ArrayList<>();

@OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
@JsonIgnore
@ToString.Exclude
@EqualsAndHashCode.Exclude
private List<Review> reviews = new ArrayList<>();

@OneToMany(mappedBy = "user")
@JsonIgnore
@ToString.Exclude
@EqualsAndHashCode.Exclude
private List<Chat> chats = new ArrayList<>();

private LocalDateTime createdAt;

@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority(role.toString()));
}

@Override
public String getUsername() {
    return email;
}

@Override
public boolean isAccountNonExpired() {
    return true;
}

@Override
public boolean isAccountNonLocked() {
    return true;
}

@Override
public boolean isCredentialsNonExpired() {
    return true;
}

@Override
public boolean isEnabled() {
    return isEmailVerified;
}
}