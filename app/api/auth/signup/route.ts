import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const body = await request.json();
    const { email, password, firstName, lastName, phone, userType } = body;
    
    // Validation des données
    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Email, mot de passe et type d\'utilisateur requis' },
        { status: 400 }
      );
    }
    
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }
    
    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          user_type: userType
        },
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`
      }
    });
    
    if (authError) {
      console.error('Erreur Supabase Auth:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }
    
    // Insérer dans la table users personnalisée
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        user_type: userType,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: phone || null,
        is_active: true,
        is_verified: false,
        country_code: 'CI'
      });
    
    if (insertError) {
      console.error('Erreur insertion users:', insertError);
      // Ne pas bloquer l'inscription si l'insertion échoue
    }
    
    // Créer les préférences utilisateur par défaut
    const { error: prefError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: authData.user.id,
        theme: 'light',
        language: 'fr',
        currency: 'XOF',
        email_notifications: true,
        push_notifications: true,
        default_chart_period: '1M',
        risk_profile: 'moderate',
        investment_horizon: 'medium'
      });
    
    if (prefError) {
      console.error('Erreur création préférences:', prefError);
    }
    
    // Créer le profil utilisateur
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        risk_tolerance: 'moderate'
      });
    
    if (profileError) {
      console.error('Erreur création profil:', profileError);
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      message: 'Inscription réussie. Veuillez vérifier votre email pour confirmer votre compte.'
    });
    
  } catch (error) {
    console.error('Erreur serveur inscription:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
