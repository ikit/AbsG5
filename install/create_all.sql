

--
-- ENUM
-- 
CREATE TYPE sex          AS ENUM ('F','M');
CREATE TYPE root_familly AS ENUM ('gueudelot','guibert','guyomard','letot');
CREATE TYPE log_type     AS ENUM ('error','warning','message');
CREATE TYPE module       AS ENUM ('absg','citation','immt','forum','agpa','agenda','web3g','gtheque','wigi','olympiages','grenier','nuage');
CREATE TYPE file_status  AS ENUM ('uploading','uploaded','error');
CREATE TYPE topic_type   AS ENUM ('thread', 'important','article');





--
-- CORE TABLES
--

CREATE TABLE public.parameter
(
    key character varying(255) COLLATE pg_catalog."C",
    value character varying(255) COLLATE pg_catalog."C",
    CONSTRAINT parameter_pkey PRIMARY KEY (key)
);




CREATE TABLE public.log
(
    user_id integer NOT NULL,
    datetime timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    type log_type NOT NULL,
    module module NOT NULL,
    message character varying(255) NOT NULL COLLATE pg_catalog."C",
    url character varying(255) COLLATE pg_catalog."C",
    CONSTRAINT log_pkey PRIMARY KEY (datetime, user_id)
);



CREATE TABLE public.rank
(
    code character varying(2) NOT NULL COLLATE pg_catalog."C",
    title character varying(20) NOT NULL COLLATE pg_catalog."C",
    g_note integer NOT NULL,
    CONSTRAINT rank_pkey PRIMARY KEY (code)
);




CREATE TABLE public.user
(
    id serial NOT NULL,
    people_id integer,
    username character varying(25) NOT NULL COLLATE pg_catalog."C",
    username_clean character varying(25) COLLATE pg_catalog."C",
    password character varying(255) COLLATE pg_catalog."C",
    auth json,
    noteg character varying(255) COLLATE pg_catalog."C",
    rank character varying(2) COLLATE pg_catalog."C",
    data json,
    CONSTRAINT user_pkey PRIMARY KEY (id)
);


CREATE TABLE public.user_daily
(
    datetime timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer NOT NULL,
    CONSTRAINT user_daily_pkey PRIMARY KEY (datetime, user_id)
);



CREATE TABLE public.user_session
(
    token character varying(32) NOT NULL COLLATE pg_catalog."C",
    creation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expiration_date timestamp without time zone NOT NULL,
    last_activity timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer NOT NULL,
    user_agent text,
    ip inet NOT NULL,
    context json,
    CONSTRAINT user_session_pkey PRIMARY KEY (token)
);



CREATE TABLE public.file
(
    id serial NOT NULL,
    creation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    owner_id integer NOT NULL,
    name character varying(255) COLLATE pg_catalog."C",
    type character varying(10) COLLATE pg_catalog."C",
    "path" text,
    size bigint,
    "offset" bigint,
    status file_status,
    CONSTRAINT file_pkey PRIMARY KEY (id)
);




--
-- CITATION Module
--
CREATE TABLE public.citation
(
    id serial NOT NULL,
    poster_id integer NOT NULL,
    author_id integer,
    citation text,
    creation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT citation_pkey PRIMARY KEY (id)
);



--
-- AGENDA Module
--
CREATE TABLE public.people
(
    id serial NOT NULL,
    firstname character varying(255) COLLATE pg_catalog."C",
    firstname2 character varying(255) COLLATE pg_catalog."C",
    lastname character varying(255) COLLATE pg_catalog."C",
    nickname character varying(255) COLLATE pg_catalog."C",
    sex sex,
    birthday timestamp without time zone NOT NULL,
    deathday timestamp without time zone NOT NULL,
    address character varying(255) COLLATE pg_catalog."C",
    city character varying(255) COLLATE pg_catalog."C",
    country character varying(255) COLLATE pg_catalog."C",
    phone character varying(255) COLLATE pg_catalog."C",
    mobilephone character varying(255) COLLATE pg_catalog."C",
    email character varying(255) COLLATE pg_catalog."C",
    website character varying(255) COLLATE pg_catalog."C",
    rootfamilly root_familly,
    CONSTRAINT people_pkey PRIMARY KEY (id)
);


