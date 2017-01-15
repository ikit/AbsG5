

--
-- ENUM
-- 
CREATE TYPE log_type    AS ENUM ('error','warning','message');
CREATE TYPE module_type AS ENUM ('absg','citation','immt','forum','agpa','agenda','web3g','cultureg','gtheque','wikig','olympiages','grenier','birthday');






--
-- TABLES
--


CREATE TABLE public.absg_current_data
(
    key   character varying(255) COLLATE pg_catalog."C.UTF-8",
    value character varying(255) COLLATE pg_catalog."C.UTF-8",
    CONSTRAINT absg_current_data_pkey PRIMARY KEY (key)
)
WITH ( OIDS=FALSE );
ALTER TABLE public.absg_current_data OWNER TO absg;




CREATE TABLE public.absg_daily_presence
(
    datetime timestamp without time zone,
    user_id  integer NOT NULL,
    CONSTRAINT absg_daily_presence_pkey PRIMARY KEY (datetime, user_id)
)
WITH ( OIDS=FALSE );
ALTER TABLE public.absg_daily_presence OWNER TO absg;




CREATE TABLE public.absg_logs
(
    user_id  integer NOT NULL,
    datetime timestamp without time zone NOT NULL,
    type     log_type NOT NULL,
    module   module_type NOT NULL,
    message  character varying(255) NOT NULL COLLATE pg_catalog."C.UTF-8",
    url
    CONSTRAINT template_pkey PRIMARY KEY (datetime, user_id)
)
WITH ( OIDS=FALSE );
ALTER TABLE public.absg_logs OWNER TO absg;










CREATE TABLE `` (
  `user_id` int(5) NOT NULL,
  `date` int(8) NOT NULL,
  `type` enum('error','warning','message','') NOT NULL,
  `module` enum('absg','citation','immt','forum','agpa','agenda','web3g','cultureg','gtheque','wikig','olympiages','grenier','birthday') NOT NULL,
  `message` varchar(255) NOT NULL,
  `url` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;




CREATE SEQUENCE public.template_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
ALTER TABLE public.template_id_seq OWNER TO annso;
CREATE TABLE public.template
(
    id integer NOT NULL DEFAULT nextval('template_id_seq'::regclass),
    name character varying(50) COLLATE pg_catalog."C.UTF-8",
    author character varying(255) COLLATE pg_catalog."C.UTF-8",
    description text COLLATE pg_catalog."C.UTF-8",
    version character varying(20) COLLATE pg_catalog."C.UTF-8",
    creation_date timestamp without time zone,
    update_date timestamp without time zone,
    parent_id integer,
    configuration text COLLATE pg_catalog."C.UTF-8",
    CONSTRAINT template_pkey PRIMARY KEY (id)
)
WITH ( OIDS=FALSE );
ALTER TABLE public.template OWNER TO annso;