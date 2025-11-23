-- ============================================
-- DONNÉES DE TEST POUR DÉVELOPPEMENT
-- ============================================

-- Insertion de cols célèbres
INSERT INTO cols (nom, altitude, latitude, longitude, denivele, distance_km, pente_moyenne, pente_max, pays, region, description, difficulte) VALUES
('Alpe d''Huez', 1850, 45.0911, 6.0706, 1120, 13.8, 8.1, 11.5, 'France', 'Isère', 'Col mythique du Tour de France avec ses 21 virages', 'difficile'),
('Col du Galibier', 2642, 45.0642, 6.4078, 1245, 17.7, 7.0, 10.1, 'France', 'Savoie', 'Un des cols les plus hauts d''Europe', 'hc'),
('Mont Ventoux', 1909, 44.1742, 5.2789, 1617, 21.5, 7.5, 12.0, 'France', 'Vaucluse', 'Le Géant de Provence', 'hc'),
('Col de la Madeleine', 2000, 45.4331, 6.3778, 1550, 19.2, 8.1, 11.5, 'France', 'Savoie', 'Ascension régulière et exigeante', 'difficile'),
('Col du Tourmalet', 2115, 42.9094, 0.1456, 1404, 19.0, 7.4, 10.2, 'France', 'Hautes-Pyrénées', 'Col le plus franchi du Tour de France', 'hc'),
('Passo dello Stelvio', 2758, 46.5281, 10.4522, 1533, 24.3, 6.3, 14.0, 'Italie', 'Lombardie', 'Col le plus haut d''Italie avec 48 virages', 'hc'),
('Col de l''Iseran', 2770, 45.4169, 7.0308, 1840, 47.4, 3.9, 9.0, 'France', 'Savoie', 'Col routier le plus haut de France', 'hc'),
('Col d''Izoard', 2360, 44.8208, 6.7353, 1120, 15.9, 7.0, 9.3, 'France', 'Hautes-Alpes', 'Paysages lunaires et passages mythiques', 'difficile'),
('Col de la Croix de Fer', 2067, 45.2189, 6.2231, 1430, 29.0, 4.9, 11.0, 'France', 'Savoie', 'Ascension longue depuis Saint-Jean-de-Maurienne', 'difficile'),
('Montée de Puy Mary', 1588, 45.1089, 2.6631, 640, 11.0, 5.8, 8.0, 'France', 'Cantal', 'Volcan d''Auvergne au panorama exceptionnel', 'moyen'),
('Col de Joux Plane', 1691, 46.1614, 6.6833, 870, 11.6, 7.5, 11.6, 'France', 'Haute-Savoie', 'Col très raide au-dessus de Morzine', 'difficile'),
('Col du Glandon', 1924, 45.2806, 6.1806, 1240, 21.7, 5.7, 9.5, 'France', 'Savoie', 'Ascension plus douce que la Croix de Fer', 'difficile'),
('Plateau de Beille', 1780, 42.7944, 1.7289, 1260, 15.8, 8.0, 9.5, 'France', 'Ariège', 'Station de ski de fond en altitude', 'difficile'),
('Col de Vars', 2109, 44.5378, 6.7003, 720, 9.0, 8.0, 10.5, 'France', 'Hautes-Alpes', 'Passage entre Ubaye et Queyras', 'difficile'),
('La Planche des Belles Filles', 1148, 47.7761, 6.7594, 720, 5.9, 8.5, 20.0, 'France', 'Haute-Saône', 'Mur final extrême devenu classique du Tour', 'difficile');

-- Note: Les utilisateurs seront créés via l'authentification Supabase
-- Mais on peut préparer quelques ascensions fictives après création des users

-- Exemple de fonction pour générer des statistiques de test
-- À exécuter après avoir créé quelques utilisateurs via l'interface
CREATE OR REPLACE FUNCTION generate_test_ascensions(p_user_id UUID, p_nombre_cols INTEGER DEFAULT 5)
RETURNS void AS $$
DECLARE
  v_col RECORD;
  v_counter INTEGER := 0;
BEGIN
  FOR v_col IN (SELECT * FROM cols ORDER BY RANDOM() LIMIT p_nombre_cols) LOOP
    INSERT INTO ascensions (user_id, col_id, date_ascension, temps_secondes, vitesse_moyenne_kmh, validee)
    VALUES (
      p_user_id,
      v_col.id,
      NOW() - (RANDOM() * INTERVAL '365 days'),
      (v_col.distance_km * 1000 / 15) * 3600, -- Temps estimé à 15 km/h
      12 + RANDOM() * 8, -- Vitesse entre 12 et 20 km/h
      true
    );
    v_counter := v_counter + 1;
  END LOOP;
  
  RAISE NOTICE 'Généré % ascensions pour l''utilisateur %', v_counter, p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction utilitaire pour compter les cols disponibles
CREATE OR REPLACE FUNCTION get_total_cols_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM cols);
END;
$$ LANGUAGE plpgsql;