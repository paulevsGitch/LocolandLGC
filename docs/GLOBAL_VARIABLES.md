# LGC Global Variables Reference

File-scope variables provided by the transitive standard `header.lgc` include tree, plus explicitly shared train-tactics declarations used by levels.

**Entries:** 207. Each record has an explicit primitive type, array flag, declaration source and English description grounded in source comments and use sites.

## `ai_default_event.lgc`

7 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `F505unit_z` | `int` | `ai_default_event.lgc` | Z coordinate stored for the F505 bear-generator unit. |
| `F545_x` | `int` | `ai_default_event.lgc` | X coordinate used by the F545 event sequence. |
| `F545_y` | `int` | `ai_default_event.lgc` | Y coordinate used by the F545 event sequence. |
| `F545_z` | `int` | `ai_default_event.lgc` | Z coordinate used by the F545 event sequence. |
| `flies_killed` | `int` | `ai_default_event.lgc` | Counter of flies killed by the player. |
| `vulcan_time` | `int` | `ai_default_event.lgc` | Game-time timestamp of the most recent Vulcan event. |
| `vulcan_timer` | `int` | `ai_default_event.lgc` | Randomized interval controlling the next Vulcan event. |

## `ai_default_event_inherit.lgc`

1 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `depo_com` | `string` | `ai_default_event_inherit.lgc` | Saved command string and depot build contents retained when a depot is destroyed. |

## `ai_events.lgc`

1 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `depo_time_create` | `int` | `ai_events.lgc` | Creation timestamp recorded for the depot event system. |

## `ai_functions.lgc`

5 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `GetLongestTrain_unit` | `int` | `ai_functions.lgc` | Temporary unit/train handle used while finding the longest train. |
| `IsTrainAtWeaponRadiusEx_unit` | `int` | `ai_functions.lgc` | Temporary unit handle used by the extended weapon-radius check. |
| `TrainHasUnitVid_unit` | `int` | `ai_functions.lgc` | Temporary unit handle used by the train unit-VID search helper. |
| `WeightX` | `int` | `ai_functions.lgc` | X coordinate of the army centre of mass. |
| `WeightY` | `int` | `ai_functions.lgc` | Y coordinate of the army centre of mass. |

## `cheats.lgc`

1 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `option_cheats` | `int` | `cheats.lgc` | Launcher cheat-option state. In the original game configuration, the launcher substitutes a separate `cheats_on.lgc` file when cheats are enabled. |

## `civil.lgc`

10 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `civil_train_type` | `int[]` | `civil.lgc` | NVID/type code for each managed civilian train. |
| `civil_train_x` | `int[]` | `civil.lgc` | X coordinate for each managed civilian train. |
| `civil_train_y` | `int[]` | `civil.lgc` | Y coordinate for each managed civilian train. |
| `CivilPatrolCount` | `int` | `civil.lgc` | Number of civilian patrol trains currently tracked. |
| `CivilPatrolEngine` | `int` | `civil.lgc` | Current civilian patrol engine handle. |
| `CivilPatrolEngineAction` | `int` | `civil.lgc` | Current action/state recorded for the civilian patrol engine. |
| `CivilPatrolNum` | `int` | `civil.lgc` | Index of the active civilian patrol entry. |
| `CivilPatrolTime` | `int` | `civil.lgc` | Timer used by the civilian patrol scheduler. |
| `Tornado_time` | `int` | `civil.lgc` | Timer for the tornado effect. |
| `Tornado_unit` | `int` | `civil.lgc` | Unit reference associated with the active tornado. |

## `constants.lgc`

