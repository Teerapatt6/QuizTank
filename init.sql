--
-- PostgreSQL database dump
--

\restrict 7mL7nVBglbhJQyl3BEKvEHaGekabBnaOBzGuUvtSnUpXrb0GQGjE2BoRRardzM2

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: challenges; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.challenges (
    challenge_id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    type character varying(20) NOT NULL,
    difficulty character varying(20),
    target_action character varying(50) NOT NULL,
    target_value integer DEFAULT 1 NOT NULL,
    xp_reward integer DEFAULT 0 NOT NULL,
    badge_image_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT challenges_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[]))),
    CONSTRAINT challenges_type_check CHECK (((type)::text = ANY ((ARRAY['DAILY'::character varying, 'WEEKLY'::character varying])::text[])))
);


ALTER TABLE public.challenges OWNER TO quiztank_admin;

--
-- Name: challenges_challenge_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.challenges_challenge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.challenges_challenge_id_seq OWNER TO quiztank_admin;

--
-- Name: challenges_challenge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.challenges_challenge_id_seq OWNED BY public.challenges.challenge_id;


--
-- Name: game_knowledge; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.game_knowledge (
    knowledge_id integer NOT NULL,
    game_id integer,
    title character varying(150),
    content text,
    media_url text
);


ALTER TABLE public.game_knowledge OWNER TO quiztank_admin;

--
-- Name: game_knowledge_knowledge_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.game_knowledge_knowledge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_knowledge_knowledge_id_seq OWNER TO quiztank_admin;

--
-- Name: game_knowledge_knowledge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.game_knowledge_knowledge_id_seq OWNED BY public.game_knowledge.knowledge_id;


--
-- Name: game_session_answers; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.game_session_answers (
    session_answer_id integer NOT NULL,
    activity_id integer,
    question_id integer,
    selected_option_id integer,
    input_text text,
    is_correct boolean,
    points_earned integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.game_session_answers OWNER TO quiztank_admin;

--
-- Name: game_session_answers_session_answer_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.game_session_answers_session_answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_session_answers_session_answer_id_seq OWNER TO quiztank_admin;

--
-- Name: game_session_answers_session_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.game_session_answers_session_answer_id_seq OWNED BY public.game_session_answers.session_answer_id;


--
-- Name: game_settings; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.game_settings (
    game_id integer NOT NULL,
    map_id integer,
    duration_seconds integer DEFAULT 60,
    enemies_num integer DEFAULT 0,
    hearts_num integer DEFAULT 3,
    brains_num integer DEFAULT 0,
    initial_ammo integer DEFAULT 0,
    ammo_per_correct integer DEFAULT 1
);


ALTER TABLE public.game_settings OWNER TO quiztank_admin;

--
-- Name: game_tags_rel; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.game_tags_rel (
    game_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.game_tags_rel OWNER TO quiztank_admin;

--
-- Name: games; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.games (
    game_id integer NOT NULL,
    creator_id integer,
    title character varying(150) NOT NULL,
    description text,
    cover_image_url text,
    visibility character varying(20) DEFAULT 'public'::character varying,
    category character varying(50),
    difficulty character varying(20),
    language character varying(10) DEFAULT 'th'::character varying,
    is_ai_generated boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    play_count integer DEFAULT 0,
    CONSTRAINT games_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['easy'::character varying, 'medium'::character varying, 'hard'::character varying])::text[]))),
    CONSTRAINT games_visibility_check CHECK (((visibility)::text = ANY ((ARRAY['public'::character varying, 'private'::character varying, 'unlisted'::character varying])::text[])))
);


ALTER TABLE public.games OWNER TO quiztank_admin;

--
-- Name: games_game_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.games_game_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.games_game_id_seq OWNER TO quiztank_admin;

--
-- Name: games_game_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.games_game_id_seq OWNED BY public.games.game_id;


--
-- Name: maps; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.maps (
    map_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    image_url text
);


