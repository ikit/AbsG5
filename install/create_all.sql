

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
) WITH ( OIDS=FALSE );




CREATE TABLE public.log
(
    user_id integer NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    type log_type NOT NULL,
    module module NOT NULL,
    message character varying(255) NOT NULL COLLATE pg_catalog."C",
    url character varying(255) COLLATE pg_catalog."C",
    CONSTRAINT log_pkey PRIMARY KEY (datetime, user_id)
) WITH ( OIDS=FALSE );



CREATE TABLE public.rank
(
    code character varying(2) NOT NULL COLLATE pg_catalog."C",
    title character varying(20) NOT NULL COLLATE pg_catalog."C",
    g_note integer NOT NULL,
    CONSTRAINT rank_pkey PRIMARY KEY (code)
) WITH ( OIDS=FALSE );




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
) WITH ( OIDS=FALSE );


CREATE TABLE public.user_daily
(
    datetime timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer NOT NULL,
    CONSTRAINT user_daily_pkey PRIMARY KEY (datetime, user_id)
) WITH ( OIDS=FALSE );



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
) WITH ( OIDS=FALSE );



CREATE TABLE public.file
(
    id serial NOT NULL,
    creation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    update_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    owner_id integer NOT NULL,
    name character varying(255) COLLATE pg_catalog."C",
    type character varying(10) COLLATE pg_catalog."C",
    path text,
    size bigint,
    offset bigint,
    status file_status,
    CONSTRAINT file_pkey PRIMARY KEY (id)
) WITH ( OIDS=FALSE );




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
) WITH ( OIDS=FALSE );



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
) WITH ( OIDS=FALSE );


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
) WITH ( OIDS=FALSE );


CREATE TABLE public.people_event
(
    people_id integer NOT NULL,
    event_id integer NOT NULL,
    CONSTRAINT people_event_pkey PRIMARY KEY (people_id, event_id)
) WITH ( OIDS=FALSE );





--
-- Forum Module
--
CREATE TABLE public.forum
(
    id serial NOT NULL,
    parent_id integer
    name character varying(255) COLLATE pg_catalog."C",
    description text,
    private boolean DEFAULT False,
    archived boolean DEFAULT False,
    last_message_id integer,
    last_message_date timestamp without time zone,
    last_poster_name character varying(255) COLLATE pg_catalog."C",
    last_poster_id integer,
    CONSTRAINT forum_pkey PRIMARY KEY (id)
) WITH ( OIDS=FALSE );

CREATE TABLE public.topic
(
    id serial NOT NULL,
    forum_id integer
    title character varying(255) COLLATE pg_catalog."C",
    type topic_type DEFAULT thread,
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
) WITH ( OIDS=FALSE );

CREATE TABLE public.message
(
    id serial NOT NULL,
    forum_id integer NOT NULL,
    topic_id integer NOT NULL,
    poster_id integer NOT NULL,
    date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    message text,
    CONSTRAINT message_pkey PRIMARY KEY (id)
) WITH ( OIDS=FALSE );

CREATE TABLE public.message_file
(
    message_id integer NOT NULL,
    file_id integer NOT NULL,
    CONSTRAINT message_file_pkey PRIMARY KEY (message_id, file_id)
) WITH ( OIDS=FALSE );






--
-- GTheque Module (gtheque_)
--
CREATE TABLE public.gtheque_book
(
    isbn varchar(50) NOT NULL,
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
    CONSTRAINT agenda_people_pkey PRIMARY KEY (people_id)
)
WITH ( OIDS=FALSE );














--
-- DATA
--

INSERT INTO public.absg_parameter (key, value) VALUES
('agpa_phase_boundaries', '1/1-24/12-26/12-27/12-28/12-30/12'),
('log_last_autocheck', '1484437405'),
('site_offline', ''),
('stat_max_user_date', '1381760130'),
('stat_max_user_online', '8'),
('stat_max_visitor_by_day', '19'),
('stat_max_visitor_date', '1387926000');



INSERT INTO public.absg_ranks (code, title, g_note) VALUES
('00', 'Fi G', 0),
('01', 'G nèse', 2),
('02', 'G né', 4),
('03', 'G volue', 6),
('04', 'Miti G', 8),
('05', 'Emer G', 10),
('06', 'Boue G', 12),
('07', 'G''sperd', 14),
('08', 'G zite', 16),
('09', 'Soula G', 18),
('10', 'G ponge', 20),
('11', 'G xplore', 22),
('12', 'G latine', 24),
('13', 'G touffe', 26),
('14', 'G trip', 28),
('15', 'G ricanne', 30),
('16', 'Ah ! L''G ri !', 32),
('17', 'New zehr G', 34),
('18', 'G orgie', 36),
('19', 'G néreux', 38),
('20', 'G tset', 40),
('21', 'T.G.V.', 42),
('22', 'Herr G', 44),
('23', 'G ronimo', 46),
('24', 'Absolument G', 48),
('25', 'G''ssy James', 50),
('26', 'Ma G llan', 52),
('27', 'Fort G', 54),
('28', 'Agré G', 56),
('29', 'Enra G', 58),
('30', 'Pur G', 60),
('31', 'Super G', 62),
('32', 'G ant', 64),
('33', 'G néral', 66),
('34', 'Ma G sté', 68),
('35', 'Au sommet du G3', 70),
('36', 'Apo G', 72),
('37', 'Hé G monie', 74),
('38', 'G zu', 76),
('39', 'Saint G', 78),
('40', 'Divinement G', 80),
('41', 'G rare', 90),
('A', 'Grand Gourou', 0),
('B', 'Vice Gourou', 0),
('C', 'Potes à G', 0),
('D', 'Mascotte', 0),
('E', 'Rang G ?', 0);


INSERT INTO public.absg_users (id, people_id, username, username_clean) VALUES
(1, 1, 'Zaffa', 'zaffa'),
(2, 2, 'Olive', 'olive'),
(3, 3, 'Frédo', 'fredo'),
(4, 4, 'Manouel', 'manouel'),
(5, 5, 'Flo', 'flo'),
(6, 6, 'Gérard', 'gerard'),
(7, 7, 'Thomas', 'thomas'),
(8, 8, 'AL1', 'al1'),
(9, 9, 'Bébé Ma''anne', 'bebe ma''anne'),
(10, 10, 'Seb', 'seb'),
(11, 11, 'Athos', 'athos'),
(12, 12, 'Annie', 'annie'),
(13, 13, 'Poupette', 'poupette'),
(14, 14, 'Die Mittlere', 'die mittlere'),
(15, 15, 'Sylve', 'sylve'),
(16, 16, 'Jul6M3', 'jul6m3'),
(17, 17, 'Phébus', 'phebus'),
(18, 18, 'Fannette', 'fannette'),
(19, 19, 'Vati', 'vati'),
(20, 20, 'Marie', 'marie'),
(21, 21, 'Marie-Cécile', 'marie-cecile'),
(22, 22, 'Isa', 'isa'),
(23, 23, 'Marceau', 'marceau'),
(24, 24, 'Eugénie', 'eugenie'),
(25, 25, 'Pierre', 'pierre'),
(26, 26, 'Gaston', 'gaston'),
(27, 27, 'Émie', 'emie'),
(28, 28, 'Augustin', 'augustin'),
(29, 29, 'Lucien', 'lucien'),
(30, 30, 'Margot', 'margot'),
(31, 31, 'Maya', 'maya'),
(32, 32, 'Gaspar', 'gaspar'),
(33, 33, 'Daphné', 'daphne'),
(35, 35, 'Louison', 'louison'),
(36, 47, 'Camille', 'camille');