18 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `ARMY0_NVID_ARRAY` | `int[]` | `constants.lgc` | Array of unit NVID values used to count the total units belonging to army 0. |
| `ARMY1_NVID_ARRAY` | `int[]` | `constants.lgc` | Array of unit NVID values used to count the total units belonging to army 1. |
| `back_pict` | `int` | `constants.lgc` | Background-picture object handle used by the standard menu. |
| `defle` | `int` | `constants.lgc` | Default level index used by the menu/level-selection logic. |
| `defpl` | `int` | `constants.lgc` | Default player index used by the menu/player-selection logic. |
| `DIFF_NVID_ARRAY` | `int[]` | `constants.lgc` | Array of unit NVID values whose hit-point values are adjusted by the selected difficulty coefficient. |
| `enemy_depo` | `int` | `constants.lgc` | Reference to an AI depot. |
| `menu_brief_head` | `int` | `constants.lgc` | Heading object/reference used by the level-briefing menu. |
| `menu_brief_text` | `int` | `constants.lgc` | Text object/reference used by the level-briefing menu. |
| `menu_pict` | `int` | `constants.lgc` | Menu background picture object handle. |
| `menu_state` | `int` | `constants.lgc` | Current menu state value shared by the standard menu scripts. |
| `RANG_SCORES` | `int[]` | `constants.lgc` | Score thresholds used to assign player ranks. |
| `SCORE_NVID_ARRAY` | `int[]` | `constants.lgc` | NVID list of units that award score when destroyed; entries correspond by index to `SCORE_NVID_WEIGHT_ARRAY`. |
| `SCORE_NVID_WEIGHT_ARRAY` | `int[]` | `constants.lgc` | Score awarded for destroying each corresponding NVID in `SCORE_NVID_ARRAY`. |
| `this_depo_capture` | `int` | `constants.lgc` | Reference to the player-owned or neutral depot currently being captured. |
| `WATER_Z_ARRAY` | `int[]` | `constants.lgc` | NVID list of object types that are not killed while underwater. The source requires the final array entry to be zero. |
| `X` | `int` | `constants.lgc` | Shared X coordinate scratch value used by the standard menu scripts. |
| `Y` | `int` | `constants.lgc` | Shared Y coordinate scratch value used by the standard menu scripts. |

## `daynight.lgc`

13 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `GammaIntensive_text` | `int` | `daynight.lgc` | Text-sprite handle for the intensive-gamma status display. |
| `Gammas` | `int[]` | `daynight.lgc` | Gamma values for the day/night phases. |
| `Rain_mode` | `int` | `daynight.lgc` | Rain state: 0 means rain is off and 1 means rain is active. |
| `Rain_nuke_time` | `int` | `daynight.lgc` | Timer used to coordinate rain gamma with the nuclear flash effect. |
| `Rain_oldgamma` | `int` | `daynight.lgc` | Gamma value saved before the rain effect changes it. |
| `Rain_time` | `int` | `daynight.lgc` | Timer used by the rain effect. |
| `RainGammas` | `int[]` | `daynight.lgc` | Gamma presets used while rain is active. |
| `s507enabled` | `int` | `daynight.lgc` | Flag indicating whether fireflies are present on the current map. |
| `SetDayNightGamma_changegamma` | `int` | `daynight.lgc` | Target gamma adjustment for the current day/night transition. |
| `SetDayNightGamma_mode` | `int` | `daynight.lgc` | Current phase/mode used by the day/night gamma transition. |
| `SetDayNightGamma_oldgamma` | `int` | `daynight.lgc` | Gamma value saved at the start of the day/night transition. |
| `SetDayNightGamma_time` | `int` | `daynight.lgc` | Timestamp of the current day/night gamma transition. |
| `Times` | `int[]` | `daynight.lgc` | Durations or transition timings for the day/night phases. |

## `DoKeys.lgc`

13 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `ai_log_debugmode` | `int` | `DoKeys.lgc` | Flag controlling AI log debug output. |
| `aidebug_mode` | `int` | `DoKeys.lgc` | Flag controlling the AI debug display. |
| `BuildModeText1` | `int` | `DoKeys.lgc` | Text-sprite handle for the first build-mode help line. |
| `BuildModeText2` | `int` | `DoKeys.lgc` | Text-sprite handle for the second build-mode help line. |
| `BuildModeText3` | `int` | `DoKeys.lgc` | Text-sprite handle for the third build-mode help line. |
| `BuildModeText4` | `int` | `DoKeys.lgc` | Text-sprite handle for the fourth build-mode help line. |
| `BuildModeText5` | `int` | `DoKeys.lgc` | Text-sprite handle for the fifth build-mode help line. |
| `BuildTime` | `int` | `DoKeys.lgc` | Build-mode timing value. |
| `BuildUnit` | `int` | `DoKeys.lgc` | Unit handle selected for the current build-mode operation. |
| `PrintDebug_alltext` | `string` | `DoKeys.lgc` | Complete text buffer used by the developer debug overlay. |
| `PrintDebug_oldtext` | `string` | `DoKeys.lgc` | Previous debug-overlay text buffer used to detect changes. |
| `PrintDebug_strnum` | `int` | `DoKeys.lgc` | Number of debug strings/rows currently tracked. |
| `PrintDebug_text` | `int` | `DoKeys.lgc` | Text-sprite handle used by the debug overlay. |

