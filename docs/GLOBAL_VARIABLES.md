# Standard global variables

The analyser recognises **207** game-provided file-scope variables without requiring a local `#include`. The 200 entries declared at file scope in the standard source closure listed in `data/always-available-sources.json` are included, together with the seven explicitly shared declarations from `trainstactdeclares.lgc`, which is not directly included by `header.lgc`.

| Name | Type | Source | Description |
|---|---|---|---|
| `time_game_total` | `int` | `header.lgc` | Total in-game elapsed time, initialized by the standard game header. |
| `nuke_time` | `int` | `header.lgc` | Game-state timer used by the standard game scripts. |
| `end` | `int` | `header.lgc` | Global game-end state shared by all level scripts. |
| `we_are_win` | `int` | `header.lgc` | Global flag indicating that the player has won. |
| `temp_array` | `int[]` | `trainstactdeclares.lgc` | Shared temporary integer array used by train tactics scripts. |
| `ai_trains` | `int[]` | `trainstactdeclares.lgc` | Shared array of AI train unit identifiers. |
| `ai_trains_task2` | `int[]` | `trainstactdeclares.lgc` | Shared array storing secondary AI train tasks. |
| `ai_trains_task` | `int[]` | `trainstactdeclares.lgc` | Shared array storing primary AI train tasks. |
| `ai_trains_type` | `int[]` | `trainstactdeclares.lgc` | Shared array storing AI train composition types. |
| `ai_trains_target` | `int[]` | `trainstactdeclares.lgc` | Shared array storing target identifiers for AI trains. |
| `stgbeh` | `int` | `trainstactdeclares.lgc` | Shared integer state for stage/train behaviour. |
| `F505unit_z` | `int` | `ai_default_event.lgc` | Global int declared in standard header include ai_default_event.lgc and shared with level scripts. |
| `F545_x` | `int` | `ai_default_event.lgc` | Global int declared in standard header include ai_default_event.lgc and shared with level scripts. |
| `F545_y` | `int` | `ai_default_event.lgc` | Global int declared in standard header include ai_default_event.lgc and shared with level scripts. |
| `F545_z` | `int` | `ai_default_event.lgc` | Global int declared in standard header include ai_default_event.lgc and shared with level scripts. |
| `flies_killed` | `int` | `ai_default_event.lgc` | Global int declared in standard header include ai_default_event.lgc and shared with level scripts. |
| `vulcan_time` | `int` | `ai_default_event.lgc` | Global int declared in standard header include ai_default_event.lgc and shared with level scripts. |
| `vulcan_timer` | `int` | `ai_default_event.lgc` | Global int declared in standard header include ai_default_event.lgc and shared with level scripts. |
| `depo_com` | `string` | `ai_default_event_inherit.lgc` | Global string declared in standard header include ai_default_event_inherit.lgc and shared with level scripts. |
| `depo_time_create` | `int` | `ai_events.lgc` | Global int declared in standard header include ai_events.lgc and shared with level scripts. |
| `GetLongestTrain_unit` | `int` | `ai_functions.lgc` | Global int declared in standard header include ai_functions.lgc and shared with level scripts. |
| `IsTrainAtWeaponRadiusEx_unit` | `int` | `ai_functions.lgc` | Global int declared in standard header include ai_functions.lgc and shared with level scripts. |
| `TrainHasUnitVid_unit` | `int` | `ai_functions.lgc` | Global int declared in standard header include ai_functions.lgc and shared with level scripts. |
| `WeightX` | `int` | `ai_functions.lgc` | Global int declared in standard header include ai_functions.lgc and shared with level scripts. |
| `WeightY` | `int` | `ai_functions.lgc` | Global int declared in standard header include ai_functions.lgc and shared with level scripts. |
| `option_cheats` | `int` | `cheats.lgc` | Global int declared in standard header include cheats.lgc and shared with level scripts. |
| `civil_train_type` | `int[]` | `civil.lgc` | Global int array declared in standard header include civil.lgc and shared with level scripts. |
| `civil_train_x` | `int[]` | `civil.lgc` | Global int array declared in standard header include civil.lgc and shared with level scripts. |
| `civil_train_y` | `int[]` | `civil.lgc` | Global int array declared in standard header include civil.lgc and shared with level scripts. |
| `CivilPatrolCount` | `int` | `civil.lgc` | Global int declared in standard header include civil.lgc and shared with level scripts. |
| `CivilPatrolEngine` | `int` | `civil.lgc` | Global int declared in standard header include civil.lgc and shared with level scripts. |
| `CivilPatrolEngineAction` | `int` | `civil.lgc` | Global int declared in standard header include civil.lgc and shared with level scripts. |
| `CivilPatrolNum` | `int` | `civil.lgc` | Global int declared in standard header include civil.lgc and shared with level scripts. |
| `CivilPatrolTime` | `int` | `civil.lgc` | Global int declared in standard header include civil.lgc and shared with level scripts. |
| `Tornado_time` | `int` | `civil.lgc` | Global int declared in standard header include civil.lgc and shared with level scripts. |
| `Tornado_unit` | `int` | `civil.lgc` | Global int declared in standard header include civil.lgc and shared with level scripts. |
| `ARMY0_NVID_ARRAY` | `int[]` | `constants.lgc` | Global int array declared in standard header include constants.lgc and shared with level scripts. |
| `ARMY1_NVID_ARRAY` | `int[]` | `constants.lgc` | Global int array declared in standard header include constants.lgc and shared with level scripts. |
| `back_pict` | `int` | `constants.lgc` | Global int declared in standard header include constants.lgc and shared with level scripts. |
| `defle` | `int` | `constants.lgc` | Global int declared in standard header include constants.lgc and shared with level scripts. |
| `defpl` | `int` | `constants.lgc` | Global int declared in standard header include constants.lgc and shared with level scripts. |
| `DIFF_NVID_ARRAY` | `int[]` | `constants.lgc` | Global int array declared in standard header include constants.lgc and shared with level scripts. |
| `enemy_depo` | `int` | `constants.lgc` | Global int declared in standard header include constants.lgc and shared with level scripts. |
| `menu_brief_head` | `int` | `constants.lgc` | Global int declared in standard header include constants.lgc and shared with level scripts. |
| `menu_brief_text` | `int` | `constants.lgc` | Global int declared in standard header include constants.lgc and shared with level scripts. |
| `menu_pict` | `int` | `constants.lgc` | Global int declared in standard header include constants.lgc and shared with level scripts. |
| `menu_state` | `int` | `constants.lgc` | Global int declared in standard header include constants.lgc and shared with level scripts. |
| `RANG_SCORES` | `int[]` | `constants.lgc` | Global int array declared in standard header include constants.lgc and shared with level scripts. |
| `SCORE_NVID_ARRAY` | `int[]` | `constants.lgc` | Global int array declared in standard header include constants.lgc and shared with level scripts. |
| `SCORE_NVID_WEIGHT_ARRAY` | `int[]` | `constants.lgc` | Global int array declared in standard header include constants.lgc and shared with level scripts. |
| `this_depo_capture` | `int` | `constants.lgc` | Global int declared in standard header include constants.lgc and shared with level scripts. |
| `WATER_Z_ARRAY` | `int[]` | `constants.lgc` | Global int array declared in standard header include constants.lgc and shared with level scripts. |
| `X` | `int` | `constants.lgc` | Global int declared in standard header include constants.lgc and shared with level scripts. |
| `Y` | `int` | `constants.lgc` | Global int declared in standard header include constants.lgc and shared with level scripts. |
| `GammaIntensive_text` | `int` | `daynight.lgc` | Global int declared in standard header include daynight.lgc and shared with level scripts. |
| `Gammas` | `int[]` | `daynight.lgc` | Global int array declared in standard header include daynight.lgc and shared with level scripts. |
| `Rain_mode` | `int` | `daynight.lgc` | Global int declared in standard header include daynight.lgc and shared with level scripts. |
| `Rain_nuke_time` | `int` | `daynight.lgc` | Global int declared in standard header include daynight.lgc and shared with level scripts. |
| `Rain_oldgamma` | `int` | `daynight.lgc` | Global int declared in standard header include daynight.lgc and shared with level scripts. |
| `Rain_time` | `int` | `daynight.lgc` | Global int declared in standard header include daynight.lgc and shared with level scripts. |
| `RainGammas` | `int[]` | `daynight.lgc` | Global int array declared in standard header include daynight.lgc and shared with level scripts. |
| `s507enabled` | `int` | `daynight.lgc` | Global int declared in standard header include daynight.lgc and shared with level scripts. |
| `SetDayNightGamma_changegamma` | `int` | `daynight.lgc` | Global int declared in standard header include daynight.lgc and shared with level scripts. |
| `SetDayNightGamma_mode` | `int` | `daynight.lgc` | Global int declared in standard header include daynight.lgc and shared with level scripts. |
| `SetDayNightGamma_oldgamma` | `int` | `daynight.lgc` | Global int declared in standard header include daynight.lgc and shared with level scripts. |
| `SetDayNightGamma_time` | `int` | `daynight.lgc` | Global int declared in standard header include daynight.lgc and shared with level scripts. |
| `Times` | `int[]` | `daynight.lgc` | Global int array declared in standard header include daynight.lgc and shared with level scripts. |
| `ai_log_debugmode` | `int` | `DoKeys.lgc` | Global int declared in standard header include DoKeys.lgc and shared with level scripts. |
| `aidebug_mode` | `int` | `DoKeys.lgc` | Global int declared in standard header include DoKeys.lgc and shared with level scripts. |
| `BuildModeText1` | `int` | `DoKeys.lgc` | Global int declared in standard header include DoKeys.lgc and shared with level scripts. |
| `BuildModeText2` | `int` | `DoKeys.lgc` | Global int declared in standard header include DoKeys.lgc and shared with level scripts. |
| `BuildModeText3` | `int` | `DoKeys.lgc` | Global int declared in standard header include DoKeys.lgc and shared with level scripts. |
| `BuildModeText4` | `int` | `DoKeys.lgc` | Global int declared in standard header include DoKeys.lgc and shared with level scripts. |
| `BuildModeText5` | `int` | `DoKeys.lgc` | Global int declared in standard header include DoKeys.lgc and shared with level scripts. |
| `BuildTime` | `int` | `DoKeys.lgc` | Global int declared in standard header include DoKeys.lgc and shared with level scripts. |
| `BuildUnit` | `int` | `DoKeys.lgc` | Global int declared in standard header include DoKeys.lgc and shared with level scripts. |
| `PrintDebug_alltext` | `string` | `DoKeys.lgc` | Global string declared in standard header include DoKeys.lgc and shared with level scripts. |
| `PrintDebug_oldtext` | `string` | `DoKeys.lgc` | Global string declared in standard header include DoKeys.lgc and shared with level scripts. |
| `PrintDebug_strnum` | `int` | `DoKeys.lgc` | Global int declared in standard header include DoKeys.lgc and shared with level scripts. |
| `PrintDebug_text` | `int` | `DoKeys.lgc` | Global int declared in standard header include DoKeys.lgc and shared with level scripts. |
| `endt` | `int` | `EnvironmentTact.lgc` | Global int declared in standard header include EnvironmentTact.lgc and shared with level scripts. |
| `m_rain_act` | `int` | `EnvironmentTact.lgc` | Global int declared in standard header include EnvironmentTact.lgc and shared with level scripts. |
| `Quake_end` | `int` | `EnvironmentTact.lgc` | Global int declared in standard header include EnvironmentTact.lgc and shared with level scripts. |
| `Quake_noquake` | `int` | `EnvironmentTact.lgc` | Global int declared in standard header include EnvironmentTact.lgc and shared with level scripts. |
| `Quake_noquake_period` | `int` | `EnvironmentTact.lgc` | Global int declared in standard header include EnvironmentTact.lgc and shared with level scripts. |
| `Quake_sound` | `int` | `EnvironmentTact.lgc` | Global int declared in standard header include EnvironmentTact.lgc and shared with level scripts. |
| `Quake_start` | `int` | `EnvironmentTact.lgc` | Global int declared in standard header include EnvironmentTact.lgc and shared with level scripts. |
| `startt` | `int` | `EnvironmentTact.lgc` | Global int declared in standard header include EnvironmentTact.lgc and shared with level scripts. |
| `wind_dir` | `int` | `EnvironmentTact.lgc` | Global int declared in standard header include EnvironmentTact.lgc and shared with level scripts. |
| `wind_speed` | `int` | `EnvironmentTact.lgc` | Global int declared in standard header include EnvironmentTact.lgc and shared with level scripts. |
| `wind_time` | `int` | `EnvironmentTact.lgc` | Global int declared in standard header include EnvironmentTact.lgc and shared with level scripts. |
| `FlyCountDiffArr` | `int[]` | `fly.lgc` | Global int array declared in standard header include fly.lgc and shared with level scripts. |
| `FlyCountLast` | `int` | `fly.lgc` | Global int declared in standard header include fly.lgc and shared with level scripts. |
| `MusicFileNumber` | `int` | `InitDefault.lgc` | Global int declared in standard header include InitDefault.lgc and shared with level scripts. |
| `map_enabled` | `int[]` | `maps_enabled.lgc` | Global int array declared in standard header include maps_enabled.lgc and shared with level scripts. |
| `alpha_appear` | `int` | `Menuend.lgc` | Global int declared in standard header include Menuend.lgc and shared with level scripts. |
| `End_gamma` | `int` | `Menuend.lgc` | Global int declared in standard header include Menuend.lgc and shared with level scripts. |
| `FinalScores` | `int` | `Menuend.lgc` | Global int declared in standard header include Menuend.lgc and shared with level scripts. |
| `GivenRang` | `int` | `Menuend.lgc` | Global int declared in standard header include Menuend.lgc and shared with level scripts. |
| `GivenScores` | `string` | `Menuend.lgc` | Global string declared in standard header include Menuend.lgc and shared with level scripts. |
| `HiLevel` | `int[]` | `Menuend.lgc` | Global int array declared in standard header include Menuend.lgc and shared with level scripts. |
| `HiName` | `string[]` | `Menuend.lgc` | Global string array declared in standard header include Menuend.lgc and shared with level scripts. |
| `HiNameEnd` | `string[]` | `Menuend.lgc` | Global string array declared in standard header include Menuend.lgc and shared with level scripts. |
| `HiRank` | `int[]` | `Menuend.lgc` | Global int array declared in standard header include Menuend.lgc and shared with level scripts. |
| `HiScores` | `int[]` | `Menuend.lgc` | Global int array declared in standard header include Menuend.lgc and shared with level scripts. |
| `hiscores_text` | `string` | `Menuend.lgc` | Global string declared in standard header include Menuend.lgc and shared with level scripts. |
| `hiscores_text2` | `string` | `Menuend.lgc` | Global string declared in standard header include Menuend.lgc and shared with level scripts. |
| `HiScoresEnd` | `int[]` | `Menuend.lgc` | Global int array declared in standard header include Menuend.lgc and shared with level scripts. |
| `MENU_STATE_END` | `int` | `Menuend.lgc` | Global int declared in standard header include Menuend.lgc and shared with level scripts. |
| `MenuEndGameTimeMSec` | `int` | `Menuend.lgc` | Global int declared in standard header include Menuend.lgc and shared with level scripts. |
| `MenuEndTime` | `int` | `Menuend.lgc` | Global int declared in standard header include Menuend.lgc and shared with level scripts. |
| `ScoresByArmy` | `int[]` | `Menuend.lgc` | Global int array declared in standard header include Menuend.lgc and shared with level scripts. |
| `TotalScores` | `int` | `Menuend.lgc` | Global int declared in standard header include Menuend.lgc and shared with level scripts. |
| `active_map` | `string` | `MenuTact.lgc` | Global string declared in standard header include MenuTact.lgc and shared with level scripts. |
| `BuildMode` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `creditsmenu_created` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `curr_page` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `curr_player` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `exitmenu_created` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `h_pl_diff` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `h_pl_name` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `helpmenu_created` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `keypressed` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `levelmenu_created` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `load_list` | `string` | `MenuTact.lgc` | Global string declared in standard header include MenuTact.lgc and shared with level scripts. |
| `mbars` | `int[]` | `MenuTact.lgc` | Global int array declared in standard header include MenuTact.lgc and shared with level scripts. |
| `mclick` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `mdir` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_editor_hold` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_editor_how` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_editor_lamp` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_editor_text` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_editor_w` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_editor_x` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_editor_y` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_loading_time` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_next` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_prev` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_start` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_start_text` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `MENU_STATE` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_temp_gamma` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `menu_time_sec` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `mouse_over_vid` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `mouse_swap` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `mtext` | `int[]` | `MenuTact.lgc` | Global int array declared in standard header include MenuTact.lgc and shared with level scripts. |
| `music_volume` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `mvid` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `optionsmenu_created` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `pause_mx` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `pause_my` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `reading` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `readnametext` | `string` | `MenuTact.lgc` | Global string declared in standard header include MenuTact.lgc and shared with level scripts. |
| `readNUM` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `readX` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `readY` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `SCRX` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `SCRY` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `sound_volume` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `start` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `time_pause` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `time_pause2` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `user_delete` | `int[]` | `MenuTact.lgc` | Global int array declared in standard header include MenuTact.lgc and shared with level scripts. |
| `user_diff` | `int[]` | `MenuTact.lgc` | Global int array declared in standard header include MenuTact.lgc and shared with level scripts. |
| `user_exists` | `int[]` | `MenuTact.lgc` | Global int array declared in standard header include MenuTact.lgc and shared with level scripts. |
| `user_play` | `int[]` | `MenuTact.lgc` | Global int array declared in standard header include MenuTact.lgc and shared with level scripts. |
| `user_text` | `int[]` | `MenuTact.lgc` | Global int array declared in standard header include MenuTact.lgc and shared with level scripts. |
| `usermenu_created` | `int` | `MenuTact.lgc` | Global int declared in standard header include MenuTact.lgc and shared with level scripts. |
| `users` | `string[]` | `MenuTact.lgc` | Global string array declared in standard header include MenuTact.lgc and shared with level scripts. |
| `xmaps` | `int[]` | `MenuTact.lgc` | Global int array declared in standard header include MenuTact.lgc and shared with level scripts. |
| `ymaps` | `int[]` | `MenuTact.lgc` | Global int array declared in standard header include MenuTact.lgc and shared with level scripts. |
| `opt_editor` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_editor_max` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_editor_name` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_editor_value` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_interface` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_interface_max` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_interface_name` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_interface_value` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_minimap` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_minimap_name` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_minimap_value` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_text` | `string` | `optfields.lgc` | Global string declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_text_z` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_x` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_y` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `opt_z` | `int` | `optfields.lgc` | Global int declared in standard header include optfields.lgc and shared with level scripts. |
| `ai_reinforcement_no` | `int` | `reinforcement.lgc` | Global int declared in standard header include reinforcement.lgc and shared with level scripts. |
| `player_commands` | `string` | `reinforcement.lgc` | Global string declared in standard header include reinforcement.lgc and shared with level scripts. |
| `player_reinforcement_no` | `int` | `reinforcement.lgc` | Global int declared in standard header include reinforcement.lgc and shared with level scripts. |
| `player_x` | `int` | `reinforcement.lgc` | Global int declared in standard header include reinforcement.lgc and shared with level scripts. |
| `player_y` | `int` | `reinforcement.lgc` | Global int declared in standard header include reinforcement.lgc and shared with level scripts. |
| `player_z` | `int` | `reinforcement.lgc` | Global int declared in standard header include reinforcement.lgc and shared with level scripts. |
| `ai_train_create_help_time` | `int` | `TrainsTactFunctions.lgc` | Global int declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `ai_trains_print` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `level_queue_task` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `level_queue_times` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `level_queue_trains` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `start_trains` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `start_trains_random_task` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `start_trains_renew` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `start_trains_task` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `start_trains_x` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `start_trains_y` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `this_train_null` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `UniqueNum_arr` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
| `UniqueNum_arr_count` | `int[]` | `TrainsTactFunctions.lgc` | Global int array declared in standard header include TrainsTactFunctions.lgc and shared with level scripts. |
