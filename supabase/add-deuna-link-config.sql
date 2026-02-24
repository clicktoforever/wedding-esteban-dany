-- Insert the DeUna payment link into configurations table
INSERT INTO public.configurations (key, value, description)
VALUES (
  'deuna_payment_link',
  'https://pagar.deuna.app/H92p/U2FsdGVkX1/P8BQafvWFOKQyN0gxGAaxqnB/zRXoa4Vq27Ue9Fe/hOl1WBSoIcCIMJxggoXhaDULLdNxJPBoT7xOUMcD8vNb5oRTXoZJOs+gxMT9N6bz79Xe+xl6xPG2wynZrB7Y7z72o9reoRiwPKMw2AGep844Imb/oAtiFDTersq685uGN14F/jDFBMxryVpJbrQV58v4+7OsZsjiIg==',
  'Enlace de pago para donaciones vía DeUna'
)
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value,
    description = EXCLUDED.description;