## `EnvironmentTact.lgc`

11 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `endt` | `int` | `EnvironmentTact.lgc` | End timestamp for the meteor-shower interval. |
| `m_rain_act` | `int` | `EnvironmentTact.lgc` | State flag indicating whether a meteor shower is active. |
| `Quake_end` | `int` | `EnvironmentTact.lgc` | End time/state for the current earthquake. |
| `Quake_noquake` | `int` | `EnvironmentTact.lgc` | Flag or timer suppressing a new earthquake. |
| `Quake_noquake_period` | `int` | `EnvironmentTact.lgc` | Cooldown period before another earthquake can begin. |
| `Quake_sound` | `int` | `EnvironmentTact.lgc` | Sound setting used by the current earthquake effect. |
| `Quake_start` | `int` | `EnvironmentTact.lgc` | Start time/state for the current earthquake. |
| `startt` | `int` | `EnvironmentTact.lgc` | Start timestamp for the meteor-shower interval. |
| `wind_dir` | `int` | `EnvironmentTact.lgc` | Current wind direction used by the environment scripts. |
| `wind_speed` | `int` | `EnvironmentTact.lgc` | Current wind speed used by the environment scripts. |
| `wind_time` | `int` | `EnvironmentTact.lgc` | Timer used by the wind environment scripts. |

## `fly.lgc`

2 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `FlyCountDiffArr` | `int[]` | `fly.lgc` | Per-difficulty fly-count values used by the standard fly system. |
| `FlyCountLast` | `int` | `fly.lgc` | State used by the fly system when spawning hostile flies. |

## `header.lgc`

4 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `end` | `int` | `header.lgc` | Shared game-ending state: 0 means play continues; 1 means the enemy was removed but has not yet reached the semaphore; 2 means the enemy removed the player; 3 means the player reached the semaphore. |
| `nuke_time` | `int` | `header.lgc` | Countdown or state timer used by the game-end script. |
| `time_game_total` | `int` | `header.lgc` | Total elapsed in-game time, initialized by the game-end script. |
| `we_are_win` | `int` | `header.lgc` | Flag set when the player has won. |

## `InitDefault.lgc`

1 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `MusicFileNumber` | `int` | `InitDefault.lgc` | Identifier of the music file currently playing. |

## `maps_enabled.lgc`

1 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `map_enabled` | `int[]` | `maps_enabled.lgc` | Map-availability list used to decide which campaign maps can be selected. |

## `Menuend.lgc`

18 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `alpha_appear` | `int` | `Menuend.lgc` | Controls whether the end menu appears using alpha transparency. |
| `End_gamma` | `int` | `Menuend.lgc` | Gamma value used by the end-of-level fade. |
| `FinalScores` | `int` | `Menuend.lgc` | Final score calculated for the current level. |
| `GivenRang` | `int` | `Menuend.lgc` | Rank assigned to the player after score calculation. |
| `GivenScores` | `string` | `Menuend.lgc` | Formatted score text displayed on the end screen. |
| `HiLevel` | `int[]` | `Menuend.lgc` | Level identifiers stored in the high-score table. |
| `HiName` | `string[]` | `Menuend.lgc` | Player names stored in the main high-score table. |
| `HiNameEnd` | `string[]` | `Menuend.lgc` | Player names stored in the end-screen high-score table. |
| `HiRank` | `int[]` | `Menuend.lgc` | Rank values stored in the main high-score table. |
| `HiScores` | `int[]` | `Menuend.lgc` | Score values stored in the main high-score table. |
| `hiscores_text` | `string` | `Menuend.lgc` | Formatted high-score text displayed by the end menu. |
| `hiscores_text2` | `string` | `Menuend.lgc` | Secondary formatted high-score text displayed by the end menu. |
| `HiScoresEnd` | `int[]` | `Menuend.lgc` | Score values stored in the end-screen high-score table. |
| `MENU_STATE_END` | `int` | `Menuend.lgc` | Current end-menu state. |
| `MenuEndGameTimeMSec` | `int` | `Menuend.lgc` | Time in milliseconds used by the end-of-level score and animation logic. |
| `MenuEndTime` | `int` | `Menuend.lgc` | Game time at which the win/loss event occurred and the final sequence began. |
| `ScoresByArmy` | `int[]` | `Menuend.lgc` | Score totals accumulated separately for each army. |
| `TotalScores` | `int` | `Menuend.lgc` | Total score accumulated before end-of-level bonuses. |

