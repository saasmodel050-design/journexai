
-- WALLETS
CREATE TABLE public.payment_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method text NOT NULL UNIQUE,
  label text NOT NULL,
  network text NOT NULL,
  address text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_wallets TO anon, authenticated;
GRANT ALL ON public.payment_wallets TO service_role;
ALTER TABLE public.payment_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active wallets" ON public.payment_wallets FOR SELECT USING (active = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins manage wallets" ON public.payment_wallets FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_wallets_updated BEFORE UPDATE ON public.payment_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_wallets (method, label, network, address, sort_order) VALUES
('usdt_trc20','USDT (TRC20)','TRC20','TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',1),
('usdt_bep20','USDT (BEP20)','BEP20 (BSC)','0x0000000000000000000000000000000000000000',2),
('btc','Bitcoin','BTC','bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',3),
('eth','Ethereum','ERC20','0x0000000000000000000000000000000000000000',4);

UPDATE public.payment_wallets SET active = false WHERE method <> 'usdt_trc20';

-- PAYMENTS
CREATE TABLE public.crypto_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  telegram text,
  country text,
  experience text,
  plan text NOT NULL DEFAULT 'pro',
  amount numeric NOT NULL,
  method text NOT NULL,
  network text NOT NULL,
  wallet_address text NOT NULL,
  txid text NOT NULL,
  screenshot_url text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (method, txid)
);
GRANT SELECT, INSERT, UPDATE ON public.crypto_payments TO authenticated;
GRANT ALL ON public.crypto_payments TO service_role;
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own payments" ON public.crypto_payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own payments" ON public.crypto_payments FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admins update payments" ON public.crypto_payments FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.crypto_payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Approval trigger: when status flips to approved, activate Pro plan for the user
CREATE OR REPLACE FUNCTION public.activate_pro_on_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    NEW.activated_at := now();
    UPDATE public.profiles
      SET plan = 'pro',
          plan_status = 'active',
          subscription_type = 'paid',
          payment_status = 'paid'
      WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_activate_pro BEFORE UPDATE ON public.crypto_payments
  FOR EACH ROW EXECUTE FUNCTION public.activate_pro_on_approval();