ALTER TABLE public.maps OWNER TO quiztank_admin;

--
-- Name: maps_map_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.maps_map_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maps_map_id_seq OWNER TO quiztank_admin;

--
-- Name: maps_map_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.maps_map_id_seq OWNED BY public.maps.map_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer,
    type character varying(50) NOT NULL,
    title character varying(255),
    message text,
    is_read boolean DEFAULT false,
    related_link text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO quiztank_admin;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO quiztank_admin;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: question_media; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.question_media (
    media_id integer NOT NULL,
    question_id integer,
    media_url text NOT NULL,
    media_type character varying(20) DEFAULT 'image'::character varying,
    file_size_bytes bigint,
    display_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT question_media_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying])::text[])))
);


ALTER TABLE public.question_media OWNER TO quiztank_admin;

--
-- Name: question_media_media_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.question_media_media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_media_media_id_seq OWNER TO quiztank_admin;

--
-- Name: question_media_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.question_media_media_id_seq OWNED BY public.question_media.media_id;


--
-- Name: question_options; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.question_options (
    option_id integer NOT NULL,
    question_id integer,
    option_text text NOT NULL,
    is_correct boolean DEFAULT false,
    display_order integer DEFAULT 0
);


ALTER TABLE public.question_options OWNER TO quiztank_admin;

--
-- Name: question_options_option_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.question_options_option_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_options_option_id_seq OWNER TO quiztank_admin;

--
-- Name: question_options_option_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.question_options_option_id_seq OWNED BY public.question_options.option_id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.questions (
    question_id integer NOT NULL,
    game_id integer,
    question_type character varying(20) NOT NULL,
    allow_multiple_answers boolean DEFAULT false,
    text text NOT NULL,
    time_limit_seconds integer,
    points integer DEFAULT 10,
    CONSTRAINT questions_question_type_check CHECK (((question_type)::text = ANY ((ARRAY['MCQ'::character varying, 'FILL_BLANK'::character varying])::text[])))
);


ALTER TABLE public.questions OWNER TO quiztank_admin;

--
-- Name: questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.questions_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_question_id_seq OWNER TO quiztank_admin;

--
-- Name: questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.questions_question_id_seq OWNED BY public.questions.question_id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.reports (
    report_id integer NOT NULL,
    reporter_id integer,
    target_type character varying(50) NOT NULL,
    target_id integer NOT NULL,
    reason_category character varying(50) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'PENDING'::character varying,
    admin_notes text,
    resolved_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reports_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'IN_PROGRESS'::character varying, 'RESOLVED'::character varying, 'REJECTED'::character varying])::text[]))),
    CONSTRAINT reports_target_type_check CHECK (((target_type)::text = ANY ((ARRAY['GAME'::character varying, 'USER'::character varying, 'REVIEW'::character varying, 'QUESTION'::character varying])::text[])))
);


ALTER TABLE public.reports OWNER TO quiztank_admin;

--
-- Name: reports_report_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.reports_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_report_id_seq OWNER TO quiztank_admin;

--
-- Name: reports_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.reports_report_id_seq OWNED BY public.reports.report_id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    game_id integer,
    user_id integer,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO quiztank_admin;

--
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_review_id_seq OWNER TO quiztank_admin;