## `MenuTact.lgc`

58 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `active_map` | `string` | `MenuTact.lgc` | Filename or identifier of the currently selected map. |
| `BuildMode` | `int` | `MenuTact.lgc` | Flag indicating whether the menu/editor is currently in build mode. |
| `creditsmenu_created` | `int` | `MenuTact.lgc` | Flag indicating that the credits menu objects have been created. |
| `curr_page` | `int` | `MenuTact.lgc` | Current briefing or menu page index. |
| `curr_player` | `int` | `MenuTact.lgc` | Currently selected player index. |
| `exitmenu_created` | `int` | `MenuTact.lgc` | Flag indicating that exit-menu objects have been created. |
| `h_pl_diff` | `int` | `MenuTact.lgc` | Text/object handle for the player difficulty label. |
| `h_pl_name` | `int` | `MenuTact.lgc` | Text/object handle for the player name label. |
| `helpmenu_created` | `int` | `MenuTact.lgc` | Flag indicating that help-menu objects have been created. |
| `keypressed` | `int` | `MenuTact.lgc` | Last key pressed by the menu logic. |
| `levelmenu_created` | `int` | `MenuTact.lgc` | Flag indicating that level-menu objects have been created. |
| `load_list` | `string` | `MenuTact.lgc` | Text buffer containing entries read from a menu/list file. |
| `mbars` | `int[]` | `MenuTact.lgc` | Menu bar object handles. |
| `mclick` | `int` | `MenuTact.lgc` | Mouse-click state used by the menu scripts. |
| `mdir` | `int` | `MenuTact.lgc` | Current menu direction value. |
| `menu_editor_hold` | `int` | `MenuTact.lgc` | Flag indicating that the editor menu is holding/capturing an input action. |
| `menu_editor_how` | `int` | `MenuTact.lgc` | Editor help-text object handle. |
| `menu_editor_lamp` | `int` | `MenuTact.lgc` | Editor lamp/light object handle. |
| `menu_editor_text` | `int` | `MenuTact.lgc` | Editor text object handle. |
| `menu_editor_w` | `int` | `MenuTact.lgc` | Editor row width. |
| `menu_editor_x` | `int` | `MenuTact.lgc` | Editor row X coordinate. |
| `menu_editor_y` | `int` | `MenuTact.lgc` | Editor row Y coordinate. |
| `menu_loading_time` | `int` | `MenuTact.lgc` | Timestamp or elapsed-time counter for the loading menu. |
| `menu_next` | `int` | `MenuTact.lgc` | Next menu page index. |
| `menu_prev` | `int` | `MenuTact.lgc` | Previous menu page index. |
| `menu_start` | `int` | `MenuTact.lgc` | Menu start-button object handle/state. |
| `menu_start_text` | `int` | `MenuTact.lgc` | Menu start-button text object handle. |
| `MENU_STATE` | `int` | `MenuTact.lgc` | Current main-menu state. |
| `menu_temp_gamma` | `int` | `MenuTact.lgc` | Temporary gamma value used while drawing or transitioning the menu. |
| `menu_time_sec` | `int` | `MenuTact.lgc` | Elapsed menu time in seconds. |
| `mouse_over_vid` | `int` | `MenuTact.lgc` | VID of the menu object currently under the mouse cursor. |
| `mouse_swap` | `int` | `MenuTact.lgc` | State flag for mouse-driven item swapping. |
| `mtext` | `int[]` | `MenuTact.lgc` | Menu text object handles. |
| `music_volume` | `int` | `MenuTact.lgc` | Current music volume setting. |
| `mvid` | `int` | `MenuTact.lgc` | VID of the menu object selected on the previous interaction. |
| `optionsmenu_created` | `int` | `MenuTact.lgc` | Flag indicating that options-menu objects have been created. |
| `pause_mx` | `int` | `MenuTact.lgc` | X coordinate saved for the pause-menu interaction. |
| `pause_my` | `int` | `MenuTact.lgc` | Y coordinate saved for the pause-menu interaction. |
| `reading` | `int` | `MenuTact.lgc` | Flag indicating that a menu/list file is currently being read. |
| `readnametext` | `string` | `MenuTact.lgc` | Text buffer used while reading a name from a menu/list file. |
| `readNUM` | `int` | `MenuTact.lgc` | Current entry/index while reading a menu/list file. |
| `readX` | `int` | `MenuTact.lgc` | X coordinate used by the menu/list text reader. |
| `readY` | `int` | `MenuTact.lgc` | Y coordinate used by the menu/list text reader. |
| `SCRX` | `int` | `MenuTact.lgc` | Current menu/screen X coordinate. |
| `SCRY` | `int` | `MenuTact.lgc` | Current menu/screen Y coordinate. |
| `sound_volume` | `int` | `MenuTact.lgc` | Current sound-effect volume setting. |
| `start` | `int` | `MenuTact.lgc` | Start-state flag used by the main menu. |
| `time_pause` | `int` | `MenuTact.lgc` | Timestamp used by the first pause timer. |
| `time_pause2` | `int` | `MenuTact.lgc` | Timestamp used by the second pause timer. |
| `user_delete` | `int[]` | `MenuTact.lgc` | Per-player flags indicating whether a user entry is marked for deletion. |
| `user_diff` | `int[]` | `MenuTact.lgc` | Difficulty setting selected for each user entry. |
| `user_exists` | `int[]` | `MenuTact.lgc` | Per-player flags indicating whether a user entry exists. |
| `user_play` | `int[]` | `MenuTact.lgc` | Per-player flags indicating whether a user entry is playable/selected. |
| `user_text` | `int[]` | `MenuTact.lgc` | Text/object handles for user-menu player entries. |
| `usermenu_created` | `int` | `MenuTact.lgc` | Flag indicating that user-menu objects have been created. |
| `users` | `string[]` | `MenuTact.lgc` | Player names shown in the user menu. |
| `xmaps` | `int[]` | `MenuTact.lgc` | X coordinates of map entries in the level-selection menu. |
| `ymaps` | `int[]` | `MenuTact.lgc` | Y coordinates of map entries in the level-selection menu. |

