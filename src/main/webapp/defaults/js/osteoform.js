"use strict";

(function($) {
    var COMPLETE_CLASS = "complete";
    var COMPLETE_VALUE = "C";
    var ABSENT_CLASS = "absent";
    var ABSENT_VALUE = "0";
    
    var relations = {
        Cranium: {
            children: [
                "Frontal_L", "Frontal_R",
                "Occipital",
                "Sphenoid",
                "Vomer",
                "Ethmoid",
                "Parietal_L", "Parietal_R",
                "Temporal_L", "Temporal_R",
                "Maxilla_L", "Maxilla_R",
                "Nasal_L", "Nasal_R",
                "Zygomatic_L", "Zygomatic_R",
                "Lacrimal_L", "Lacrimal_R",
                "Palatine_L", "Palatine_R",
                "Mandible_L", "Mandible_R",
                "Orbit_L", "Orbit_R"
            ],
            computedFrom: [
                "Frontal_L", "Frontal_R",
                "Occipital",
                "Sphenoid",
                "Vomer",
                "Ethmoid",
                "Parietal_L", "Parietal_R",
                "Temporal_L", "Temporal_R",
                "Maxilla_L", "Maxilla_R",
                "Nasal_L", "Nasal_R",
                "Zygomatic_L", "Zygomatic_R",
                "Lacrimal_L", "Lacrimal_R",
                "Palatine_L", "Palatine_R",
                "Mandible_L", "Mandible_R",
                "Orbit_L", "Orbit_R"
            ]
        },
        Occipital: {
            children: [
                'Occipital_pars_basilaris',
                'Occipital_L_pars_lateralis',
                'Occipital_R_pars_lateralis'
            ],
            computedFrom: [
                'Occipital_pars_basilaris',
                'Occipital_L_pars_lateralis',
                'Occipital_R_pars_lateralis',
                '__other__'
            ]
        },
        
        //
        
        Humerus_L_complete: {
            children: [
                "Humerus_L_JS_P",
                "Humerus_L_shaft_P",
                "Humerus_L_shaft_M",
                "Humerus_L_shaft_D",
                "Humerus_L_JS_D"
            ],
            computedFrom: [
                "Humerus_L_JS_P",
                "Humerus_L_shaft_P",
                "Humerus_L_shaft_M",
                "Humerus_L_shaft_D",
                "Humerus_L_JS_D"
            ]
        },
        Humerus_R_complete: {
            children: [
                "Humerus_R_JS_P",
                "Humerus_R_shaft_P",
                "Humerus_R_shaft_M",
                "Humerus_R_shaft_D",
                "Humerus_R_JS_D"
            ],
            computedFrom: [
                "Humerus_R_JS_P",
                "Humerus_R_shaft_P",
                "Humerus_R_shaft_M",
                "Humerus_R_shaft_D",
                "Humerus_R_JS_D"
            ]
        },
        Radius_L_complete: {
            children: [
                "Radius_L_JS_P",
                "Radius_L_shaft_P",
                "Radius_L_shaft_M",
                "Radius_L_shaft_D",
                "Radius_L_JS_D"
            ],
            computedFrom: [
                "Radius_L_JS_P",
                "Radius_L_shaft_P",
                "Radius_L_shaft_M",
                "Radius_L_shaft_D",
                "Radius_L_JS_D"
            ]
        },
        Radius_R_complete: {
            children: [
                "Radius_R_JS_P",
                "Radius_R_shaft_P",
                "Radius_R_shaft_M",
                "Radius_R_shaft_D",
                "Radius_R_JS_D"
            ],
            computedFrom: [
                "Radius_R_JS_P",
                "Radius_R_shaft_P",
                "Radius_R_shaft_M",
                "Radius_R_shaft_D",
                "Radius_R_JS_D"
            ]
        },
        Ulna_L_complete: {
            children: [
                "Ulna_L_JS_P",
                "Ulna_L_shaft_P",
                "Ulna_L_shaft_M",
                "Ulna_L_shaft_D",
                "Ulna_L_JS_D"
            ],
            computedFrom: [
                "Ulna_L_JS_P",
                "Ulna_L_shaft_P",
                "Ulna_L_shaft_M",
                "Ulna_L_shaft_D",
                "Ulna_L_JS_D"
            ]
        },
        Ulna_R_complete: {
            children: [
                "Ulna_R_JS_P",
                "Ulna_R_shaft_P",
                "Ulna_R_shaft_M",
                "Ulna_R_shaft_D",
                "Ulna_R_JS_D"
            ],
            computedFrom: [
                "Ulna_R_JS_P",
                "Ulna_R_shaft_P",
                "Ulna_R_shaft_M",
                "Ulna_R_shaft_D",
                "Ulna_R_JS_D"
            ]
        },
       
        //
        
        Femur_L_complete: {
            children: [
                "Femur_L_JS_P",
                "Femur_L_shaft_P",
                "Femur_L_shaft_M",
                "Femur_L_shaft_D",
                "Femur_L_JS_D"
            ],
            computedFrom: [
                "Femur_L_JS_P",
                "Femur_L_shaft_P",
                "Femur_L_shaft_M",
                "Femur_L_shaft_D",
                "Femur_L_JS_D"
            ]
        },
        Femur_R_complete: {
            children: [
                "Femur_R_JS_P",
                "Femur_R_shaft_P",
                "Femur_R_shaft_M",
                "Femur_R_shaft_D",
                "Femur_R_JS_D"
            ],
            computedFrom: [
                "Femur_R_JS_P",
                "Femur_R_shaft_P",
                "Femur_R_shaft_M",
                "Femur_R_shaft_D",
                "Femur_R_JS_D"
            ]
        },
        Tibia_L_complete: {
            children: [
                "Tibia_L_JS_P",
                "Tibia_L_shaft_P",
                "Tibia_L_shaft_M",
                "Tibia_L_shaft_D",
                "Tibia_L_JS_D"
            ],
            computedFrom: [
                "Tibia_L_JS_P",
                "Tibia_L_shaft_P",
                "Tibia_L_shaft_M",
                "Tibia_L_shaft_D",
                "Tibia_L_JS_D"
            ]
        },
        Tibia_R_complete: {
            children: [
                "Tibia_R_JS_P",
                "Tibia_R_shaft_P",
                "Tibia_R_shaft_M",
                "Tibia_R_shaft_D",
                "Tibia_R_JS_D"
            ],
            computedFrom: [
                "Tibia_R_JS_P",
                "Tibia_R_shaft_P",
                "Tibia_R_shaft_M",
                "Tibia_R_shaft_D",
                "Tibia_R_JS_D"
            ]
        },
        Fibula_L_complete: {
            children: [
                "Fibula_L_JS_P",
                "Fibula_L_shaft_P",
                "Fibula_L_shaft_M",
                "Fibula_L_shaft_D",
                "Fibula_L_JS_D"
            ],
            computedFrom: [
                "Fibula_L_JS_P",
                "Fibula_L_shaft_P",
                "Fibula_L_shaft_M",
                "Fibula_L_shaft_D",
                "Fibula_L_JS_D"
            ]
        },
        Fibula_R_complete: {
            children: [
                "Fibula_R_JS_P",
                "Fibula_R_shaft_P",
                "Fibula_R_shaft_M",
                "Fibula_R_shaft_D",
                "Fibula_R_JS_D"
            ],
            computedFrom: [
                "Fibula_R_JS_P",
                "Fibula_R_shaft_P",
                "Fibula_R_shaft_M",
                "Fibula_R_shaft_D",
                "Fibula_R_JS_D"
            ]
        },
       
        //
        
        Os_coxae_L: {
            children: [
                "Ischium_L",
                "Ilium_L",
                "Pubis_L",
                "Acetabulum_L",
                "Auricular_surf_L"
            ],
            computedFrom: [
                "Ischium_L",
                "Ilium_L",
                "Pubis_L",
            ]
        },
        Ischium_L: {
            markVisited: [
                "Acetabulum_L",
                "Auricular_surf_L"
            ]
        },
        Ilium_L: {
            markVisited: [
                "Acetabulum_L",
                "Auricular_surf_L"
            ]
        },
        Acetabulum_L: {
            markVisited: [
                "Auricular_surf_L"
            ]
        },
        Auricular_surf_L: {
            markVisited: [
                "Acetabulum_L"
            ]
        },
        Pubis_L: {
            markVisited: [
                "Acetabulum_L",
                "Auricular_surf_L"
            ]
        },
        Os_coxae_R: {
            children: [
                "Ischium_R",
                "Ilium_R",
                "Pubis_R",
                "Acetabulum_R",
                "Auricular_surf_R"
            ],
            computedFrom: [
                "Ischium_R",
                "Ilium_R",
                "Pubis_R"
            ]
        },
        Ischium_R: {
            markVisited: [
                "Acetabulum_R",
                "Auricular_surf_R"
            ]
        },
        Ilium_R: {
            markVisited: [
                "Acetabulum_R",
                "Auricular_surf_R"
            ]
        },
        Pubis_R: {
            markVisited: [
                "Acetabulum_R",
                "Auricular_surf_R"
            ]
        },
        Scapula_L: {
            children: [
                'Glenoid_L'
            ],
            computedFrom: [
                'Glenoid_L',
                '__other__'
            ]
        },
        Scapula_R: {
            children: [
                'Glenoid_R'
            ],
            computedFrom: [
                'Glenoid_R',
                '__other__'
            ]
        },
        Sternum: {
            children: [
                'Manubrium'
            ],
            computedFrom: [
                'Manubrium',
                '__other__'
            ]
        },
        
        //
        
        Carpals_L_complete: {
            children: [
                "Scaphoid_L",
                "Lunate_L",
                "Triquetral_L",
                "Pisiform_L",
                "Trapezium_L",
                "Trapezoid_L",
                "Capitate_L",
                "Hamate_L"
            ],
            computedFrom: [
                "Scaphoid_L",
                "Lunate_L",
                "Triquetral_L",
                "Pisiform_L",
                "Trapezium_L",
                "Trapezoid_L",
                "Capitate_L",
                "Hamate_L"
            ]
        },
        
        Carpals_R_complete: {
            children: [
                "Scaphoid_R",
                "Lunate_R",
                "Triquetral_R",
                "Pisiform_R",
                "Trapezium_R",
                "Trapezoid_R",
                "Capitate_R",
                "Hamate_R"
            ],
            computedFrom: [
                "Scaphoid_R",
                "Lunate_R",
                "Triquetral_R",
                "Pisiform_R",
                "Trapezium_R",
                "Trapezoid_R",
                "Capitate_R",
                "Hamate_R"
            ]
        },
        
        //
        
        Tarsals_L_complete: {
            children: [
                "Talus_L",
                "Calcaneus_L",
                "Navicular_L",
                "Cuboid_L",
                "Med_cuneif_1_L",
                "Int_cuneif_2_L",
                "Lat_cuneif_3_L"
            ],
            computedFrom: [
                "Talus_L",
                "Calcaneus_L",
                "Navicular_L",
                "Cuboid_L",
                "Med_cuneif_1_L",
                "Int_cuneif_2_L",
                "Lat_cuneif_3_L"
            ]
        },

        Tarsals_R_complete: {
            children: [
                "Talus_R",
                "Calcaneus_R",
                "Navicular_R",
                "Cuboid_R",
                "Med_cuneif_1_R",
                "Int_cuneif_2_R",
                "Lat_cuneif_3_R"
            ],
            computedFrom: [
                "Talus_R",
                "Calcaneus_R",
                "Navicular_R",
                "Cuboid_R",
                "Med_cuneif_1_R",
                "Int_cuneif_2_R",
                "Lat_cuneif_3_R"
            ]
        },
        
        //
        
        MC_L_complete: {
            children: [
                "MC1_L",
                "MC2_L",
                "MC3_L",
                "MC4_L",
                "MC5_L"
            ],
            computedFrom: [
                "MC1_L",
                "MC2_L",
                "MC3_L",
                "MC4_L",
                "MC5_L"
            ]
        },
        
        MC_R_complete: {
            children: [
                "MC1_R",
                "MC2_R",
                "MC3_R",
                "MC4_R",
                "MC5_R"
            ],
            computedFrom: [
                "MC1_R",
                "MC2_R",
                "MC3_R",
                "MC4_R",
                "MC5_R"
            ]
        },
        
        //
        
        MT_L_complete: {
            children: [
                "MT1_L",
                "MT2_L",
                "MT3_L",
                "MT4_L",
                "MT5_L"
            ],
            computedFrom: [
                "MT1_L",
                "MT2_L",
                "MT3_L",
                "MT4_L",
                "MT5_L"
            ]
        },
        
        MT_R_complete: {
            children: [
                "MT1_R",
                "MT2_R",
                "MT3_R",
                "MT4_R",
                "MT5_R"
            ],
            computedFrom: [
                "MT1_R",
                "MT2_R",
                "MT3_R",
                "MT4_R",
                "MT5_R"
            ]
        },
        
        //
        
        Ribs_L_complete: {
          children: [
            "Rib1_L",
            "Rib2_L",
            "Rib3_L",
            "Rib4_L",
            "Rib5_L",
            "Rib6_L",
            "Rib7_L",
            "Rib8_L",
            "Rib9_L",
            "Rib10_L",
            "Rib11_L",
            "Rib12_L"
          ],
          computedFrom: [
            "Rib1_L",
            "Rib2_L",
            "Rib3_L",
            "Rib4_L",
            "Rib5_L",
            "Rib6_L",
            "Rib7_L",
            "Rib8_L",
            "Rib9_L",
            "Rib10_L",
            "Rib11_L",
            "Rib12_L"
          ]
        },
        
        Rib1_L: {
          children: [
            "Rib1_L_sternal_end_complete",
            "Rib1_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib1_L_sternal_end_complete",
            "Rib1_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib2_L: {
          children: [
            "Rib2_L_sternal_end_complete",
            "Rib2_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib2_L_sternal_end_complete",
            "Rib2_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib3_L: {
          children: [
            "Rib3_L_sternal_end_complete",
            "Rib3_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib3_L_sternal_end_complete",
            "Rib3_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib4_L: {
          children: [
            "Rib4_L_sternal_end_complete",
            "Rib4_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib4_L_sternal_end_complete",
            "Rib4_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib5_L: {
          children: [
            "Rib5_L_sternal_end_complete",
            "Rib5_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib5_L_sternal_end_complete",
            "Rib5_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib6_L: {
          children: [
            "Rib6_L_sternal_end_complete",
            "Rib6_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib6_L_sternal_end_complete",
            "Rib6_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib7_L: {
          children: [
            "Rib7_L_sternal_end_complete",
            "Rib7_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib7_L_sternal_end_complete",
            "Rib7_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib8_L: {
          children: [
            "Rib8_L_sternal_end_complete",
            "Rib8_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib8_L_sternal_end_complete",
            "Rib8_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib9_L: {
          children: [
            "Rib9_L_sternal_end_complete",
            "Rib9_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib9_L_sternal_end_complete",
            "Rib9_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib10_L: {
          children: [
            "Rib10_L_sternal_end_complete",
            "Rib10_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib10_L_sternal_end_complete",
            "Rib10_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib11_L: {
          children: [
            "Rib11_L_sternal_end_complete",
            "Rib11_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib11_L_sternal_end_complete",
            "Rib11_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib12_L: {
          children: [
            "Rib12_L_sternal_end_complete",
            "Rib12_L_head_neck_complete"
          ],
          computedFrom: [
            "Rib12_L_sternal_end_complete",
            "Rib12_L_head_neck_complete",
            "__other__"
          ]
        },
          
        Ribs_R_complete: {
          children: [
            "Rib1_R",
            "Rib2_R",
            "Rib3_R",
            "Rib4_R",
            "Rib5_R",
            "Rib6_R",
            "Rib7_R",
            "Rib8_R",
            "Rib9_R",
            "Rib10_R",
            "Rib11_R",
            "Rib12_R"
          ],
          computedFrom: [
            "Rib1_R",
            "Rib2_R",
            "Rib3_R",
            "Rib4_R",
            "Rib5_R",
            "Rib6_R",
            "Rib7_R",
            "Rib8_R",
            "Rib9_R",
            "Rib10_R",
            "Rib11_R",
            "Rib12_R"
          ]
        },
        
        Rib1_R: {
          children: [
            "Rib1_R_sternal_end_complete",
            "Rib1_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib1_R_sternal_end_complete",
            "Rib1_R_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib2_R: {
          children: [
            "Rib2_R_sternal_end_complete",
            "Rib2_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib2_R_sternal_end_complete",
            "Rib2_R_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib3_R: {
          children: [
            "Rib3_R_sternal_end_complete",
            "Rib3_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib3_R_sternal_end_complete",
            "Rib3_R_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib4_R: {
          children: [
            "Rib4_R_sternal_end_complete",
            "Rib4_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib4_R_sternal_end_complete",
            "Rib4_R_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib5_R: {
          children: [
            "Rib5_R_sternal_end_complete",
            "Rib5_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib5_R_sternal_end_complete",
            "Rib5_R_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib6_R: {
          children: [
            "Rib6_R_sternal_end_complete",
            "Rib6_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib6_R_sternal_end_complete",
            "Rib6_R_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib7_R: {
          children: [
            "Rib7_R_sternal_end_complete",
            "Rib7_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib7_R_sternal_end_complete",
            "Rib7_R_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib8_R: {
          children: [
            "Rib8_R_sternal_end_complete",
            "Rib8_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib8_R_sternal_end_complete",
            "Rib8_R_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib9_R: {
          children: [
            "Rib9_R_sternal_end_complete",
            "Rib9_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib9_R_sternal_end_complete",
            "Rib9_R_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib10_R: {
          children: [
            "Rib10_R_sternal_end_complete",
            "Rib10_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib10_R_sternal_end_complete",
            "Rib10_R_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib11_R: {
          children: [
            "Rib11_R_sternal_end_complete",
            "Rib11_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib11_R_sternal_end_complete",
            "Rib11_R_head_neck_complete",
            "__other__"
          ]
        },
          
        Rib12_R: {
          children: [
            "Rib12_R_sternal_end_complete",
            "Rib12_R_head_neck_complete"
          ],
          computedFrom: [
            "Rib12_R_sternal_end_complete",
            "Rib12_R_head_neck_complete",
            "__other__"
          ]
        },
          
        //
        
        Vertebrae_complete: {
            children: [
                "C1_complete",
                "C2_complete",
                "C3_complete",
                "C4_complete",
                "C5_complete",
                "C6_complete",
                "C7_complete",
                "T1_complete",
                "T2_complete",
                "T3_complete",
                "T4_complete",
                "T5_complete",
                "T6_complete",
                "T7_complete",
                "T8_complete",
                "T9_complete",
                "T10_complete",
                "T11_complete",
                "T12_complete",
                "L1_complete",
                "L2_complete",
                "L3_complete",
                "L4_complete",
                "L5_complete",
                "Sacrum_complete",
                "Coccyx_complete"
            ],
            computedFrom: [
                "C1_complete",
                "C2_complete",
                "C3_complete",
                "C4_complete",
                "C5_complete",
                "C6_complete",
                "C7_complete",
                "T1_complete",
                "T2_complete",
                "T3_complete",
                "T4_complete",
                "T5_complete",
                "T6_complete",
                "T7_complete",
                "T8_complete",
                "T9_complete",
                "T10_complete",
                "T11_complete",
                "T12_complete",
                "L1_complete",
                "L2_complete",
                "L3_complete",
                "L4_complete",
                "L5_complete",
                "Sacrum_complete",
                "Coccyx_complete"
            ]
        },
        
        C1_complete: {
            children: [
                "C1_L_arch",
                "C1_R_arch"
            ],
            computedFrom: [
                "C1_L_arch",
                "C1_R_arch",
                "__other__"
            ]
        },
        
        C2_complete: {
            children: [
                "C2_centrum",
                "C2_L_arch",
                "C2_R_arch"
            ],
            computedFrom: [
                "C2_centrum",
                "C2_L_arch",
                "C2_R_arch",
                "__other__"
            ]
        },

        C3_complete: {
            children: [
                "C3_centrum",
                "C3_L_arch",
                "C3_R_arch"
            ],
            computedFrom: [
                "C3_centrum",
                "C3_L_arch",
                "C3_R_arch",
                "__other__"
            ]
        },

        C4_complete: {
            children: [
                "C4_centrum",
                "C4_L_arch",
                "C4_R_arch"
            ],
            computedFrom: [
                "C4_centrum",
                "C4_L_arch",
                "C4_R_arch",
                "__other__"
            ]
        },

        C5_complete: {
            children: [
                "C5_centrum",
                "C5_L_arch",
                "C5_R_arch"
            ],
            computedFrom: [
                "C5_centrum",
                "C5_L_arch",
                "C5_R_arch",
                "__other__"
            ]
        },

        C6_complete: {
            children: [
                "C6_centrum",
                "C6_L_arch",
                "C6_R_arch"
            ],
            computedFrom: [
                "C6_centrum",
                "C6_L_arch",
                "C6_R_arch",
                "__other__"
            ]
        },

        C7_complete: {
            children: [
                "C7_centrum",
                "C7_L_arch",
                "C7_R_arch"
            ],
            computedFrom: [
                "C7_centrum",
                "C7_L_arch",
                "C7_R_arch",
                "__other__"
            ]
        },
        
        T1_complete: {
            children: [
                "T1_centrum",
                "T1_L_arch",
                "T1_R_arch"
            ],
            computedFrom: [
                "T1_centrum",
                "T1_L_arch",
                "T1_R_arch",
                "__other__"
            ]
        },
        
        T2_complete: {
            children: [
                "T2_centrum",
                "T2_L_arch",
                "T2_R_arch"
            ],
            computedFrom: [
                "T2_centrum",
                "T2_L_arch",
                "T2_R_arch",
                "__other__"
            ]
        },

        T3_complete: {
            children: [
                "T3_centrum",
                "T3_L_arch",
                "T3_R_arch"
            ],
            computedFrom: [
                "T3_centrum",
                "T3_L_arch",
                "T3_R_arch",
                "__other__"
            ]
        },

        T4_complete: {
            children: [
                "T4_centrum",
                "T4_L_arch",
                "T4_R_arch"
            ],
            computedFrom: [
                "T4_centrum",
                "T4_L_arch",
                "T4_R_arch",
                "__other__"
            ]
        },

        T5_complete: {
            children: [
                "T5_centrum",
                "T5_L_arch",
                "T5_R_arch"
            ],
            computedFrom: [
                "T5_centrum",
                "T5_L_arch",
                "T5_R_arch",
                "__other__"
            ]
        },

        T6_complete: {
            children: [
                "T6_centrum",
                "T6_L_arch",
                "T6_R_arch"
            ],
            computedFrom: [
                "T6_centrum",
                "T6_L_arch",
                "T6_R_arch",
                "__other__"
            ]
        },

        T7_complete: {
            children: [
                "T7_centrum",
                "T7_L_arch",
                "T7_R_arch"
            ],
            computedFrom: [
                "T7_centrum",
                "T7_L_arch",
                "T7_R_arch",
                "__other__"
            ]
        },
        
        T8_complete: {
            children: [
                "T8_centrum",
                "T8_L_arch",
                "T8_R_arch"
            ],
            computedFrom: [
                "T8_centrum",
                "T8_L_arch",
                "T8_R_arch",
                "__other__"
            ]
        },
        
        T9_complete: {
            children: [
                "T9_centrum",
                "T9_L_arch",
                "T9_R_arch"
            ],
            computedFrom: [
                "T9_centrum",
                "T9_L_arch",
                "T9_R_arch",
                "__other__"
            ]
        },
        
        T10_complete: {
            children: [
                "T10_centrum",
                "T10_L_arch",
                "T10_R_arch"
            ],
            computedFrom: [
                "T10_centrum",
                "T10_L_arch",
                "T10_R_arch",
                "__other__"
            ]
        },
        
        T11_complete: {
            children: [
                "T11_centrum",
                "T11_L_arch",
                "T11_R_arch"
            ],
            computedFrom: [
                "T11_centrum",
                "T11_L_arch",
                "T11_R_arch",
                "__other__"
            ]
        },
        
        T12_complete: {
            children: [
                "T12_centrum",
                "T12_L_arch",
                "T12_R_arch"
            ],
            computedFrom: [
                "T12_centrum",
                "T12_L_arch",
                "T12_R_arch",
                "__other__"
            ]
        },

        L1_complete: {
            children: [
                "L1_centrum",
                "L1_L_arch",
                "L1_R_arch"
            ],
            computedFrom: [
                "L1_centrum",
                "L1_L_arch",
                "L1_R_arch",
                "__other__"
            ]
        },
        
        L2_complete: {
            children: [
                "L2_centrum",
                "L2_L_arch",
                "L2_R_arch"
            ],
            computedFrom: [
                "L2_centrum",
                "L2_L_arch",
                "L2_R_arch",
                "__other__"
            ]
        },

        L3_complete: {
            children: [
                "L3_centrum",
                "L3_L_arch",
                "L3_R_arch"
            ],
            computedFrom: [
                "L3_centrum",
                "L3_L_arch",
                "L3_R_arch",
                "__other__"
            ]
        },

        L4_complete: {
            children: [
                "L4_centrum",
                "L4_L_arch",
                "L4_R_arch"
            ],
            computedFrom: [
                "L4_centrum",
                "L4_L_arch",
                "L4_R_arch",
                "__other__"
            ]
        },

        L5_complete: {
            children: [
                "L5_centrum",
                "L5_L_arch",
                "L5_R_arch"
            ],
            computedFrom: [
                "L5_centrum",
                "L5_L_arch",
                "L5_R_arch",
                "__other__"
            ]
        },

        Sacrum_complete: {
            children: [
                "Sacrum",
                "Sacrum_L_alae",
                "Sacrum_R_alae",
                "S1_complete",
                "S2_complete",
                "S3_complete",
                "S4_complete",
                "S5_complete"
            ],
            computedFrom: [
                "S1_complete",
                "S2_complete",
                "S3_complete",
                "S4_complete",
                "S5_complete"
            ]
        },
        
        Sacrum: {
          children: [
              "S1_centrum",
              "S2_centrum",
              "S3_centrum",
              "S4_centrum",
              "S5_centrum"
          ],
          computedFrom: [
              "S1_centrum",
              "S2_centrum",
              "S3_centrum",
              "S4_centrum",
              "S5_centrum"
          ]
        },
        
        Sacrum_L_alae: {
            children: [
                "S1_L_ala",
                "S2_L_ala",
                "S3_L_ala",
                "S4_L_ala",
                "S5_L_ala"
            ],
            computedFrom: [
                "S1_L_ala",
                "S2_L_ala",
                "S3_L_ala",
                "S4_L_ala",
                "S5_L_ala"
            ]
        },
        
        Sacrum_R_alae: {
            children: [
                "S1_R_ala",
                "S2_R_ala",
                "S3_R_ala",
                "S4_R_ala",
                "S5_R_ala"
            ],
            computedFrom: [
                "S1_R_ala",
                "S2_R_ala",
                "S3_R_ala",
                "S4_R_ala",
                "S5_R_ala"
            ]
        },
        
        S1_complete: {
            children: [
                "S1_centrum",
                "S1_L_ala",
                "S1_R_ala"
            ],
            computedFrom: [
                "S1_centrum",
                "S1_L_ala",
                "S1_R_ala",
                "__other__"
            ]
        },

        S2_complete: {
            children: [
                "S2_centrum",
                "S2_L_ala",
                "S2_R_ala"
            ],
            computedFrom: [
                "S2_centrum",
                "S2_L_ala",
                "S2_R_ala",
                "__other__"
            ]
        },

        S3_complete: {
            children: [
                "S3_centrum",
                "S3_L_ala",
                "S3_R_ala"
            ],
            computedFrom: [
                "S3_centrum",
                "S3_L_ala",
                "S3_R_ala",
                "__other__"
            ]
        },

        S4_complete: {
            children: [
                "S4_centrum",
                "S4_L_ala",
                "S4_R_ala"
            ],
            computedFrom: [
                "S4_centrum",
                "S4_L_ala",
                "S4_R_ala",
                "__other__"
            ]
        },

        S5_complete: {
            children: [
                "S5_centrum",
                "S5_L_ala",
                "S5_R_ala"
            ],
            computedFrom: [
                "S5_centrum",
                "S5_L_ala",
                "S5_R_ala",
                "__other__"
            ]
        },

        Coccyx_complete: {
            children: [
                "Coccyx"
            ],
            computedFrom: [
                "Coccyx"
            ]
        }
    };
    
    var parents = {}
    
    for (var parentName in relations) {
        var children = relations[parentName].children;
        
        if (children) {
            for (var i=0; i<children.length; i++) {
                var childName = children[i];
                
                if (!parents[childName]) {
                    parents[childName] = [];
                }
                
                parents[childName].push(parentName);
            }
        }
    }
    
    $.widget("cspace.osteoform", {
        options: {
            className: "osteo-form",
            value: {},
            editable: false
        },
        
        _create: function() {
            var osteoform = this;
            var container = osteoform.element;

            container.addClass(osteoform.options.className);
            container.html(template());
            
            container.find("#markAllPresentButton")
                .prop("disabled", !osteoform.options.editable)
            .click(function(event) {
                    event.stopPropagation();
                    event.preventDefault();
            
                    if (window.confirm("Are you sure? This will erase all entered completeness data.")) {
                        osteoform._markAllPresent();
                    }
                });
            
            container.find("#markAllAbsentButton")
                .prop("disabled", !osteoform.options.editable)
                .click(function(event) {
                    event.stopPropagation();
                    event.preventDefault();
            
                    if (window.confirm("Are you sure? This will erase all entered completeness data.")) {
                        osteoform._markAllAbsent();
                    }
                });
        
            container.find(".osteo .permanent .zeroButton")
                .prop("disabled", !osteoform.options.editable)
                .click(function(event) {
                    event.stopPropagation();
                    event.preventDefault();
  
                    container.find(".osteo .permanent input[type='text']").each(function(index, element) {
                        var fieldName = element.name;
                        var value = "0";
    
                        element.value = value;
                        osteoform._updateModel(fieldName, value);
                  });
                });

            container.find(".osteo .deciduous .zeroButton")
                .prop("disabled", !osteoform.options.editable)
                .click(function(event) {
                    event.stopPropagation();
                    event.preventDefault();
            
                    container.find(".osteo .deciduous input[type='text']").each(function(index, element) {
                        var fieldName = element.name;
                        var value = "0";
                
                        element.value = value;
                        osteoform._updateModel(fieldName, value);
                    });
                });
            
            // name: {value: input element, ...}
            osteoform._radioInputs = {};
                
            container.find("input[type='radio']").each(function(index, element) {
                $(element)
                    .prop("disabled", !osteoform.options.editable)
                    .wrap("<label></label>")
                    .after("<span></span>")
                    .addClass(function() {
                        switch (element.value) {
                            case COMPLETE_VALUE: return COMPLETE_CLASS;
                            case ABSENT_VALUE: return ABSENT_CLASS;
                        }
                    });
            
                var inputName = element.name;
            
                if (!(inputName in osteoform._radioInputs)) {
                    osteoform._radioInputs[inputName] = {};
                }
            
                osteoform._radioInputs[inputName][element.value] = element;
            });

            container.find("input[type='checkbox']").each(function(index, element) {
                $(element)
                    .prop("disabled", !osteoform.options.editable)
                    .wrap("<label></label>")
                    .after("<span></span>");
            
                var inputName = element.name;
            
                if (!(inputName in osteoform._radioInputs)) {
                    osteoform._radioInputs[inputName] = {};
                }
            
                osteoform._radioInputs[inputName][element.value] = element;
            });
            
            // console.log(osteoform._radioInputs);
        
            // name: input element
            osteoform._textInputs = {};
        
            container.find("input[type='text']").each(function(index, element) {
                $(element).prop("disabled", !osteoform.options.editable);
                
                var inputName = element.name;
            
                if (!(inputName in osteoform._textInputs)) {
                    osteoform._textInputs[inputName] = element;
                }
            });
        
            // console.log(osteoform._textInputs);
            
            // Fill in the form.
        
            var model = osteoform.options.value;
            
            for (var fieldName in model) {
                 osteoform._updateView(fieldName, model[fieldName]);
            }
            
            container.change(function(event) {
                var target = event.target;
                var fieldName = target.name;
                var value = target.value;

                if (target.type === "checkbox" && !target.checked) {
                  value = "";
                }

                osteoform._updateModel(fieldName, value);

                osteoform._visitedFields = {};
                osteoform._visitedFields[fieldName] = true;

                if ((fieldName in relations) && relations[fieldName].markVisited) {
                    //console.log(relations[name].markVisited);
                    relations[fieldName].markVisited.forEach(function(markVisitedFieldName) {
                        osteoform._visitedFields[markVisitedFieldName] = true;
                    })
                }

                if (target.tagName === "INPUT" && (target.type === "radio" || target.type === "checkbox")) {
                    osteoform._updateParents(fieldName);

                    if (value === COMPLETE_VALUE || value === ABSENT_VALUE || target.type === "checkbox") {
                        osteoform._updateChildren(fieldName, value);
                    }
                }
            });
        },
    
        _destroy: function() {
            this.element
                .removeClass(this.options.className)
                .text("");
        },
        
        _updateModel: function(fieldName, value) {
            var model = this.options.value;
            
            if (model[fieldName] !== value) {
                model[fieldName] = value;
            
                this._trigger("change", null, { 
                    fieldName: fieldName,
                    value: value 
                });
            }
        },
        
        _updateView: function(fieldName, value) {
            if (fieldName in this._radioInputs) {
                var input = this._radioInputs[fieldName][value];
                
                if (input) {
                    input.checked = true;
                }
                else {
                    var radioInputs = this._radioInputs[fieldName];
                
                    for(var value in radioInputs) {
                        radioInputs[value].checked = false;
                    }
                }
            }
            else if (fieldName in this._textInputs) {
                var input = this._textInputs[fieldName];
                
                if (input) {
                    input.value = value;
                }
            }
        },

        _updateChildren: function(fieldName, value) {
            if (fieldName in relations) {
                var children = relations[fieldName].children;

                if (children && children.length > 0) {
                    for (var i=0; i<children.length; i++) {
                        var childName = children[i];
                    
                        if (!this._visitedFields[childName]) {
                            //console.log("child of " + name + ": " + childName + "=" + value);
                            this._updateView(childName, value);
                            this._updateModel(childName, value);
                    
                            this._visitedFields[childName] = true;
                    
                            this._updateChildren(childName, value);
                        }
                    }
                }
            }
        },
        
        _updateParents: function(fieldName) {
            var osteoform = this;
            
            if (fieldName in parents) {
                var parentNames = parents[fieldName];
            
                // Update parents breadth-first.
            
                parentNames.forEach(function(parentName) {
                    if (!osteoform._visitedFields[parentName]) {
                        var value = osteoform._computeValue(parentName);
                        //console.log("parent of " + name + ": " + parentName + "=" + value);
                        osteoform._updateView(parentName, value);
                        osteoform._updateModel(parentName, value);
                    
                        osteoform._visitedFields[parentName] = true;
                    
                        if (value === COMPLETE_VALUE || value === ABSENT_VALUE) {
                            osteoform._updateChildren(parentName, value);
                        }
                    }
                });
                        
                parentNames.forEach(function(parentName) {
                    osteoform._updateParents(parentName);
                });
            }
        },
        
        _computeValue: function(fieldName) {
            var osteoform = this;
            var model = osteoform.options.value;
            var value = model[fieldName];
            
            if (fieldName in relations) {
                var computedFromFields = relations[fieldName].computedFrom;
                
                if (computedFromFields && computedFromFields.length > 0) {
                    if (osteoform._allFieldsHaveValue(computedFromFields, COMPLETE_VALUE)) {
                        value = COMPLETE_VALUE;
                    }
                    else if (osteoform._allFieldsHaveValue(computedFromFields, ABSENT_VALUE)) {
                        value = ABSENT_VALUE;
                    }
                    else if (value == COMPLETE_VALUE || value == ABSENT_VALUE) {
                        value = "";
                    } 
                }
            }
            
            return value;
        },
        
        _allFieldsHaveValue: function(fieldNames, value) {
            var osteoform = this;
            var model = osteoform.options.value;        
            var result = true;
        
            for (var i=0; i<fieldNames.length; i++) {
                var fieldName = fieldNames[i];

                if (model[fieldName] !== value) {
                    result = false;
                    break;
                }
            }
    
            return result;
        },
        
        _markAllPresent: function() {
            this._markAll(COMPLETE_VALUE);
        },
        
        _markAllAbsent: function() {
            this._markAll(ABSENT_VALUE);
        },
        
        _markAll: function(value) {
            var radioInputs = this._radioInputs;
            
            for(var fieldName in radioInputs) {
                this._updateView(fieldName, value);
                this._updateModel(fieldName, value);
            }
        },
        
        value: function(value) {
            if (value === undefined) {
                return this.options.value;
            }
            else {
                this.options.value = value;
            }
        }
    });

    function template() {
        return (
            '<div>' +
                '<p>' +
                    '<input type="button" id="markAllPresentButton" value="Mark all present"/> ' +
                    '<input type="button" id="markAllAbsentButton" value="Mark all absent"/>' +
                '</p>' +
                '<div class="osteo-row">' +
                    '<div class="column">' +
                        '<table class="osteo">' +
                            '<thead class="flat-label">' +
                                '<tr class="sides">' +
                                    '<th class="left" colspan="5">Left/unpaired</th>' +
                                    '<th colspan="3"></th>' +
                                    '<th class="right" colspan="5">Right</th>' +
                                '</tr>' +
                                '<tr class="labels">' +
                                    '<th></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Cranium" value="0"/></td>' +
                                    '<td><input type="radio" name="Cranium" value="1"/></td>' +
                                    '<td><input type="radio" name="Cranium" value="2a"/></td>' +
                                    '<td><input type="radio" name="Cranium" value="2b"/></td>' +
                                    '<td><input type="radio" name="Cranium" value="3"/></td>' +
                                    '<td><input type="radio" name="Cranium" value="C"/></td>' +
                                    '<td class="segment">Cranium</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Frontal_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Frontal_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Frontal_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Frontal_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Frontal_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Frontal_L" value="C"/></td>' +
                                    '<td class="segment">Frontal</td>' +
                                    '<td><input type="radio" name="Frontal_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Frontal_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Frontal_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Frontal_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Frontal_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Frontal_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Occipital" value="0"/></td>' +
                                    '<td><input type="radio" name="Occipital" value="1"/></td>' +
                                    '<td><input type="radio" name="Occipital" value="2a"/></td>' +
                                    '<td><input type="radio" name="Occipital" value="2b"/></td>' +
                                    '<td><input type="radio" name="Occipital" value="3"/></td>' +
                                    '<td><input type="radio" name="Occipital" value="C"/></td>' +
                                    '<td class="segment">Occipital</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Occipital_pars_basilaris" value="0"/></td>' +
                                    '<td><input type="radio" name="Occipital_pars_basilaris" value="1"/></td>' +
                                    '<td><input type="radio" name="Occipital_pars_basilaris" value="2a"/></td>' +
                                    '<td><input type="radio" name="Occipital_pars_basilaris" value="2b"/></td>' +
                                    '<td><input type="radio" name="Occipital_pars_basilaris" value="3"/></td>' +
                                    '<td><input type="radio" name="Occipital_pars_basilaris" value="C"/></td>' +
                                    '<td class="segment">Pars basilaris</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Occipital_L_pars_lateralis" value="0"/></td>' +
                                    '<td><input type="radio" name="Occipital_L_pars_lateralis" value="1"/></td>' +
                                    '<td><input type="radio" name="Occipital_L_pars_lateralis" value="2a"/></td>' +
                                    '<td><input type="radio" name="Occipital_L_pars_lateralis" value="2b"/></td>' +
                                    '<td><input type="radio" name="Occipital_L_pars_lateralis" value="3"/></td>' +
                                    '<td><input type="radio" name="Occipital_L_pars_lateralis" value="C"/></td>' +
                                    '<td class="segment">Pars lateralis</td>' +
                                    '<td><input type="radio" name="Occipital_R_pars_lateralis" value="C"/></td>' +
                                    '<td><input type="radio" name="Occipital_R_pars_lateralis" value="3"/></td>' +
                                    '<td><input type="radio" name="Occipital_R_pars_lateralis" value="2b"/></td>' +
                                    '<td><input type="radio" name="Occipital_R_pars_lateralis" value="2a"/></td>' +
                                    '<td><input type="radio" name="Occipital_R_pars_lateralis" value="1"/></td>' +
                                    '<td><input type="radio" name="Occipital_R_pars_lateralis" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Sphenoid" value="0"/></td>' +
                                    '<td><input type="radio" name="Sphenoid" value="1"/></td>' +
                                    '<td><input type="radio" name="Sphenoid" value="2a"/></td>' +
                                    '<td><input type="radio" name="Sphenoid" value="2b"/></td>' +
                                    '<td><input type="radio" name="Sphenoid" value="3"/></td>' +
                                    '<td><input type="radio" name="Sphenoid" value="C"/></td>' +
                                    '<td class="segment">Sphenoid</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Vomer" value="0"/></td>' +
                                    '<td><input type="radio" name="Vomer" value="1"/></td>' +
                                    '<td><input type="radio" name="Vomer" value="2a"/></td>' +
                                    '<td><input type="radio" name="Vomer" value="2b"/></td>' +
                                    '<td><input type="radio" name="Vomer" value="3"/></td>' +
                                    '<td><input type="radio" name="Vomer" value="C"/></td>' +
                                    '<td class="segment">Vomer</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Ethmoid" value="0"/></td>' +
                                    '<td><input type="radio" name="Ethmoid" value="1"/></td>' +
                                    '<td><input type="radio" name="Ethmoid" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ethmoid" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ethmoid" value="3"/></td>' +
                                    '<td><input type="radio" name="Ethmoid" value="C"/></td>' +
                                    '<td class="segment">Ethmoid</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Parietal_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Parietal_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Parietal_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Parietal_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Parietal_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Parietal_L" value="C"/></td>' +
                                    '<td class="segment">Parietal</td>' +
                                    '<td><input type="radio" name="Parietal_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Parietal_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Parietal_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Parietal_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Parietal_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Parietal_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Temporal_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Temporal_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Temporal_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Temporal_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Temporal_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Temporal_L" value="C"/></td>' +
                                    '<td class="segment">Temporal</td>' +
                                    '<td><input type="radio" name="Temporal_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Temporal_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Temporal_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Temporal_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Temporal_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Temporal_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Maxilla_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Maxilla_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Maxilla_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Maxilla_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Maxilla_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Maxilla_L" value="C"/></td>' +
                                    '<td class="segment">Maxilla</td>' +
                                    '<td><input type="radio" name="Maxilla_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Maxilla_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Maxilla_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Maxilla_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Maxilla_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Maxilla_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Nasal_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Nasal_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Nasal_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Nasal_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Nasal_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Nasal_L" value="C"/></td>' +
                                    '<td class="segment">Nasal</td>' +
                                    '<td><input type="radio" name="Nasal_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Nasal_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Nasal_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Nasal_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Nasal_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Nasal_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Zygomatic_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Zygomatic_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Zygomatic_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Zygomatic_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Zygomatic_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Zygomatic_L" value="C"/></td>' +
                                    '<td class="segment">Zygomatic</td>' +
                                    '<td><input type="radio" name="Zygomatic_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Zygomatic_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Zygomatic_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Zygomatic_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Zygomatic_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Zygomatic_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Lacrimal_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Lacrimal_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Lacrimal_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Lacrimal_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Lacrimal_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Lacrimal_L" value="C"/></td>' +
                                    '<td class="segment">Lacrimal</td>' +
                                    '<td><input type="radio" name="Lacrimal_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Lacrimal_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Lacrimal_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Lacrimal_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Lacrimal_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Lacrimal_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Palatine_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Palatine_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Palatine_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Palatine_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Palatine_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Palatine_L" value="C"/></td>' +
                                    '<td class="segment">Palatine</td>' +
                                    '<td><input type="radio" name="Palatine_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Palatine_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Palatine_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Palatine_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Palatine_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Palatine_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Mandible_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Mandible_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Mandible_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Mandible_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Mandible_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Mandible_L" value="C"/></td>' +
                                    '<td class="segment">Mandible</td>' +
                                    '<td><input type="radio" name="Mandible_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Mandible_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Mandible_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Mandible_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Mandible_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Mandible_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Orbit_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Orbit_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Orbit_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Orbit_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Orbit_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Orbit_L" value="C"/></td>' +
                                    '<td class="segment">Orbit</td>' +
                                    '<td><input type="radio" name="Orbit_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Orbit_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Orbit_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Orbit_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Orbit_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Orbit_R" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Hyoid" value="0"/></td>' +
                                    '<td><input type="radio" name="Hyoid" value="1"/></td>' +
                                    '<td><input type="radio" name="Hyoid" value="2a"/></td>' +
                                    '<td><input type="radio" name="Hyoid" value="2b"/></td>' +
                                    '<td><input type="radio" name="Hyoid" value="3"/></td>' +
                                    '<td><input type="radio" name="Hyoid" value="C"/></td>' +
                                    '<td class="segment">Hyoid</td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
        
                    '<div class="column">' +
                        '<table class="osteo">' +
                            '<thead>' +
                                '<tr class="sides">' +
                                    '<th class="left" colspan="5">Left</th>' +
                                    '<th colspan="3"></th>' +
                                    '<th class="right" colspan="5">Right</th>' +
                                '</tr>' +
                                '<tr class="labels">' +
                                    '<th></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="Humerus_L_complete" type="radio" value="0"/></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Humerus_L_complete" type="radio" value="C"></td>' +
                                    '<td class="bone">Humerus</td>' +
                                    '<td><input name="Humerus_R_complete" type="radio" value="C"></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Humerus_R_complete" type="radio" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Humerus_L_JS_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_JS_P" value="C"/></td>' +
                                    '<td class="segment">Prox. JS</td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_P" value="C"/></td>' +
                                    '<td class="segment">Pr. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_M" value="0"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_M" value="C"/></td>' +
                                    '<td class="segment">Md. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_M" value="C"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_M" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_shaft_D" value="C"/></td>' +
                                    '<td class="segment">Ds. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_shaft_D" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Humerus_L_JS_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Humerus_L_JS_D" value="C"/></td>' +
                                    '<td class="segment">Dist. JS</td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Humerus_R_JS_D" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="Radius_L_complete" type="radio" value="0"/></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Radius_L_complete" type="radio" value="C"></td>' +
                                    '<td class="bone">Radius</td>' +
                                    '<td><input name="Radius_R_complete" type="radio" value="C"></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Radius_R_complete" type="radio" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Radius_L_JS_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Radius_L_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Radius_L_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Radius_L_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Radius_L_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Radius_L_JS_P" value="C"/></td>' +
                                    '<td class="segment">Prox. JS</td>' +
                                    '<td><input type="radio" name="Radius_R_JS_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Radius_R_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Radius_R_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Radius_R_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Radius_R_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Radius_R_JS_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Radius_L_shaft_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_P" value="C"/></td>' +
                                    '<td class="segment">Pr. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Radius_L_shaft_M" value="0"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_M" value="C"/></td>' +
                                    '<td class="segment">Md. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_M" value="C"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_M" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Radius_L_shaft_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Radius_L_shaft_D" value="C"/></td>' +
                                    '<td class="segment">Ds. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Radius_R_shaft_D" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Radius_L_JS_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Radius_L_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Radius_L_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Radius_L_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Radius_L_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Radius_L_JS_D" value="C"/></td>' +
                                    '<td class="segment">Dist. JS</td>' +
                                    '<td><input type="radio" name="Radius_R_JS_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Radius_R_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Radius_R_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Radius_R_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Radius_R_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Radius_R_JS_D" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="Ulna_L_complete" type="radio" value="0"/></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Ulna_L_complete" type="radio" value="C"></td>' +
                                    '<td class="bone">Ulna</td>' +
                                    '<td><input name="Ulna_R_complete" type="radio" value="C"></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Ulna_R_complete" type="radio" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Ulna_L_JS_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_JS_P" value="C"/></td>' +
                                    '<td class="segment">Prox. JS</td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_P" value="C"/></td>' +
                                    '<td class="segment">Pr. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_M" value="0"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_M" value="C"/></td>' +
                                    '<td class="segment">Md. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_M" value="C"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_M" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_shaft_D" value="C"/></td>' +
                                    '<td class="segment">Ds. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_shaft_D" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Ulna_L_JS_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Ulna_L_JS_D" value="C"/></td>' +
                                    '<td class="segment">Dist. JS</td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Ulna_R_JS_D" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
        
                    '<div class="column">' +
                        '<table class="osteo">' +
                            '<thead>' +
                                '<tr class="sides">' +
                                    '<th class="left" colspan="5">Left</th>' +
                                    '<th colspan="3"></th>' +
                                    '<th class="right" colspan="5">Right</th>' +
                                '</tr>' +
                                '<tr class="labels">' +
                                    '<th></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="Femur_L_complete" type="radio" value="0"/></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Femur_L_complete" type="radio" value="C"></td>' +
                                    '<td class="bone">Femur</td>' +
                                    '<td><input name="Femur_R_complete" type="radio" value="C"></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Femur_R_complete" type="radio" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Femur_L_JS_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Femur_L_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Femur_L_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Femur_L_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Femur_L_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Femur_L_JS_P" value="C"/></td>' +
                                    '<td class="segment">Prox. JS</td>' +
                                    '<td><input type="radio" name="Femur_R_JS_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Femur_R_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Femur_R_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Femur_R_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Femur_R_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Femur_R_JS_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Femur_L_shaft_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_P" value="C"/></td>' +
                                    '<td class="segment">Pr. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Femur_L_shaft_M" value="0"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_M" value="C"/></td>' +
                                    '<td class="segment">Md. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_M" value="C"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_M" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Femur_L_shaft_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Femur_L_shaft_D" value="C"/></td>' +
                                    '<td class="segment">Ds. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Femur_R_shaft_D" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Femur_L_JS_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Femur_L_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Femur_L_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Femur_L_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Femur_L_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Femur_L_JS_D" value="C"/></td>' +
                                    '<td class="segment">Dist. JS</td>' +
                                    '<td><input type="radio" name="Femur_R_JS_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Femur_R_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Femur_R_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Femur_R_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Femur_R_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Femur_R_JS_D" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="Tibia_L_complete" type="radio" value="0"/></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Tibia_L_complete" type="radio" value="C"></td>' +
                                    '<td class="bone">Tibia</td>' +
                                    '<td><input name="Tibia_R_complete" type="radio" value="C"></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Tibia_R_complete" type="radio" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Tibia_L_JS_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_JS_P" value="C"/></td>' +
                                    '<td class="segment">Prox. JS</td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_P" value="C"/></td>' +
                                    '<td class="segment">Pr. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_M" value="0"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_M" value="C"/></td>' +
                                    '<td class="segment">Md. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_M" value="C"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_M" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_shaft_D" value="C"/></td>' +
                                    '<td class="segment">Ds. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_shaft_D" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Tibia_L_JS_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Tibia_L_JS_D" value="C"/></td>' +
                                    '<td class="segment">Dist. JS</td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Tibia_R_JS_D" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="Fibula_L_complete" type="radio" value="0"/></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Fibula_L_complete" type="radio" value="C"></td>' +
                                    '<td class="bone">Fibula</td>' +
                                    '<td><input name="Fibula_R_complete" type="radio" value="C"></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Fibula_R_complete" type="radio" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Fibula_L_JS_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_JS_P" value="C"/></td>' +
                                    '<td class="segment">Prox. JS</td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_P" value="0"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_P" value="C"/></td>' +
                                    '<td class="segment">Pr. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_P" value="C"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_P" value="3"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_P" value="2b"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_P" value="2a"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_P" value="1"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_P" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_M" value="0"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_M" value="C"/></td>' +
                                    '<td class="segment">Md. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_M" value="C"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_M" value="3"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_M" value="2b"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_M" value="2a"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_M" value="1"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_M" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_shaft_D" value="C"/></td>' +
                                    '<td class="segment">Ds. 1/3 shaft</td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_shaft_D" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Fibula_L_JS_D" value="0"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Fibula_L_JS_D" value="C"/></td>' +
                                    '<td class="segment">Dist. JS</td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_D" value="C"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_D" value="3"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_D" value="2b"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_D" value="2a"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_D" value="1"/></td>' +
                                    '<td><input type="radio" name="Fibula_R_JS_D" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
                '</div>' +
    
                '<div class="osteo-row">' +
                    '<div class="column">' +
                        '<table class="osteo">' +
                            '<thead class="flat-label">' +
                                '<tr class="sides">' +
                                    '<th class="left" colspan="5">Left/unpaired</th>' +
                                    '<th colspan="3"></th>' +
                                    '<th class="right" colspan="5">Right</th>' +
                                '</tr>' +
                                '<tr class="labels">' +
                                    '<th></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Os_coxae_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Os_coxae_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Os_coxae_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Os_coxae_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Os_coxae_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Os_coxae_L" value="C"/></td>' +
                                    '<td class="segment">Os coxae</td>' +
                                    '<td><input type="radio" name="Os_coxae_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Os_coxae_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Os_coxae_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Os_coxae_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Os_coxae_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Os_coxae_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Ischium_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Ischium_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Ischium_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ischium_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ischium_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Ischium_L" value="C"/></td>' +
                                    '<td class="segment">Ischium</td>' +
                                    '<td><input type="radio" name="Ischium_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Ischium_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Ischium_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ischium_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ischium_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Ischium_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Ilium_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Ilium_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Ilium_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ilium_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ilium_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Ilium_L" value="C"/></td>' +
                                    '<td class="segment">Ilium</td>' +
                                    '<td><input type="radio" name="Ilium_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Ilium_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Ilium_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Ilium_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Ilium_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Ilium_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Pubis_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Pubis_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Pubis_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Pubis_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Pubis_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Pubis_L" value="C"/></td>' +
                                    '<td class="segment">Pubis</td>' +
                                    '<td><input type="radio" name="Pubis_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Pubis_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Pubis_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Pubis_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Pubis_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Pubis_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Acetabulum_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Acetabulum_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Acetabulum_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Acetabulum_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Acetabulum_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Acetabulum_L" value="C"/></td>' +
                                    '<td class="segment">Acetabulum</td>' +
                                    '<td><input type="radio" name="Acetabulum_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Acetabulum_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Acetabulum_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Acetabulum_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Acetabulum_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Acetabulum_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Auricular_surf_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Auricular_surf_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Auricular_surf_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Auricular_surf_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Auricular_surf_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Auricular_surf_L" value="C"/></td>' +
                                    '<td class="segment">Auricular sur.</td>' +
                                    '<td><input type="radio" name="Auricular_surf_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Auricular_surf_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Auricular_surf_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Auricular_surf_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Auricular_surf_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Auricular_surf_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Scapula_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Scapula_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Scapula_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Scapula_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Scapula_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Scapula_L" value="C"/></td>' +
                                    '<td class="segment">Scapula</td>' +
                                    '<td><input type="radio" name="Scapula_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Scapula_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Scapula_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Scapula_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Scapula_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Scapula_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Glenoid_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Glenoid_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Glenoid_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Glenoid_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Glenoid_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Glenoid_L" value="C"/></td>' +
                                    '<td class="segment">Glenoid</td>' +
                                    '<td><input type="radio" name="Glenoid_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Glenoid_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Glenoid_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Glenoid_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Glenoid_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Glenoid_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Clavicle_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Clavicle_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Clavicle_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Clavicle_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Clavicle_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Clavicle_L" value="C"/></td>' +
                                    '<td class="segment">Clavicle</td>' +
                                    '<td><input type="radio" name="Clavicle_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Clavicle_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Clavicle_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Clavicle_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Clavicle_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Clavicle_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Sternum" value="0"/></td>' +
                                    '<td><input type="radio" name="Sternum" value="1"/></td>' +
                                    '<td><input type="radio" name="Sternum" value="2a"/></td>' +
                                    '<td><input type="radio" name="Sternum" value="2b"/></td>' +
                                    '<td><input type="radio" name="Sternum" value="3"/></td>' +
                                    '<td><input type="radio" name="Sternum" value="C"/></td>' +
                                    '<td class="segment">Sternum</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Manubrium" value="0"/></td>' +
                                    '<td><input type="radio" name="Manubrium" value="1"/></td>' +
                                    '<td><input type="radio" name="Manubrium" value="2a"/></td>' +
                                    '<td><input type="radio" name="Manubrium" value="2b"/></td>' +
                                    '<td><input type="radio" name="Manubrium" value="3"/></td>' +
                                    '<td><input type="radio" name="Manubrium" value="C"/></td>' +
                                    '<td class="segment">Manubrium</td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Patella_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Patella_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Patella_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Patella_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Patella_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Patella_L" value="C"/></td>' +
                                    '<td class="segment">Patella</td>' +
                                    '<td><input type="radio" name="Patella_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Patella_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Patella_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Patella_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Patella_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Patella_R" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
        
                    '<div class="column">' +
                        '<table class="osteo">' +
                            '<thead>' +
                                '<tr class="sides">' +
                                    '<th class="left" colspan="5">Left</th>' +
                                    '<th colspan="3"></th>' +
                                    '<th class="right" colspan="5">Right</th>' +
                                '</tr>' +
                                '<tr class="labels">' +
                                    '<th></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="Carpals_L_complete" type="radio" value="0"/></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Carpals_L_complete" type="radio" value="C"></td>' +
                                    '<td class="bone">Wrist</td>' +
                                    '<td><input name="Carpals_R_complete" type="radio" value="C"></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Carpals_R_complete" type="radio" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Scaphoid_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Scaphoid_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Scaphoid_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Scaphoid_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Scaphoid_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Scaphoid_L" value="C"/></td>' +
                                    '<td class="segment">Scaphoid</td>' +
                                    '<td><input type="radio" name="Scaphoid_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Scaphoid_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Scaphoid_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Scaphoid_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Scaphoid_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Scaphoid_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Lunate_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Lunate_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Lunate_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Lunate_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Lunate_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Lunate_L" value="C"/></td>' +
                                    '<td class="segment">Lunate</td>' +
                                    '<td><input type="radio" name="Lunate_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Lunate_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Lunate_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Lunate_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Lunate_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Lunate_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Triquetral_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Triquetral_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Triquetral_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Triquetral_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Triquetral_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Triquetral_L" value="C"/></td>' +
                                    '<td class="segment">Triquetral</td>' +
                                    '<td><input type="radio" name="Triquetral_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Triquetral_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Triquetral_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Triquetral_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Triquetral_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Triquetral_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Pisiform_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Pisiform_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Pisiform_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Pisiform_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Pisiform_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Pisiform_L" value="C"/></td>' +
                                    '<td class="segment">Pisiform</td>' +
                                    '<td><input type="radio" name="Pisiform_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Pisiform_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Pisiform_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Pisiform_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Pisiform_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Pisiform_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Trapezium_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Trapezium_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Trapezium_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Trapezium_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Trapezium_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Trapezium_L" value="C"/></td>' +
                                    '<td class="segment">Trapezium</td>' +
                                    '<td><input type="radio" name="Trapezium_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Trapezium_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Trapezium_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Trapezium_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Trapezium_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Trapezium_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Trapezoid_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Trapezoid_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Trapezoid_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Trapezoid_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Trapezoid_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Trapezoid_L" value="C"/></td>' +
                                    '<td class="segment">Trapezoid</td>' +
                                    '<td><input type="radio" name="Trapezoid_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Trapezoid_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Trapezoid_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Trapezoid_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Trapezoid_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Trapezoid_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Capitate_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Capitate_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Capitate_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Capitate_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Capitate_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Capitate_L" value="C"/></td>' +
                                    '<td class="segment">Capitate</td>' +
                                    '<td><input type="radio" name="Capitate_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Capitate_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Capitate_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Capitate_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Capitate_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Capitate_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Hamate_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Hamate_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Hamate_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Hamate_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Hamate_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Hamate_L" value="C"/></td>' +
                                    '<td class="segment">Hamate</td>' +
                                    '<td><input type="radio" name="Hamate_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Hamate_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Hamate_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Hamate_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Hamate_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Hamate_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td colspan="6"><input type="text" class="sesamoid" name="Sesamoid_L_count_hand"/></td>' +
                                    '<td class="segment">Sesamoid</td>' +
                                    '<td colspan="6"><input type="text" class="sesamoid" name="Sesamoid_R_count_hand"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
        
                    '<div class="column">' +
                        '<table class="osteo">' +
                            '<thead>' +
                                '<tr class="sides">' +
                                    '<th class="left" colspan="5">Left</th>' +
                                    '<th colspan="3"></th>' +
                                    '<th class="right" colspan="5">Right</th>' +
                                '</tr>' +
                                '<tr class="labels">' +
                                    '<th></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="Tarsals_L_complete" type="radio" value="0"/></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Tarsals_L_complete" type="radio" value="C"></td>' +
                                    '<td class="bone">Ankle</td>' +
                                    '<td><input name="Tarsals_R_complete" type="radio" value="C"></td>' +
                                    '<td colspan="4"></td>' +
                                    '<td><input name="Tarsals_R_complete" type="radio" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Talus_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Talus_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Talus_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Talus_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Talus_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Talus_L" value="C"/></td>' +
                                    '<td class="segment">Talus</td>' +
                                    '<td><input type="radio" name="Talus_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Talus_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Talus_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Talus_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Talus_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Talus_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Calcaneus_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Calcaneus_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Calcaneus_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Calcaneus_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Calcaneus_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Calcaneus_L" value="C"/></td>' +
                                    '<td class="segment">Calcaneus</td>' +
                                    '<td><input type="radio" name="Calcaneus_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Calcaneus_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Calcaneus_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Calcaneus_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Calcaneus_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Calcaneus_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Navicular_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Navicular_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Navicular_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Navicular_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Navicular_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Navicular_L" value="C"/></td>' +
                                    '<td class="segment">Navicular</td>' +
                                    '<td><input type="radio" name="Navicular_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Navicular_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Navicular_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Navicular_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Navicular_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Navicular_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Cuboid_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Cuboid_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Cuboid_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Cuboid_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Cuboid_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Cuboid_L" value="C"/></td>' +
                                    '<td class="segment">Cuboid</td>' +
                                    '<td><input type="radio" name="Cuboid_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Cuboid_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Cuboid_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Cuboid_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Cuboid_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Cuboid_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Med_cuneif_1_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Med_cuneif_1_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Med_cuneif_1_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Med_cuneif_1_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Med_cuneif_1_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Med_cuneif_1_L" value="C"/></td>' +
                                    '<td class="segment">Med. cun. (1)</td>' +
                                    '<td><input type="radio" name="Med_cuneif_1_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Med_cuneif_1_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Med_cuneif_1_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Med_cuneif_1_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Med_cuneif_1_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Med_cuneif_1_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Int_cuneif_2_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Int_cuneif_2_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Int_cuneif_2_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Int_cuneif_2_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Int_cuneif_2_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Int_cuneif_2_L" value="C"/></td>' +
                                    '<td class="segment">Int. cun. (2)</td>' +
                                    '<td><input type="radio" name="Int_cuneif_2_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Int_cuneif_2_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Int_cuneif_2_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Int_cuneif_2_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Int_cuneif_2_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Int_cuneif_2_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_L" value="0"/></td>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_L" value="C"/></td>' +
                                    '<td class="segment">Lat. cun. (3)</td>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_R" value="1"/></td>' +
                                    '<td><input type="radio" name="Lat_cuneif_3_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td colspan="6"><input type="text" class="sesamoid" name="Sesamoid_L_count_foot"/></td>' +
                                    '<td class="segment">Sesamoid</td>' +
                                    '<td colspan="6"><input type="text" class="sesamoid" name="Sesamoid_R_count_foot"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
                '</div>' +
    
                '<div class="osteo-row">' +
                    '<div class="column">' +
                        '<table class="osteo">' +
                            '<thead>' +
                                '<tr class="sides">' +
                                    '<th colspan="4"></th>' +
                                    '<th class="left" colspan="3">Left</th>' +
                                    '<th colspan="3"></th>' +
                                    '<th class="right" colspan="3">Right</th>' +
                                '</tr>' +
                                '<tr class="labels">' +
                                    '<th></th>' +
                                    '<th><span>Sternal end</span></th>' +
                                    '<th><span>Head/neck</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>Head/neck</span></th>' +
                                    '<th><span>Sternal end</span></th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="Ribs_L_complete" type="radio" value="0"/></td>' +
                                    '<td colspan="6"></td>' +
                                    '<td><input name="Ribs_L_complete" type="radio" value="C"></td>' +
                                    '<td class="bone">Rib #</td>' +
                                    '<td><input name="Ribs_R_complete" type="radio" value="C"></td>' +
                                    '<td colspan="6"></td>' +
                                    '<td><input name="Ribs_R_complete" type="radio" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib1_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib1_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib1_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib1_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib1_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib1_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib1_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib1_L" value="C"/></td>' +
                                    '<td class="segment">1</td>' +
                                    '<td><input type="radio" name="Rib1_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib1_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib1_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib1_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib1_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib1_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib1_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib1_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib2_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib2_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib2_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib2_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib2_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib2_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib2_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib2_L" value="C"/></td>' +
                                    '<td class="segment">2</td>' +
                                    '<td><input type="radio" name="Rib2_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib2_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib2_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib2_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib2_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib2_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib2_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib2_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib3_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib3_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib3_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib3_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib3_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib3_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib3_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib3_L" value="C"/></td>' +
                                    '<td class="segment">3-9 (~3)</td>' +
                                    '<td><input type="radio" name="Rib3_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib3_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib3_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib3_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib3_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib3_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib3_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib3_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib4_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib4_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib4_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib4_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib4_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib4_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib4_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib4_L" value="C"/></td>' +
                                    '<td class="segment">3-9 (~4)</td>' +
                                    '<td><input type="radio" name="Rib4_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib4_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib4_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib4_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib4_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib4_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib4_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib4_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib5_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib5_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib5_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib5_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib5_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib5_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib5_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib5_L" value="C"/></td>' +
                                    '<td class="segment">3-9 (~5)</td>' +
                                    '<td><input type="radio" name="Rib5_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib5_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib5_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib5_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib5_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib5_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib5_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib5_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib6_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib6_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib6_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib6_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib6_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib6_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib6_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib6_L" value="C"/></td>' +
                                    '<td class="segment">3-9 (~6)</td>' +
                                    '<td><input type="radio" name="Rib6_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib6_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib6_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib6_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib6_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib6_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib6_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib6_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib7_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib7_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib7_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib7_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib7_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib7_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib7_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib7_L" value="C"/></td>' +
                                    '<td class="segment">3-9 (~7)</td>' +
                                    '<td><input type="radio" name="Rib7_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib7_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib7_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib7_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib7_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib7_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib7_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib7_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib8_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib8_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib8_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib8_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib8_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib8_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib8_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib8_L" value="C"/></td>' +
                                    '<td class="segment">3-9 (~8)</td>' +
                                    '<td><input type="radio" name="Rib8_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib8_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib8_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib8_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib8_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib8_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib8_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib8_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib9_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib9_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib9_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib9_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib9_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib9_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib9_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib9_L" value="C"/></td>' +
                                    '<td class="segment">3-9 (~9)</td>' +
                                    '<td><input type="radio" name="Rib9_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib9_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib9_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib9_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib9_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib9_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib9_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib9_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib10_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib10_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib10_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib10_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib10_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib10_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib10_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib10_L" value="C"/></td>' +
                                    '<td class="segment">10</td>' +
                                    '<td><input type="radio" name="Rib10_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib10_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib10_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib10_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib10_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib10_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib10_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib10_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib11_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib11_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib11_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib11_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib11_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib11_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib11_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib11_L" value="C"/></td>' +
                                    '<td class="segment">11</td>' +
                                    '<td><input type="radio" name="Rib11_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib11_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib11_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib11_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib11_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib11_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib11_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib11_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Rib12_L" value="0"/></td>' +
                                    '<td><input type="checkbox" name="Rib12_L_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib12_L_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib12_L" value="1"/></td>' +
                                    '<td><input type="radio" name="Rib12_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib12_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib12_L" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib12_L" value="C"/></td>' +
                                    '<td class="segment">12</td>' +
                                    '<td><input type="radio" name="Rib12_R" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib12_R" value="3"/></td>' +
                                    '<td><input type="radio" name="Rib12_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="Rib12_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="Rib12_R" value="1"/></td>' +
                                    '<td><input type="checkbox" name="Rib12_R_head_neck_complete" value="C"/></td>' +
                                    '<td><input type="checkbox" name="Rib12_R_sternal_end_complete" value="C"/></td>' +
                                    '<td><input type="radio" name="Rib12_R" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
        
                    '<div class="column">' +
                        '<table class="osteo">' +
                            '<thead>' +
                                '<tr class="sides">' +
                                    '<th class="left" colspan="6">Left</th>' +
                                    '<th colspan="3"></th>' +
                                    '<th class="right" colspan="6">Right</th>' +
                                '</tr>' +
                                '<tr class="labels">' +
                                    '<th></th>' +
                                    '<th><span>#</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>#</span></th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="MC_L_complete" type="radio" value="0"/></td>' +
                                    '<td colspan="5"></td>' +
                                    '<td><input name="MC_L_complete" type="radio" value="C"></td>' +
                                    '<td class="bone">Hand</td>' +
                                    '<td><input name="MC_R_complete" type="radio" value="C"></td>' +
                                    '<td colspan="5"></td>' +
                                    '<td><input name="MC_R_complete" type="radio" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="MC1_L" value="0"/></td>' +
                                    '<td rowspan="5"><input class="mc" type="text" name="MC_L_count"/></td>' +
                                    '<td><input type="radio" name="MC1_L" value="1"/></td>' +
                                    '<td><input type="radio" name="MC1_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="MC1_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="MC1_L" value="3"/></td>' +
                                    '<td><input type="radio" name="MC1_L" value="C"/></td>' +
                                    '<td class="segment">MC 1</td>' +
                                    '<td><input type="radio" name="MC1_R" value="C"/></td>' +
                                    '<td><input type="radio" name="MC1_R" value="3"/></td>' +
                                    '<td><input type="radio" name="MC1_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="MC1_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="MC1_R" value="1"/></td>' +
                                    '<td rowspan="5"><input class="mc" type="text" name="MC_R_count"/></td>' +
                                    '<td><input type="radio" name="MC1_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="MC2_L" value="0"/></td>' +
                                    '<td><input type="radio" name="MC2_L" value="1"/></td>' +
                                    '<td><input type="radio" name="MC2_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="MC2_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="MC2_L" value="3"/></td>' +
                                    '<td><input type="radio" name="MC2_L" value="C"/></td>' +
                                    '<td class="segment">MC 2</td>' +
                                    '<td><input type="radio" name="MC2_R" value="C"/></td>' +
                                    '<td><input type="radio" name="MC2_R" value="3"/></td>' +
                                    '<td><input type="radio" name="MC2_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="MC2_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="MC2_R" value="1"/></td>' +
                                    '<td><input type="radio" name="MC2_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="MC3_L" value="0"/></td>' +
                                    '<td><input type="radio" name="MC3_L" value="1"/></td>' +
                                    '<td><input type="radio" name="MC3_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="MC3_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="MC3_L" value="3"/></td>' +
                                    '<td><input type="radio" name="MC3_L" value="C"/></td>' +
                                    '<td class="segment">MC 3</td>' +
                                    '<td><input type="radio" name="MC3_R" value="C"/></td>' +
                                    '<td><input type="radio" name="MC3_R" value="3"/></td>' +
                                    '<td><input type="radio" name="MC3_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="MC3_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="MC3_R" value="1"/></td>' +
                                    '<td><input type="radio" name="MC3_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="MC4_L" value="0"/></td>' +
                                    '<td><input type="radio" name="MC4_L" value="1"/></td>' +
                                    '<td><input type="radio" name="MC4_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="MC4_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="MC4_L" value="3"/></td>' +
                                    '<td><input type="radio" name="MC4_L" value="C"/></td>' +
                                    '<td class="segment">MC 4</td>' +
                                    '<td><input type="radio" name="MC4_R" value="C"/></td>' +
                                    '<td><input type="radio" name="MC4_R" value="3"/></td>' +
                                    '<td><input type="radio" name="MC4_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="MC4_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="MC4_R" value="1"/></td>' +
                                    '<td><input type="radio" name="MC4_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="MC5_L" value="0"/></td>' +
                                    '<td><input type="radio" name="MC5_L" value="1"/></td>' +
                                    '<td><input type="radio" name="MC5_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="MC5_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="MC5_L" value="3"/></td>' +
                                    '<td><input type="radio" name="MC5_L" value="C"/></td>' +
                                    '<td class="segment">MC 5</td>' +
                                    '<td><input type="radio" name="MC5_R" value="C"/></td>' +
                                    '<td><input type="radio" name="MC5_R" value="3"/></td>' +
                                    '<td><input type="radio" name="MC5_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="MC5_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="MC5_R" value="1"/></td>' +
                                    '<td><input type="radio" name="MC5_R" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
        
                        '<table class="osteo phalanges">' +
                            '<tr>' +
                                '<th></th>' +
                                '<th>#</th>' +
                                '<th># (juv.)</th>' +
                            '</tr>' +
                            '<tr>' +
                                '<th>Prox. hand phalanges</th>' +
                                '<td><input type="text" name="Phalanx_P_count_hand"></td>' +
                                '<td rowspan="3"><input type="text" name="Phalanx_juv_count_hand"></td>' +
                            '</tr>' +
                            '<tr>' +
                                '<th>Int. hand phalanges</th>' +
                                '<td><input type="text" name="Phalanx_I_count_hand"></td>' +
                            '</tr>' +
                            '<tr>' +
                                '<th>Dist. hand phalanges</th>' +
                                '<td><input type="text" name="Phalanx_D_count_hand"></td>' +
                            '</tr>' +
                        '</table>' +
                    '</div>' +

                    '<div class="column">' +
                        '<table class="osteo">' +
                            '<thead>' +
                                '<tr class="sides">' +
                                    '<th class="left" colspan="6">Left</th>' +
                                    '<th colspan="3"></th>' +
                                    '<th class="right" colspan="6">Right</th>' +
                                '</tr>' +
                                '<tr class="labels">' +
                                    '<th></th>' +
                                    '<th><span>#</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>#</span></th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="MT_L_complete" type="radio" value="0"/></td>' +
                                    '<td colspan="5"></td>' +
                                    '<td><input name="MT_L_complete" type="radio" value="C"></td>' +
                                    '<td class="bone">Foot</td>' +
                                    '<td><input name="MT_R_complete" type="radio" value="C"></td>' +
                                    '<td colspan="5"></td>' +
                                    '<td><input name="MT_R_complete" type="radio" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="MT1_L" value="0"/></td>' +
                                    '<td rowspan="5"><input class="mt" type="text" name="MT_L_count"/></td>' +
                                    '<td><input type="radio" name="MT1_L" value="1"/></td>' +
                                    '<td><input type="radio" name="MT1_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="MT1_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="MT1_L" value="3"/></td>' +
                                    '<td><input type="radio" name="MT1_L" value="C"/></td>' +
                                    '<td class="segment">MT 1</td>' +
                                    '<td><input type="radio" name="MT1_R" value="C"/></td>' +
                                    '<td><input type="radio" name="MT1_R" value="3"/></td>' +
                                    '<td><input type="radio" name="MT1_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="MT1_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="MT1_R" value="1"/></td>' +
                                    '<td rowspan="5"><input class="mt" type="text" name="MT_R_count"/></td>' +
                                    '<td><input type="radio" name="MT1_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="MT2_L" value="0"/></td>' +
                                    '<td><input type="radio" name="MT2_L" value="1"/></td>' +
                                    '<td><input type="radio" name="MT2_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="MT2_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="MT2_L" value="3"/></td>' +
                                    '<td><input type="radio" name="MT2_L" value="C"/></td>' +
                                    '<td class="segment">MT 2</td>' +
                                    '<td><input type="radio" name="MT2_R" value="C"/></td>' +
                                    '<td><input type="radio" name="MT2_R" value="3"/></td>' +
                                    '<td><input type="radio" name="MT2_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="MT2_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="MT2_R" value="1"/></td>' +
                                    '<td><input type="radio" name="MT2_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="MT3_L" value="0"/></td>' +
                                    '<td><input type="radio" name="MT3_L" value="1"/></td>' +
                                    '<td><input type="radio" name="MT3_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="MT3_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="MT3_L" value="3"/></td>' +
                                    '<td><input type="radio" name="MT3_L" value="C"/></td>' +
                                    '<td class="segment">MT 3</td>' +
                                    '<td><input type="radio" name="MT3_R" value="C"/></td>' +
                                    '<td><input type="radio" name="MT3_R" value="3"/></td>' +
                                    '<td><input type="radio" name="MT3_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="MT3_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="MT3_R" value="1"/></td>' +
                                    '<td><input type="radio" name="MT3_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="MT4_L" value="0"/></td>' +
                                    '<td><input type="radio" name="MT4_L" value="1"/></td>' +
                                    '<td><input type="radio" name="MT4_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="MT4_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="MT4_L" value="3"/></td>' +
                                    '<td><input type="radio" name="MT4_L" value="C"/></td>' +
                                    '<td class="segment">MT 4</td>' +
                                    '<td><input type="radio" name="MT4_R" value="C"/></td>' +
                                    '<td><input type="radio" name="MT4_R" value="3"/></td>' +
                                    '<td><input type="radio" name="MT4_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="MT4_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="MT4_R" value="1"/></td>' +
                                    '<td><input type="radio" name="MT4_R" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="MT5_L" value="0"/></td>' +
                                    '<td><input type="radio" name="MT5_L" value="1"/></td>' +
                                    '<td><input type="radio" name="MT5_L" value="2a"/></td>' +
                                    '<td><input type="radio" name="MT5_L" value="2b"/></td>' +
                                    '<td><input type="radio" name="MT5_L" value="3"/></td>' +
                                    '<td><input type="radio" name="MT5_L" value="C"/></td>' +
                                    '<td class="segment">MT 5</td>' +
                                    '<td><input type="radio" name="MT5_R" value="C"/></td>' +
                                    '<td><input type="radio" name="MT5_R" value="3"/></td>' +
                                    '<td><input type="radio" name="MT5_R" value="2b"/></td>' +
                                    '<td><input type="radio" name="MT5_R" value="2a"/></td>' +
                                    '<td><input type="radio" name="MT5_R" value="1"/></td>' +
                                    '<td><input type="radio" name="MT5_R" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +

                        '<table class="osteo phalanges">' +
                            '<tr>' +
                                '<th></th>' +
                                '<th>#</th>' +
                                '<th># (juv.)</th>' +
                            '</tr>' +
                            '<tr>' +
                                '<th>Prox. foot phalanges</th>' +
                                '<td><input type="text" name="Phalanx_P_count_foot"></td>' +
                                '<td rowspan="3"><input type="text" name="Phalanx_juv_count_foot"></td>' +
                            '</tr>' +
                            '<tr>' +
                                '<th>Int. foot phalanges</th>' +
                                '<td><input type="text" name="Phalanx_I_count_foot"></td>' +
                            '</tr>' +
                            '<tr>' +
                                '<th>Dist. foot phalanges</th>' +
                                '<td><input type="text" name="Phalanx_D_count_foot"></td>' +
                            '</tr>' +
                        '</table>' +
                    '</div>' +
                '</div>' +
    
                '<div class="osteo-row">' +
                    '<div class="column">' +
                        '<table class="osteo vertebrae">' +
                            '<thead>' +
                                '<tr class="sides">' +
                                    '<th></th>' +
                                    '<th class="hspace"></th>' +
                                    '<th colspan="7">Centrum (body)</th>' +
                                    '<th class="hspace"></th>' +
                                    '<th colspan="2"></th>' +
                                    '<th class="hspace"></th>' +
                                    '<th colspan="7">Left arch</th>' +
                                    '<th class="hspace"></th>' +
                                    '<th colspan="7">Right arch</th>' +
                                '</tr>' +
                                '<tr class="labels">' +
                                    '<th></th>' +
                                    '<th class="hspace"></th>' +
                                    '<th></th>' +
                                    '<th class="centrum"><span>#</span></th>' +
                                    '<th class="centrum"><span>&lt;25%</span></th>' +
                                    '<th class="centrum"><span>25-50%</span></th>' +
                                    '<th class="centrum"><span>50-75%</span></th>' +
                                    '<th class="centrum"><span>&gt;75%</span></th>' +
                                    '<th class="centrum complete"><span>compl.</span></th>' +
                                    '<th class="hspace"></th>' +
                                    '<th></th>' +
                                    '<th class="complete"><span>compl.</span></th>' +
                                    '<th class="hspace"></th>' +
                                    '<th class="arch complete"><span>compl.</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>#</span></th>' +
                                    '<th></th>' +
                                    '<th class="hspace"></th>' +
                                    '<th class="arch complete"><span>compl.</span></th>' +
                                    '<th><span>&gt;75%</span></th>' +
                                    '<th><span>50-75%</span></th>' +
                                    '<th><span>25-50%</span></th>' +
                                    '<th><span>&lt;25%</span></th>' +
                                    '<th><span>#</span></th>' +
                                    '<th></th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td><input name="Vertebrae_complete" type="radio" value="0"/></td>' +
                                    '<td class="hspace" rowspan="8"></td>' +
                                    '<td colspan="7"></td>' +
                                    '<td class="hspace" rowspan="8"></td>' +
                                    '<td></td>' +
                                    '<td><input name="Vertebrae_complete" type="radio" value="C"></td>' +
                                    '<td class="hspace" rowspan="8"></td>' +
                                    '<td colspan="7"></td>' +
                                    '<td class="hspace" rowspan="8"></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="C1_complete" value="0"/></td>' +
                                    '<td colspan="7"></td>' +
                                    '<td class="segment">C1</td>' +
                                    '<td><input type="radio" name="C1_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="C1_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C1_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C1_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C1_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C1_L_arch" value="1"/></td>' +
                                    '<td rowspan="7"><input type="text" name="C_L_arch_count"/></td>' +
                                    '<td><input type="radio" name="C1_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C1_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C1_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C1_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C1_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C1_R_arch" value="1"/></td>' +
                                    '<td rowspan="7"><input type="text" name="C_R_arch_count"/></td>' +
                                    '<td><input type="radio" name="C1_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="C2_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C2_centrum" value="0"/></td>' +
                                    '<td rowspan="6"><input type="text" name="C_centra_count"/></td>' +
                                    '<td><input type="radio" name="C2_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="C2_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="C2_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="C2_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="C2_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">C2</td>' +
                                    '<td><input type="radio" name="C2_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="C2_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C2_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C2_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C2_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C2_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C2_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C2_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C2_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C2_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C2_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C2_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C2_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="C3_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C3_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="C3_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="C3_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="C3_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="C3_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="C3_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">C3-6 (~3)</td>' +
                                    '<td><input type="radio" name="C3_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="C3_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C3_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C3_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C3_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C3_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C3_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C3_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C3_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C3_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C3_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C3_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C3_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="C4_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C4_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="C4_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="C4_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="C4_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="C4_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="C4_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">C3-6 (~4)</td>' +
                                    '<td><input type="radio" name="C4_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="C4_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C4_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C4_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C4_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C4_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C4_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C4_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C4_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C4_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C4_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C4_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C4_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="C5_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C5_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="C5_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="C5_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="C5_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="C5_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="C5_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">C3-6 (~5)</td>' +
                                    '<td><input type="radio" name="C5_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="C5_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C5_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C5_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C5_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C5_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C5_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C5_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C5_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C5_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C5_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C5_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C5_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="C6_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C6_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="C6_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="C6_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="C6_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="C6_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="C6_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">C3-6 (~6)</td>' +
                                    '<td><input type="radio" name="C6_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="C6_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C6_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C6_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C6_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C6_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C6_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C6_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C6_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C6_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C6_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C6_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C6_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="C7_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C7_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="C7_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="C7_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="C7_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="C7_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="C7_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">C7</td>' +
                                    '<td><input type="radio" name="C7_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="C7_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C7_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C7_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C7_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C7_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C7_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="C7_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="C7_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="C7_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="C7_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="C7_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="C7_R_arch" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td></td>' +
                                    '<td class="hspace" rowspan="13"></td>' +
                                    '<td colspan="7"></td>' +
                                    '<td class="hspace" rowspan="13"></td>' +
                                    '<td colspan="2"></td>' +
                                    '<td class="hspace" rowspan="13"></td>' +
                                    '<td colspan="7"></td>' +
                                    '<td class="hspace" rowspan="13"></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T1_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T1_centrum" value="0"/></td>' +
                                    '<td rowspan="12"><input type="text" name="T_centra_count"/></td>' +
                                    '<td><input type="radio" name="T1_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T1_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T1_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T1_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T1_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T1</td>' +
                                    '<td><input type="radio" name="T1_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T1_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T1_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T1_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T1_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T1_L_arch" value="1"/></td>' +
                                    '<td rowspan="12"><input type="text" name="T_L_arch_count"/></td>' +
                                    '<td><input type="radio" name="T1_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T1_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T1_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T1_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T1_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T1_R_arch" value="1"/></td>' +
                                    '<td rowspan="12"><input type="text" name="T_R_arch_count"/></td>' +
                                    '<td><input type="radio" name="T1_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T2_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T2_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="T2_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T2_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T2_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T2_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T2_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T2-9 (~2)</td>' +
                                    '<td><input type="radio" name="T2_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T2_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T2_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T2_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T2_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T2_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T2_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T2_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T2_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T2_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T2_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T2_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T2_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T3_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T3_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="T3_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T3_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T3_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T3_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T3_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T2-9 (~3)</td>' +
                                    '<td><input type="radio" name="T3_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T3_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T3_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T3_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T3_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T3_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T3_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T3_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T3_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T3_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T3_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T3_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T3_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T4_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T4_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="T4_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T4_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T4_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T4_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T4_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T2-9 (~4)</td>' +
                                    '<td><input type="radio" name="T4_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T4_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T4_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T4_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T4_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T4_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T4_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T4_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T4_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T4_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T4_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T4_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T4_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T5_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T5_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="T5_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T5_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T5_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T5_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T5_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T2-9 (~5)</td>' +
                                    '<td><input type="radio" name="T5_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T5_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T5_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T5_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T5_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T5_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T5_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T5_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T5_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T5_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T5_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T5_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T5_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T6_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T6_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="T6_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T6_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T6_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T6_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T6_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T2-9 (~6)</td>' +
                                    '<td><input type="radio" name="T6_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T6_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T6_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T6_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T6_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T6_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T6_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T6_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T6_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T6_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T6_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T6_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T6_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T7_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T7_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="T7_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T7_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T7_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T7_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T7_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T2-9 (~7)</td>' +
                                    '<td><input type="radio" name="T7_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T7_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T7_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T7_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T7_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T7_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T7_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T7_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T7_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T7_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T7_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T7_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T7_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T8_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T8_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="T8_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T8_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T8_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T8_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T8_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T2-9 (~8)</td>' +
                                    '<td><input type="radio" name="T8_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T8_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T8_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T8_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T8_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T8_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T8_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T8_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T8_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T8_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T8_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T8_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T8_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T9_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T9_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="T9_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T9_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T9_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T9_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T9_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T2-9 (~9)</td>' +
                                    '<td><input type="radio" name="T9_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T9_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T9_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T9_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T9_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T9_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T9_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T9_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T9_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T9_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T9_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T9_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T9_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T10_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T10_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="T10_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T10_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T10_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T10_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T10_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T10</td>' +
                                    '<td><input type="radio" name="T10_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T10_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T10_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T10_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T10_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T10_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T10_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T10_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T10_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T10_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T10_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T10_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T10_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T11_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T11_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="T11_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T11_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T11_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T11_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T11_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T11</td>' +
                                    '<td><input type="radio" name="T11_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T11_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T11_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T11_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T11_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T11_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T11_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T11_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T11_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T11_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T11_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T11_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T11_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="T12_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T12_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="T12_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="T12_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="T12_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="T12_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="T12_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">T12</td>' +
                                    '<td><input type="radio" name="T12_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="T12_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T12_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T12_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T12_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T12_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T12_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="T12_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="T12_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="T12_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="T12_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="T12_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="T12_R_arch" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td></td>' +
                                    '<td class="hspace" rowspan="6"></td>' +
                                    '<td colspan="7"></td>' +
                                    '<td class="hspace" rowspan="6"></td>' +
                                    '<td colspan="2"></td>' +
                                    '<td class="hspace" rowspan="6"></td>' +
                                    '<td colspan="7"></td>' +
                                    '<td class="hspace" rowspan="6"></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="L1_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="L1_centrum" value="0"/></td>' +
                                    '<td rowspan="5"><input type="text" name="L_centra_count"/></td>' +
                                    '<td><input type="radio" name="L1_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="L1_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="L1_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="L1_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="L1_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">L1</td>' +
                                    '<td><input type="radio" name="L1_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="L1_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="L1_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="L1_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="L1_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="L1_L_arch" value="1"/></td>' +
                                    '<td rowspan="5"><input type="text" name="L_L_arch_count"/></td>' +
                                    '<td><input type="radio" name="L1_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="L1_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="L1_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="L1_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="L1_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="L1_R_arch" value="1"/></td>' +
                                    '<td rowspan="5"><input type="text" name="L_R_arch_count"/></td>' +
                                    '<td><input type="radio" name="L1_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="L2_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="L2_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="L2_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="L2_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="L2_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="L2_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="L2_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">L2</td>' +
                                    '<td><input type="radio" name="L2_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="L2_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="L2_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="L2_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="L2_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="L2_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="L2_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="L2_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="L2_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="L2_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="L2_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="L2_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="L2_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="L3_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="L3_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="L3_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="L3_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="L3_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="L3_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="L3_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">L3</td>' +
                                    '<td><input type="radio" name="L3_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="L3_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="L3_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="L3_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="L3_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="L3_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="L3_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="L3_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="L3_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="L3_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="L3_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="L3_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="L3_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="L4_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="L4_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="L4_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="L4_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="L4_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="L4_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="L4_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">L4</td>' +
                                    '<td><input type="radio" name="L4_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="L4_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="L4_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="L4_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="L4_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="L4_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="L4_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="L4_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="L4_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="L4_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="L4_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="L4_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="L4_R_arch" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="L5_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="L5_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="L5_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="L5_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="L5_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="L5_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="L5_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">L5</td>' +
                                    '<td><input type="radio" name="L5_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="L5_L_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="L5_L_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="L5_L_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="L5_L_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="L5_L_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="L5_L_arch" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="L5_R_arch" value="C"/></td>' +
                                    '<td><input type="radio" name="L5_R_arch" value="3"/></td>' +
                                    '<td><input type="radio" name="L5_R_arch" value="2b"/></td>' +
                                    '<td><input type="radio" name="L5_R_arch" value="2a"/></td>' +
                                    '<td><input type="radio" name="L5_R_arch" value="1"/></td>' +
                                    '<td><input type="radio" name="L5_R_arch" value="0"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td></td>' +
                                    '<td class="hspace" rowspan="8"></td>' +
                                    '<td colspan="7"></td>' +
                                    '<td class="hspace" rowspan="8"></td>' +
                                    '<td colspan="2"></td>' +
                                    '<td class="hspace" rowspan="7"></td>' +
                                    '<td colspan="7"></td>' +
                                    '<td class="hspace" rowspan="7"></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Sacrum_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="Sacrum" value="0"/></td>' +
                                    '<td rowspan="6"><input type="text" name="S_centra_count"/></td>' +
                                    '<td><input type="radio" name="Sacrum" value="1"/></td>' +
                                    '<td><input type="radio" name="Sacrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="Sacrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="Sacrum" value="3"/></td>' +
                                    '<td><input type="radio" name="Sacrum" value="C"/></td>' +
                    
                                    '<td class="segment">Sacrum</td>' +
                                    '<td><input type="radio" name="Sacrum_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="Sacrum_L_alae" value="C"/></td>' +
                                    '<td><input type="radio" name="Sacrum_L_alae" value="3"/></td>' +
                                    '<td><input type="radio" name="Sacrum_L_alae" value="2b"/></td>' +
                                    '<td><input type="radio" name="Sacrum_L_alae" value="2a"/></td>' +
                                    '<td><input type="radio" name="Sacrum_L_alae" value="1"/></td>' +
                                    '<td rowspan="6"><input type="text" name="S_L_ala_count"/></td>' +
                                    '<td><input type="radio" name="Sacrum_L_alae" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="Sacrum_R_alae" value="C"/></td>' +
                                    '<td><input type="radio" name="Sacrum_R_alae" value="3"/></td>' +
                                    '<td><input type="radio" name="Sacrum_R_alae" value="2b"/></td>' +
                                    '<td><input type="radio" name="Sacrum_R_alae" value="2a"/></td>' +
                                    '<td><input type="radio" name="Sacrum_R_alae" value="1"/></td>' +
                                    '<td rowspan="6"><input type="text" name="S_R_ala_count"/></td>' +
                                    '<td><input type="radio" name="Sacrum_R_alae" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="S1_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="S1_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="S1_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="S1_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="S1_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="S1_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="S1_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">S1</td>' +
                                    '<td><input type="radio" name="S1_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="S1_L_ala" value="C"/></td>' +
                                    '<td><input type="radio" name="S1_L_ala" value="3"/></td>' +
                                    '<td><input type="radio" name="S1_L_ala" value="2b"/></td>' +
                                    '<td><input type="radio" name="S1_L_ala" value="2a"/></td>' +
                                    '<td><input type="radio" name="S1_L_ala" value="1"/></td>' +
                                    '<td><input type="radio" name="S1_L_ala" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="S1_R_ala" value="C"/></td>' +
                                    '<td><input type="radio" name="S1_R_ala" value="3"/></td>' +
                                    '<td><input type="radio" name="S1_R_ala" value="2b"/></td>' +
                                    '<td><input type="radio" name="S1_R_ala" value="2a"/></td>' +
                                    '<td><input type="radio" name="S1_R_ala" value="1"/></td>' +
                                    '<td><input type="radio" name="S1_R_ala" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="S2_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="S2_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="S2_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="S2_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="S2_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="S2_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="S2_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">S2</td>' +
                                    '<td><input type="radio" name="S2_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="S2_L_ala" value="C"/></td>' +
                                    '<td><input type="radio" name="S2_L_ala" value="3"/></td>' +
                                    '<td><input type="radio" name="S2_L_ala" value="2b"/></td>' +
                                    '<td><input type="radio" name="S2_L_ala" value="2a"/></td>' +
                                    '<td><input type="radio" name="S2_L_ala" value="1"/></td>' +
                                    '<td><input type="radio" name="S2_L_ala" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="S2_R_ala" value="C"/></td>' +
                                    '<td><input type="radio" name="S2_R_ala" value="3"/></td>' +
                                    '<td><input type="radio" name="S2_R_ala" value="2b"/></td>' +
                                    '<td><input type="radio" name="S2_R_ala" value="2a"/></td>' +
                                    '<td><input type="radio" name="S2_R_ala" value="1"/></td>' +
                                    '<td><input type="radio" name="S2_R_ala" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="S3_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="S3_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="S3_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="S3_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="S3_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="S3_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="S3_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">S3</td>' +
                                    '<td><input type="radio" name="S3_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="S3_L_ala" value="C"/></td>' +
                                    '<td><input type="radio" name="S3_L_ala" value="3"/></td>' +
                                    '<td><input type="radio" name="S3_L_ala" value="2b"/></td>' +
                                    '<td><input type="radio" name="S3_L_ala" value="2a"/></td>' +
                                    '<td><input type="radio" name="S3_L_ala" value="1"/></td>' +
                                    '<td><input type="radio" name="S3_L_ala" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="S3_R_ala" value="C"/></td>' +
                                    '<td><input type="radio" name="S3_R_ala" value="3"/></td>' +
                                    '<td><input type="radio" name="S3_R_ala" value="2b"/></td>' +
                                    '<td><input type="radio" name="S3_R_ala" value="2a"/></td>' +
                                    '<td><input type="radio" name="S3_R_ala" value="1"/></td>' +
                                    '<td><input type="radio" name="S3_R_ala" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="S4_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="S4_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="S4_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="S4_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="S4_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="S4_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="S4_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">S4</td>' +
                                    '<td><input type="radio" name="S4_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="S4_L_ala" value="C"/></td>' +
                                    '<td><input type="radio" name="S4_L_ala" value="3"/></td>' +
                                    '<td><input type="radio" name="S4_L_ala" value="2b"/></td>' +
                                    '<td><input type="radio" name="S4_L_ala" value="2a"/></td>' +
                                    '<td><input type="radio" name="S4_L_ala" value="1"/></td>' +
                                    '<td><input type="radio" name="S4_L_ala" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="S4_R_ala" value="C"/></td>' +
                                    '<td><input type="radio" name="S4_R_ala" value="3"/></td>' +
                                    '<td><input type="radio" name="S4_R_ala" value="2b"/></td>' +
                                    '<td><input type="radio" name="S4_R_ala" value="2a"/></td>' +
                                    '<td><input type="radio" name="S4_R_ala" value="1"/></td>' +
                                    '<td><input type="radio" name="S4_R_ala" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="S5_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="S5_centrum" value="0"/></td>' +
                                    '<td><input type="radio" name="S5_centrum" value="1"/></td>' +
                                    '<td><input type="radio" name="S5_centrum" value="2a"/></td>' +
                                    '<td><input type="radio" name="S5_centrum" value="2b"/></td>' +
                                    '<td><input type="radio" name="S5_centrum" value="3"/></td>' +
                                    '<td><input type="radio" name="S5_centrum" value="C"/></td>' +
                    
                                    '<td class="segment">S5</td>' +
                                    '<td><input type="radio" name="S5_complete" value="C"/></td>' +
                    
                                    '<td><input type="radio" name="S5_L_ala" value="C"/></td>' +
                                    '<td><input type="radio" name="S5_L_ala" value="3"/></td>' +
                                    '<td><input type="radio" name="S5_L_ala" value="2b"/></td>' +
                                    '<td><input type="radio" name="S5_L_ala" value="2a"/></td>' +
                                    '<td><input type="radio" name="S5_L_ala" value="1"/></td>' +
                                    '<td><input type="radio" name="S5_L_ala" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="S5_R_ala" value="C"/></td>' +
                                    '<td><input type="radio" name="S5_R_ala" value="3"/></td>' +
                                    '<td><input type="radio" name="S5_R_ala" value="2b"/></td>' +
                                    '<td><input type="radio" name="S5_R_ala" value="2a"/></td>' +
                                    '<td><input type="radio" name="S5_R_ala" value="1"/></td>' +
                                    '<td><input type="radio" name="S5_R_ala" value="0"/></td>' +
                                '</tr>' +
                                '<tr>' +
                                    '<td><input type="radio" name="Coccyx_complete" value="0"/></td>' +
                    
                                    '<td><input type="radio" name="Coccyx" value="0"/></td>' +
                                    '<td></td>' +
                                    '<td><input type="radio" name="Coccyx" value="1"/></td>' +
                                    '<td><input type="radio" name="Coccyx" value="2a"/></td>' +
                                    '<td><input type="radio" name="Coccyx" value="2b"/></td>' +
                                    '<td><input type="radio" name="Coccyx" value="3"/></td>' +
                                    '<td><input type="radio" name="Coccyx" value="C"/></td>' +
                    
                                    '<td class="segment">Coccyx</td>' +
                                    '<td><input type="radio" name="Coccyx_complete" value="C"/></td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>' +
                    '</div>' +
        
                    '<div class="column">' +
                        '<div class="osteo dental">' +
                            '<div class="permanent">' +
                                '<h3>Permanent Dentition</h3>' +
                                '<div class="key">0=absent; F=frag.; 1-5=wear stage</div>' +

                                '<input type="button" class="zeroButton" value="0"/>' +
                    
                                '<fieldset class="upper">' +
                                    '<legend>Upper</legend>' +
                        
                                    '<label class="Teeth_UM3_R">RM<sup>3</sup><input name="Teeth_UM3_R" type="text"/></label>' +
                                    '<label class="Teeth_UM2_R">RM<sup>2</sup><input name="Teeth_UM2_R" type="text"/></label>' +
                                    '<label class="Teeth_UM1_R">RM<sup>1</sup><input name="Teeth_UM1_R" type="text"/></label>' +
                                    '<label class="Teeth_UP4_R">RP<sup>4</sup><input name="Teeth_UP4_R" type="text"/></label>' +
                                    '<label class="Teeth_UP3_R">RP<sup>3</sup><input name="Teeth_UP3_R" type="text"/></label>' +
                                    '<label class="Teeth_UC_R">RC<sup>X</sup><input name="Teeth_UC_R" type="text"/></label>' +
                                    '<label class="Teeth_UI2_R">RI<sup>2</sup><input name="Teeth_UI2_R" type="text"/></label>' +
                                    '<label class="Teeth_UI1_R">RI<sup>1</sup><input name="Teeth_UI1_R" type="text"/></label>' +

                                    '<label class="Teeth_UI1_L">LI<sup>1</sup><input name="Teeth_UI1_L" type="text"/></label>' +
                                    '<label class="Teeth_UI2_L">LI<sup>2</sup><input name="Teeth_UI2_L" type="text"/></label>' +
                                    '<label class="Teeth_UC_L">LC<sup>X</sup><input name="Teeth_UC_L" type="text"/></label>' +
                                    '<label class="Teeth_UP3_L">LP<sup>3</sup><input name="Teeth_UP3_L" type="text"/></label>' +
                                    '<label class="Teeth_UP4_L">LP<sup>4</sup><input name="Teeth_UP4_L" type="text"/></label>' +
                                    '<label class="Teeth_UM1_L">LM<sup>1</sup><input name="Teeth_UM1_L" type="text"/></label>' +
                                    '<label class="Teeth_UM2_L">LM<sup>2</sup><input name="Teeth_UM2_L" type="text"/></label>' +
                                    '<label class="Teeth_UM3_L">LM<sup>3</sup><input name="Teeth_UM3_L" type="text"/></label>' +
                                '</fieldset>' +
                    
                                '<fieldset class="lower">' +
                                    '<legend>Lower</legend>' +
                        
                                    '<label class="Teeth_LM3_R">RM<sub>3</sub><input name="Teeth_LM3_R" type="text"/></label>' +
                                    '<label class="Teeth_LM2_R">RM<sub>2</sub><input name="Teeth_LM2_R" type="text"/></label>' +
                                    '<label class="Teeth_LM1_R">RM<sub>1</sub><input name="Teeth_LM1_R" type="text"/></label>' +
                                    '<label class="Teeth_LP4_R">RP<sub>4</sub><input name="Teeth_LP4_R" type="text"/></label>' +
                                    '<label class="Teeth_LP3_R">RP<sub>3</sub><input name="Teeth_LP3_R" type="text"/></label>' +
                                    '<label class="Teeth_LC_R">RC<sub>X</sub><input name="Teeth_LC_R" type="text"/></label>' +
                                    '<label class="Teeth_LI2_R">I<sub>2</sub><input name="Teeth_LI2_R" type="text"/></label>' +
                                    '<label class="Teeth_LI1_R">I<sub>1</sub><input name="Teeth_LI1_R" type="text"/></label>' +

                                    '<label class="Teeth_LI1_L">I<sub>1</sub><input name="Teeth_LI1_L" type="text"/></label>' +
                                    '<label class="Teeth_LI2_L">I<sub>2</sub><input name="Teeth_LI2_L" type="text"/></label>' +
                                    '<label class="Teeth_LC_L">LC<sub>X</sub><input name="Teeth_LC_L" type="text"/></label>' +
                                    '<label class="Teeth_LP3_L">LP<sub>3</sub><input name="Teeth_LP3_L" type="text"/></label>' +
                                    '<label class="Teeth_LP4_L">LP<sub>4</sub><input name="Teeth_LP4_L" type="text"/></label>' +
                                    '<label class="Teeth_LM1_L">LM<sub>1</sub><input name="Teeth_LM1_L" type="text"/></label>' +
                                    '<label class="Teeth_LM2_L">LM<sub>2</sub><input name="Teeth_LM2_L" type="text"/></label>' +
                                    '<label class="Teeth_LM3_L">LM<sub>3</sub><input name="Teeth_LM3_L" type="text"/></label>' +
                                '</fieldset>' +
                            '</div>' +
                            '<div class="deciduous">' +
                                '<h3>Deciduous Dentition</h3>' +
                                '<div class="key">0=absent; F=frag.; 1-5=wear stage</div>' +

                                '<input type="button" class="zeroButton" value="0"/>' +
                    
                                '<fieldset class="upper">' +
                                    '<legend>Upper</legend>' +
                        
                                    '<label class="Teeth_decid_Udm2_R">Rdm<sup>2</sup><input name="Teeth_decid_Udm2_R" type="text"/></label>' +
                                    '<label class="Teeth_decid_Udm1_R">Rdm<sup>1</sup><input name="Teeth_decid_Udm1_R" type="text"/></label>' +
                                    '<label class="Teeth_decid_Udc_R">Rdc<sup>x</sup><input name="Teeth_decid_Udc_R" type="text"/></label>' +
                                    '<label class="Teeth_decid_Udi2_R">Rdi<sup>2</sup><input name="Teeth_decid_Udi2_R" type="text"/></label>' +
                                    '<label class="Teeth_decid_Udi1_R">Rdi<sup>1</sup><input name="Teeth_decid_Udi1_R" type="text"/></label>' +

                                    '<label class="Teeth_decid_Udi1_L">Ldi<sup>1</sup><input name="Teeth_decid_Udi1_L" type="text"/></label>' +
                                    '<label class="Teeth_decid_Udi2_L">Ldi<sup>2</sup><input name="Teeth_decid_Udi2_L" type="text"/></label>' +
                                    '<label class="Teeth_decid_Udc_L">Ldc<sup>x</sup><input name="Teeth_decid_Udc_L" type="text"/></label>' +
                                    '<label class="Teeth_decid_Udm1_L">Ldm<sup>1</sup><input name="Teeth_decid_Udm1_L" type="text"/></label>' +
                                    '<label class="Teeth_decid_Udm2_L">Ldm<sup>2</sup><input name="Teeth_decid_Udm2_L" type="text"/></label>' +
                                '</fieldset>' +
                    
                                '<fieldset class="lower">' +
                                    '<legend>Lower</legend>' +

                                    '<label class="Teeth_decid_Ldm2_R">Rdm<sub>2</sub><input name="Teeth_decid_Ldm2_R" type="text"/></label>' +
                                    '<label class="Teeth_decid_Ldm1_R">Rdm<sub>1</sub><input name="Teeth_decid_Ldm1_R" type="text"/></label>' +
                                    '<label class="Teeth_decid_Ldc_R">dc<sub>x</sub><input name="Teeth_decid_Ldc_R" type="text"/></label>' +
                                    '<label class="Teeth_decid_Ldi2_R">di<sub>2</sub><input name="Teeth_decid_Ldi2_R" type="text"/></label>' +
                                    '<label class="Teeth_decid_Ldi1_R">di<sub>1</sub><input name="Teeth_decid_Ldi1_R" type="text"/></label>' +

                                    '<label class="Teeth_decid_Ldi1_L">di<sub>1</sub><input name="Teeth_decid_Ldi1_L" type="text"/></label>' +
                                    '<label class="Teeth_decid_Ldi2_L">di<sub>2</sub><input name="Teeth_decid_Ldi2_L" type="text"/></label>' +
                                    '<label class="Teeth_decid_Ldc_L">dc<sub>x</sub><input name="Teeth_decid_Ldc_L" type="text"/></label>' +
                                    '<label class="Teeth_decid_Ldm1_L">Ldm<sub>1</sub><input name="Teeth_decid_Ldm1_L" type="text"/></label>' +
                                    '<label class="Teeth_decid_Ldm2_L">Ldm<sub>2</sub><input name="Teeth_decid_Ldm2_L" type="text"/></label>' +
                                '</fieldset>' +
                    
                                '<div class="immVertFrags">' +
                                    '<h3>Imm. Vert. frags</h3>' +
                                    'Count <input type="text" name="Teeth_immVertFragsCount"/>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    }
}(jQuery));