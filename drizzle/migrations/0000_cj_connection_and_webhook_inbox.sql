CREATE TABLE public.cj_connection (
  id text PRIMARY KEY DEFAULT 'primary',
  access_token text,
  access_expires_at timestamptz,
  open_id text,
  refresh_token text,
  refresh_expires_at timestamptz,
  processor_url text,
  processor_secret text,
  token_lock_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.cj_connection TO service_role;
REVOKE ALL ON public.cj_connection FROM anon, authenticated;
ALTER TABLE public.cj_connection ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.cj_webhook_inbox (
  message_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
GRANT ALL ON public.cj_webhook_inbox TO service_role;
REVOKE ALL ON public.cj_webhook_inbox FROM anon, authenticated;
ALTER TABLE public.cj_webhook_inbox ENABLE ROW LEVEL SECURITY;
CREATE INDEX cj_webhook_pending_idx ON public.cj_webhook_inbox (next_attempt_at) WHERE status <> 'processed';

CREATE OR REPLACE FUNCTION public.cj_acquire_token_lock()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE acquired boolean;
BEGIN
  INSERT INTO public.cj_connection (id) VALUES ('primary') ON CONFLICT DO NOTHING;
  UPDATE public.cj_connection SET token_lock_until = now() + interval '30 seconds'
  WHERE id = 'primary' AND (token_lock_until IS NULL OR token_lock_until < now());
  GET DIAGNOSTICS acquired = ROW_COUNT;
  RETURN acquired;
END;
$$;
REVOKE ALL ON FUNCTION public.cj_acquire_token_lock() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cj_acquire_token_lock() TO service_role;

CREATE OR REPLACE FUNCTION public.cj_claim_event(event_id text)
RETURNS SETOF public.cj_webhook_inbox LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.cj_webhook_inbox SET status = 'processing', locked_until = now() + interval '2 minutes', attempts = attempts + 1
  WHERE message_id = event_id AND status <> 'processed' AND next_attempt_at <= now()
  AND (locked_until IS NULL OR locked_until < now())
  RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.cj_claim_event(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cj_claim_event(text) TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE OR REPLACE FUNCTION public.cj_dispatch_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE cfg public.cj_connection;
BEGIN
  SELECT * INTO cfg FROM public.cj_connection WHERE id = 'primary';
  IF cfg.processor_url IS NOT NULL AND cfg.processor_secret IS NOT NULL THEN
    PERFORM net.http_post(
      url := cfg.processor_url,
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || cfg.processor_secret),
      body := jsonb_build_object('messageId', NEW.message_id),
      timeout_milliseconds := 30000
    );
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.cj_dispatch_event() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER cj_inbox_dispatch AFTER INSERT ON public.cj_webhook_inbox FOR EACH ROW EXECUTE FUNCTION public.cj_dispatch_event();