CREATE TABLE public.event
(
    id serial NOT NULL,
    start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    end_date timestamp without time zone,
    description text,
    location point,
    type varchar(200) NOT NULL,
    poster_id integer NOT NULL,
    CONSTRAINT event_pkey PRIMARY KEY (id)
);


CREATE TABLE public.people_event
(
    people_id integer NOT NULL,
    event_id integer NOT NULL,
    CONSTRAINT people_event_pkey PRIMARY KEY (people_id, event_id)
);





--
-- Forum Module
--
CREATE TABLE public.forum
(
    id serial NOT NULL,
    parent_id integer,
    name character varying(255) COLLATE pg_catalog."C",
    description text,
    private boolean DEFAULT False,
    archived boolean DEFAULT False,
    last_message_id integer,
    last_message_date timestamp without time zone,
    last_poster_name character varying(255) COLLATE pg_catalog."C",
    last_poster_id integer,
    CONSTRAINT forum_pkey PRIMARY KEY (id)
);

CREATE TABLE public.topic
(
    id serial NOT NULL,
    forum_id integer,
    title character varying(255) COLLATE pg_catalog."C",
    type topic_type DEFAULT 'thread',
    replies integer DEFAULT 0,

    first_message_id integer,
    first_message_date timestamp without time zone,
    first_poster_name character varying(255) COLLATE pg_catalog."C",
    first_poster_id integer,
    last_message_id integer,
    last_message_date timestamp without time zone,
    last_poster_name character varying(255) COLLATE pg_catalog."C",
    last_poster_id integer,
    CONSTRAINT topic_pkey PRIMARY KEY (id)
);

CREATE TABLE public.message
(
    id serial NOT NULL,
    forum_id integer NOT NULL,
    topic_id integer NOT NULL,
    poster_id integer NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    message text,
    CONSTRAINT message_pkey PRIMARY KEY (id)
);

CREATE TABLE public.message_file
(
    message_id integer NOT NULL,
    file_id integer NOT NULL,
    CONSTRAINT message_file_pkey PRIMARY KEY (message_id, file_id)
);






--
-- GTheque Module (gtheque_)
--
CREATE TABLE public.gtheque_book
(
    isbn varchar(25) NOT NULL,
    firstname character varying(255) COLLATE pg_catalog."C",
    firstname2 character varying(255) COLLATE pg_catalog."C",
    lastname character varying(255) COLLATE pg_catalog."C",
    nickname character varying(255) COLLATE pg_catalog."C",
    sex sex,
    birthday timestamp without time zone NOT NULL,
    deathday timestamp without time zone NOT NULL,
    address character varying(255) COLLATE pg_catalog."C",
    city character varying(255) COLLATE pg_catalog."C",
    country character varying(255) COLLATE pg_catalog."C",
    phone character varying(255) COLLATE pg_catalog."C",
    mobilephone character varying(255) COLLATE pg_catalog."C",
    email character varying(255) COLLATE pg_catalog."C",
    skype character varying(255) COLLATE pg_catalog."C",
    website character varying(255) COLLATE pg_catalog."C",
    rootfamilly root_familly,
    CONSTRAINT gtheque_book_pkey PRIMARY KEY (isbn)
);














--
-- DATA
--

INSERT INTO public.parameter (key, value) VALUES
('agpa_phase_boundaries', '1/1-24/12-26/12-27/12-28/12-30/12'),
('log_last_autocheck', '1484437405'),
('site_offline', ''),
('stat_max_user_date', '1381760130'),
('stat_max_user_online', '8'),
('stat_max_visitor_by_day', '19'),
('stat_max_visitor_date', '1387926000');



INSERT INTO public.rank (code, title, g_note) VALUES
('00', 'Fi G', 0);


INSERT INTO public.user (id, people_id, username, username_clean) VALUES
(1, 1, 'Zaffa', 'zaffa'),
(2, 2, 'Olive', 'olive');;




