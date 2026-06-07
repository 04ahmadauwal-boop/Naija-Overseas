import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Download, Calendar, Search, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LGA_IMAGES from '../utils/lgaImages';

const STATE_META = {
  Lagos:       { emoji:'🏙️', color:'from-orange-600 to-amber-500',   bg:'from-orange-50 to-amber-50',   desc:"Nigeria's commercial capital and education hub — home to the highest concentration of top private and international schools.",    image:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Lagoon_Front_Park%2C_Lagos%2C_Nigeria.jpg/1280px-Lagoon_Front_Park%2C_Lagos%2C_Nigeria.jpg', lgas:['Agege','Ajeromi-Ifelodun','Alimosho','Amuwo-Odofin','Apapa','Badagry','Epe','Eti-Osa','Ibeju-Lekki','Ifako-Ijaiye','Ikeja','Ikorodu','Kosofe','Lagos Island','Lagos Mainland','Mushin','Ojo','Oshodi-Isolo','Somolu','Surulere'] },
  FCT:         { emoji:'🏛️', color:'from-blue-700 to-sky-500',        bg:'from-blue-50 to-sky-50',        desc:'The Federal Capital Territory hosts elite federal schools, embassies and top private institutions in a planned city environment.',         image:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/City_of_abuja.jpg/1280px-City_of_abuja.jpg',                                                                                                                                    lgas:['Abaji','AMAC (Abuja Municipal)','Bwari','Gwagwalada','Kuje','Kwali'] },
  Kano:        { emoji:'🌾', color:'from-yellow-600 to-lime-500',     bg:'from-yellow-50 to-lime-50',     desc:"Northern Nigeria's most populated state with a growing collection of strong private and government-backed schools.",                       image:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Dala_Hill_the_Cradle_of_Kano_State_Nigeria.jpg/1280px-Dala_Hill_the_Cradle_of_Kano_State_Nigeria.jpg',                                                                       lgas:['Ajingi','Albasu','Bagwai','Bebeji','Bichi','Bunkure','Dala','Dambatta','Dawakin Kudu','Dawakin Tofa','Doguwa','Fagge','Gabasawa','Garko','Garun Mallam','Gaya','Gezawa','Gwale','Gwarzo','Kabo','Kano Municipal','Karaye','Kibiya','Kiru','Kumbotso','Kunchi','Kura','Madobi','Makoda','Minjibir','Nasarawa','Rano','Rimin Gado','Rogo','Shanono','Sumaila','Takai','Tarauni','Tofa','Tsanyawa','Tudun Wada','Ungogo','Warawa','Wudil'] },
  Rivers:      { emoji:'🛢️', color:'from-teal-700 to-emerald-500',   bg:'from-teal-50 to-emerald-50',   desc:'Port Harcourt drives South-South excellence — a blend of oil-sector prosperity and strong academic institutions.',                          image:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Port_Harcourt_Major_Road_%28Ikwerre_Road%29_Port_Harcourt%2C_Rivers_State%2C_Nigeria.jpg/1280px-Port_Harcourt_Major_Road_%28Ikwerre_Road%29_Port_Harcourt%2C_Rivers_State%2C_Nigeria.jpg', lgas:['Abua-Odual','Ahoada East','Ahoada West','Akuku-Toru','Andoni','Asari-Toru','Bonny','Degema','Eleme','Emohua','Etche','Gokana','Ikwerre','Khana','Obio-Akpor','Ogba-Egbema-Ndoni','Ogu-Bolo','Okrika','Omuma','Opobo-Nkoro','Oyigbo','Port Harcourt','Tai'] },
  Ogun:        { emoji:'🌲', color:'from-green-700 to-emerald-500',   bg:'from-green-50 to-emerald-50',  desc:"Ogun State's strategic location between Lagos and Ibadan makes it a gateway to quality education for South-West families.",                  image:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Aerial_view_of_Abeokuta_from_Olumo_rock.jpg/1280px-Aerial_view_of_Abeokuta_from_Olumo_rock.jpg',                                                                              lgas:['Abeokuta North','Abeokuta South','Ado-Odo/Ota','Ewekoro','Ifo','Ijebu East','Ijebu North','Ijebu North East','Ijebu Ode','Ikenne','Imeko-Afon','Ipokia','Obafemi-Owode','Odeda','Odogbolu','Ogun Waterside','Remo North','Sagamu','Yewa North','Yewa South'] },
  Enugu:       { emoji:'⛏️', color:'from-stone-600 to-gray-500',     bg:'from-stone-50 to-gray-50',     desc:"The Coal City State is one of South-East Nigeria's academic centres — known for discipline and strong secondary schools.",                   image:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Awhum_Water_Fall_Enugu%2C_Nigeria.jpg/1280px-Awhum_Water_Fall_Enugu%2C_Nigeria.jpg',                                                                                            lgas:['Aninri','Awgu','Enugu East','Enugu North','Enugu South','Ezeagu','Igbo-Etiti','Igbo-Eze North','Igbo-Eze South','Isi-Uzo','Nkanu East','Nkanu West','Nsukka','Oji-River','Udenu','Udi','Uzo-Uwani'] },
  Oyo:         { emoji:'🏯', color:'from-purple-700 to-violet-500',   bg:'from-purple-50 to-violet-50',  desc:"Ibadan, Nigeria's largest city by land mass, anchors Oyo State's academic legacy with historic institutions and modern schools.",            image:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Dugbe_commercial_area%2C_Ibadan_Oyo_state.jpg/1280px-Dugbe_commercial_area%2C_Ibadan_Oyo_state.jpg',                                                                            lgas:['Afijio','Akinyele','Atiba','Atisbo','Egbeda','Ibadan North','Ibadan North-East','Ibadan North-West','Ibadan South-East','Ibadan South-West','Ibarapa Central','Ibarapa East','Ibarapa North','Ido','Irepo','Iseyin','Itesiwaju','Iwajowa','Kajola','Lagelu','Ogbomosho North','Ogbomosho South','Ogo-Oluwa','Olorunsogo','Oluyole','Ona-Ara','Orelope','Orire','Oyo East','Oyo West','Saki East','Saki West','Surulere'] },
  Delta:       { emoji:'🌊', color:'from-cyan-700 to-blue-500',       bg:'from-cyan-50 to-blue-50',      desc:'Delta State combines Niger Delta wealth with strong academic ambition — offering a range of private and public school options.',              image:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Meet_Ethiope_River%2C_Abraka%2C_Delta%2C_Nigeria.jpg/1280px-Meet_Ethiope_River%2C_Abraka%2C_Delta%2C_Nigeria.jpg',                                                                  lgas:['Aniocha North','Aniocha South','Bomadi','Burutu','Ethiope East','Ethiope West','Ika North East','Ika South','Isoko North','Isoko South','Ndokwa East','Ndokwa West','Okpe','Oshimili North','Oshimili South','Patani','Sapele','Udu','Ughelli North','Ughelli South','Ukwuani','Uvwie','Warri North','Warri South','Warri South-West'] },
  Abia:        { emoji:'🏭', color:'from-red-600 to-rose-500',        bg:'from-red-50 to-rose-50',        desc:'Abia State is the backbone of the South-East economy with a growing number of strong private and federal schools.',                         image:'', lgas:['Aba North','Aba South','Arochukwu','Bende','Ikwuano','Isiala Ngwa North','Isiala Ngwa South','Isuikwuato','Obi Ngwa','Ohafia','Osisioma','Ugwunagbo','Ukwa East','Ukwa West','Umuahia North','Umuahia South','Umu Nneochi'] },
  Adamawa:     { emoji:'🌄', color:'from-amber-600 to-orange-500',    bg:'from-amber-50 to-orange-50',   desc:'Adamawa State — the land of beauty — offers a mix of federal, state and private schools across its 21 local government areas.',               image:'', lgas:['Demsa','Fufure','Ganye','Gayuk','Gombi','Grie','Hong','Jada','Lamurde','Madagali','Maiha','Mayo Belwa','Michika','Mubi North','Mubi South','Numan','Shelleng','Song','Toungo','Yola North','Yola South'] },
  'Akwa Ibom': { emoji:'🛳️', color:'from-sky-600 to-blue-500',       bg:'from-sky-50 to-blue-50',        desc:'Akwa Ibom is one of the most prosperous states in the South-South with strong investment in education infrastructure.',                       image:'', lgas:['Abak','Eastern Obolo','Eket','Esit-Eket','Essien Udim','Etim-Ekpo','Etinan','Ibeno','Ibesikpo-Asutan','Ibiono-Ibom','Ika','Ikono','Ikot Abasi','Ikot Ekpene','Ini','Itu','Mbo','Mkpat-Enin','Nsit-Atai','Nsit-Ibom','Nsit-Ubium','Obot-Akara','Okobo','Onna','Oron','Oruk Anam','Udung-Uko','Ukanafun','Uruan','Urue-Offong/Oruko','Uyo'] },
  Anambra:     { emoji:'🏙️', color:'from-red-700 to-rose-500',       bg:'from-red-50 to-rose-50',        desc:'Anambra State is a leading South-East education hub known for high academic standards and a strong private school culture.',                    image:'', lgas:['Aguata','Anambra East','Anambra West','Anaocha','Awka North','Awka South','Ayamelum','Dunukofia','Ekwusigo','Idemili North','Idemili South','Ihiala','Njikoka','Nnewi North','Nnewi South','Ogbaru','Onitsha North','Onitsha South','Orumba North','Orumba South','Oyi'] },
  Bauchi:      { emoji:'🦁', color:'from-orange-700 to-red-500',      bg:'from-orange-50 to-red-50',      desc:'Bauchi — the Pearl of the North — is growing its education sector with increasing private school investment across 20 LGAs.',                 image:'', lgas:['Alkaleri','Bauchi','Bogoro','Damban','Darazo','Dass','Gamawa','Ganjuwa','Giade','Itas/Gadau','Katagum','Kirfi','Misau','Ningi','Shira','Tafawa-Balewa','Toro','Warji','Zaki','Jama\'are'] },
  Bayelsa:     { emoji:'🌊', color:'from-cyan-600 to-sky-500',        bg:'from-cyan-50 to-sky-50',        desc:'Bayelsa — the glory of all lands — is developing its education landscape with quality schools across its 8 local government areas.',           image:'', lgas:['Brass','Ekeremor','Kolokuma/Opokuma','Nembe','Ogbia','Sagbama','Southern Ijaw','Yenagoa'] },
  Benue:       { emoji:'🌾', color:'from-lime-600 to-green-500',      bg:'from-lime-50 to-green-50',      desc:'Benue — the food basket of the nation — invests in strong academic institutions across its 23 local government areas.',                       image:'', lgas:['Ado','Agatu','Apa','Buruku','Gboko','Guma','Gwer East','Gwer West','Katsina-Ala','Konshisha','Kwande','Logo','Makurdi','Obi','Ogbadibo','Ohimini','Oju','Okpokwu','Oturkpo','Tarka','Ukum','Ushongo','Vandeikya'] },
  Borno:       { emoji:'🕌', color:'from-red-600 to-orange-500',      bg:'from-red-50 to-orange-50',      desc:'Borno State, home of peace and culture, is rebuilding its education sector with federal and state-supported schools across 27 LGAs.',         image:'', lgas:['Abadam','Askira/Uba','Bama','Bayo','Biu','Chibok','Damboa','Dikwa','Gubio','Guzamala','Gwoza','Hawul','Jere','Kaga','Kala/Balge','Konduga','Kukawa','Kwaya Kusar','Mafa','Magumeri','Maiduguri','Marte','Mobbar','Monguno','Ngala','Nganzai','Shani'] },
  'Cross River':{ emoji:'🌿', color:'from-green-600 to-teal-500',     bg:'from-green-50 to-teal-50',      desc:'Cross River State combines natural beauty with strong academic institutions, particularly in Calabar and surrounding communities.',             image:'', lgas:['Abi','Akamkpa','Akpabuyo','Bakassi','Bekwarra','Biase','Boki','Calabar Municipal','Calabar South','Etung','Ikom','Obanliku','Obubra','Obudu','Odukpani','Ogoja','Yakuur','Yala'] },
  Ebonyi:      { emoji:'⛰️', color:'from-gray-600 to-slate-500',     bg:'from-gray-50 to-slate-50',      desc:'Ebonyi — the salt of the nation — is growing its education sector with public and private schools across 13 local government areas.',           image:'', lgas:['Abakaliki','Afikpo North','Afikpo South','Ebonyi','Ezza North','Ezza South','Ikwo','Ishielu','Ivo','Izzi','Ohaozara','Ohaukwu','Onicha'] },
  Edo:         { emoji:'🏛️', color:'from-amber-600 to-yellow-500',   bg:'from-amber-50 to-yellow-50',   desc:'Edo State — the heartbeat of the Benin Kingdom — combines rich cultural heritage with strong private and public schools.',                      image:'', lgas:['Akoko-Edo','Egor','Esan Central','Esan North-East','Esan South-East','Esan West','Etsako Central','Etsako East','Etsako West','Igueben','Ikpoba-Okha','Orhionmwon','Oredo','Ovia North-East','Ovia South-West','Owan East','Owan West','Uhunmwonde'] },
  Ekiti:       { emoji:'🏔️', color:'from-teal-600 to-cyan-500',      bg:'from-teal-50 to-cyan-50',       desc:'Ekiti — the fountain of knowledge — is renowned for its highly educated population and excellent primary and secondary schools.',               image:'', lgas:['Ado Ekiti','Efon','Ekiti East','Ekiti South-West','Ekiti West','Emure','Gbonyin','Ido Osi','Ijero','Ikere','Ikole','Ilejemeje','Irepodun/Ifelodun','Ise/Orun','Moba','Oye'] },
  Gombe:       { emoji:'🌾', color:'from-lime-600 to-amber-500',      bg:'from-lime-50 to-amber-50',      desc:'Gombe — the jewel of the savannah — is building quality schools across its 11 local government areas in the North-East.',                    image:'', lgas:['Akko','Balanga','Billiri','Dukku','Funakaye','Gombe','Kaltungo','Kwami','Nafada','Shomgom','Yamaltu/Deba'] },
  Imo:         { emoji:'🌿', color:'from-lime-700 to-green-500',      bg:'from-lime-50 to-green-50',      desc:'Imo State has a strong culture of education in Eastern Nigeria with many top-rated private schools in Owerri and surrounding LGAs.',           image:'', lgas:['Aboh Mbaise','Ahiazu Mbaise','Ehime Mbano','Ezinihitte Mbaise','Ideato North','Ideato South','Ihitte/Uboma','Ikeduru','Isiala Mbano','Isu','Mbaitoli','Ngor Okpala','Njaba','Nkwerre','Nwangele','Obowo','Oguta','Ohaji/Egbema','Okigwe','Orlu','Orsu','Oru East','Oru West','Owerri Municipal','Owerri North','Owerri West','Unuimo'] },
  Jigawa:      { emoji:'🌾', color:'from-orange-600 to-yellow-500',   bg:'from-orange-50 to-yellow-50',  desc:'Jigawa — the new world — is expanding its education sector with state and federal schools across 27 local government areas.',                    image:'', lgas:['Auyo','Babura','Biriniwa','Birnin Kudu','Buji','Dutse','Gagarawa','Garki','Gumel','Guri','Gwaram','Gwiwa','Hadejia','Jahun','Kafin Hausa','Kaugama','Kazaure','Kiri Kasama','Kiyawa','Maigatari','Malam Madori','Miga','Ringim','Roni','Sule Tankarkar','Taura','Yankwashi'] },
  Kaduna:      { emoji:'🏙️', color:'from-indigo-700 to-blue-500',    bg:'from-indigo-50 to-blue-50',    desc:'Kaduna State is a major North-West education hub with a diverse mix of private, federal and state schools across 23 LGAs.',                    image:'', lgas:['Birnin Gwari','Chikun','Giwa','Igabi','Ikara','Jaba','Jema\'a','Kachia','Kaduna North','Kaduna South','Kagarko','Kajuru','Kaura','Kauru','Kubau','Kudan','Lere','Makarfi','Sabon Gari','Sanga','Soba','Zangon Kataf','Zaria'] },
  Katsina:     { emoji:'🕌', color:'from-yellow-600 to-amber-500',    bg:'from-yellow-50 to-amber-50',   desc:'Katsina State — land of hospitality — has a growing private school sector alongside strong federal and state secondary schools.',                image:'', lgas:['Bakori','Batagarawa','Batsari','Baure','Bindawa','Charanchi','Dandume','Danja','Dan Musa','Daura','Dutsi','Dutsin-Ma','Faskari','Funtua','Ingawa','Jibia','Kafur','Kaita','Kankara','Kankia','Katsina','Kurfi','Kusada','Mai\'adua','Malumfashi','Mani','Mashi','Matazu','Musawa','Rimi','Sabuwa','Safana','Sandamu','Zango'] },
  Kebbi:       { emoji:'🌊', color:'from-blue-600 to-cyan-500',       bg:'from-blue-50 to-cyan-50',       desc:'Kebbi — the land of equity — is expanding its education offerings with quality schools across all 21 local government areas.',                 image:'', lgas:['Aleiro','Arewa Dandi','Argungu','Augie','Bagudo','Birnin Kebbi','Bunza','Dandi','Fakai','Gwandu','Jega','Kalgo','Koko/Besse','Maiyama','Ngaski','Sakaba','Shanga','Suru','Wasagu/Danko','Yauri','Zuru'] },
  Kogi:        { emoji:'⛰️', color:'from-red-600 to-orange-500',      bg:'from-red-50 to-orange-50',      desc:'Kogi — the confluence state — sits at the meeting of Nigeria\'s two great rivers with increasing investment in quality schools.',              image:'', lgas:['Adavi','Ajaokuta','Ankpa','Bassa','Dekina','Ibaji','Idah','Igalamela Odolu','Ijumu','Kabba/Bunu','Kogi','Lokoja','Mopa Muro','Ofu','Ogori/Magongo','Okehi','Okene','Olamaboro','Omala','Yagba East','Yagba West'] },
  Kwara:       { emoji:'🏞️', color:'from-emerald-600 to-teal-500',   bg:'from-emerald-50 to-teal-50',   desc:'Kwara — the state of harmony — has a mix of federal government colleges, private and state secondary schools across 16 LGAs.',                  image:'', lgas:['Asa','Baruten','Edu','Ekiti','Ifelodun','Ilorin East','Ilorin South','Ilorin West','Irepodun','Isin','Kaiama','Moro','Offa','Oke-Ero','Oyun','Pategi'] },
  Nasarawa:    { emoji:'🌲', color:'from-green-600 to-teal-500',      bg:'from-green-50 to-teal-50',      desc:'Nasarawa — home of solid minerals — is expanding its education sector with private and state schools across 13 local government areas.',       image:'', lgas:['Akwanga','Awe','Doma','Karu','Keana','Keffi','Kokona','Lafia','Nasarawa','Nasarawa Egon','Obi','Toto','Wamba'] },
  Niger:       { emoji:'🌊', color:'from-blue-600 to-indigo-500',     bg:'from-blue-50 to-indigo-50',     desc:'Niger State — the power state — has vast land and growing education infrastructure across 25 local government areas.',                          image:'', lgas:['Agaie','Agwara','Bida','Borgu','Bosso','Chanchaga','Edati','Gbako','Gurara','Katcha','Kontagora','Lapai','Lavun','Magama','Mariga','Mashegu','Mokwa','Moya','Paikoro','Rafi','Rijau','Shiroro','Suleja','Tafa','Wushishi'] },
  Ondo:        { emoji:'🌿', color:'from-yellow-600 to-green-500',    bg:'from-yellow-50 to-green-50',    desc:'Ondo — the sunshine state — has quality schools across its 18 LGAs ranging from Akure to the coastal Ilaje communities.',                      image:'', lgas:['Akoko North-East','Akoko North-West','Akoko South-East','Akoko South-West','Akure North','Akure South','Ese Odo','Idanre','Ifedore','Ilaje','Ile Oluji/Okeigbo','Irele','Odigbo','Okitipupa','Ondo East','Ondo West','Ose','Owo'] },
  Osun:        { emoji:'🏛️', color:'from-violet-600 to-purple-500',  bg:'from-violet-50 to-purple-50',  desc:'Osun — the state of the living spring — is known for its high literacy rate and strong tradition of quality education.',                       image:'', lgas:['Aiyedade','Aiyedire','Atakumosa East','Atakumosa West','Boluwaduro','Boripe','Ede North','Ede South','Egbedore','Ejigbo','Ife Central','Ife East','Ife North','Ife South','Ifedayo','Ifelodun','Ila','Ilesa East','Ilesa West','Irepodun','Irewole','Isokan','Iwo','Obokun','Odo-Otin','Ola Oluwa','Olorunda','Oriade','Orolu','Osogbo'] },
  Plateau:     { emoji:'🏔️', color:'from-slate-600 to-gray-500',     bg:'from-slate-50 to-gray-50',      desc:'Plateau State — home of peace and tourism — has quality schools dotted across its highlands, including many reputable secondary schools.',    image:'', lgas:['Barkin Ladi','Bassa','Bokkos','Jos East','Jos North','Jos South','Kanam','Kanke','Langtang North','Langtang South','Mangu','Mikang','Pankshin','Qua\'an Pan','Riyom','Shendam','Wase'] },
  Sokoto:      { emoji:'🕌', color:'from-yellow-700 to-orange-500',   bg:'from-yellow-50 to-orange-50',  desc:'Sokoto — the seat of the Caliphate — has a rich Islamic education tradition alongside growing modern schools across 23 LGAs.',                  image:'', lgas:['Binji','Bodinga','Dange Shuni','Gada','Goronyo','Gudu','Gwadabawa','Illela','Isa','Kebbe','Kware','Rabah','Sabon Birni','Shagari','Silame','Sokoto North','Sokoto South','Tambuwal','Tangaza','Tureta','Wamako','Wurno','Yabo'] },
  Taraba:      { emoji:'🌿', color:'from-emerald-700 to-green-500',   bg:'from-emerald-50 to-green-50',  desc:"Taraba — nature's treasure — has a growing education sector with schools spread across 16 diverse local government areas.",                       image:'', lgas:['Ardo-Kola','Bali','Donga','Gashaka','Gassol','Ibi','Jalingo','Karim-Lamido','Kumi','Lau','Sardauna','Takum','Ussa','Wukari','Yorro','Zing'] },
  Yobe:        { emoji:'🏜️', color:'from-stone-600 to-amber-500',    bg:'from-stone-50 to-amber-50',    desc:'Yobe — pride of the northeast — is rebuilding its education sector with federal, state and private schools across 17 LGAs.',                   image:'', lgas:['Bade','Bursari','Damaturu','Fika','Fune','Geidam','Gujba','Gulani','Jakusko','Karasuwa','Machina','Nangere','Nguru','Potiskum','Tarmuwa','Yunusari','Yusufari'] },
  Zamfara:     { emoji:'🌾', color:'from-yellow-600 to-lime-500',     bg:'from-yellow-50 to-lime-50',    desc:'Zamfara State is expanding its education sector, blending traditional Islamic learning with modern school infrastructure across 14 LGAs.',      image:'', lgas:['Anka','Bakura','Birnin Magaji/Kiyaw','Bukkuyum','Bungudu','Gummi','Gusau','Kaura Namoda','Maradun','Maru','Shinkafi','Talata Mafara','Tsafe','Zurmi'] },
};

const STATE_EXTRA_IMAGES = {
  Abia:          'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Azumini_Blue_River_in_Abia_state%2C_Nigeria.jpg/1280px-Azumini_Blue_River_in_Abia_state%2C_Nigeria.jpg',
  Adamawa:       'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/AUN_Campus.jpg/1280px-AUN_Campus.jpg',
  'Akwa Ibom':   'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Ibom_Plaza_Roundabout_-_drone_view_2024.jpg/1280px-Ibom_Plaza_Roundabout_-_drone_view_2024.jpg',
  Anambra:       'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Onitsha_Bridge_2.jpg/1280px-Onitsha_Bridge_2.jpg',
  Bauchi:        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Wikki_warm_spring_in_Yankari.jpg/1280px-Wikki_warm_spring_in_Yankari.jpg',
  Bayelsa:       'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Arid_Resort_Wellness_%26_Spa%2C_Yenogoa%2C_Bayelsa_state.jpg/1280px-Arid_Resort_Wellness_%26_Spa%2C_Yenogoa%2C_Bayelsa_state.jpg',
  Benue:         'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Sunset_at_River_Benue.jpg/1280px-Sunset_at_River_Benue.jpg',
  Borno:         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Wamdeo_Hill.JPG/1280px-Wamdeo_Hill.JPG',
  'Cross River': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Cross_River_National_Park%2C_Okwangwo_Division.jpg/1280px-Cross_River_National_Park%2C_Okwangwo_Division.jpg',
  Ebonyi:        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Abakaliki_metropolis_with_Azugwu_Hill_in_background_03.jpg/1280px-Abakaliki_metropolis_with_Azugwu_Hill_in_background_03.jpg',
  Edo:           'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Mountain_hill_view%2C_Ososo%2C_Akoko-Edo-8.jpg/1280px-Mountain_hill_view%2C_Ososo%2C_Akoko-Edo-8.jpg',
  Ekiti:         'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Ikogosi_warm_spring_02.jpg/1280px-Ikogosi_warm_spring_02.jpg',
  Gombe:         'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Rice_farm_2022.jpg/1280px-Rice_farm_2022.jpg',
  Imo:           'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Aboh_Mbaise_Local_Government_Area_in_Imo_State.jpg/1280px-Aboh_Mbaise_Local_Government_Area_in_Imo_State.jpg',
  Jigawa:        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Dutse_Central_Mosque_3.jpg/1280px-Dutse_Central_Mosque_3.jpg',
  Kaduna:        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Kamuku_National_Park_kaduna_State_Nigeria.jpg/1280px-Kamuku_National_Park_kaduna_State_Nigeria.jpg',
  Katsina:       'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Gobarau_Minaret_04.jpg/1280px-Gobarau_Minaret_04.jpg',
  Kebbi:         'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Argungu_Fishing_Festival.jpg/1280px-Argungu_Fishing_Festival.jpg',
  Kogi:          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Kogi_-Lokoja_Confluence.jpg/1280px-Kogi_-Lokoja_Confluence.jpg',
  Kwara:         'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Kwara_State_University%2C_Malete.jpg/1280px-Kwara_State_University%2C_Malete.jpg',
  Nasarawa:      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Keffi_Town_from_the_top_of_Maloney_Hill.jpg/1280px-Keffi_Town_from_the_top_of_Maloney_Hill.jpg',
  Niger:         'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Minna.photowalk_Tudun_Fulani_City_Gate.jpg/1280px-Minna.photowalk_Tudun_Fulani_City_Gate.jpg',
  Ondo:          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/IDANRE_HILLS.jpg/1280px-IDANRE_HILLS.jpg',
  Osun:          'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Erin-ijesha-water-fall.jpg/1280px-Erin-ijesha-water-fall.jpg',
  Plateau:       "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Beauty_of_God%27s_creation.jpg/1280px-Beauty_of_God%27s_creation.jpg",
  Sokoto:        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Tireta_forest_in_sokoto.jpg/1280px-Tireta_forest_in_sokoto.jpg',
  Taraba:        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Chappal_Wadi.jpg/1280px-Chappal_Wadi.jpg',
  Yobe:          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Oasis_amid_the_Sahel_in_Yobe_State_Nigeria.jpg/1280px-Oasis_amid_the_Sahel_in_Yobe_State_Nigeria.jpg',
  Zamfara:       'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Household_in_Zamfara_State.jpg/1280px-Household_in_Zamfara_State.jpg',
};

const DEFAULT_META = {
  emoji: '🏫',
  color: 'from-green-700 to-emerald-500',
  bg: 'from-green-50 to-emerald-50',
  desc: 'Discover verified, top-rated schools in this state — compare fees, curriculum, type and more.',
  image: '',
  lgas: [],
};

// Academic calendars per state (2025/2026 session)
// Place approved state landmark photos at: public/images/states/{state-lowercase}.jpg
const STATE_CALENDARS = {
  Lagos: {
    year: '2025/2026', authority: 'Lagos State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 19, 2025', weeks: '14 wks' },
      { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 2, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 24, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 27–31, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 20, 2025 – Jan 11, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 23–27, 2026' },
      { name: 'Easter Break',          dates: 'Apr 3–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 25 – Sep 14, 2026' },
    ],
  },
  FCT: {
    year: '2025/2026', authority: 'FCT Education Secretariat',
    terms: [
      { name: 'First Term',  start: 'Sep 22, 2025', end: 'Dec 20, 2025', weeks: '13 wks' },
      { name: 'Second Term', start: 'Jan 19, 2026', end: 'Apr 9, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 25, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Nov 3–7, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 21, 2025 – Jan 18, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Mar 2–6, 2026' },
      { name: 'Easter Break',          dates: 'Apr 10–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 26 – Sep 21, 2026' },
    ],
  },
  Kano: {
    year: '2025/2026', authority: 'Kano State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 8, 2025',  end: 'Dec 12, 2025', weeks: '14 wks' },
      { name: 'Second Term', start: 'Jan 5, 2026',  end: 'Mar 27, 2026', weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 20, 2026', end: 'Jul 17, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 20–24, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 13, 2025 – Jan 4, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 16–20, 2026' },
      { name: 'Easter Break',          dates: 'Mar 28 – Apr 19, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 18 – Sep 7, 2026' },
    ],
  },
  Rivers: {
    year: '2025/2026', authority: 'Rivers State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 19, 2025', weeks: '14 wks' },
      { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 3, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 24, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 27–31, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 20, 2025 – Jan 11, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 23–27, 2026' },
      { name: 'Easter Break',          dates: 'Apr 4–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 25 – Sep 14, 2026' },
    ],
  },
  Ogun: {
    year: '2025/2026', authority: 'Ogun State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 12, 2025', weeks: '13 wks' },
      { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 3, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 18, 2026', weeks: '12 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 20–24, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 13, 2025 – Jan 11, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 23–27, 2026' },
      { name: 'Easter Break',          dates: 'Apr 4–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 19 – Sep 14, 2026' },
    ],
  },
  Enugu: {
    year: '2025/2026', authority: 'Enugu State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 12, 2025', weeks: '13 wks' },
      { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 2, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 18, 2026', weeks: '12 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 20–24, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 13, 2025 – Jan 11, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 16–20, 2026' },
      { name: 'Easter Break',          dates: 'Apr 3–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 19 – Sep 14, 2026' },
    ],
  },
  Oyo: {
    year: '2025/2026', authority: 'Oyo State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 12, 2025', weeks: '13 wks' },
      { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 2, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 24, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Oct 20–24, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 13, 2025 – Jan 11, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Feb 16–20, 2026' },
      { name: 'Easter Break',          dates: 'Apr 3–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 25 – Sep 14, 2026' },
    ],
  },
  Delta: {
    year: '2025/2026', authority: 'Delta State Ministry of Education',
    terms: [
      { name: 'First Term',  start: 'Sep 22, 2025', end: 'Dec 19, 2025', weeks: '13 wks' },
      { name: 'Second Term', start: 'Jan 19, 2026', end: 'Apr 9, 2026',  weeks: '12 wks' },
      { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 25, 2026', weeks: '13 wks' },
    ],
    breaks: [
      { name: 'Mid-Term Break (1st)',  dates: 'Nov 3–7, 2025' },
      { name: 'Christmas Break',       dates: 'Dec 20, 2025 – Jan 18, 2026' },
      { name: 'Mid-Term Break (2nd)',  dates: 'Mar 2–6, 2026' },
      { name: 'Easter Break',          dates: 'Apr 10–26, 2026' },
      { name: 'Long Vacation',         dates: 'Jul 26 – Sep 21, 2026' },
    ],
  },
};

const DEFAULT_CALENDAR = {
  year: '2025/2026', authority: 'Federal Ministry of Education',
  terms: [
    { name: 'First Term',  start: 'Sep 15, 2025', end: 'Dec 19, 2025', weeks: '14 wks' },
    { name: 'Second Term', start: 'Jan 12, 2026', end: 'Apr 2, 2026',  weeks: '12 wks' },
    { name: 'Third Term',  start: 'Apr 27, 2026', end: 'Jul 24, 2026', weeks: '13 wks' },
  ],
  breaks: [
    { name: 'Christmas Break', dates: 'Dec 20, 2025 – Jan 11, 2026' },
    { name: 'Easter Break',    dates: 'Apr 3–26, 2026' },
    { name: 'Long Vacation',   dates: 'Jul 25 – Sep 14, 2026' },
  ],
};

const TERM_COLORS = ['bg-green-50 border-green-200 text-green-800', 'bg-blue-50 border-blue-200 text-blue-800', 'bg-purple-50 border-purple-200 text-purple-800'];

function downloadCalendar(stateName, calData) {
  const lines = [
    `${stateName.toUpperCase()} STATE SCHOOL ACADEMIC CALENDAR ${calData.year}`,
    `Approved by: ${calData.authority}`,
    `Downloaded from naijaandoverseas.com`,
    '',
    'ACADEMIC TERMS',
    'Term,Resumption Date,Closing Date,Duration',
    ...calData.terms.map(t => `${t.name},${t.start},${t.end},${t.weeks}`),
    '',
    'HOLIDAY & BREAK PERIODS',
    'Period,Dates',
    ...calData.breaks.map(b => `"${b.name}","${b.dates}"`),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${stateName}_School_Calendar_${calData.year.replace('/', '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function StateSchools() {
  const { state } = useParams();
  const navigate = useNavigate();
  const rawMeta  = STATE_META[state]     || DEFAULT_META;
  const meta     = { ...rawMeta, image: rawMeta.image || STATE_EXTRA_IMAGES[state] || '' };
  const calData  = STATE_CALENDARS[state] || DEFAULT_CALENDAR;

  const [imgError, setImgError]       = useState(false);
  const [selectedLga, setSelectedLga] = useState(null);
  const [lgaSchools, setLgaSchools]   = useState([]);
  const [lgaLoading, setLgaLoading]   = useState(false);
  const [lgaPage, setLgaPage]         = useState(1);
  const [lgaSearch, setLgaSearch]     = useState('');
  const [lgaCounts, setLgaCounts]     = useState({});
  const LGA_PER_PAGE = 5;

  const filteredLgas = lgaSearch.trim()
    ? meta.lgas.filter(l => l.toLowerCase().includes(lgaSearch.toLowerCase()))
    : meta.lgas;

  // Reset on state change
  useEffect(() => {
    window.scrollTo(0, 0);
    setImgError(false);
    setSelectedLga(null);
    setLgaSchools([]);
    setLgaPage(1);
    setLgaSearch('');
    setLgaCounts({});
  }, [state]);

  // Reset page when search changes
  useEffect(() => {
    setLgaPage(1);
    setSelectedLga(null);
    setLgaSchools([]);
  }, [lgaSearch]);

  // Fetch school counts for visible LGAs
  useEffect(() => {
    if (!state) return;
    const visibleLgas = filteredLgas.slice((lgaPage - 1) * LGA_PER_PAGE, lgaPage * LGA_PER_PAGE);
    const toFetch = visibleLgas.filter(l => !(l in lgaCounts));
    if (!toFetch.length) return;

    Promise.all(
      toFetch.map(async (lga) => {
        try {
          const [allRes, featRes] = await Promise.all([
            api.get('/schools', { params: { state, lga, limit: 1 } }),
            api.get('/schools', { params: { state, lga, featured: 'true', limit: 1 } }),
          ]);
          return { lga, total: allRes.data.total ?? 0, featured: featRes.data.total ?? 0 };
        } catch {
          return { lga, total: 0, featured: 0 };
        }
      })
    ).then(results => {
      const map = {};
      results.forEach(r => { map[r.lga] = { total: r.total, featured: r.featured }; });
      setLgaCounts(prev => ({ ...prev, ...map }));
    });
  }, [state, lgaPage, lgaSearch]); // eslint-disable-line

  const handleLgaClick = async (lga) => {
    if (selectedLga === lga) { setSelectedLga(null); setLgaSchools([]); return; }
    setSelectedLga(lga);
    setLgaSchools([]);
    setLgaLoading(true);
    try {
      const { data } = await api.get('/schools', { params: { state, lga, limit: 50 } });
      setLgaSchools(data.schools || []);
    } catch {
      toast.error('Failed to load schools');
    } finally {
      setLgaLoading(false);
    }
  };

  const handleDownload = () => {
    downloadCalendar(state, calData);
    toast.success(`${state} school calendar downloaded!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${meta.color} text-white`}>
        {/* Landmark photo background */}
        {meta.image && !imgError && (
          <img
            src={meta.image}
            alt=""
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Gradient overlay for readability */}
        <div className={`absolute inset-0 bg-gradient-to-r ${meta.color} ${meta.image && !imgError ? 'opacity-80' : 'opacity-100'}`} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-12">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-5 sm:mb-7 transition"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl sm:text-5xl shrink-0 shadow-lg">
              {meta.emoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={13} className="text-white/60" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Nigeria</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 leading-tight">
                Best Schools in {state}
              </h1>
              <p className="text-white/75 text-sm sm:text-base max-w-2xl leading-relaxed">
                {meta.desc}
              </p>
            </div>

            {meta.lgas.length > 0 && (
              <div className="shrink-0 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20 self-start sm:self-auto">
                <div className="text-2xl sm:text-3xl font-extrabold">{meta.lgas.length}</div>
                <div className="text-white/70 text-xs font-semibold mt-0.5">Local Govt Areas</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── LANDMARK PHOTO + CALENDAR ROW ───────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Local Government Areas */}
          <div className="lg:w-[62%]">
            {/* Header row */}
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} className="text-green-700 shrink-0" />
              <h2 className="font-bold text-gray-800 text-sm sm:text-base">Local Government Areas</h2>
              <span className="ml-auto text-[11px] text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full font-semibold shrink-0">
                {lgaSearch ? `${filteredLgas.length} / ${meta.lgas.length}` : `${meta.lgas.length}`} LGAs
              </span>
            </div>

            {/* Search bar */}
            <div className="mb-4">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={lgaSearch}
                  onChange={(e) => setLgaSearch(e.target.value)}
                  placeholder={`Search ${meta.lgas.length} local governments in ${state}…`}
                  className="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                />
                {lgaSearch && (
                  <button
                    onClick={() => setLgaSearch('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {lgaSearch && filteredLgas.length === 0 && (
                <p className="text-xs text-gray-400 mt-2 ml-1">No local governments match "{lgaSearch}"</p>
              )}
            </div>

            <div className="space-y-4">
              {filteredLgas.slice((lgaPage - 1) * LGA_PER_PAGE, lgaPage * LGA_PER_PAGE).map((lga, i) => {
                const isOpen = selectedLga === lga;

                const SCHOOL_BADGES = [
                  { icon: '⭐', label: 'Top Ranked #1',         bg: 'bg-amber-50 text-amber-700 border border-amber-200' },
                  { icon: '🌟', label: 'Elite Standing',         bg: 'bg-amber-50 text-amber-700 border border-amber-200' },
                  { icon: '🏛',  label: 'Heritage & Excellence', bg: 'bg-amber-50 text-amber-700 border border-amber-200' },
                  { icon: '🌱', label: 'Foundation Years',       bg: 'bg-amber-50 text-amber-700 border border-amber-200' },
                  { icon: '🔬', label: 'STEM Focus',             bg: 'bg-amber-50 text-amber-700 border border-amber-200' },
                  { icon: '🌍', label: 'International',          bg: 'bg-amber-50 text-amber-700 border border-amber-200' },
                ];

                const lgaImage = LGA_IMAGES[lga] || meta.image || '';

                return (
                  <div key={lga} className="rounded-2xl overflow-hidden shadow-md">

                    {/* ── Collapsed LGA card ────────────────────────── */}
                    <div className="relative" style={{ minHeight: '240px' }}>
                      {/* Per-LGA background image (falls back to state image, then gradient) */}
                      {lgaImage ? (
                        <img
                          src={lgaImage}
                          alt=""
                          onError={(e) => { e.target.style.display = 'none'; }}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-r ${meta.color}`} />
                      )}
                      {/* Subtle dark veil */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />

                      {/* White content card — leaves right edge showing background */}
                      <div className="relative z-10 p-4 sm:p-5" style={{ width: '88%' }}>
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-xl">
                          {/* Badge */}
                          <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full">
                            👑 EDUCATION HUB
                          </span>

                          {/* Title */}
                          <h3 className="mt-3 text-xl sm:text-2xl font-black leading-tight" style={{ color: '#1a2b4a' }}>
                            {lga}
                          </h3>
                          <p className="text-base sm:text-lg font-bold" style={{ color: '#1a2b4a' }}>
                            Academic Excellence
                          </p>

                          {/* Description with amber left border */}
                          <div className="border-l-4 border-amber-400 pl-3 mt-3 mb-4">
                            <p className="text-sm text-gray-500 leading-relaxed">
                              Discover the most prestigious schools in {lga}, {state} State — where quality education meets community.
                            </p>
                          </div>

                          {/* Stats row */}
                          {(() => {
                            const counts = lgaCounts[lga];
                            const isLoading = !(lga in lgaCounts);
                            return (
                              <div className="grid grid-cols-3 gap-2 mb-5">
                                {[
                                  { label: 'Total Schools',      val: counts?.total      },
                                  { label: 'Listed on Platform', val: counts?.total      },
                                  { label: 'Top Schools',        val: counts?.featured   },
                                ].map(({ label, val }) => (
                                  <div key={label} className="bg-white rounded-xl px-2 py-3 text-center border border-gray-100 shadow-sm">
                                    {isLoading ? (
                                      <div className="h-5 w-8 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
                                    ) : (
                                      <div className="text-xl font-black text-gray-800">{val ?? 0}</div>
                                    )}
                                    <div className="text-[10px] text-gray-500 font-semibold leading-tight mt-0.5">{label}</div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          {/* Explore button */}
                          <button
                            onClick={() => handleLgaClick(lga)}
                            className="inline-flex items-center gap-2 bg-teal-900 hover:bg-teal-800 text-white text-sm font-bold px-6 py-2.5 rounded-full transition-colors"
                          >
                            {isOpen ? `Hide ${lga}` : `Explore ${lga}`} {isOpen ? '↑' : '→'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── Expanded school grid ──────────────────────── */}
                    {isOpen && (
                      <div className="bg-gray-50 px-4 sm:px-6 py-5">
                        {/* Section header */}
                        <div className="mb-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">🏛</span>
                            <h4 className="text-lg font-extrabold" style={{ color: '#1a2b4a' }}>
                              Premier Institutions in {lga}
                            </h4>
                          </div>
                          <div className="border-l-4 border-amber-400 pl-3">
                            <p className="text-sm text-gray-500">
                              Recognized for global curricula, state-of-the-art campuses, and outstanding academic track records.
                            </p>
                          </div>
                        </div>

                        {lgaLoading ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[1, 2].map((n) => (
                              <div key={n} className="h-52 bg-gray-200 rounded-2xl animate-pulse" />
                            ))}
                          </div>
                        ) : lgaSchools.length === 0 ? (
                          <div className="text-center py-8">
                            <span className="text-4xl">🏫</span>
                            <p className="text-sm text-gray-400 mt-2">No listed schools found in {lga} yet.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {lgaSchools.map((school, idx) => {
                              const badge = SCHOOL_BADGES[idx] || { icon: '📚', label: 'Listed School', bg: 'bg-amber-50 text-amber-700 border border-amber-200' };
                              const features = [
                                school.curriculum?.length ? school.curriculum.join(' / ') : null,
                                school.description ? school.description.slice(0, 70) + (school.description.length > 70 ? '…' : '') : null,
                                school.city ? `${school.city} catchment area` : (school.lga ? `${school.lga} LGA` : null),
                              ].filter(Boolean).slice(0, 3);

                              return (
                                <div key={school._id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col">
                                  {/* School badge */}
                                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full w-fit ${badge.bg}`}>
                                    {badge.icon} {badge.label}
                                  </span>

                                  {/* School name */}
                                  <h5 className="mt-3 font-extrabold text-base leading-snug" style={{ color: '#1a2b4a' }}>
                                    {school.name}
                                  </h5>

                                  {/* Feature bullets */}
                                  {features.length > 0 && (
                                    <ul className="mt-3 space-y-2 flex-1">
                                      {features.map((f, fi) => {
                                        const icons = ['🌐', '🏫', '📍'];
                                        return (
                                          <li key={fi} className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                                            <span className="shrink-0 mt-0.5">{icons[fi] || '📌'}</span>
                                            {f}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}

                                  {/* View Profile button */}
                                  <div className="mt-4 pt-3 border-t border-gray-100">
                                    <Link
                                      to={`/schools/${school.slug}`}
                                      className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700 border border-gray-300 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors"
                                    >
                                      View Profile ›
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* LGA pagination */}
            {filteredLgas.length > LGA_PER_PAGE && (
              <div className="flex justify-center items-center gap-2 mt-4">
                {Array.from({ length: Math.ceil(filteredLgas.length / LGA_PER_PAGE) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => { setLgaPage(p); setSelectedLga(null); setLgaSchools([]); }}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                      p === lgaPage
                        ? 'bg-green-700 text-white shadow-sm'
                        : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Academic calendar card */}
          <div className="lg:w-[38%] bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            {/* Card header */}
            <div className={`bg-gradient-to-r ${meta.color} text-white px-5 py-4 rounded-t-2xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-white/80" />
                  <span className="font-bold text-sm">Academic Calendar</span>
                </div>
                <span className="text-white/70 text-xs font-semibold bg-white/15 px-2.5 py-0.5 rounded-full">
                  {calData.year}
                </span>
              </div>
              <p className="text-white/65 text-[11px] mt-1 leading-snug">{calData.authority}</p>
            </div>

            {/* Terms */}
            <div className="px-4 pt-4 pb-2 flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">School Terms</p>
              <div className="space-y-2">
                {calData.terms.map((term, i) => (
                  <div key={term.name} className={`border rounded-xl px-3 py-2.5 ${TERM_COLORS[i] || TERM_COLORS[0]}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold">{term.name}</span>
                      <span className="text-[10px] font-semibold opacity-70">{term.weeks}</span>
                    </div>
                    <p className="text-[11px] opacity-75">{term.start} – {term.end}</p>
                  </div>
                ))}
              </div>

              {/* Breaks */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3.5 mb-2">Holidays & Breaks</p>
              <div className="space-y-1.5">
                {calData.breaks.map((brk) => (
                  <div key={brk.name} className="flex items-start gap-2 text-[11px] text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                    <span>
                      <span className="font-semibold text-gray-700">{brk.name}:</span> {brk.dates}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Download button */}
            <div className="px-4 pb-4 pt-3 border-t border-gray-50">
              <button
                onClick={handleDownload}
                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${meta.color} text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition shadow-sm`}
              >
                <Download size={14} />
                Download Calendar (.csv)
              </button>
              <p className="text-center text-[10px] text-gray-400 mt-1.5">Opens in Excel, Google Sheets &amp; more</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
