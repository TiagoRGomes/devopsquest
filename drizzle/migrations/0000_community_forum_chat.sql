-- Perfis públicos da comunidade
CREATE TABLE public.community_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT nickname_format CHECK (nickname ~ '^[A-Za-z0-9_.-]{3,24}$')
);
CREATE UNIQUE INDEX community_profiles_nickname_lower ON public.community_profiles (lower(nickname));
GRANT SELECT ON public.community_profiles TO anon, authenticated;
GRANT INSERT (user_id, nickname) ON public.community_profiles TO authenticated;
GRANT UPDATE (nickname) ON public.community_profiles TO authenticated;
GRANT ALL ON public.community_profiles TO service_role;
ALTER TABLE public.community_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read community profiles" ON public.community_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users create own community profile" ON public.community_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own community profile" ON public.community_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_community_profiles_updated_at BEFORE UPDATE ON public.community_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- XP público sincronizado do progresso
CREATE OR REPLACE FUNCTION public.sync_community_xp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_TABLE_NAME = 'progress' THEN
    UPDATE public.community_profiles SET xp = NEW.xp WHERE user_id = NEW.user_id;
  ELSE
    NEW.xp := COALESCE((SELECT xp FROM public.progress WHERE user_id = NEW.user_id), 0);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER sync_xp_from_progress AFTER INSERT OR UPDATE OF xp ON public.progress FOR EACH ROW EXECUTE FUNCTION public.sync_community_xp();
CREATE TRIGGER set_xp_on_community_insert BEFORE INSERT ON public.community_profiles FOR EACH ROW EXECUTE FUNCTION public.sync_community_xp();
REVOKE EXECUTE ON FUNCTION public.sync_community_xp() FROM PUBLIC, anon, authenticated;

-- Bloqueios
CREATE TABLE public.community_bans (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.community_bans TO authenticated;
GRANT ALL ON public.community_bans TO service_role;
ALTER TABLE public.community_bans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and self can see bans" ON public.community_bans FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins ban" ON public.community_bans FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins unban" ON public.community_bans FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.can_post(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.community_profiles WHERE user_id = _user_id)
     AND NOT EXISTS (SELECT 1 FROM public.community_bans WHERE user_id = _user_id)
$$;

-- Tópicos
CREATE TABLE public.forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.community_profiles(user_id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 20000),
  is_closed boolean NOT NULL DEFAULT false,
  is_solved boolean NOT NULL DEFAULT false,
  is_pinned boolean NOT NULL DEFAULT false,
  reply_count integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX forum_topics_list ON public.forum_topics (is_closed, is_pinned DESC, last_activity_at DESC);
GRANT SELECT ON public.forum_topics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_topics TO authenticated;
GRANT ALL ON public.forum_topics TO service_role;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads topics" ON public.forum_topics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members open topics" ON public.forum_topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND public.can_post(auth.uid()) AND is_pinned = false);
CREATE POLICY "Author or admin updates topic" ON public.forum_topics FOR UPDATE TO authenticated USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin')) WITH CHECK (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Author or admin deletes topic" ON public.forum_topics FOR DELETE TO authenticated USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.guard_topic_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF NEW.is_pinned IS DISTINCT FROM OLD.is_pinned
       OR NEW.author_id IS DISTINCT FROM OLD.author_id
       OR NEW.reply_count IS DISTINCT FROM OLD.reply_count THEN
      RAISE EXCEPTION 'not allowed';
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END; $$;
CREATE TRIGGER guard_topic_update BEFORE UPDATE ON public.forum_topics FOR EACH ROW WHEN (pg_trigger_depth() = 0) EXECUTE FUNCTION public.guard_topic_update();

-- Respostas
CREATE TABLE public.forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.community_profiles(user_id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 20000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX forum_replies_topic ON public.forum_replies (topic_id, created_at);
GRANT SELECT ON public.forum_replies TO anon;
GRANT SELECT, INSERT, DELETE ON public.forum_replies TO authenticated;
GRANT ALL ON public.forum_replies TO service_role;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads replies" ON public.forum_replies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members reply to open topics" ON public.forum_replies FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = author_id AND public.can_post(auth.uid())
  AND EXISTS (SELECT 1 FROM public.forum_topics t WHERE t.id = topic_id AND t.is_closed = false)
);
CREATE POLICY "Author or admin deletes reply" ON public.forum_replies FOR DELETE TO authenticated USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.bump_topic_on_reply()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_topics SET reply_count = reply_count + 1, last_activity_at = now() WHERE id = NEW.topic_id;
    RETURN NEW;
  ELSE
    UPDATE public.forum_topics SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.topic_id;
    RETURN OLD;
  END IF;
END; $$;
CREATE TRIGGER bump_topic_on_reply AFTER INSERT OR DELETE ON public.forum_replies FOR EACH ROW EXECUTE FUNCTION public.bump_topic_on_reply();

-- Bate-papo
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES public.community_profiles(user_id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_created ON public.chat_messages (created_at DESC);
GRANT SELECT ON public.chat_messages TO anon;
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads chat" ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Members send chat" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND public.can_post(auth.uid()));
CREATE POLICY "Author or admin deletes chat" ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;