--
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.tags (
    tag_id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.tags OWNER TO quiztank_admin;

--
-- Name: tags_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.tags_tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_tag_id_seq OWNER TO quiztank_admin;

--
-- Name: tags_tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.tags_tag_id_seq OWNED BY public.tags.tag_id;


--
-- Name: user_challenges; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.user_challenges (
    id integer NOT NULL,
    user_id integer,
    challenge_id integer,
    current_progress integer DEFAULT 0,
    is_completed boolean DEFAULT false,
    completed_at timestamp without time zone,
    assigned_date date NOT NULL
);


ALTER TABLE public.user_challenges OWNER TO quiztank_admin;

--
-- Name: user_challenges_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.user_challenges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_challenges_id_seq OWNER TO quiztank_admin;

--
-- Name: user_challenges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.user_challenges_id_seq OWNED BY public.user_challenges.id;


--
-- Name: user_game_activities; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.user_game_activities (
    activity_id integer NOT NULL,
    user_id integer,
    game_id integer,
    is_favorite boolean DEFAULT false,
    score integer DEFAULT 0,
    is_win boolean,
    played_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_game_activities OWNER TO quiztank_admin;

--
-- Name: user_game_activities_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.user_game_activities_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_game_activities_activity_id_seq OWNER TO quiztank_admin;

--
-- Name: user_game_activities_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.user_game_activities_activity_id_seq OWNED BY public.user_game_activities.activity_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100),
    biography text,
    profile_pic_url text,
    level integer DEFAULT 1,
    xp bigint DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(20) DEFAULT 'USER'::character varying,
    is_2fa_enabled boolean DEFAULT false,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['USER'::character varying, 'ADMIN'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO quiztank_admin;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO quiztank_admin;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: verification_codes; Type: TABLE; Schema: public; Owner: quiztank_admin
--

CREATE TABLE public.verification_codes (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    otp_code character varying(6) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.verification_codes OWNER TO quiztank_admin;

--
-- Name: verification_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: quiztank_admin
--

CREATE SEQUENCE public.verification_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.verification_codes_id_seq OWNER TO quiztank_admin;

--
-- Name: verification_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: quiztank_admin
--

ALTER SEQUENCE public.verification_codes_id_seq OWNED BY public.verification_codes.id;


--
-- Name: challenges challenge_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.challenges ALTER COLUMN challenge_id SET DEFAULT nextval('public.challenges_challenge_id_seq'::regclass);


--
-- Name: game_knowledge knowledge_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_knowledge ALTER COLUMN knowledge_id SET DEFAULT nextval('public.game_knowledge_knowledge_id_seq'::regclass);


--
-- Name: game_session_answers session_answer_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_session_answers ALTER COLUMN session_answer_id SET DEFAULT nextval('public.game_session_answers_session_answer_id_seq'::regclass);


--
-- Name: games game_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.games ALTER COLUMN game_id SET DEFAULT nextval('public.games_game_id_seq'::regclass);


--
-- Name: maps map_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.maps ALTER COLUMN map_id SET DEFAULT nextval('public.maps_map_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: question_media media_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.question_media ALTER COLUMN media_id SET DEFAULT nextval('public.question_media_media_id_seq'::regclass);


--
-- Name: question_options option_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.question_options ALTER COLUMN option_id SET DEFAULT nextval('public.question_options_option_id_seq'::regclass);


--
-- Name: questions question_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.questions ALTER COLUMN question_id SET DEFAULT nextval('public.questions_question_id_seq'::regclass);


--
-- Name: reports report_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.reports ALTER COLUMN report_id SET DEFAULT nextval('public.reports_report_id_seq'::regclass);


--
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- Name: tags tag_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.tags ALTER COLUMN tag_id SET DEFAULT nextval('public.tags_tag_id_seq'::regclass);


--
-- Name: user_challenges id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.user_challenges ALTER COLUMN id SET DEFAULT nextval('public.user_challenges_id_seq'::regclass);


--
-- Name: user_game_activities activity_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.user_game_activities ALTER COLUMN activity_id SET DEFAULT nextval('public.user_game_activities_activity_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: verification_codes id; Type: DEFAULT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.verification_codes ALTER COLUMN id SET DEFAULT nextval('public.verification_codes_id_seq'::regclass);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (challenge_id);


--
-- Name: game_knowledge game_knowledge_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_knowledge
    ADD CONSTRAINT game_knowledge_pkey PRIMARY KEY (knowledge_id);


--
-- Name: game_session_answers game_session_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_session_answers
    ADD CONSTRAINT game_session_answers_pkey PRIMARY KEY (session_answer_id);


--
-- Name: game_settings game_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_settings
    ADD CONSTRAINT game_settings_pkey PRIMARY KEY (game_id);


--
-- Name: game_tags_rel game_tags_rel_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_tags_rel
    ADD CONSTRAINT game_tags_rel_pkey PRIMARY KEY (game_id, tag_id);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (game_id);


--
-- Name: maps maps_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.maps
    ADD CONSTRAINT maps_pkey PRIMARY KEY (map_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: question_media question_media_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.question_media
    ADD CONSTRAINT question_media_pkey PRIMARY KEY (media_id);


--
-- Name: question_options question_options_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_pkey PRIMARY KEY (option_id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (question_id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (report_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (tag_id);


--
-- Name: user_challenges user_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.user_challenges
    ADD CONSTRAINT user_challenges_pkey PRIMARY KEY (id);


--
-- Name: user_challenges user_challenges_user_id_challenge_id_assigned_date_key; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.user_challenges
    ADD CONSTRAINT user_challenges_user_id_challenge_id_assigned_date_key UNIQUE (user_id, challenge_id, assigned_date);


--
-- Name: user_game_activities user_game_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.user_game_activities
    ADD CONSTRAINT user_game_activities_pkey PRIMARY KEY (activity_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: verification_codes verification_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_pkey PRIMARY KEY (id);


--
-- Name: idx_uc_completed; Type: INDEX; Schema: public; Owner: quiztank_admin
--

CREATE INDEX idx_uc_completed ON public.user_challenges USING btree (user_id, is_completed);


--
-- Name: idx_uc_user_date; Type: INDEX; Schema: public; Owner: quiztank_admin
--

CREATE INDEX idx_uc_user_date ON public.user_challenges USING btree (user_id, assigned_date);


--
-- Name: game_knowledge game_knowledge_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_knowledge
    ADD CONSTRAINT game_knowledge_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: game_session_answers game_session_answers_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_session_answers
    ADD CONSTRAINT game_session_answers_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.user_game_activities(activity_id) ON DELETE CASCADE;


--
-- Name: game_session_answers game_session_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_session_answers
    ADD CONSTRAINT game_session_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- Name: game_session_answers game_session_answers_selected_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_session_answers
    ADD CONSTRAINT game_session_answers_selected_option_id_fkey FOREIGN KEY (selected_option_id) REFERENCES public.question_options(option_id) ON DELETE SET NULL;


--
-- Name: game_settings game_settings_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_settings
    ADD CONSTRAINT game_settings_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: game_settings game_settings_map_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_settings
    ADD CONSTRAINT game_settings_map_id_fkey FOREIGN KEY (map_id) REFERENCES public.maps(map_id);


--
-- Name: game_tags_rel game_tags_rel_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_tags_rel
    ADD CONSTRAINT game_tags_rel_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: game_tags_rel game_tags_rel_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.game_tags_rel
    ADD CONSTRAINT game_tags_rel_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(tag_id) ON DELETE CASCADE;


--
-- Name: games games_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: question_media question_media_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.question_media
    ADD CONSTRAINT question_media_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- Name: question_options question_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.question_options
    ADD CONSTRAINT question_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;


--
-- Name: questions questions_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: reports reports_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(user_id);


--
-- Name: reviews reviews_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_challenges user_challenges_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.user_challenges
    ADD CONSTRAINT user_challenges_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(challenge_id) ON DELETE CASCADE;


--
-- Name: user_challenges user_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.user_challenges
    ADD CONSTRAINT user_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_game_activities user_game_activities_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.user_game_activities
    ADD CONSTRAINT user_game_activities_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(game_id) ON DELETE CASCADE;


--
-- Name: user_game_activities user_game_activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: quiztank_admin
--

ALTER TABLE ONLY public.user_game_activities
    ADD CONSTRAINT user_game_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 7mL7nVBglbhJQyl3BEKvEHaGekabBnaOBzGuUvtSnUpXrb0GQGjE2BoRRardzM2

