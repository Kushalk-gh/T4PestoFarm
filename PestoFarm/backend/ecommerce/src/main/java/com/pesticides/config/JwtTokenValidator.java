package com.pesticides.config;

import java.io.IOException;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// import jakarta.servlet.Filter;

// nio.file.DirectoryStream.
public class JwtTokenValidator  extends OncePerRequestFilter{

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = request.getHeader("Authorization");

        // Development helper: accept a mock bearer token and treat it as authenticated
        if ("Bearer mock-jwt-token".equals(jwt)) {
            List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList("ROLE_USER");
            Authentication authentication = new UsernamePasswordAuthenticationToken("mock", null, auths);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        if(jwt != null && jwt.startsWith("Bearer ")){
            jwt = jwt.substring(7);
            try{
                SecretKey key = Keys.hmacShaKeyFor(JWT_CONSTANT.SECRET_KEY.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                Claims claims = Jwts.parserBuilder().setSigningKey(key).build().
                parseClaimsJws(jwt).getBody();

                String email = String.valueOf(claims.get("email"));

                List<GrantedAuthority> auths = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
                Authentication authentication = new UsernamePasswordAuthenticationToken(email, null, auths);

                SecurityContextHolder.getContext().setAuthentication(authentication);

            }
            catch(Exception e){
                throw new BadCredentialsException("Invalid JWT token ...");
            }
        }

        filterChain.doFilter(request, response);
    }
  

}
