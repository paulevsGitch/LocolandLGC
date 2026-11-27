# LGC Constants Reference

Object-like constants and standard preprocessor aliases available through the supplied game header sources.

**Entries:** 666. Every entry includes an explicit primitive or macro type, replacement value, source file and English description. `function` identifies a function-like compatibility alias.

## `ai_default_event.lgc`

7 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `F505_MARGIN` | `int` | `150` | Margin used by the F505 bear-generator event logic. |
| `F505_TIME_BETWEEN` | `int` | `10` | Delay between F505 bear-generator activations. |
| `F505_TIME_OPEN` | `int` | `1000` | Open/active duration used by the F505 bear-generator sequence. |
| `F505_TOP_Z` | `int` | `40` | Upper Z coordinate used by the F505 bear-generator sequence. |
| `FORTS_CAPTURE_RANGE` | `int` | `75` | Capture range used by the standard fort-capture logic. |
| `TOWERS_FORT_DISTANCE` | `int` | `150` | Distance within which towers are checked around forts and factories. |
| `TYKVA_COUNT` | `int` | `20` | Number of pumpkins used by the corresponding standard event script. |

## `ai_events.lgc`

2 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `AI_DEFINE` | `int` | `1` | Include guard for the standard AI event definitions. |
| `AI_L03_LGC` | `int` | `1` | Build/level preprocessor flag for the level-03 AI event source. |

## `ai_functions.lgc`

16 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `AI_FUNCTIONS_LGC` | `int` | `1` | Include guard indicating that the standard AI helper functions are loaded. |
| `COVER_BATTLE_RANGE` | `int` | `0` | Default battle-range threshold used by AI train tactics. |
| `TRADIUS_ALLINRADIUS` | `int` | `2` | Train radius-selection mode that includes all targets in the radius. |
| `TRADIUS_BATTLERADIUS` | `int` | `9` | Train radius-selection mode using the battle radius. |
| `TRADIUS_INRADIUS` | `int` | `1` | Train radius-selection mode for targets inside the radius. |
| `TRADIUS_NOTINRADIUS` | `int` | `0` | Train radius-selection mode for targets outside the radius. |
| `TRAINBEHAVE_HAUNT` | `int` | `4` | Train behaviour mode that pursues an enemy when one is encountered. |
| `TRAINBEHAVE_HAUNT_BIGFIRE` | `int` | `5` | Pursuit behaviour with super-weapon firing enabled. |
| `TRAINBEHAVE_WITH_BIGFIRE` | `int` | `3` | Train behaviour mode that allows firing even with super weapons. |
| `TRAINBEHAVE_WITH_FIRE` | `int` | `2` | Train behaviour mode that allows firing. |
| `TRAINBEHAVE_WITHOUT_FIRE` | `int` | `1` | Train behaviour mode that avoids firing. |
| `VID_ENGINE_ANTIAIR` | `int` | `(-1)` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_ENGINE_FARWEAPON` | `int` | `(-3)` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_ENGINE_NEARWEAPON` | `int` | `(-2)` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_ENGINE_OTHER` | `int` | `(-5)` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_ENGINE_STEAM` | `int` | `(-4)` | VID property selector used with `GetVidData()` and `SetVidData()`. |

## `basefunctions.lgc`

2 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `MUXI_MARGIN` | `int` | `(-30)` | Vertical margin used by the fly-spawning logic. |
| `RAIL_Z` | `int` | `0` | Z coordinate assigned to railway-related elements. |

## `civil.lgc`

5 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `CIVIL_TRAIN_RANDOM` | `int` | `0` | Mode flag used by the civilian-train selection logic for random behaviour. |
| `CIVIL_TRAIN_REBIRTH` | `int` | `0` | Mode flag controlling civilian-train respawn behaviour. |
| `CIVILPATROLTIME_BUILD` | `int` | `20000` | Civilian patrol timing constant used while a patrol train is being built. |
| `CIVILPATROLTIME_STOP` | `int` | `5000` | Civilian patrol timing constant used while a patrol train is stopped. |
| `TORNADO_TIME` | `int` | `120000` | Duration or interval setting used by the tornado effect. |

## `constants.lgc`

36 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `DIFF_EASY` | `int` | `1` | Easy game difficulty level. |
| `DIFF_EASY_ARMY0` | `int` | `200` | Starting unit allowance for the player army on Easy difficulty. |
| `DIFF_EASY_ARMY1` | `int` | `100` | Starting unit allowance for the enemy army on Easy difficulty. |
| `DIFF_HARD` | `int` | `3` | Hard game difficulty level. |
| `DIFF_HARD_ARMY0` | `int` | `100` | Starting unit allowance for the player army on Hard difficulty. |
| `DIFF_HARD_ARMY1` | `int` | `100` | Starting unit allowance for the enemy army on Hard difficulty. |
| `DIFF_NORMAL` | `int` | `2` | Normal game difficulty level. |
| `DIFF_NORMAL_ARMY0` | `int` | `150` | Starting unit allowance for the player army on Normal difficulty. |
| `DIFF_NORMAL_ARMY1` | `int` | `100` | Starting unit allowance for the enemy army on Normal difficulty. |
| `FACTORY_MONEY` | `int` | `3` | Factory production money multiplier used by the standard scripts. |
| `GAMMA_END1` | `int` | `0x0039E239` | Gamma/colour value used by the first end-screen transition. |
| `GAMMA_END2` | `int` | `0x00CB7F7F` | Gamma/colour value used by the second end-screen transition. |
| `KEY_BUILD_MODE` | `char` | `'B'` | Developer cheat key for entering build mode. |
| `KEY_CHANGE_ARMY` | `char` | `'A'` | Developer cheat key for changing the active army. |
| `KEY_CREATE_BIG_TRAIN` | `char` | `'#'` | Developer cheat key for creating a large train. |
| `KEY_EXPLOSION` | `char` | `'x'` | Developer cheat key for triggering an explosion. |
| `KEY_KILLEM_ALL` | `char` | `'K'` | Developer cheat key for removing all units belonging to army 1. |
| `KEY_MAP_EXIT` | `int` | `27` | Virtual-key code for leaving the current map and returning to the menu (Escape). |
| `KEY_OBJECTIVES` | `int` | `79` | Virtual-key code used to open the objectives panel (O). |
| `KEY_REPAIR` | `char` | `'h'` | Developer cheat key for repairing a unit. |
| `KEY_SET_MONEY` | `char` | `'M'` | Developer cheat key for granting money. |
| `KEY_SHOW_AIDEBUG` | `char` | `'D'` | Developer cheat key for displaying AI debug information. |
| `KEY_STATEBAR` | `int` | `9` | Virtual-key code used to toggle the state bar (Tab). |
| `KEY_TRAIN_DELETE` | `int` | `4` | Virtual-key code for deleting a train; the source comment identifies Ctrl+D. |
| `KEY_UNIT_DELETE` | `char` | `'d'` | Virtual-key code for the unit-delete command. |
| `KEY_VICTORY` | `char` | `'W'` | Developer cheat key for forcing a victory state. |
| `MENU_DISABLE` | `int` | `0` | Menu state indicating that the menu is disabled. |
| `MENU_LOADING` | `int` | `1` | Menu state used while a menu or screen is loading. |
| `MENU_LOADING_F1` | `int` | `4` | Menu state used by the F1 loading/help screen. |
| `MENU_OPTIONS_SHIFT_X` | `int` | `(-18)` | Menu-state or menu-layout constant used by standard menu scripts. |
| `MENU_OPTIONS_SHIFT_Y` | `int` | `(-10)` | Menu-state or menu-layout constant used by standard menu scripts. |
| `MENU_UNLOADING` | `int` | `3` | Menu state used while a menu or screen is unloading. |
| `MENU_WORKING` | `int` | `2` | Menu state used while the main menu is active. |
| `NUKE_END` | `int` | `0x006000` | Final gamma/colour value used by the nuclear effect. |
| `REBUILD_ADDON` | `int` | `0` | Train-rebuild option flag used by the standard train-tactics scripts. |
| `RENEW_TIMEOUT` | `int` | `0` | Timeout used by the standard renewal/rebuild logic. |

