(function ($, fluid) {
    var BASE_EL_PATH = "fields";
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
    
    fluid.defaults("cspace.osteology", {
        gradeNames: ["fluid.modelComponent", "autoInit"],
        selectors: {},
        strings: {},
        parentBundle: "{globalBundle}",
        preInitFunction: "cspace.osteology.preInit",
        finalInitFunction: "cspace.osteology.finalInit",
        invokers: {
            bindEvents: {
                funcName: "cspace.osteology.bindEvents",
                args: ["{osteology}", "{recordEditor}"]
            },
            initForm: {
                funcName: "cspace.osteology.initForm",
                args: ["{osteology}"]
            }
        }
    });
    
    cspace.osteology.preInit = function(that) {
        that.setFieldValue = function(fieldName, value) {
            if (fieldName in that.radioInputs) {
                var input = that.radioInputs[fieldName][value];
            
                if (input) {
                    input.checked = true;
                }
                else {
                    var radioInputs = that.radioInputs[fieldName];
                
                    for(var value in radioInputs) {
                        radioInputs[value].checked = false;
                    }
                }
            }
            else if (fieldName in that.textInputs) {
                var input = that.textInputs[fieldName];
                
                if (input) {
                    input.value = value;
                }
            }
        };
        
        that.computeValue = function(fieldName) {
            var value = that.model.fields[fieldName];
            
            if (fieldName in relations) {
                var computedFromFields = relations[fieldName].computedFrom;
                
                if (computedFromFields && computedFromFields.length > 0) {
                    if (that.allFieldsHaveValue(computedFromFields, COMPLETE_VALUE)) {
                        value = COMPLETE_VALUE;
                    }
                    else if (that.allFieldsHaveValue(computedFromFields, ABSENT_VALUE)) {
                        value = ABSENT_VALUE;
                    }
                    else if (value == COMPLETE_VALUE || value == ABSENT_VALUE) {
                        value = "";
                    } 
                }
            }
            
            return value;
        };
        
        that.allFieldsHaveValue = function(fields, value) {
            var result = true;
        
            for (var i=0; i<fields.length; i++) {
                var name = fields[i];

                if (that.model.fields[name] !== value) {
                    result = false;
                    break;
                }
            }
    
            return result;
        };
        
        that.markAllPresent = function() {
            that.markAll(COMPLETE_VALUE);
        };
        
        that.markAllAbsent = function() {
            that.markAll(ABSENT_VALUE);
        };
        
        that.markAll = function(value) {
            var radioInputs = that.radioInputs;
            
            for(var fieldName in radioInputs) {
                that.setFieldValue(fieldName, value);
                that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, fieldName), value);
            }
        };
    };
    
    cspace.osteology.finalInit = function(that) {
        that.bindEvents();
    };
    
    cspace.osteology.bindEvents = function(that, recordEditor) {
        recordEditor.events.afterRecordRender.addListener(function() {
            that.initForm();
        }, that.typeName);
    };
    
    cspace.osteology.initForm = function(that) {
        that.form = $("form.csc-osteology-form");
        
        that.form.find("#markAllPresentButton").click(function(event) {
            event.stopPropagation();
            event.preventDefault();
            
            if (window.confirm("Are you sure? This will erase all entered completeness data.")) {
                that.markAllPresent();
            }
        });
        
        that.form.find("#markAllAbsentButton").click(function() {
            event.stopPropagation();
            event.preventDefault();
            
            if (window.confirm("Are you sure? This will erase all entered completeness data.")) {
                that.markAllAbsent();
            }
        });
        
        that.form.find(".osteo .permanent .zeroButton").click(function() {
          event.stopPropagation();
          event.preventDefault();
          
          that.form.find(".osteo .permanent input[type='text']").each(function(index, element) {
            var fieldName = element.name;
            var value = "0";
            
            element.value = value;
            that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, fieldName), value);
          });
        });

        that.form.find(".osteo .deciduous .zeroButton").click(function() {
          event.stopPropagation();
          event.preventDefault();
          
          that.form.find(".osteo .deciduous input[type='text']").each(function(index, element) {
            var fieldName = element.name;
            var value = "0";
            
            element.value = value;
            that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, fieldName), value);
          });
        });
        
        // name: {value: input element, ...}
        that.radioInputs = {};
                
        that.form.find("input[type='radio']").each(function(index, element) {
            $(element).wrap("<label></label>").after("<span></span>").addClass(function() {
                switch (element.value) {
                    case COMPLETE_VALUE: return COMPLETE_CLASS;
                    case ABSENT_VALUE: return ABSENT_CLASS;
                }
            });
            
            var inputName = element.name;
            
            if (!(inputName in that.radioInputs)) {
                that.radioInputs[inputName] = {};
            }
            
            that.radioInputs[inputName][element.value] = element;
        });

        that.form.find("input[type='checkbox']").each(function(index, element) {
            $(element).wrap("<label></label>").after("<span></span>");
            
            var inputName = element.name;
            
            if (!(inputName in that.radioInputs)) {
                that.radioInputs[inputName] = {};
            }
            
            that.radioInputs[inputName][element.value] = element;
        });
        
        // console.log(that.radioInputs);
        
        // name: input element
        that.textInputs = {};
        
        that.form.find("input[type='text']").each(function(index, element) {
            var inputName = element.name;
            
            if (!(inputName in that.textInputs)) {
                that.textInputs[inputName] = element;
            }
        });
        
        // console.log(that.textInputs);
        
        // Fill in the form using values from the model.
        
        for (var name in that.model.fields) {
            that.setFieldValue(name, that.model.fields[name]);
        }
        
        that.form.change(function(event) {
            var target = event.target;
            var name = target.name;
            var value = target.value;
            
            if (target.type === "checkbox" && !target.checked) {
              value = "";
            }
            
            that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, name), value);

            that.visitedFields = {};
            that.visitedFields[name] = true;

            if ((name in relations) && relations[name].markVisited) {
                //console.log(relations[name].markVisited);
                relations[name].markVisited.forEach(function(markVisitedFieldName) {
                    that.visitedFields[markVisitedFieldName] = true;
                })
            }
            
            if (target.tagName === "INPUT" && (target.type === "radio" || target.type === "checkbox")) {
                updateParents(that, name);
                
                if (value === COMPLETE_VALUE || value === ABSENT_VALUE || target.type === "checkbox") {
                    updateChildren(that, name, value);
                }
            }
        });
    };
    
    var updateChildren = function(that, name, value) {
        if (name in relations) {
            var children = relations[name].children;

            if (children && children.length > 0) {
                for (var i=0; i<children.length; i++) {
                    var childName = children[i];
                    
                    if (!that.visitedFields[childName]) {
                        //console.log("child of " + name + ": " + childName + "=" + value);
                        that.setFieldValue(childName, value);
                        that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, childName), value);
                    
                        that.visitedFields[childName] = true;
                    
                        updateChildren(that, childName, value);
                    }
                }
            }
        }
    };
    
    var updateParents = function(that, name) {
        if (name in parents) {
            var parentNames = parents[name];
            
            // Update parents breadth-first.
            
            parentNames.forEach(function(parentName) {
                if (!that.visitedFields[parentName]) {
                    var value = that.computeValue(parentName);
                    //console.log("parent of " + name + ": " + parentName + "=" + value);
                    that.setFieldValue(parentName, value);
                    that.applier.requestChange(cspace.util.composeSegments(BASE_EL_PATH, parentName), value);
                    
                    that.visitedFields[parentName] = true;
                    
                    if (value === COMPLETE_VALUE || value === ABSENT_VALUE) {
                        updateChildren(that, parentName, value);
                    }
                }
            });
                        
            parentNames.forEach(function(parentName) {
                updateParents(that, parentName);
            });
        }
    };
    
    fluid.fetchResources.primeCacheFromResources("cspace.osteology");
})(jQuery, fluid);