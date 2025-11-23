-- ============================================
-- TABLES PRINCIPALES
-- ============================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs (étend auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  pseudo TEXT UNIQUE NOT NULL,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  avatar_url TEXT,
  strava_id BIGINT UNIQUE,
  strava_access_token TEXT,
  strava_refresh_token TEXT,
  strava_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des cols
CREATE TABLE cols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom TEXT NOT NULL,
  altitude INTEGER NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  denivele INTEGER NOT NULL,
  distance_km DECIMAL(5, 2) NOT NULL,
  pente_moyenne DECIMAL(4, 2),
  pente_max DECIMAL(4, 2),
  pays TEXT NOT NULL,
  region TEXT,
  description TEXT,
  difficulte TEXT CHECK (difficulte IN ('facile', 'moyen', 'difficile', 'hc')),
  strava_segment_id BIGINT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des ascensions (performances)
CREATE TABLE ascensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  col_id UUID NOT NULL REFERENCES cols(id) ON DELETE CASCADE,
  date_ascension TIMESTAMPTZ NOT NULL,
  temps_secondes INTEGER,
  vitesse_moyenne_kmh DECIMAL(5, 2),
  frequence_cardiaque_moyenne INTEGER,
  puissance_moyenne_watts INTEGER,
  strava_activity_id BIGINT UNIQUE,
  validee BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, col_id, date_ascension)
);

-- Table des cols épinglés
CREATE TABLE cols_epingles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  col_id UUID NOT NULL REFERENCES cols(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, col_id)
);

-- Table des utilisateurs favoris
CREATE TABLE favoris (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  favori_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, favori_user_id),
  CHECK (user_id != favori_user_id)
);

-- ============================================
-- INDEXES POUR PERFORMANCE
-- ============================================

CREATE INDEX idx_profiles_pseudo ON profiles(pseudo);
CREATE INDEX idx_profiles_strava_id ON profiles(strava_id);
CREATE INDEX idx_cols_latitude_longitude ON cols(latitude, longitude);
CREATE INDEX idx_cols_strava_segment ON cols(strava_segment_id);
CREATE INDEX idx_ascensions_user_id ON ascensions(user_id);
CREATE INDEX idx_ascensions_col_id ON ascensions(col_id);
CREATE INDEX idx_ascensions_date ON ascensions(date_ascension);
CREATE INDEX idx_cols_epingles_user_id ON cols_epingles(user_id);
CREATE INDEX idx_favoris_user_id ON favoris(user_id);

-- ============================================
-- VUES POUR STATISTIQUES
-- ============================================

-- Vue des statistiques par utilisateur
CREATE VIEW user_statistics AS
SELECT 
  p.id,
  p.pseudo,
  COUNT(DISTINCT a.col_id) as cols_gravis,
  COUNT(a.id) as nombre_ascensions,
  SUM(c.denivele) as denivele_total,
  COUNT(DISTINCT DATE(a.date_ascension)) as nombre_sorties
FROM profiles p
LEFT JOIN ascensions a ON p.id = a.user_id
LEFT JOIN cols c ON a.col_id = c.id
WHERE a.validee = true
GROUP BY p.id, p.pseudo;

-- ============================================
-- FONCTIONS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer un profil automatiquement lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, pseudo, prenom, nom)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'pseudo', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cols ENABLE ROW LEVEL SECURITY;
ALTER TABLE ascensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cols_epingles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoris ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Les profils sont visibles par tous"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Politiques pour cols
CREATE POLICY "Les cols sont visibles par tous"
  ON cols FOR SELECT
  USING (true);

-- Politiques pour ascensions
CREATE POLICY "Les ascensions sont visibles par tous"
  ON ascensions FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres ascensions"
  ON ascensions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres ascensions"
  ON ascensions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres ascensions"
  ON ascensions FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques pour cols_epingles
CREATE POLICY "Les épingles sont visibles par leur propriétaire"
  ON cols_epingles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres épingles"
  ON cols_epingles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres épingles"
  ON cols_epingles FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques pour favoris
CREATE POLICY "Les favoris sont visibles par leur propriétaire"
  ON favoris FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres favoris"
  ON favoris FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres favoris"
  ON favoris FOR DELETE
  USING (auth.uid() = user_id);