## `daynight.lgc`

22 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `ENV_SOUND_FREQ` | `int` | `30` | Sound-effect frequency setting used by the day/night environment script. |
| `GAMMA1` | `int` | `0x00000000` | Gamma preset for the first day/night phase. |
| `GAMMA2` | `int` | `0x00272727` | Gamma preset for the second day/night phase. |
| `GAMMA3` | `int` | `0x00505050` | Gamma preset for the third day/night phase. |
| `GAMMA4` | `int` | `0x00272727` | Gamma preset for the fourth day/night phase. |
| `NUKE` | `int` | `1` | Effect/state flag for the nuclear flash sequence. |
| `NUKE_GAMMA` | `int` | `0x6633aa` | Gamma value used during the nuclear flash. |
| `NUKE_TIME` | `int` | `10` | Timing value used by the nuclear flash effect. |
| `RAIN` | `int` | `0` | Effect/state flag for the standard rain system. |
| `RAIN_GAMMA1` | `int` | `0x00101010` | Gamma preset used during the first rain/day-night phase. |
| `RAIN_GAMMA2` | `int` | `0x00373737` | Gamma preset used during the second rain/day-night phase. |
| `RAIN_GAMMA3` | `int` | `0x00707070` | Gamma preset used during the third rain/day-night phase. |
| `RAIN_GAMMA4` | `int` | `0x00373737` | Gamma preset used during the fourth rain/day-night phase. |
| `RAIN_GAMMA_TIME` | `int` | `2000` | Time interval used when transitioning gamma during rain. |
| `RAIN_TYPE` | `int` | `0` | Rain effect type selector. |
| `START_DAYNIGHT` | `int` | `1` | Initial day/night phase selector. |
| `SVERCHOK` | `int` | `0` | Ambient environment effect flag for the grasshopper/cricket sound. |
| `TIME1` | `int` | `300000` | Duration of the first day/night phase in milliseconds. |
| `TIME2` | `int` | `300000` | Duration of the second day/night phase in milliseconds. |
| `TIME3` | `int` | `300000` | Duration of the third day/night phase in milliseconds. |
| `TIME4` | `int` | `300000` | Duration of the fourth day/night phase in milliseconds. |
| `TIME_CHANGE` | `int` | `30000` | Duration of the gamma transition between day/night phases in milliseconds. |

## `dokeys.lgc`

2 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `SCR_X` | `int` | `72` | X offset from the centre of the construction-help display. |
| `SCR_Y` | `int` | `167` | Y offset from the centre of the construction-help display. |

## `environmenttact.lgc`

8 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `CLOUD_ADD_Z` | `int` | `0` | Additional Z offset applied to clouds. |
| `METEOR_HEIGHT` | `int` | `1000` | Spawn height used for meteorites. |
| `METEOR_RAIN_DELAY` | `int` | `10000` | Pause between meteor showers. |
| `METEOR_RAIN_TIME` | `int` | `10000` | Duration of a meteor shower. |
| `NO_RAIN_TIME` | `int` | `` | No-rain duration setting; its effective value depends on the active preprocessor branch. |
| `QUAKE_TIME` | `int` | `3` | Duration of an earthquake effect, in seconds. |
| `RAIN_TIME` | `int` | `` | Rain-duration setting; its effective value depends on the active preprocessor branch. |
| `SQUALL_TIME` | `int` | `30` | Interval between wind gusts. |

## `explode.lgc`

3 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `EXPLODE_COLORER` | `int` | `1` | Include or configuration flag for the standard explosion effects. |
| `EXPLODE_DAMAGE` | `int` | `15` | Damage setting used by the standard explosion effect script. |
| `EXPLODE_LGC` | `int` | `1` | Include guard for the explosion helper script. |

## `export.lgc`

