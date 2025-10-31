-- FMSV Dingden - Flugbuch Table
-- Flugbuch-Einträge

CREATE TABLE IF NOT EXISTS flugbuch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pilot_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flight_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    duration_minutes INTEGER,
    aircraft_type VARCHAR(100) NOT NULL,
    aircraft_model VARCHAR(100),
    flight_type VARCHAR(50),
    remarks TEXT,
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index für schnellere Suche
CREATE INDEX IF NOT EXISTS idx_flugbuch_pilot_id ON flugbuch(pilot_id);
CREATE INDEX IF NOT EXISTS idx_flugbuch_flight_date ON flugbuch(flight_date);
CREATE INDEX IF NOT EXISTS idx_flugbuch_instructor_id ON flugbuch(instructor_id);
CREATE INDEX IF NOT EXISTS idx_flugbuch_flight_type ON flugbuch(flight_type);