## `optfields.lgc`

16 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `opt_editor` | `int` | `optfields.lgc` | Current editor option selection/value. |
| `opt_editor_max` | `int` | `optfields.lgc` | Maximum value for the editor option. |
| `opt_editor_name` | `int` | `optfields.lgc` | Name or label for the editor option. |
| `opt_editor_value` | `int` | `optfields.lgc` | Current value of the editor option. |
| `opt_interface` | `int` | `optfields.lgc` | Current interface-size option selection/value. |
| `opt_interface_max` | `int` | `optfields.lgc` | Maximum value for the interface-size option. |
| `opt_interface_name` | `int` | `optfields.lgc` | Name or label for the interface-size option. |
| `opt_interface_value` | `int` | `optfields.lgc` | Current interface-size option value. |
| `opt_minimap` | `int` | `optfields.lgc` | Current minimap-size option selection/value. |
| `opt_minimap_name` | `int` | `optfields.lgc` | Name or label for the minimap-size option. |
| `opt_minimap_value` | `int` | `optfields.lgc` | Current minimap-size option value. |
| `opt_text` | `string` | `optfields.lgc` | Text buffer used to display the current options description. |
| `opt_text_z` | `int` | `optfields.lgc` | Z/depth coordinate at which `CreateOptionsMenu` places the options page. |
| `opt_x` | `int` | `optfields.lgc` | X coordinate at which `CreateOptionsMenu` places the options page. |
| `opt_y` | `int` | `optfields.lgc` | Y coordinate at which `CreateOptionsMenu` places the options page. |
| `opt_z` | `int` | `optfields.lgc` | Z/depth coordinate at which `CreateOptionsMenu` places the options page. |

