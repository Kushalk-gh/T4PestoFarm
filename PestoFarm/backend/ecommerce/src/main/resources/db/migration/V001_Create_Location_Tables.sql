-- Migration Script: Create Location-related Tables
-- Version: V001
-- Purpose: Create user_locations and user_location_preferences tables for geolocation data persistence

-- Table: user_locations
-- Purpose: Store user geolocation history with timestamps
-- Relationship: Many locations per user (historical record)
CREATE TABLE IF NOT EXISTS user_locations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timestamp BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign key constraint to users table
    CONSTRAINT fk_user_locations_user_id FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Indexes for common queries
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id_created_at (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_location_preferences
-- Purpose: Store user's location permission choice (one-to-one relationship)
-- Relationship: One preference per user
CREATE TABLE IF NOT EXISTS user_location_preferences (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    choice VARCHAR(50) NOT NULL COMMENT 'allowWhileVisiting, onlyThisTime, or dontAllow',
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign key constraint to users table (one-to-one)
    CONSTRAINT fk_location_pref_user_id FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Index for user lookup
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comments for clarity
ALTER TABLE user_locations COMMENT='Stores historical geolocation data for each user';
ALTER TABLE user_location_preferences COMMENT='Stores user location permission preferences';

-- Note: If the tables already exist, the IF NOT EXISTS clause will prevent errors.
-- To drop and recreate: DROP TABLE IF EXISTS user_location_preferences; DROP TABLE IF EXISTS user_locations;
