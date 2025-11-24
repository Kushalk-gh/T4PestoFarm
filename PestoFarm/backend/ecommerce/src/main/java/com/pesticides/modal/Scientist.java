package com.pesticides.modal;

import com.pesticides.domain.AccountStatus;
import com.pesticides.domain.USER_ROLE;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class Scientist {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String scientistName;

    @Column(unique = true , nullable = false)
    private String email;

    private String mobile;

    private String password;

    private String specialization; 

    private String institution;

    @OneToOne(cascade = CascadeType.ALL)
    private Address officeAddress;

    private USER_ROLE role = USER_ROLE.ROLE_SCIENTIST;

    private boolean isEmailVerified = false;

    private AccountStatus accountStatus = AccountStatus.PENDING_VERIFICATION;
}