## `reinforcement.lgc`

6 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `ai_reinforcement_no` | `int` | `reinforcement.lgc` | Number of AI reinforcements received or scheduled by the reinforcement system. |
| `player_commands` | `string` | `reinforcement.lgc` | Initial command string assigned to player reinforcement trains. |
| `player_reinforcement_no` | `int` | `reinforcement.lgc` | Number of player reinforcements received or scheduled by the reinforcement system. |
| `player_x` | `int` | `reinforcement.lgc` | Map X coordinate at which player reinforcements are created. |
| `player_y` | `int` | `reinforcement.lgc` | Map Y coordinate at which player reinforcements are created. |
| `player_z` | `int` | `reinforcement.lgc` | Map Z coordinate at which player reinforcements are created. |

## `trainstactdeclares.lgc`

7 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `ai_trains` | `int[]` | `trainstactdeclares.lgc` | Array of references to AI trains managed by the standard train-tactics system. |
| `ai_trains_target` | `int[]` | `trainstactdeclares.lgc` | Target identifier associated with each AI train task. |
| `ai_trains_task` | `int[]` | `trainstactdeclares.lgc` | Current task code assigned to each AI train. |
| `ai_trains_task2` | `int[]` | `trainstactdeclares.lgc` | Secondary task code assigned to each AI train. |
| `ai_trains_type` | `int[]` | `trainstactdeclares.lgc` | Formation/type code assigned to each AI train. |
| `stgbeh` | `int` | `trainstactdeclares.lgc` | Shared train-stage behaviour state used by the train-tactics scripts. |
| `temp_array` | `int[]` | `trainstactdeclares.lgc` | Temporary integer array shared by train-tactics routines. |

## `TrainsTactFunctions.lgc`

14 variable(s).

| Name | Type | Source | Description |
|---|---|---|---|
| `ai_train_create_help_time` | `int` | `TrainsTactFunctions.lgc` | Timestamp of the most recent AI helper-train creation. |
| `ai_trains_print` | `int[]` | `TrainsTactFunctions.lgc` | Debug flag/state controlling on-screen train information output. |
| `level_queue_task` | `int[]` | `TrainsTactFunctions.lgc` | Task code for each queued level train. |
| `level_queue_times` | `int[]` | `TrainsTactFunctions.lgc` | Scheduled creation/dispatch time for each queued level train. |
| `level_queue_trains` | `int[]` | `TrainsTactFunctions.lgc` | Train handle for each queued level train. |
| `start_trains` | `int[]` | `TrainsTactFunctions.lgc` | Formation type code for each configured AI starting train. |
| `start_trains_random_task` | `int[]` | `TrainsTactFunctions.lgc` | Random-task selection data associated with starting AI trains. |
| `start_trains_renew` | `int[]` | `TrainsTactFunctions.lgc` | Renewal/rebuild flag for each starting AI train. |
| `start_trains_task` | `int[]` | `TrainsTactFunctions.lgc` | Initial task code assigned to each starting AI train. |
| `start_trains_x` | `int[]` | `TrainsTactFunctions.lgc` | Spawn X coordinate for each configured starting AI train. |
| `start_trains_y` | `int[]` | `TrainsTactFunctions.lgc` | Spawn Y coordinate for each configured starting AI train. |
| `this_train_null` | `int[]` | `TrainsTactFunctions.lgc` | Temporary train composition array used while building or rebuilding a train. |
| `UniqueNum_arr` | `int[]` | `TrainsTactFunctions.lgc` | Array of unique NVID values extracted from a train composition. |
| `UniqueNum_arr_count` | `int[]` | `TrainsTactFunctions.lgc` | Occurrence count for each unique NVID in `UniqueNum_arr`. |
