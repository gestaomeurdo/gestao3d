"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { Printer } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 orange-gradient rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Printer size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">PrintSaaS</h1>
          <p className="text-slate-500 font-medium">Gestão profissional para sua impressão 3D</p>
        </div>

        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#ff6b00',
                  brandAccent: '#ff9100',
                },
                radii: {
                  buttonRadius: '1rem',
                  inputRadius: '1rem',
                }
              }
            }
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Entrar',
                loading_button_label: 'Entrando...',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entre aqui',
              },
              sign_up: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Criar conta',
                loading_button_label: 'Criando conta...',
                link_text: 'Não tem uma conta? Cadastre-se',
              }
            }
          }}
          theme="light"
        />
      </div>
    </div>
  );
}