410 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `ACT_ADD_AMMO` | `int` | `93` | Add `var1` ammunition to weapon slot `var2`; returns the resulting ammunition count. |
| `ACT_ADD_ITEM` | `int` | `54` | Add an item with the NVID in `var1` to a unit item list. |
| `ACT_ATTACK` | `int` | `32` | Attack the target specified by `var1`. |
| `ACT_BACKUP_COMMAND` | `int` | `70` | Push the currently executing command onto the action stack. |
| `ACT_BUILD_UNIT` | `int` | `35` | Build a unit with the NVID in `var1`. |
| `ACT_CHANGE_ANIMATION` | `int` | `61` | Set the unit animation to `var1`. |
| `ACT_CHANGE_COOR` | `int` | `63` | Set the sprite coordinates using `var1` (X), `var2` (Y) and `var3` (Z). |
| `ACT_CHANGE_DIRECTION` | `int` | `60` | Set the unit direction to `var1`. |
| `ACT_CHANGE_VID` | `int` | `62` | Change the sprite VID to `var1`; `var2` optionally changes animation, with -1 leaving it unchanged. |
| `ACT_CLASH_ENGINE` | `int` | `151` | Ram the engine referenced by `var1`. |
| `ACT_CLEAR_COMMAND` | `int` | `42` | Stop the currently executing command. |
| `ACT_CLEAR_STACK` | `int` | `72` | Clear the action stack. |
| `ACT_COOR_ATTACK` | `int` | `37` | Fire a single shot at the map coordinates in `var1`/`var2`. |
| `ACT_CYCLE_STACK` | `int` | `71` | Loop the command stack to the command index specified by `var1`. |
| `ACT_DAMAGE` | `int` | `85` | Apply damage from `var1`; `var2` identifies the unit that caused it. A return value of 1 indicates that repair is not needed. |
| `ACT_DELETE_ALL_ITEM` | `int` | `57` | Remove all items from a unit item list. |
| `ACT_DELETE_ITEM` | `int` | `55` | Remove an item with the NVID in `var1` from a unit item list. |
| `ACT_DESTROY_UNIT` | `int` | `134` | Destroy an object with NVID `var1` at coordinates `var2`/`var3`. |
| `ACT_FIRST_ENGINE` | `int` | `154` | Return the first engine in a train. |
| `ACT_FLAGMAN_TRIGGER` | `int` | `43` | Pause command-stack execution while Flagman distance exceeds the thresholds in `var1`/`var2`/`var3`. |
| `ACT_FORCELINK_ENGINE` | `int` | `152` | Force-link the engine referenced by `var1` to reconnect a split train. |
| `ACT_GET_AMMO` | `int` | `92` | Return ammunition for the weapon slot specified by `var1`. |
| `ACT_GET_ANIMATION` | `int` | `91` | Return the current animation. |
| `ACT_GET_ARMY` | `int` | `96` | Return the army number. |
| `ACT_GET_BATTLE_RANGE` | `int` | `100` | Return the unit battle range, accounting for linked objects. |
| `ACT_GET_BEHAVE` | `int` | `94` | Return the current behaviour mode. |
| `ACT_GET_COMMAND` | `int` | `111` | Return the command currently being executed (`COM_*`). |
| `ACT_GET_GOAL` | `int` | `90` | Action opcode used with `Action()` and `AddCommand()`; the opcode selects the `get goal` action. |
| `ACT_GET_HP` | `int` | `87` | Return the unit hit points. |
| `ACT_GET_ITEM` | `int` | `58` | Return the item stored in the slot specified by `var1`. |
| `ACT_GET_LINK` | `int` | `101` | Return the sprite linked to this sprite. |
| `ACT_GET_PERCENT_HP` | `int` | `89` | Return unit hit points as a percentage. |
| `ACT_GET_SPEED` | `int` | `109` | Return the current speed. |
| `ACT_GET_TEXT` | `int` | `121` | Return the string associated with an `STEXT` sprite. |
| `ACT_GET_TIMER` | `int` | `105` | Action opcode that returns the unit timer value. |
| `ACT_GET_UPLINK` | `int` | `103` | Return the parent sprite to which this sprite is linked. |
| `ACT_GET_ZSPEED` | `int` | `107` | Return the current Z speed. |
| `ACT_HAVE_ITEM` | `int` | `56` | Test whether the unit has an item with the NVID in `var1`. |
| `ACT_IN_TRAIN` | `int` | `158` | Return whether the engine specified by `var1` is present in the train. |
| `ACT_IS_FIRST` | `int` | `157` | Return whether the wagon is the first wagon in its train. |
| `ACT_IS_TRAIN` | `int` | `159` | Return whether the sprite is a locomotive/train engine. |
| `ACT_LAST_ENGINE` | `int` | `155` | Return the last engine in a train. |
| `ACT_LINK_ENGINE` | `int` | `150` | Link the engine referenced by `var1` to the train. |
| `ACT_LOGIC_RUN` | `int` | `131` | Run `LogicRun` with the value in `var1` and the current sprite. |
| `ACT_MOVE` | `int` | `33` | Move to the map coordinates in `var1` and `var2`. |
| `ACT_MOVE_TO` | `int` | `34` | Move to the sprite target referenced by `var1`. |
| `ACT_NEXT_COMMAND` | `int` | `130` | Animation-completion callback invoked when a sprite finishes playing an animation. |
| `ACT_NEXT_ENGINE` | `int` | `156` | Return the next engine in a train. |
| `ACT_NONE` | `int` | `255` | No-op command; performs no action. |
| `ACT_PATH_BLOCK` | `int` | `50` | Path-blocked movement callback; `var1` and `var2` contain the last X/Y movement deltas. |
| `ACT_PATH_GROUND` | `int` | `51` | Ground-intersection movement callback; `var1` is the new Z and `var2` is the ground Z. |
| `ACT_PATH_LIMIT` | `int` | `52` | Movement callback invoked when an object leaves the map boundaries. |
| `ACT_PATROL` | `int` | `36` | Patrol to the map point in `var1`/`var2` and return. |
| `ACT_PAUSE` | `int` | `40` | Wait for `var1` plus a random amount up to `var2` milliseconds. |
| `ACT_PLAY_SFX` | `int` | `135` | Play the sound effect identified by `var1`. |
| `ACT_RANDOM` | `int` | `38` | Perform a random idle action, such as a lazy animation, a head turn, or no action. |
| `ACT_REPAIR` | `int` | `86` | Fully restore hit points and rebuild a destroyed turret. |
| `ACT_RESTORE` | `int` | `81` | Restore sprite-specific state from the stream referenced by `var1`. |
| `ACT_ROTATE` | `int` | `41` | Turn toward the direction specified by `var1`. |
| `ACT_SAVE` | `int` | `80` | Save the sprite-specific state to the stream referenced by `var1`. |
| `ACT_SET_ARMY` | `int` | `97` | Set the army number to `var1`. |
| `ACT_SET_BEHAVE` | `int` | `95` | Set the behaviour mode to `var1`. |
| `ACT_SET_DEATH_TIMER` | `int` | `112` | Set the time until the sprite dies; 999999 disables the death timer. |
| `ACT_SET_FILE` | `int` | `123` | Set the filename associated with the sprite. |
| `ACT_SET_HP` | `int` | `88` | Set hit points using `var1`; when `var1` is zero, `var2` is interpreted as a percentage of maximum HP. |
| `ACT_SET_INVISIBLE` | `int` | `98` | Set visibility using `var1` (1 hides the object; 0 makes it visible). |
| `ACT_SET_LINK` | `int` | `102` | Link the sprite referenced by `var1` to this sprite. |
| `ACT_SET_SPEED` | `int` | `110` | Set speed to `var1`. |
| `ACT_SET_TEXT` | `int` | `120` | Set the string associated with an `STEXT` sprite. |
| `ACT_SET_TEXT_COUNT` | `int` | `122` | Set the number of characters currently displayed. |
| `ACT_SET_TIMER` | `int` | `106` | Action opcode that sets the unit timer value using the supplied timer value. |
| `ACT_SET_UPLINK` | `int` | `104` | Unlink this sprite from its parent. |
| `ACT_SET_ZSPEED` | `int` | `108` | Set Z speed to `var1`. |
| `ACT_STOP` | `int` | `39` | Stop executing commands; a non-zero `var1` requests an immediate stop. |
| `ACT_STOP_STACK` | `int` | `73` | Stop execution of subsequent action-stack commands. |
| `ACT_TRAIN_BEHAVE` | `int` | `153` | Set the train behaviour mode using a `TRAINBEHAVE_*` value in `var1`. |
| `ACT_UNDO_INSERT` | `int` | `133` | Map-editor undo operation that restores a unit to the screen without recreating the underlying object. |
| `ACT_UNDO_REMOVE` | `int` | `132` | Map-editor undo operation that removes a unit from the screen without deleting the underlying object. |
| `ANI_BIRTH` | `int` | `14` | Animation-state identifier used by sprite animation functions. |
| `ANI_BUILD` | `int` | `1` | Animation-state identifier used by sprite animation functions. |
| `ANI_CLASH` | `int` | `12` | Animation-state identifier used by sprite animation functions. |
| `ANI_CLOSE` | `int` | `7` | Animation-state identifier used by sprite animation functions. |
| `ANI_DEATH` | `int` | `15` | Animation-state identifier used by sprite animation functions. |
| `ANI_DEATH2` | `int` | `16` | Animation-state identifier used by sprite animation functions. |
| `ANI_FIGHT` | `int` | `8` | Animation-state identifier used by sprite animation functions. |
| `ANI_FONT_NEXT_CHAR` | `int` | `1` | Animation-state identifier used by sprite animation functions. |
| `ANI_FONT_NEXT_LINE` | `int` | `2` | Animation-state identifier used by sprite animation functions. |
| `ANI_FONT_NORMAL` | `int` | `0` | Animation-state identifier used by sprite animation functions. |
| `ANI_GO` | `int` | `2` | Animation-state identifier used by sprite animation functions. |
| `ANI_HIT` | `int` | `7` | Animation-state identifier used by sprite animation functions. |
| `ANI_L_ROTATE` | `int` | `4` | Animation-state identifier used by sprite animation functions. |
| `ANI_LAZY` | `int` | `12` | Animation-state identifier used by sprite animation functions. |
| `ANI_LINK` | `int` | `11` | Animation-state identifier used by sprite animation functions. |
| `ANI_LOAD` | `int` | `11` | Animation-state identifier used by sprite animation functions. |
| `ANI_MENUDISABLE` | `int` | `6` | Animation-state identifier used by sprite animation functions. |
| `ANI_MENUDISABLEDOWN` | `int` | `6` | Animation-state identifier used by sprite animation functions. |
| `ANI_MENUDISABLEUP` | `int` | `7` | Animation-state identifier used by sprite animation functions. |
| `ANI_MENUPRESSDOWN` | `int` | `4` | Animation-state identifier used by sprite animation functions. |
| `ANI_MENUPRESSUP` | `int` | `5` | Animation-state identifier used by sprite animation functions. |
| `ANI_MENUSELECTDOWN` | `int` | `2` | Animation-state identifier used by sprite animation functions. |
| `ANI_MENUSELECTUP` | `int` | `3` | Animation-state identifier used by sprite animation functions. |
| `ANI_MENUSTANDDOWN` | `int` | `0` | Animation-state identifier used by sprite animation functions. |
| `ANI_MENUSTANDUP` | `int` | `1` | Animation-state identifier used by sprite animation functions. |
| `ANI_OPEN` | `int` | `6` | Animation-state identifier used by sprite animation functions. |
| `ANI_R_ROTATE` | `int` | `5` | Animation-state identifier used by sprite animation functions. |
| `ANI_SALUT` | `int` | `9` | Animation-state identifier used by sprite animation functions. |
| `ANI_STAND` | `int` | `0` | Animation-state identifier used by sprite animation functions. |
| `ANI_STAND_OPEN` | `int` | `10` | Animation-state identifier used by sprite animation functions. |
| `ANI_START_MOVE` | `int` | `3` | Animation-state identifier used by sprite animation functions. |
| `ANI_STOP_MOVE` | `int` | `1` | Animation-state identifier used by sprite animation functions. |
| `ANI_UNLOAD` | `int` | `12` | Animation-state identifier used by sprite animation functions. |
| `ANI_WOUND` | `int` | `13` | Animation-state identifier used by sprite animation functions. |
| `B_AVIA` | `int` | `4` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_BALLOON` | `int` | `26` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_BUILDING` | `int` | `3` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_CANNON` | `int` | `5` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_CIV_ROBOT` | `int` | `20` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_CREATURE` | `int` | `25` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_DEPO` | `int` | `24` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_ENGINE` | `int` | `21` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_FRAME` | `int` | `10` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_LINKER` | `int` | `12` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_MISSILE` | `int` | `27` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_OBJECT` | `int` | `1` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_PRIMITIVE` | `int` | `6` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_RAIL` | `int` | `22` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_REGION` | `int` | `23` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_SPRITE` | `int` | `9` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_TERRAIN` | `int` | `0` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_TEXT` | `int` | `19` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `B_UNIT` | `int` | `2` | Sprite-class identifier returned by `GetVid()`/`GetVidData()` through `VID_CLASS`. |
| `BEH_ACTIVE` | `int` | `2` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_AGGRESSIVE` | `int` | `1` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_BIGFIRE` | `int` | `16` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_BOTTOM` | `int` | `4` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_CAREFUL` | `int` | `4` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_CENTER` | `int` | `(BEH_CENTER_X+BEH_CENTER_Y)` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_CENTER_X` | `int` | `1` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_CENTER_Y` | `int` | `8` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_FILE` | `int` | `(2*16)` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_HAUNT` | `int` | `8` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_LEFT` | `int` | `0` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_LOAD_FROM` | `int` | `(16+32+64)` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_NOT_LOAD` | `int` | `(0*16)` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_RIGHT` | `int` | `2` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_SCRIPT_FILE` | `int` | `(4*16)` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_SCRIPT_STRINGS` | `int` | `(5*16)` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_SCRIPT_UPDATED` | `int` | `(6*16)` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_SCRIPT_VARIABLE` | `int` | `(3*16)` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_STRINGS_INI` | `int` | `(1*16)` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `BEH_TOP` | `int` | `0` | Text or sprite behaviour flag used when loading or displaying text resources. |
| `COM_ATTACK` | `int` | `3` | Sprite command identifier. Value: 3 |
| `COM_BUILD` | `int` | `16` | Sprite command identifier. Value: 16 |
| `COM_DISTATTACK` | `int` | `5` | Sprite command identifier. Value: 5 |
| `COM_ENGINE_ATTACK` | `int` | `28` | Sprite command identifier. Value: 28 |
| `COM_ENGINE_CLASH` | `int` | `27` | Sprite command identifier. Value: 27 |
| `COM_ENGINE_LINK` | `int` | `26` | Sprite command identifier. Value: 26 |
| `COM_ENGINE_MINE` | `int` | `24` | Sprite command identifier. Value: 24 |
| `COM_ENGINE_MOVE` | `int` | `23` | Sprite command identifier. Value: 23 |
| `COM_ENGINE_ONEATTACK` | `int` | `29` | Sprite command identifier. Value: 29 |
| `COM_ENGINE_PATROL` | `int` | `25` | Sprite command identifier. Value: 25 |
| `COM_MOVE` | `int` | `1` | Sprite command identifier. Value: 1 |
| `COM_MOVE3D` | `int` | `2` | Sprite command identifier. Value: 2 |
| `COM_NEARATTACK` | `int` | `6` | Sprite command identifier. Value: 6 |
| `COM_NONE` | `int` | `0` | Sprite command identifier. Value: 0 |
| `COM_ONEATTACK` | `int` | `4` | Sprite command identifier. Value: 4 |
| `COM_OTHER` | `int` | `31` | Sprite command identifier. Value: 31 |
| `COM_PASSIVE` | `int` | `17` | Sprite command identifier. Value: 17 |
| `COM_PATROL` | `int` | `7` | Sprite command identifier. Value: 7 |
| `COM_PAUSE` | `int` | `18` | Sprite command identifier. Value: 18 |
| `COM_ROTATE` | `int` | `19` | Sprite command identifier. Value: 19 |
| `COM_TARAN` | `int` | `8` | Sprite command identifier. Value: 8 |
| `CURSOR_ATTACK` | `int` | `5` | Game cursor mode identifier. Value: 5 |
| `CURSOR_CLASH` | `int` | `3` | Game cursor mode identifier. Value: 3 |
| `CURSOR_CYCLE` | `int` | `9` | Game cursor mode identifier. Value: 9 |
| `CURSOR_DELETE` | `int` | `15` | Game cursor mode identifier. Value: 15 |
| `CURSOR_FIGHT` | `int` | `5` | Game cursor mode identifier. Value: 5 |
| `CURSOR_FIGHT2` | `int` | `6` | Game cursor mode identifier. Value: 6 |
| `CURSOR_LINK` | `int` | `10` | Game cursor mode identifier. Value: 10 |
| `CURSOR_MOVE` | `int` | `2` | Game cursor mode identifier. Value: 2 |
| `CURSOR_NORMAL` | `int` | `0` | Game cursor mode identifier. Value: 0 |
| `CURSOR_NOTMOVE` | `int` | `8` | Game cursor mode identifier. Value: 8 |
| `CURSOR_OFF` | `int` | `-1` | Game cursor mode identifier. Value: -1 |
| `CURSOR_SELECT` | `int` | `7` | Game cursor mode identifier. Value: 7 |
| `CURSOR_UNLINK` | `int` | `11` | Game cursor mode identifier. Value: 11 |
| `EFF_ALPHAAPPEAR` | `int` | `5` | Engine effect identifier used with `Effect()`. |
| `EFF_FADE` | `int` | `3` | Engine effect identifier used with `Effect()`. |
| `EFF_FADE_IN` | `int` | `9` | Engine effect identifier used with `Effect()`. |
| `EFF_FADE_OUT` | `int` | `10` | Engine effect identifier used with `Effect()`. |
| `EFF_LINESHIFT` | `int` | `7` | Engine effect identifier used with `Effect()`. |
| `EFF_NONE` | `int` | `0` | Engine effect identifier used with `Effect()`. |
| `EFF_NUKE` | `int` | `1` | Engine effect identifier used with `Effect()`. |
| `EFF_OPEN_WINDOW` | `int` | `4` | Engine effect identifier used with `Effect()`. |
| `EFF_PIXELAPPEAR` | `int` | `6` | Engine effect identifier used with `Effect()`. |
| `EFF_SCALE_WINDOW` | `int` | `8` | Engine effect identifier used with `Effect()`. |
| `EFF_SCROLL` | `int` | `2` | Engine effect identifier used with `Effect()`. |
| `ENV_BORN_RAIN` | `int` | `0x0800` | Environment effect flag used with SetEnvironment(). Value: 0x0800 |
| `ENV_BORN_SNOW` | `int` | `0x8000` | Environment effect flag used with SetEnvironment(). Value: 0x8000 |
| `ENV_EARTHQUAKE` | `int` | `4` | Environment effect flag used with SetEnvironment(). Value: 4 |
| `ENV_FOG` | `int` | `32` | Environment effect flag used with SetEnvironment(). Value: 32 |
| `ENV_FOGAPPEAR` | `int` | `0x0200` | Environment effect flag used with SetEnvironment(). Value: 0x0200 |
| `ENV_FOGINV` | `int` | `0x0100` | Environment effect flag used with SetEnvironment(). Value: 0x0100 |
| `ENV_GROUND_SNOW` | `int` | `64` | Environment effect flag used with SetEnvironment(). Value: 64 |
| `ENV_LONGSHADOW` | `int` | `2` | Environment effect flag used with SetEnvironment(). Value: 2 |
| `ENV_MASK_RAIN` | `int` | `0x0C00` | Environment effect flag used with SetEnvironment(). Value: 0x0C00 |
| `ENV_MASK_SNOW` | `int` | `0xC000` | Environment effect flag used with SetEnvironment(). Value: 0xC000 |
| `ENV_RAIN` | `int` | `0x0C00` | Environment effect flag used with SetEnvironment(). Value: 0x0C00 |
| `ENV_SHADOW` | `int` | `1` | Environment effect flag used with SetEnvironment(). Value: 1 |
| `ENV_SNOW` | `int` | `0xC000` | Environment effect flag used with SetEnvironment(). Value: 0xC000 |
| `ENV_SQUALL` | `int` | `128` | Environment effect flag used with SetEnvironment(). Value: 128 |
| `ENV_STOP` | `int` | `0x80000000` | Environment effect flag used with SetEnvironment(). Value: 0x80000000 |
| `ENV_STOP_RAIN` | `int` | `0x0400` | Environment effect flag used with SetEnvironment(). Value: 0x0400 |
| `ENV_STOP_SNOW` | `int` | `0x4000` | Environment effect flag used with SetEnvironment(). Value: 0x4000 |
| `ENV_STOPALL` | `int` | `0xFFFFFFFF` | Environment effect flag used with SetEnvironment(). Value: 0xFFFFFFFF |
| `GETSPRITE_ARMY0` | `int` | `0x10000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_ARMY1` | `int` | `0x20000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_ARMY2` | `int` | `0x40000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_ARMY3` | `int` | `0x80000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_AVIA` | `int` | `0x800000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_CANNON` | `int` | `0x20000000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_CLASS` | `int` | `0x1000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_FREE` | `int` | `0x80000000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_HASH` | `int` | `0x8000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_MENU` | `int` | `0x1000000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_OBJECT` | `int` | `0x200000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_RAILWAY` | `int` | `0x2000000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_REGION` | `int` | `0x4000000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_SPRITE` | `int` | `0x40000000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_TERRAIN` | `int` | `0x100000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_UNIT` | `int` | `0x400000` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `GETSPRITE_VID` | `int` | `0x800` | Sprite-filter flag used by `GetSprite()`, `FirstInBox()` and related search functions. |
| `INPUT_CTRL` | `int` | `32` | Input-state bit flag. Value: 32 |
| `INPUT_DOWN` | `int` | `512` | Input-state bit flag. Value: 512 |
| `INPUT_FIRST` | `int` | `1024` | Input-state bit flag. Value: 1024 |
| `INPUT_LCLICK` | `int` | `1` | Input-state bit flag. Value: 1 |
| `INPUT_LDOWN` | `int` | `4` | Input-state bit flag. Value: 4 |
| `INPUT_LEFT` | `int` | `64` | Input-state bit flag. Value: 64 |
| `INPUT_RCLICK` | `int` | `2` | Input-state bit flag. Value: 2 |
| `INPUT_RDOWN` | `int` | `8` | Input-state bit flag. Value: 8 |
| `INPUT_RIGHT` | `int` | `128` | Input-state bit flag. Value: 128 |
| `INPUT_SECOND` | `int` | `2048` | Input-state bit flag. Value: 2048 |
| `INPUT_SHIFT` | `int` | `16` | Input-state bit flag. Value: 16 |
| `INPUT_UP` | `int` | `256` | Input-state bit flag. Value: 256 |
| `NET_CLEARKILL` | `int` | `9` | Network information selector used with GetNetInfo(). Value: 9 |
| `NET_KILLPLAYER` | `int` | `10` | Network information selector used with GetNetInfo(). Value: 10 |
| `NET_NAMEPLAYER` | `int` | `2` | Network information selector used with GetNetInfo(). Value: 2 |
| `NET_NOPLAYER` | `int` | `6` | Network information selector used with GetNetInfo(). Value: 6 |
| `NET_NUMPLAYER` | `int` | `1` | Network information selector used with GetNetInfo(). Value: 1 |
| `PROP_ACCELERATE` | `int` | `6` | Train acceleration capability. |
| `PROP_AMMO` | `int` | `5` | Remaining ammunition as a percentage. |
| `PROP_AMMO_MAX` | `int` | `11` | Maximum ammunition capacity of the train. |
| `PROP_AMMO_NO` | `int` | `10` | Current ammunition count for the train. |
| `PROP_BUILD_TIME` | `int` | `7` | Build time for the train. |
| `PROP_FREE` | `int` | `9` | Whether the train is idle. |
| `PROP_HP` | `int` | `4` | Remaining life in hit points. |
| `PROP_LIFE` | `int` | `3` | Remaining life as a percentage. |
| `PROP_SPEED` | `int` | `1` | Train speed capability. |
| `PROP_WEAPON` | `int` | `2` | Train firepower, accounting for ammunition. |
| `SCROLL_FLAGMAN_IN_CENTER` | `int` | `16` | Screen-scrolling mode used with `SetScrollType()`. |
| `SCROLL_FROM_BORDER` | `int` | `1` | Screen-scrolling mode used with `SetScrollType()`. |
| `SCROLL_NONE` | `int` | `0` | Screen-scrolling mode used with `SetScrollType()`. |
| `SCROLL_TO_FLAGMAN` | `int` | `4` | Screen-scrolling mode used with `SetScrollType()`. |
| `SCROLL_TO_FLAGMAN_WITH_DIRECTION` | `int` | `8` | Screen-scrolling mode used with `SetScrollType()`. |
| `SCROLL_WITH_ARROWS` | `int` | `32` | Screen-scrolling mode used with `SetScrollType()`. |
| `SCROLL_WITH_MOUSE` | `int` | `2` | Screen-scrolling mode used with `SetScrollType()`. |
| `STAT_ACTIVE_FORT_GUN` | `int` | `13` | Number of intact fort guns. |
| `STAT_AGRESSIVE_TRAIN` | `int` | `7` | Number of trains currently assigned an attack target. |
| `STAT_ALL_GUN_POWER` | `int` | `20` | Aggregate firepower score across all units. |
| `STAT_ANTI_AVIA` | `int` | `5` | Number of anti-air units. |
| `STAT_ANTIAVIA_GUN_POWER` | `int` | `18` | Aggregate anti-air firepower score. |
| `STAT_AVIA` | `int` | `3` | Number of air units. |
| `STAT_AVIA_GUN_POWER` | `int` | `17` | Aggregate air-unit firepower score. |
| `STAT_BATTLE_TRAIN` | `int` | `6` | Number of armed and equipped locomotive trains. |
| `STAT_DAMAGED_FORT_GUN` | `int` | `14` | Number of destroyed or damaged fort guns. |
| `STAT_DAMAGED_UNITS` | `int` | `21` | Count of wounded units. |
| `STAT_ENGINE_GUN_POWER` | `int` | `16` | Aggregate rail-unit firepower score, calculated from ammunition, per-shot damage, reload time, range and shared/unit coefficients. |
| `STAT_FREE_DEPO` | `int` | `12` | Number of idle depots. |
| `STAT_GROUND_GUN_POWER` | `int` | `19` | Aggregate ground-unit firepower score. |
| `STAT_LIFE` | `int` | `15` | Total hit points. |
| `STAT_MOBILE_TRAIN` | `int` | `2` | Number of trains with locomotives. |
| `STAT_PASSIVE_TRAIN` | `int` | `10` | Number of passive trains. |
| `STAT_PATROL_TRAIN` | `int` | `9` | Number of trains currently patrolling. |
| `STAT_SUPER_WEAPON` | `int` | `4` | Number of long-range heavy weapons. |
| `STAT_TRAIN` | `int` | `1` | Total number of trains. |
| `STAT_VERYDANGER_TRAIN` | `int` | `8` | Number of trains classified as very dangerous to the enemy; the source notes that this rating is tuned during testing. |
| `STAT_WORKING_DEPO` | `int` | `11` | Number of depots currently working. |
| `U_AVIA` | `int` | `8` | Sprite-type bit flag used by sprite search and type-filtering functions. |
| `U_CANNON` | `int` | `512` | Sprite-type bit flag used by sprite search and type-filtering functions. |
| `U_MENU` | `int` | `16` | Sprite-type bit flag used by sprite search and type-filtering functions. |
| `U_OBJECT` | `int` | `2` | Sprite-type bit flag used by sprite search and type-filtering functions. |
| `U_RAILWAY` | `int` | `32` | Sprite-type bit flag used by sprite search and type-filtering functions. |
| `U_REGION` | `int` | `64` | Sprite-type bit flag used by sprite search and type-filtering functions. |
| `U_SPRITE` | `int` | `1024` | Sprite-type bit flag used by sprite search and type-filtering functions. |
| `U_TACTIC` | `int` | `128` | Sprite-type bit flag used by sprite search and type-filtering functions. |
| `U_TERRAIN` | `int` | `1` | Sprite-type bit flag used by sprite search and type-filtering functions. |
| `U_UNIT` | `int` | `4` | Sprite-type bit flag used by sprite search and type-filtering functions. |
| `VID_AMMO` | `int` | `26` | Maximum ammunition count. |
| `VID_BATTLERANGE` | `int` | `23` | Weapon battle range. |
| `VID_BUILDTIME` | `int` | `55` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_CHILD` | `int` | `60` | VID range for child objects. |
| `VID_CLASS` | `int` | `47` | Sprite class; compare with the `B_*` constants. |
| `VID_COUNT` | `int` | `28` | Number of units of this type currently present on the map. |
| `VID_COUNT0` | `int` | `34` | Number of units of this type belonging to army 0. |
| `VID_COUNT1` | `int` | `35` | Number of units of this type belonging to army 1. |
| `VID_COUNT2` | `int` | `36` | Number of units of this type belonging to army 2. |
| `VID_COUNT3` | `int` | `37` | Number of units of this type belonging to army 3. |
| `VID_DAMAGE` | `int` | `124` | Damage dealt to nearby objects when this unit dies. |
| `VID_DETECTRANGE` | `int` | `50` | Enemy detection range in pixels. |
| `VID_EXCHANGEVID` | `int` | `52` | VID used to exchange/swap the object VID. |
| `VID_FRAME_SPEED` | `int` | `58` | FLC animation playback speed. |
| `VID_GAMMA` | `int` | `18` | Gamma/brightness value. |
| `VID_HIDE` | `int` | `56` | Visibility flag controlling whether the VID is drawn. |
| `VID_HP_COEFF0` | `int` | `42` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_HP_COEFF1` | `int` | `43` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_HP_COEFF2` | `int` | `44` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_HP_COEFF3` | `int` | `45` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_KILLEDUNIT` | `int` | `29` | Number of times this object has been killed. |
| `VID_KILLEDUNIT0` | `int` | `30` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_KILLEDUNIT1` | `int` | `31` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_KILLEDUNIT2` | `int` | `32` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_KILLEDUNIT3` | `int` | `33` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_LIFETIME` | `int` | `49` | Unit lifetime in milliseconds. |
| `VID_LINK` | `int` | `59` | VID of the object linked to this object. |
| `VID_MAXHP` | `int` | `1` | Maximum hit points. |
| `VID_MAXHP0` | `int` | `38` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_MAXHP1` | `int` | `39` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_MAXHP2` | `int` | `40` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_MAXHP3` | `int` | `41` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_MAXUNIT` | `int` | `25` | Maximum number of units of this type allowed on the map. |
| `VID_MOVE_MASK` | `int` | `54` | Movement mask. |
| `VID_NAME` | `int` | `27` | Object name. |
| `VID_NO_CHILD` | `int` | `92` | VID range for objects without children. |
| `VID_NO_DIR` | `int` | `53` | Number of directions supported by the object. |
| `VID_NOT_CREATE_AS_CHILD` | `int` | `57` | Flag that prevents this VID from being created as a child or linked object. |
| `VID_PROPERTY` | `int` | `22` | Property selector slot. |
| `VID_RECOLORUNIT` | `int` | `125` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_RECOLORUNIT0` | `int` | `126` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_RECOLORUNIT1` | `int` | `127` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_RECOLORUNIT2` | `int` | `128` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_RECOLORUNIT3` | `int` | `129` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_SPEED` | `int` | `48` | Unit movement speed. |
| `VID_SPRITETYPE` | `int` | `46` | Sprite type; compare with the `U_*` constants. |
| `VID_WEAPONAIM` | `int` | `51` | Weapon accuracy. |
| `VK_ADD` | `int` | `0x6B00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_BACK` | `int` | `0x08` | Windows virtual-key code returned by `GetKey()`. |
| `VK_CANCEL` | `int` | `0x03` | Windows virtual-key code returned by `GetKey()`. |
| `VK_CLEAR` | `int` | `0x0C` | Windows virtual-key code returned by `GetKey()`. |
| `VK_DECIMAL` | `int` | `0x6E00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_DELETE` | `int` | `0x2E00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_DIVIDE` | `int` | `0x6F00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_DOWN` | `int` | `0x2800` | Windows virtual-key code returned by `GetKey()`. |
| `VK_END` | `int` | `0x2300` | Windows virtual-key code returned by `GetKey()`. |
| `VK_ESCAPE` | `int` | `0x1B` | Windows virtual-key code returned by `GetKey()`. |
| `VK_EXECUTE` | `int` | `0x2B00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F1` | `int` | `0x7000` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F10` | `int` | `0x7900` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F11` | `int` | `0x7A00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F12` | `int` | `0x7B00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F13` | `int` | `0x7C00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F14` | `int` | `0x7D00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F15` | `int` | `0x7E00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F16` | `int` | `0x7F00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F17` | `int` | `0x8000` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F18` | `int` | `0x8100` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F19` | `int` | `0x8200` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F2` | `int` | `0x7100` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F20` | `int` | `0x8300` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F21` | `int` | `0x8400` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F22` | `int` | `0x8500` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F23` | `int` | `0x8600` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F24` | `int` | `0x8700` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F3` | `int` | `0x7200` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F4` | `int` | `0x7300` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F5` | `int` | `0x7400` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F6` | `int` | `0x7500` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F7` | `int` | `0x7600` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F8` | `int` | `0x7700` | Windows virtual-key code returned by `GetKey()`. |
| `VK_F9` | `int` | `0x7800` | Windows virtual-key code returned by `GetKey()`. |
| `VK_HELP` | `int` | `0x2F00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_HOME` | `int` | `0x2400` | Windows virtual-key code returned by `GetKey()`. |
| `VK_INSERT` | `int` | `0x2D00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_LBUTTON` | `int` | `0x01` | Windows virtual-key code returned by `GetKey()`. |
| `VK_LEFT` | `int` | `0x2500` | Windows virtual-key code returned by `GetKey()`. |
| `VK_MBUTTON` | `int` | `0x04` | Windows virtual-key code returned by `GetKey()`. |
| `VK_MULTIPLY` | `int` | `0x6A00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NEXT` | `int` | `0x2200` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NUMLOCK` | `int` | `0x90` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NUMPAD0` | `int` | `0x6000` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NUMPAD1` | `int` | `0x6100` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NUMPAD2` | `int` | `0x6200` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NUMPAD3` | `int` | `0x6300` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NUMPAD4` | `int` | `0x6400` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NUMPAD5` | `int` | `0x6500` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NUMPAD6` | `int` | `0x6600` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NUMPAD7` | `int` | `0x6700` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NUMPAD8` | `int` | `0x6800` | Windows virtual-key code returned by `GetKey()`. |
| `VK_NUMPAD9` | `int` | `0x6900` | Windows virtual-key code returned by `GetKey()`. |
| `VK_PRINT` | `int` | `0x2A00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_PRIOR` | `int` | `0x2100` | Windows virtual-key code returned by `GetKey()`. |
| `VK_RBUTTON` | `int` | `0x02` | Windows virtual-key code returned by `GetKey()`. |
| `VK_RETURN` | `int` | `0x0D` | Windows virtual-key code returned by `GetKey()`. |
| `VK_RIGHT` | `int` | `0x2700` | Windows virtual-key code returned by `GetKey()`. |
| `VK_SCROLL` | `int` | `0x91` | Windows virtual-key code returned by `GetKey()`. |
| `VK_SELECT` | `int` | `0x2900` | Windows virtual-key code returned by `GetKey()`. |
| `VK_SEPARATOR` | `int` | `0x6C00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_SNAPSHOT` | `int` | `0x2C00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_SPACE` | `int` | `0x20` | Windows virtual-key code returned by `GetKey()`. |
| `VK_SUBTRACT` | `int` | `0x6D00` | Windows virtual-key code returned by `GetKey()`. |
| `VK_TAB` | `int` | `0x09` | Windows virtual-key code returned by `GetKey()`. |
| `VK_UP` | `int` | `0x2600` | Windows virtual-key code returned by `GetKey()`. |

## `menuend.lgc`

19 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `A0_LENGTH` | `int` | `6` | Number of entries in the first end-screen score/name table. |
| `A1_LENGTH` | `int` | `6` | Number of entries in the second end-screen score/name table. |
| `A2_LENGTH` | `int` | `8` | Number of entries in the third end-screen score/name table. |
| `BONUS_LEVEL_SCORES` | `int` | `100` | Score awarded for completing a level successfully. |
| `BONUS_TIME_LIMIT` | `int` | `20` | Time limit in minutes used by the completion-time bonus calculation. |
| `BONUS_TIME_PER_MINUTE` | `int` | `5` | Score awarded for each minute saved under the level time limit. |
| `FH` | `int` | `` | Menu font dimension. The effective value depends on the active menu include: `menutact.lgc` and `menuend.lgc` use different values. |
| `FW` | `int` | `` | Menu font dimension. The effective value depends on the active menu include: `menutact.lgc` and `menuend.lgc` use different values. |
| `MENU_BACK_VID` | `int` | `465` | Menu-state or menu-layout constant used by standard menu scripts. |
| `MENU_BUTTON_VID` | `int` | `474` | Menu-state or menu-layout constant used by standard menu scripts. |
| `NAME_LENGTH` | `int` | `24` | Maximum name length used by the end-screen score table. |
| `NUKE_TIME_ENDS` | `int` | `1500` | Duration of the nuclear effect in the end-menu sequence. |
| `STAT_DY` | `int` | `9` | Statistic selector used with `GetStatistics()` and `CalcStatistics()`. |
| `STAT_X` | `int` | `100` | Statistic selector used with `GetStatistics()` and `CalcStatistics()`. |
| `STAT_X_2` | `int` | `300` | Statistic selector used with `GetStatistics()` and `CalcStatistics()`. |
| `STAT_Y` | `int` | `150` | Statistic selector used with `GetStatistics()` and `CalcStatistics()`. |
| `TEXT_LEFT` | `int` | `50` | Left margin used when drawing menu text. |
| `TEXT_TOP` | `int` | `20` | Top margin used when drawing menu text. |
| `TIME_TO_VICTORY` | `int` | `3` | Delay in seconds before the victory sequence is triggered. |

## `menutact.lgc`

43 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `BAR_X` | `int` | `769` | X coordinate of the menu barometer. |
| `BAR_Y` | `int` | `519` | Y coordinate of the menu barometer. |
| `BREIF_HEAD_X` | `int` | `-182` | X coordinate of the briefing heading. |
| `BREIF_HEAD_Y` | `int` | `2197` | Y coordinate of the briefing heading. |
| `BREIF_HEAD_Z` | `int` | `2300` | Z coordinate of the briefing heading. |
| `BTN_DY` | `int` | `47` | Vertical distance between buttons in a menu column. |
| `BTN_X` | `int` | `288` | X coordinate of the first button in a menu column. |
| `BTN_Y` | `int` | `223` | Y coordinate of the first button in a menu column. |
| `EDITOR_BRIEF_COLS` | `int` | `44` | Number of text columns available in the briefing editor. |
| `EDITOR_HEAD_CHAR` | `int` | `18` | Character width used for the editor briefing heading. |
| `EDITOR_ROW_CHAR` | `int` | `8` | Character width used for an editor briefing row. |
| `EDITOR_ROW_HEAD_Y` | `int` | `-95` | Vertical offset of the editor briefing-row heading. |
| `EDITOR_ROW_LINES` | `int` | `10` | Maximum number of text lines displayed in one editor briefing row. |
| `EDITOR_ROW_LOW_Y` | `int` | `106` | Lower vertical bound of the editor briefing row. |
| `EDITOR_ROW_RIGHT` | `int` | `178` | Right boundary of the editor briefing row. |
| `EDITOR_ROW_X` | `int` | `-150` | X coordinate of the editor briefing row. |
| `EDITOR_ROW_Y` | `int` | `80` | Y coordinate of the editor briefing row. |
| `LONLY_X` | `int` | `287` | X coordinate of the standalone menu button. |
| `LONLY_Y` | `int` | `530` | Y coordinate of the standalone menu button. |
| `MAIN_FLC_DIR` | `int` | `6` | Number of frames in the menu-screen FLC animation. |
| `MAIN_X` | `int` | `534` | X coordinate of the centre of the large in-map menu screen. |
| `MAIN_Y` | `int` | `366` | Y coordinate of the centre of the large in-map menu screen. |
| `MAPS_NUM` | `int` | `20` | Number of standard campaign maps. |
| `MENU_GAMMA` | `int` | `0x007F3C7F` | Menu-state or menu-layout constant used by standard menu scripts. |
| `SCR_DEF_X` | `int` | `1024` | Width of the menu background FLC. |
| `SCR_DEF_Y` | `int` | `768` | Height of the menu background FLC. |
| `SO_BTN_D` | `int` | `200` | Horizontal spacing used by the options/menu button layout. |
| `SO_BTN_DD` | `int` | `57` | Additional horizontal spacing used by the options/menu button layout. |
| `SO_BTN_H` | `int` | `10` | Height of the options/menu button. |
| `SO_BTN_W` | `int` | `20` | Width of the options/menu button. |
| `SO_BTN_X` | `int` | `265` | X coordinate of the options/menu button group. |
| `SO_BTN_Y` | `int` | `223` | Y coordinate of the options/menu button group. |
| `u_btn_delete` | `int` | `85` | Left X coordinate of the user-menu delete button. |
| `u_btn_diff_down` | `int` | `230` | Left X coordinate of the user-menu difficulty-decrease button. |
| `u_btn_diff_str` | `int` | `108` | Left X coordinate of the user-menu difficulty label. |
| `u_btn_diff_up` | `int` | `250` | Left X coordinate of the user-menu difficulty-increase button. |
| `u_btn_edit` | `int` | `65` | Left X coordinate of the user-menu edit button. |
| `u_btn_width` | `int` | `16` | Width of user-menu buttons. |
| `UO_H` | `int` | `20` | Height of an individual user-menu option row. |
| `USR_X` | `int` | `-103` | X coordinate of the first user-menu player entry. |
| `USR_X_PLUS` | `int` | `57` | Horizontal increment between user-menu player entries. |
| `USR_Y` | `int` | `45` | Y coordinate of the first user-menu player entry. |
| `USR_Y_PLUS` | `int` | `7` | Vertical increment between user-menu player entries. |

## `obsolete.lgc`

61 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `act_addammo` | `int` | `93` | Action opcode that adds ammunition; `var1` is the number of rounds to add and the action returns the resulting ammunition amount. |
| `act_attack` | `int` | `32` | Action opcode for attacking a monster; the legacy comment specifies the monster pointer in `var1`. |
| `act_buildunit` | `int` | `35` | Action opcode for building a unit; `var1` supplies the unit NVID. |
| `act_changeaction` | `int` | `201` | Action opcode that changes the unit action; `var1` supplies the action code and `var2` the direction. |
| `act_changecoor` | `int` | `203` | Action opcode that changes the unit X and Y coordinates using `var1` and `var2`. |
| `act_changecoor_z` | `int` | `204` | Action opcode that changes the unit Z coordinate using `var1`. |
| `act_clash_engine` | `int` | `151` | Action opcode for ramming or colliding with another train engine; `var1` identifies that engine. |
| `act_clearstack` | `int` | `72` | Action opcode that clears the unit action-command stack. |
| `act_close` | `int` | `7` | Action opcode used to close an object or interactive unit. |
| `act_cycleaction` | `int` | `71` | Action opcode that loops the unit action-command stack. |
| `act_damage` | `int` | `85` | Legacy action opcode associated with unit damage. The original source comment notes that its behavior may be changed, so its payload semantics are not documented more specifically. |
| `act_death` | `int` | `15` | Action opcode for the unit death action. |
| `act_firstengine` | `int` | `154` | Action opcode that returns the first engine in a train consist. |
| `act_forcelinkengine` | `int` | `152` | Action opcode that links a detached engine to a consist; `var1` identifies the engine to attach. |
| `act_getaction` | `int` | `202` | Action opcode that returns the unit current action code. |
| `act_getammo` | `int` | `92` | Action opcode that returns the unit ammunition amount. |
| `act_getarmy` | `int` | `96` | Action opcode that returns the unit army number. |
| `act_getbehave` | `int` | `94` | Action opcode that returns the current unit behavior code. |
| `act_gethp` | `int` | `87` | Action opcode that returns the unit hit-point value. |
| `act_getlink` | `int` | `101` | Action opcode that returns the engine linked to the current unit. |
| `act_getpercenthp` | `int` | `89` | Action opcode that returns the unit hit points as a percentage. |
| `act_getstate` | `int` | `255` | Action opcode that returns the current unit state. |
| `act_getuplink` | `int` | `103` | Action opcode that returns the upstream linked engine. |
| `act_getweaponrange` | `int` | `100` | Action opcode that returns a unit weapon range, taking a linked unit into account. |
| `act_intrain` | `int` | `158` | Action opcode that checks whether an engine is present in the train consist; `var1` is the engine handle to search for. |
| `act_lastengine` | `int` | `155` | Action opcode that returns the last engine in a train consist. |
| `act_linkengine` | `int` | `150` | Action opcode that links a train engine; `var1` is the engine to attach. |
| `act_menudisable` | `int` | `6` | Menu-button state opcode that disables the button. |
| `act_menustanddown` | `int` | `0` | Menu-button state opcode for the normal, unpressed button. |
| `act_menustandup` | `int` | `1` | Menu-button state opcode for the pressed button. |
| `act_move` | `int` | `33` | Action opcode for movement; `var1` supplies the target X coordinate and `var2` supplies the target Y coordinate. |
| `act_nextengine` | `int` | `156` | Action opcode that returns the next engine in a train consist. |
| `act_open` | `int` | `6` | Action opcode used to open an object or interactive unit. |
| `act_repair` | `int` | `86` | Action opcode for restoring hit points, including repairing a damaged or destroyed tower. |
| `act_restore` | `int` | `200` | Action opcode that restores the sprite information from the stream pointer supplied in `var1`. |
| `act_salut` | `int` | `9` | Action opcode that plays the unit salute action. |
| `act_setarmy` | `int` | `97` | Action opcode that assigns the unit to an army; `var1` is the target army number. |
| `act_setbehave` | `int` | `95` | Action opcode that sets the unit behavior; `var1` is the new behavior code. |
| `act_setstate` | `int` | `255` | Action opcode that sets the unit state; `var1` is the new state value. |
| `act_stand` | `int` | `0` | Action opcode that places the unit in its standing/default action state. |
| `act_stand_open` | `int` | `10` | Action opcode for the standing-open state. |
| `act_stop` | `int` | `39` | Action opcode that stops the unit; a non-zero `var1` requests an immediate stop. |
| `act_train_behave` | `int` | `153` | Action opcode that sets a train consist behavior mode; `var1` is a `TRAINBEHAVE_*` value. |
| `b_engine` | `int` | `21` | Sprite-class identifier for an engine (locomotive) unit. |
| `beh_active` | `int` | `2` | Behavior mode in which an attacked unit, or a unit that sees an enemy but cannot attack it, moves instead of remaining idle. |
| `beh_aggressive` | `int` | `1` | Behavior mode in which a unit attacks an enemy when the enemy enters its weapon range. |
| `eff_alphaappear` | `int` | `5` | Engine effect identifier used with `Effect()`. |
| `eff_fade` | `int` | `3` | Engine effect identifier used with `Effect()`. |
| `eff_lineshift` | `int` | `7` | Engine effect identifier used with `Effect()`. |
| `eff_none` | `int` | `0` | Engine effect identifier used with `Effect()`. |
| `eff_nuke` | `int` | `1` | Engine effect identifier used with `Effect()`. |
| `eff_openwindow` | `int` | `4` | Engine effect identifier used with `Effect()`. |
| `eff_pixelappear` | `int` | `6` | Engine effect identifier used with `Effect()`. |
| `eff_scroll` | `int` | `2` | Engine effect identifier used with `Effect()`. |
| `GetVid` | `function` | `GetVidData` | Legacy preprocessor function alias for `GetVidData`. |
| `SetVid` | `function` | `SetVidData` | Legacy preprocessor function alias for `SetVidData`. |
| `sprintf` | `function` | `Printf` | Legacy preprocessor function alias for `Printf`. |
| `u_avia` | `int` | `8` | Legacy lower-case alias for the `U_AVIA` sprite-type flag. |
| `u_monster` | `int` | `4` | Legacy lower-case alias for the `U_UNIT` sprite-type flag. |
| `VID_BEHAVE` | `int` | `47` | VID property selector used with `GetVidData()` and `SetVidData()`. |
| `VID_TYPEUNIT` | `int` | `46` | VID property selector used with `GetVidData()` and `SetVidData()`. |

## `optfields.lgc`

15 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `OPT_DY` | `int` | `40` | Vertical spacing used by the options rows. |
| `OPT_EDITOR_DOWN` | `int` | `17` | Input/key code for moving down in the editor option control. |
| `OPT_EDITOR_LEFT` | `int` | `956` | Input/key code for moving left in the editor option control. |
| `OPT_EDITOR_RIGHT` | `int` | `957` | Input/key code for moving right in the editor option control. |
| `OPT_INTERFACE_LEFT` | `int` | `954` | Input/key code for decreasing the interface-size option. |
| `OPT_INTERFACE_RIGHT` | `int` | `955` | Input/key code for increasing the interface-size option. |
| `OPT_INTERFACE_ROW` | `int` | `(-4)` | Row offset used by the interface-size option. |
| `OPT_INTERFACE_UP` | `int` | `7` | Input/key code for increasing the interface-size option. |
| `OPT_LEFT_X` | `int` | `(-73+99)` | Left X coordinate of the options panel. |
| `OPT_MINIMAP_LEFT` | `int` | `952` | Input/key code for decreasing minimap size. |
| `OPT_MINIMAP_RIGHT` | `int` | `953` | Input/key code for increasing minimap size. |
| `OPT_MINIMAP_SIZES` | `int` | `3` | Number/list of supported minimap sizes used by the options menu. |
| `OPT_RIGHT_X` | `int` | `(72+99)` | Right X coordinate of the options panel. |
| `OPT_ROW_Y` | `int` | `89` | Base Y coordinate used by options rows. |
| `OPT_VALUE_X` | `int` | `99` | X coordinate where options values are drawn. |

## `trainstactfunctions.lgc`

15 constant(s).

| Name | Type | Value | Description |
|---|---|---|---|
| `FIRSTATTACKTIME` | `int` | `180` | Initial delay before the AI train system starts its first attack. |
| `FIRSTCONTACTTIME` | `int` | `60` | Initial delay before the AI train system makes first contact. |
| `HELP_X` | `int` | `0` | X coordinate where the AI helper train is created. |
| `HELP_Y` | `int` | `0` | Y coordinate where the AI helper train is created. |
| `O_FROM_BACKUP` | `int` | `4` | Train-task option that restores the task saved when the player removed or displaced the train; the previous task value is swapped back into the backup slot. |
| `O_FROM_TASK2` | `int` | `3` | Task-change option: restore the task from the secondary task slot. |
| `O_NONE` | `int` | `0` | Task-change option: replace the current task without saving it. |
| `O_TO_BACKUP` | `int` | `2` | Task-change option: back up the current task temporarily while the player is being removed. |
| `O_TO_TASK2` | `int` | `1` | Task-change option: save the current task into the secondary task slot before switching. |
| `STG_COVER` | `int` | `20` | AI train strategy: defensive/cover behaviour. |
| `STG_DESTROY` | `int` | `9` | AI train strategy: destroy/attack behaviour. |
| `STG_DESTROY_TIME` | `int` | `10` | Duration or delay associated with the destroy strategy, in minutes. |
| `STG_PREPARE` | `int` | `1` | AI train strategy: preparation/standby behaviour. |
| `STG_STAND` | `int` | `0` | AI train strategy: stand/idle behaviour. |
| `TIME_TO_ENEMY_HELP` | `int` | `5` | Delay in minutes before the AI train system creates a helper force. |
