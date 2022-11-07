CREATE TABLE IF NOT EXISTS public.topup
(
    topup_id integer NOT NULL DEFAULT nextval('topup_topup_id_seq'::regclass),
    user_phone character varying(20) COLLATE pg_catalog."default",
    amount integer,
    created_at timestamp without time zone,
    CONSTRAINT topup_pkey PRIMARY KEY (topup_id)
)

CREATE TABLE IF NOT EXISTS public.transaction
(
    transaction_id integer NOT NULL DEFAULT nextval('transaction_transaction_id_seq'::regclass),
    user_phone character varying(20) COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    marketplace character varying COLLATE pg_catalog."default",
    "timestamp" timestamp without time zone,
    amount integer,
    buyer character varying COLLATE pg_catalog."default",
    market_transaction_id character varying COLLATE pg_catalog."default",
    CONSTRAINT transaction_pkey PRIMARY KEY (transaction_id)
)

CREATE TABLE IF NOT EXISTS public.transfer
(
    transfer_id integer NOT NULL DEFAULT nextval('transfer_transfer_id_seq'::regclass),
    user_phone character varying(20) COLLATE pg_catalog."default",
    user_target_phone character varying(20) COLLATE pg_catalog."default",
    description character varying COLLATE pg_catalog."default",
    amount integer,
    created_at timestamp without time zone,
    CONSTRAINT transfer_pkey PRIMARY KEY (transfer_id)
)

CREATE TABLE IF NOT EXISTS public.users
(
    user_id integer NOT NULL DEFAULT nextval('users_user_id_seq'::regclass),
    phone character varying(20) COLLATE pg_catalog."default",
    email character varying(100) COLLATE pg_catalog."default",
    role character varying(20) COLLATE pg_catalog."default",
    username character varying(255) COLLATE pg_catalog."default",
    password character varying(255) COLLATE pg_catalog."default",
    balance integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    CONSTRAINT users_pkey PRIMARY KEY (user_id)
)