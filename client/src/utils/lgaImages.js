const LGA_IMAGES = {
  // Lagos
  'Ikeja':              'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2013_airport_Ikeja_Lagos_Nigeria_12999337914.jpg/1280px-2013_airport_Ikeja_Lagos_Nigeria_12999337914.jpg',
  'Lagos Island':       'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Lagoon_Front_Park%2C_Lagos%2C_Nigeria.jpg/1280px-Lagoon_Front_Park%2C_Lagos%2C_Nigeria.jpg',
  'Surulere':           'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Lagoon_Front_Park%2C_Lagos%2C_Nigeria.jpg/1280px-Lagoon_Front_Park%2C_Lagos%2C_Nigeria.jpg',
  'Eti-Osa':            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Lagoon_Front_Park%2C_Lagos%2C_Nigeria.jpg/1280px-Lagoon_Front_Park%2C_Lagos%2C_Nigeria.jpg',

  // FCT
  'AMAC (Abuja Municipal)': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Abuja_heritages_30.jpg/1280px-Abuja_heritages_30.jpg',
  'Gwagwalada':         'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/City_of_abuja.jpg/1280px-City_of_abuja.jpg',

  // Kano
  'Kano Municipal':     'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Kano_municipal_council_gate.jpg/1280px-Kano_municipal_council_gate.jpg',
  'Dala':               'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Dala_Hill_the_Cradle_of_Kano_State_Nigeria.jpg/1280px-Dala_Hill_the_Cradle_of_Kano_State_Nigeria.jpg',

  // Rivers
  'Port Harcourt':      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Pitakwa.jpg/1280px-Pitakwa.jpg',
  'Obio-Akpor':         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Port_Harcourt_Major_Road_%28Ikwerre_Road%29_Port_Harcourt%2C_Rivers_State%2C_Nigeria.jpg/1280px-Port_Harcourt_Major_Road_%28Ikwerre_Road%29_Port_Harcourt%2C_Rivers_State%2C_Nigeria.jpg',

  // Ogun
  'Abeokuta South':     'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/New_cultural_center_abeokuta_side_view.jpg/1280px-New_cultural_center_abeokuta_side_view.jpg',
  'Abeokuta North':     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Aerial_view_of_Abeokuta_from_Olumo_rock.jpg/1280px-Aerial_view_of_Abeokuta_from_Olumo_rock.jpg',
  'Sagamu':             'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Aerial_view_of_Abeokuta_from_Olumo_rock.jpg/1280px-Aerial_view_of_Abeokuta_from_Olumo_rock.jpg',

  // Enugu
  'Enugu North':        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Climate_and_weather_in_Nigeria_11.jpg/1280px-Climate_and_weather_in_Nigeria_11.jpg',
  'Enugu South':        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Climate_and_weather_in_Nigeria_11.jpg/1280px-Climate_and_weather_in_Nigeria_11.jpg',
  'Nsukka':             'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Awhum_Water_Fall_Enugu%2C_Nigeria.jpg/1280px-Awhum_Water_Fall_Enugu%2C_Nigeria.jpg',

  // Oyo
  'Ibadan North':       'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Ibadan_Wide_Angle_Aerial_View.jpg/1280px-Ibadan_Wide_Angle_Aerial_View.jpg',
  'Ibadan South-West':  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Dugbe_commercial_area%2C_Ibadan_Oyo_state.jpg/1280px-Dugbe_commercial_area%2C_Ibadan_Oyo_state.jpg',
  'Ogbomosho North':    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Dugbe_commercial_area%2C_Ibadan_Oyo_state.jpg/1280px-Dugbe_commercial_area%2C_Ibadan_Oyo_state.jpg',

  // Delta
  'Warri South':        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Meet_Ethiope_River%2C_Abraka%2C_Delta%2C_Nigeria.jpg/1280px-Meet_Ethiope_River%2C_Abraka%2C_Delta%2C_Nigeria.jpg',
  'Uvwie':              'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Meet_Ethiope_River%2C_Abraka%2C_Delta%2C_Nigeria.jpg/1280px-Meet_Ethiope_River%2C_Abraka%2C_Delta%2C_Nigeria.jpg',
  'Oshimili South':     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Meet_Ethiope_River%2C_Abraka%2C_Delta%2C_Nigeria.jpg/1280px-Meet_Ethiope_River%2C_Abraka%2C_Delta%2C_Nigeria.jpg',

  // Abia
  'Umuahia North':      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Abia_state_tower.jpg/1280px-Abia_state_tower.jpg',
  'Aba North':          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Azumini_Blue_River_in_Abia_state%2C_Nigeria.jpg/1280px-Azumini_Blue_River_in_Abia_state%2C_Nigeria.jpg',
  'Aba South':          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Azumini_Blue_River_in_Abia_state%2C_Nigeria.jpg/1280px-Azumini_Blue_River_in_Abia_state%2C_Nigeria.jpg',

  // Adamawa
  'Yola North':         'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/AUN_Campus.jpg/1280px-AUN_Campus.jpg',
  'Yola South':         'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/AUN_Campus.jpg/1280px-AUN_Campus.jpg',

  // Akwa Ibom
  'Uyo':                'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Ibom_Plaza_Roundabout_-_drone_view_2024.jpg/1280px-Ibom_Plaza_Roundabout_-_drone_view_2024.jpg',
  'Eket':               'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Ibom_Plaza_Roundabout_-_drone_view_2024.jpg/1280px-Ibom_Plaza_Roundabout_-_drone_view_2024.jpg',
  'Ikot Ekpene':        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Ibom_Plaza_Roundabout_-_drone_view_2024.jpg/1280px-Ibom_Plaza_Roundabout_-_drone_view_2024.jpg',

  // Anambra
  'Awka South':         'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Unizik_beautiful_gate.jpg/1280px-Unizik_beautiful_gate.jpg',
  'Onitsha North':      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Onitsha_Bridge_2.jpg/1280px-Onitsha_Bridge_2.jpg',
  'Onitsha South':      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Onitsha_Bridge_2.jpg/1280px-Onitsha_Bridge_2.jpg',
  'Nnewi North':        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Onitsha_Bridge_2.jpg/1280px-Onitsha_Bridge_2.jpg',

  // Bauchi
  'Bauchi':             'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Wikki_warm_spring_in_Yankari.jpg/1280px-Wikki_warm_spring_in_Yankari.jpg',
  'Tafawa-Balewa':      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Wikki_warm_spring_in_Yankari.jpg/1280px-Wikki_warm_spring_in_Yankari.jpg',

  // Bayelsa
  'Yenagoa':            'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Arid_Resort_Wellness_%26_Spa%2C_Yenogoa%2C_Bayelsa_state.jpg/1280px-Arid_Resort_Wellness_%26_Spa%2C_Yenogoa%2C_Bayelsa_state.jpg',
  'Ogbia':              'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Arid_Resort_Wellness_%26_Spa%2C_Yenogoa%2C_Bayelsa_state.jpg/1280px-Arid_Resort_Wellness_%26_Spa%2C_Yenogoa%2C_Bayelsa_state.jpg',

  // Benue
  'Makurdi':            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/River_Benue_%28in_Makurdi_With_both_Bridges%29.jpg/1280px-River_Benue_%28in_Makurdi_With_both_Bridges%29.jpg',
  'Gboko':              'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Sunset_at_River_Benue.jpg/1280px-Sunset_at_River_Benue.jpg',

  // Borno
  'Maiduguri':          'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Indimi_Mosque_Maiduguri_Borno_State_Nigeria.jpg/1280px-Indimi_Mosque_Maiduguri_Borno_State_Nigeria.jpg',
  'Jere':               'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Wamdeo_Hill.JPG/1280px-Wamdeo_Hill.JPG',

  // Cross River
  'Calabar Municipal':  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Hand_sculpture_roundabout%2C_Calabar%2C_Cross_River_state2.jpg/1280px-Hand_sculpture_roundabout%2C_Calabar%2C_Cross_River_state2.jpg',
  'Calabar South':      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Hand_sculpture_roundabout%2C_Calabar%2C_Cross_River_state2.jpg/1280px-Hand_sculpture_roundabout%2C_Calabar%2C_Cross_River_state2.jpg',
  'Obudu':              'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Cross_River_National_Park%2C_Okwangwo_Division.jpg/1280px-Cross_River_National_Park%2C_Okwangwo_Division.jpg',

  // Ebonyi
  'Abakaliki':          'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Abakaliki_metropolis_with_Azugwu_Hill_in_background_03.jpg/1280px-Abakaliki_metropolis_with_Azugwu_Hill_in_background_03.jpg',
  'Afikpo North':       'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Abakaliki_metropolis_with_Azugwu_Hill_in_background_03.jpg/1280px-Abakaliki_metropolis_with_Azugwu_Hill_in_background_03.jpg',

  // Edo
  'Oredo':              'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/A_panorama_of_Benin_city.jpg/1280px-A_panorama_of_Benin_city.jpg',
  'Egor':               'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/A_panorama_of_Benin_city.jpg/1280px-A_panorama_of_Benin_city.jpg',
  'Ikpoba-Okha':        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/A_panorama_of_Benin_city.jpg/1280px-A_panorama_of_Benin_city.jpg',
  'Akoko-Edo':          'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Mountain_hill_view%2C_Ososo%2C_Akoko-Edo-8.jpg/1280px-Mountain_hill_view%2C_Ososo%2C_Akoko-Edo-8.jpg',

  // Ekiti
  'Ado Ekiti':          'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ado_Ekiti.jpg/1280px-Ado_Ekiti.jpg',
  'Ikere':              'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Ikogosi_warm_spring_02.jpg/1280px-Ikogosi_warm_spring_02.jpg',

  // Gombe
  'Akko':               'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Maize_farm_in_akko%2C_Gombe_state%2C_Nigeria.jpg/1280px-Maize_farm_in_akko%2C_Gombe_state%2C_Nigeria.jpg',
  'Gombe':              'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Rice_farm_2022.jpg/1280px-Rice_farm_2022.jpg',

  // Imo
  'Owerri Municipal':   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/CITY_SCAPE%2C_OWERRI.jpg/1280px-CITY_SCAPE%2C_OWERRI.jpg',
  'Owerri North':       'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/CITY_SCAPE%2C_OWERRI.jpg/1280px-CITY_SCAPE%2C_OWERRI.jpg',
  'Owerri West':        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/CITY_SCAPE%2C_OWERRI.jpg/1280px-CITY_SCAPE%2C_OWERRI.jpg',

  // Jigawa
  'Dutse':              'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Dutse_3.jpg/1280px-Dutse_3.jpg',
  'Hadejia':            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Dutse_Central_Mosque_3.jpg/1280px-Dutse_Central_Mosque_3.jpg',
  'Kazaure':            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Dutse_Central_Mosque_3.jpg/1280px-Dutse_Central_Mosque_3.jpg',

  // Kaduna
  'Kaduna North':       'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Zaria_Emir%27s_palace_gate.jpg/1280px-Zaria_Emir%27s_palace_gate.jpg',
  'Kaduna South':       'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Zaria_Emir%27s_palace_gate.jpg/1280px-Zaria_Emir%27s_palace_gate.jpg',
  'Zaria':              'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Zaria_Emir%27s_palace_gate.jpg/1280px-Zaria_Emir%27s_palace_gate.jpg',
  'Chikun':             'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Kamuku_National_Park_kaduna_State_Nigeria.jpg/1280px-Kamuku_National_Park_kaduna_State_Nigeria.jpg',

  // Katsina
  'Katsina':            'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Gobarau_Minaret_04.jpg/1280px-Gobarau_Minaret_04.jpg',
  'Daura':              'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Gobarau_Minaret_04.jpg/1280px-Gobarau_Minaret_04.jpg',
  'Funtua':             'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Gobarau_Minaret_04.jpg/1280px-Gobarau_Minaret_04.jpg',

  // Kebbi
  'Birnin Kebbi':       'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Central_masjid_birnin_kebbi.jpg/1280px-Central_masjid_birnin_kebbi.jpg',
  'Argungu':            'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Argungu_Fishing_Festival.jpg/1280px-Argungu_Fishing_Festival.jpg',
  'Yauri':              'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Argungu_Fishing_Festival.jpg/1280px-Argungu_Fishing_Festival.jpg',

  // Kogi
  'Lokoja':             'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/View_of_Lokoja_city_from_mountain_Patti%2C_Lokoja.jpg/1280px-View_of_Lokoja_city_from_mountain_Patti%2C_Lokoja.jpg',
  'Okene':              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Kogi_-Lokoja_Confluence.jpg/1280px-Kogi_-Lokoja_Confluence.jpg',
  'Ajaokuta':           'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Kogi_-Lokoja_Confluence.jpg/1280px-Kogi_-Lokoja_Confluence.jpg',

  // Kwara
  'Ilorin West':        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Sobi_hills%2C_Kwara_State%2C_Nigeria._01.jpg/1280px-Sobi_hills%2C_Kwara_State%2C_Nigeria._01.jpg',
  'Ilorin East':        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Sobi_hills%2C_Kwara_State%2C_Nigeria._01.jpg/1280px-Sobi_hills%2C_Kwara_State%2C_Nigeria._01.jpg',
  'Ilorin South':       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Sobi_hills%2C_Kwara_State%2C_Nigeria._01.jpg/1280px-Sobi_hills%2C_Kwara_State%2C_Nigeria._01.jpg',
  'Offa':               'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Kwara_State_University%2C_Malete.jpg/1280px-Kwara_State_University%2C_Malete.jpg',

  // Nasarawa
  'Lafia':              'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Lafia.jpg/1280px-Lafia.jpg',
  'Keffi':              'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Keffi_Town_from_the_top_of_Maloney_Hill.jpg/1280px-Keffi_Town_from_the_top_of_Maloney_Hill.jpg',
  'Karu':               'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Keffi_Town_from_the_top_of_Maloney_Hill.jpg/1280px-Keffi_Town_from_the_top_of_Maloney_Hill.jpg',

  // Niger
  'Chanchaga':          'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Minna.photowalk_City_Gate.jpg/1280px-Minna.photowalk_City_Gate.jpg',
  'Bosso':              'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Minna.photowalk_Tudun_Fulani_City_Gate.jpg/1280px-Minna.photowalk_Tudun_Fulani_City_Gate.jpg',
  'Borgu':              'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Minna.photowalk_Tudun_Fulani_City_Gate.jpg/1280px-Minna.photowalk_Tudun_Fulani_City_Gate.jpg',

  // Ondo
  'Akure South':        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Akure_Wide_Angle_Shot.jpg/1280px-Akure_Wide_Angle_Shot.jpg',
  'Akure North':        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Akure_Wide_Angle_Shot.jpg/1280px-Akure_Wide_Angle_Shot.jpg',
  'Idanre':             'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/IDANRE_HILLS.jpg/1280px-IDANRE_HILLS.jpg',
  'Owo':                'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/IDANRE_HILLS.jpg/1280px-IDANRE_HILLS.jpg',

  // Osun
  'Osogbo':             'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Osogbo.jpg/1280px-Osogbo.jpg',
  'Olorunda':           'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Osogbo.jpg/1280px-Osogbo.jpg',
  'Ife Central':        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Erin-ijesha-water-fall.jpg/1280px-Erin-ijesha-water-fall.jpg',
  'Ilesa West':         'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Erin-ijesha-water-fall.jpg/1280px-Erin-ijesha-water-fall.jpg',

  // Plateau
  'Jos North':          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Jos_nigeria05.jpg/1280px-Jos_nigeria05.jpg',
  'Jos South':          'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Jos_nigeria05.jpg/1280px-Jos_nigeria05.jpg',
  'Barkin Ladi':        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Beauty_of_God%27s_creation.jpg/1280px-Beauty_of_God%27s_creation.jpg',
  'Pankshin':           'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Beauty_of_God%27s_creation.jpg/1280px-Beauty_of_God%27s_creation.jpg',

  // Sokoto
  'Sokoto North':       'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Front_of_Sokoto_Sultan_Palce.jpg/1280px-Front_of_Sokoto_Sultan_Palce.jpg',
  'Sokoto South':       'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Front_of_Sokoto_Sultan_Palce.jpg/1280px-Front_of_Sokoto_Sultan_Palce.jpg',
  'Tambuwal':           'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Tireta_forest_in_sokoto.jpg/1280px-Tireta_forest_in_sokoto.jpg',

  // Taraba
  'Jalingo':            'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Chappal_Wadi.jpg/1280px-Chappal_Wadi.jpg',
  'Wukari':             'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Chappal_Wadi.jpg/1280px-Chappal_Wadi.jpg',
  'Sardauna':           'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Chappal_Wadi.jpg/1280px-Chappal_Wadi.jpg',

  // Yobe
  'Damaturu':           'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Round_about_jpg_damaturu.jpg/1280px-Round_about_jpg_damaturu.jpg',
  'Potiskum':           'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Oasis_amid_the_Sahel_in_Yobe_State_Nigeria.jpg/1280px-Oasis_amid_the_Sahel_in_Yobe_State_Nigeria.jpg',
  'Nguru':              'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Oasis_amid_the_Sahel_in_Yobe_State_Nigeria.jpg/1280px-Oasis_amid_the_Sahel_in_Yobe_State_Nigeria.jpg',

  // Zamfara
  'Gusau':              'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Roundabout_in_Gusau.jpg/1280px-Roundabout_in_Gusau.jpg',
  'Talata Mafara':      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Household_in_Zamfara_State.jpg/1280px-Household_in_Zamfara_State.jpg',
  'Kaura Namoda':       'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Household_in_Zamfara_State.jpg/1280px-Household_in_Zamfara_State.jpg',
};

export default LGA_IMAGES;
