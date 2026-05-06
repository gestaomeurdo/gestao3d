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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="w-full max-w-[440px] space-y-8 bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 orange-gradient rounded-3xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20 transform -rotate-3">
            <Printer size={40} strokeWidth={2.5} />
          </div>
          <div className="pt-2">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 italic">PrintSaaS</h1>
            <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">Gestão Profissional 3D</p>
          </div>
        </div>

        <div className="auth-container">
          <Auth
            supabaseClient={supabase}
            providers={['google']}
            redirectTo={window.location.origin}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#ff6b00',
                    brandAccent: '#ff8533',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#F1F5F9',
                    defaultButtonBackgroundHover: '#E2E8F0',
                    inputBackground: '#F8FAFC',
                    inputBorder: '#E2E8F0',
                    inputBorderFocus: '#ff6b00',
                    inputPlaceholder: '#94A3B8',
                  },
                  radii: {
                    buttonRadius: '1rem',
                    inputRadius: '1rem',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '12px',
                    baseButtonSize: '14px',
                  }
                }
              },
              className: {
                button: 'font-bold uppercase tracking-wider h-12',
                input: 'h-12 border-slate-200',
                label: 'font-bold text-slate-400 uppercase tracking-widest mb-1',
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Seu E-mail',
                  password_label: 'Sua Senha',
                  button_label: 'Entrar agora',
                  loading_button_label: 'Validando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem conta? Entre aqui',
                },
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Criar Senha',
                  button_label: 'Criar minha conta',
                  loading_button_label: 'Criando...',
                  link_text: 'Não tem conta? Cadastre-se',
                  confirmation_text: 'Verifique seu e-mail para confirmar o cadastro',
                },
                forgotten_password: {
                  email_label: 'E-mail cadastrado',
                  button_label: 'Recuperar senha',
                  link_text: 'Esqueceu sua senha?',
                }
              }
            }}
            theme="light"
          />
        </div>
        
        <p className="text-center text-[10px] text-slate-400 font-medium px-8">
          Ao entrar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </div>
    </div>
  );
}