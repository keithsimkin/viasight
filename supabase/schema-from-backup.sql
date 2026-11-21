-- Extracted from old Pauline cluster backup (public schema only)
-- Apply to NEW Supabase via SQL editor after enabling uuid-ossp / extensions as needed.

CREATE TABLE IF NOT EXISTS public.datasets (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    record_count integer DEFAULT 0,
    last_updated timestamp with time zone DEFAULT now(),
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.potholes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pothole_id bigint NOT NULL,
    dataset_id text DEFAULT 'default'::text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    width_m double precision NOT NULL,
    length_m double precision NOT NULL,
    depth_m double precision,
    confidence double precision NOT NULL,
    severity text,
    status text DEFAULT 'detected'::text NOT NULL,
    detection_timestamp timestamp with time zone NOT NULL,
    detection_method text DEFAULT 'ai_vision'::text,
    photo_url text,
    photo_path text,
    location_description text,
    road_name text,
    district text,
    assigned_to uuid,
    repair_priority integer,
    estimated_repair_cost numeric(10,2),
    repair_notes text,
    repaired_at timestamp with time zone,
    repaired_by uuid,
    verified_at timestamp with time zone,
    verified_by uuid,
    rejection_reason text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    area_sqm double precision,
    CONSTRAINT potholes_area_sqm_check CHECK (((area_sqm IS NULL) OR (area_sqm > (0)::double precision))),
    CONSTRAINT potholes_confidence_check CHECK (((confidence >= (0)::double precision) AND (confidence <= (1)::double precision))),
    CONSTRAINT potholes_depth_m_check CHECK (((depth_m IS NULL) OR (depth_m > (0)::double precision))),
    CONSTRAINT potholes_latitude_check CHECK (((latitude >= ('-90'::integer)::double precision) AND (latitude <= (90)::double precision))),
    CONSTRAINT potholes_length_m_check CHECK (((length_m > (0)::double precision) AND (length_m <= (500)::double precision))),
    CONSTRAINT potholes_longitude_check CHECK (((longitude >= ('-180'::integer)::double precision) AND (longitude <= (180)::double precision))),
    CONSTRAINT potholes_repair_priority_check CHECK (((repair_priority >= 1) AND (repair_priority <= 10))),
    CONSTRAINT potholes_severity_check CHECK ((severity = ANY (ARRAY['low'::text, 'moderate'::text, 'high'::text, 'patch'::text]))),
    CONSTRAINT potholes_status_check CHECK ((status = ANY (ARRAY['detected'::text, 'verified'::text, 'assigned'::text, 'in_progress'::text, 'repaired'::text, 'rejected'::text]))),
    CONSTRAINT potholes_width_m_check CHECK ((width_m > (0)::double precision))
);

CREATE TABLE IF NOT EXISTS public.pothole_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pothole_id uuid NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    mime_type text,
    width integer,
    height integer,
    camera_info jsonb DEFAULT '{}'::jsonb,
    detection_metadata jsonb DEFAULT '{}'::jsonb,
    is_primary boolean DEFAULT false,
    uploaded_by uuid,
    uploaded_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pothole_statistics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dataset_id text DEFAULT 'default'::text NOT NULL,
    date date NOT NULL,
    total_potholes integer DEFAULT 0,
    detected_today integer DEFAULT 0,
    repaired_today integer DEFAULT 0,
    verified_today integer DEFAULT 0,
    avg_confidence double precision,
    avg_width double precision,
    avg_length double precision,
    avg_depth double precision,
    severity_counts jsonb DEFAULT '{}'::jsonb,
    status_counts jsonb DEFAULT '{}'::jsonb,
    district_counts jsonb DEFAULT '{}'::jsonb,
    priority_distribution jsonb DEFAULT '{}'::jsonb,
    estimated_repair_cost_total numeric(15,2) DEFAULT 0,
    repair_completion_rate double precision DEFAULT 0,
    verification_rate double precision DEFAULT 0,
    detection_method_counts jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pothole_time_series (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    dataset_id text DEFAULT 'default'::text NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    interval_type text NOT NULL,
    pothole_count integer DEFAULT 0,
    avg_confidence double precision,
    avg_severity_score double precision,
    repair_rate double precision,
    detection_rate double precision,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pothole_time_series_interval_type_check CHECK ((interval_type = ANY (ARRAY['hourly'::text, 'daily'::text, 'weekly'::text, 'monthly'::text])))
);

CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'user'::text,
    full_name text,
    phone text,
    department text,
    preferences jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_potholes_area_sqm ON public.potholes USING btree (area_sqm);
CREATE INDEX idx_potholes_assigned_to ON public.potholes USING btree (assigned_to);
CREATE INDEX idx_potholes_created_at ON public.potholes USING btree (created_at);
CREATE INDEX idx_potholes_dataset_id ON public.potholes USING btree (dataset_id);
CREATE INDEX idx_potholes_detection_timestamp ON public.potholes USING btree (detection_timestamp);
CREATE INDEX idx_potholes_district ON public.potholes USING btree (district);
-- skipped PostGIS index idx_potholes_geom (enable postgis later if needed)
CREATE INDEX idx_potholes_location ON public.potholes USING btree (latitude, longitude);
CREATE INDEX idx_potholes_pothole_id_dataset_id ON public.potholes USING btree (pothole_id, dataset_id);
CREATE INDEX idx_potholes_road_name ON public.potholes USING btree (road_name);
CREATE INDEX idx_potholes_severity ON public.potholes USING btree (severity);
CREATE INDEX idx_potholes_status ON public.potholes USING btree (status);
CREATE INDEX idx_pothole_photos_pothole_id ON public.pothole_photos USING btree (pothole_id);
CREATE INDEX idx_pothole_statistics_dataset_id ON public.pothole_statistics USING btree (dataset_id);
CREATE INDEX idx_pothole_statistics_date ON public.pothole_statistics USING btree (date);
CREATE INDEX idx_pothole_time_series_dataset_id ON public.pothole_time_series USING btree (dataset_id);
CREATE INDEX idx_pothole_time_series_timestamp ON public.pothole_time_series USING btree ("timestamp");
CREATE INDEX idx_users_is_active ON public.users USING btree (is_active);
CREATE INDEX idx_users_role ON public.users USING btree (role);
ALTER TABLE ONLY public.datasets
    ADD CONSTRAINT datasets_name_key UNIQUE (name);
ALTER TABLE ONLY public.datasets
    ADD CONSTRAINT datasets_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.potholes
    ADD CONSTRAINT potholes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.potholes
    ADD CONSTRAINT potholes_pothole_id_dataset_id_key UNIQUE (pothole_id, dataset_id);
ALTER TABLE ONLY public.potholes
    ADD CONSTRAINT potholes_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);
ALTER TABLE ONLY public.potholes
    ADD CONSTRAINT potholes_dataset_id_fkey FOREIGN KEY (dataset_id) REFERENCES public.datasets(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY public.potholes
    ADD CONSTRAINT potholes_repaired_by_fkey FOREIGN KEY (repaired_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.potholes
    ADD CONSTRAINT potholes_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.pothole_photos
    ADD CONSTRAINT pothole_photos_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.pothole_photos
    ADD CONSTRAINT pothole_photos_pothole_id_fkey FOREIGN KEY (pothole_id) REFERENCES public.potholes(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.pothole_photos
    ADD CONSTRAINT pothole_photos_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);
ALTER TABLE ONLY public.pothole_statistics
    ADD CONSTRAINT pothole_statistics_dataset_id_date_key UNIQUE (dataset_id, date);
ALTER TABLE ONLY public.pothole_statistics
    ADD CONSTRAINT pothole_statistics_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.pothole_time_series
    ADD CONSTRAINT pothole_time_series_dataset_id_timestamp_interval_type_key UNIQUE (dataset_id, "timestamp", interval_type);
ALTER TABLE ONLY public.pothole_time_series
    ADD CONSTRAINT pothole_time_series_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.recurring_patterns
    ADD CONSTRAINT recurring_patterns_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.recurring_patterns
    ADD CONSTRAINT recurring_patterns_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.recurring_patterns
    ADD CONSTRAINT recurring_patterns_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;