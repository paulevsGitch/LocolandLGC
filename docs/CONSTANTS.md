# Constants Reference

## Contents

- [Action opcodes and legacy action aliases](#action-opcodes-and-legacy-action-aliases) (121)
- [Animation identifiers](#animation-identifiers) (34)
- [Behavior flags](#behavior-flags) (22)
- [Command types](#command-types) (21)
- [Cursor modes](#cursor-modes) (13)
- [Environment and weather effects](#environment-and-weather-effects) (18)
- [Game status and statistics identifiers](#game-status-and-statistics-identifiers) (21)
- [Input-state flags](#input-state-flags) (12)
- [Legacy aliases and script helpers](#legacy-aliases-and-script-helpers) (3)
- [Map scrolling modes](#map-scrolling-modes) (7)
- [Networking commands](#networking-commands) (5)
- [Object property identifiers](#object-property-identifiers) (10)
- [Sprite class identifiers](#sprite-class-identifiers) (20)
- [Sprite lookup filters](#sprite-lookup-filters) (17)
- [Sprite type flags](#sprite-type-flags) (12)
- [VID property identifiers](#vid-property-identifiers) (49)
- [Virtual-key codes](#virtual-key-codes) (67)
- [Visual effects and transitions](#visual-effects-and-transitions) (19)

## Action opcodes and legacy action aliases

| Name | Value | Description | Source |
|---|---:|---|---|
| `ACT_ADD_AMMO` | `93` | Action opcode used with Action() and AddCommand(). Value: 93 | `export.lgc` |
| `ACT_ADD_ITEM` | `54` | Action opcode used with Action() and AddCommand(). Value: 54 | `export.lgc` |
| `act_addammo` | `93` | Game-script constant exported by the Locoland engine. Value: 93 | `obsolete.lgc` |
| `ACT_ATTACK` | `32` | Action opcode used with Action() and AddCommand(). Value: 32 | `export.lgc` |
| `act_attack` | `32` | Game-script constant exported by the Locoland engine. Value: 32 | `obsolete.lgc` |
| `ACT_BACKUP_COMMAND` | `70` | Action opcode used with Action() and AddCommand(). Value: 70 | `export.lgc` |
| `ACT_BUILD_UNIT` | `35` | Action opcode used with Action() and AddCommand(). Value: 35 | `export.lgc` |
| `act_buildunit` | `35` | Game-script constant exported by the Locoland engine. Value: 35 | `obsolete.lgc` |
| `ACT_CHANGE_ANIMATION` | `61` | Action opcode used with Action() and AddCommand(). Value: 61 | `export.lgc` |
| `ACT_CHANGE_COOR` | `63` | Action opcode used with Action() and AddCommand(). Value: 63 | `export.lgc` |
| `ACT_CHANGE_DIRECTION` | `60` | Action opcode used with Action() and AddCommand(). Value: 60 | `export.lgc` |
| `ACT_CHANGE_VID` | `62` | Action opcode used with Action() and AddCommand(). Value: 62 | `export.lgc` |
| `act_changeaction` | `201` | Game-script constant exported by the Locoland engine. Value: 201 | `obsolete.lgc` |
| `act_changecoor` | `203` | Game-script constant exported by the Locoland engine. Value: 203 | `obsolete.lgc` |
| `act_changecoor_z` | `204` | Game-script constant exported by the Locoland engine. Value: 204 | `obsolete.lgc` |
| `ACT_CLASH_ENGINE` | `151` | Action opcode used with Action() and AddCommand(). Value: 151 | `export.lgc` |
| `act_clash_engine` | `151` | Game-script constant exported by the Locoland engine. Value: 151 | `obsolete.lgc` |
| `ACT_CLEAR_COMMAND` | `42` | Action opcode used with Action() and AddCommand(). Value: 42 | `export.lgc` |
| `ACT_CLEAR_STACK` | `72` | Action opcode used with Action() and AddCommand(). Value: 72 | `export.lgc` |
| `act_clearstack` | `72` | Game-script constant exported by the Locoland engine. Value: 72 | `obsolete.lgc` |
| `act_close` | `7` | Game-script constant exported by the Locoland engine. Value: 7 | `obsolete.lgc` |
| `ACT_COOR_ATTACK` | `37` | Action opcode used with Action() and AddCommand(). Value: 37 | `export.lgc` |
| `ACT_CYCLE_STACK` | `71` | Action opcode used with Action() and AddCommand(). Value: 71 | `export.lgc` |
| `act_cycleaction` | `71` | Game-script constant exported by the Locoland engine. Value: 71 | `obsolete.lgc` |
| `ACT_DAMAGE` | `85` | Action opcode used with Action() and AddCommand(). Value: 85 | `export.lgc` |
| `act_damage` | `85` | Game-script constant exported by the Locoland engine. Value: 85 | `obsolete.lgc` |
| `act_death` | `15` | Game-script constant exported by the Locoland engine. Value: 15 | `obsolete.lgc` |
| `ACT_DELETE_ALL_ITEM` | `57` | Action opcode used with Action() and AddCommand(). Value: 57 | `export.lgc` |
| `ACT_DELETE_ITEM` | `55` | Action opcode used with Action() and AddCommand(). Value: 55 | `export.lgc` |
| `ACT_DESTROY_UNIT` | `134` | Action opcode used with Action() and AddCommand(). Value: 134 | `export.lgc` |
| `ACT_FIRST_ENGINE` | `154` | Action opcode used with Action() and AddCommand(). Value: 154 | `export.lgc` |
| `act_firstengine` | `154` | Game-script constant exported by the Locoland engine. Value: 154 | `obsolete.lgc` |
| `ACT_FLAGMAN_TRIGGER` | `43` | Action opcode used with Action() and AddCommand(). Value: 43 | `export.lgc` |
| `ACT_FORCELINK_ENGINE` | `152` | Action opcode used with Action() and AddCommand(). Value: 152 | `export.lgc` |
| `act_forcelinkengine` | `152` | Game-script constant exported by the Locoland engine. Value: 152 | `obsolete.lgc` |
| `ACT_GET_AMMO` | `92` | Action opcode used with Action() and AddCommand(). Value: 92 | `export.lgc` |
| `ACT_GET_ANIMATION` | `91` | Action opcode used with Action() and AddCommand(). Value: 91 | `export.lgc` |
| `ACT_GET_ARMY` | `96` | Action opcode used with Action() and AddCommand(). Value: 96 | `export.lgc` |
| `ACT_GET_BATTLE_RANGE` | `100` | Action opcode used with Action() and AddCommand(). Value: 100 | `export.lgc` |
| `ACT_GET_BEHAVE` | `94` | Action opcode used with Action() and AddCommand(). Value: 94 | `export.lgc` |
| `ACT_GET_COMMAND` | `111` | Action opcode used with Action() and AddCommand(). Value: 111 | `export.lgc` |
| `ACT_GET_GOAL` | `90` | Action opcode used with Action() and AddCommand(). Value: 90 | `export.lgc` |
| `ACT_GET_HP` | `87` | Action opcode used with Action() and AddCommand(). Value: 87 | `export.lgc` |
| `ACT_GET_ITEM` | `58` | Action opcode used with Action() and AddCommand(). Value: 58 | `export.lgc` |
| `ACT_GET_LINK` | `101` | Action opcode used with Action() and AddCommand(). Value: 101 | `export.lgc` |
| `ACT_GET_PERCENT_HP` | `89` | Action opcode used with Action() and AddCommand(). Value: 89 | `export.lgc` |
| `ACT_GET_SPEED` | `109` | Action opcode used with Action() and AddCommand(). Value: 109 | `export.lgc` |
| `ACT_GET_TEXT` | `121` | Action opcode used with Action() and AddCommand(). Value: 121 | `export.lgc` |
| `ACT_GET_TIMER` | `105` | Action opcode used with Action() and AddCommand(). Value: 105 | `export.lgc` |
| `ACT_GET_UPLINK` | `103` | Action opcode used with Action() and AddCommand(). Value: 103 | `export.lgc` |
| `ACT_GET_ZSPEED` | `107` | Action opcode used with Action() and AddCommand(). Value: 107 | `export.lgc` |
| `act_getaction` | `202` | Game-script constant exported by the Locoland engine. Value: 202 | `obsolete.lgc` |
| `act_getammo` | `92` | Game-script constant exported by the Locoland engine. Value: 92 | `obsolete.lgc` |
| `act_getarmy` | `96` | Game-script constant exported by the Locoland engine. Value: 96 | `obsolete.lgc` |
| `act_getbehave` | `94` | Game-script constant exported by the Locoland engine. Value: 94 | `obsolete.lgc` |
| `act_gethp` | `87` | Game-script constant exported by the Locoland engine. Value: 87 | `obsolete.lgc` |
| `act_getlink` | `101` | Game-script constant exported by the Locoland engine. Value: 101 | `obsolete.lgc` |
| `act_getpercenthp` | `89` | Game-script constant exported by the Locoland engine. Value: 89 | `obsolete.lgc` |
| `act_getstate` | `255` | Game-script constant exported by the Locoland engine. Value: 255 | `obsolete.lgc` |
| `act_getuplink` | `103` | Game-script constant exported by the Locoland engine. Value: 103 | `obsolete.lgc` |
| `act_getweaponrange` | `100` | Game-script constant exported by the Locoland engine. Value: 100 | `obsolete.lgc` |
| `ACT_HAVE_ITEM` | `56` | Action opcode used with Action() and AddCommand(). Value: 56 | `export.lgc` |
| `ACT_IN_TRAIN` | `158` | Action opcode used with Action() and AddCommand(). Value: 158 | `export.lgc` |
| `act_intrain` | `158` | Game-script constant exported by the Locoland engine. Value: 158 | `obsolete.lgc` |
| `ACT_IS_FIRST` | `157` | Action opcode used with Action() and AddCommand(). Value: 157 | `export.lgc` |
| `ACT_IS_TRAIN` | `159` | Action opcode used with Action() and AddCommand(). Value: 159 | `export.lgc` |
| `ACT_LAST_ENGINE` | `155` | Action opcode used with Action() and AddCommand(). Value: 155 | `export.lgc` |
| `act_lastengine` | `155` | Game-script constant exported by the Locoland engine. Value: 155 | `obsolete.lgc` |
| `ACT_LINK_ENGINE` | `150` | Action opcode used with Action() and AddCommand(). Value: 150 | `export.lgc` |
| `act_linkengine` | `150` | Game-script constant exported by the Locoland engine. Value: 150 | `obsolete.lgc` |
| `ACT_LOGIC_RUN` | `131` | Action opcode used with Action() and AddCommand(). Value: 131 | `export.lgc` |
| `act_menudisable` | `6` | Game-script constant exported by the Locoland engine. Value: 6 | `obsolete.lgc` |
| `act_menustanddown` | `0` | Game-script constant exported by the Locoland engine. Value: 0 | `obsolete.lgc` |
| `act_menustandup` | `1` | Game-script constant exported by the Locoland engine. Value: 1 | `obsolete.lgc` |
| `ACT_MOVE` | `33` | Action opcode used with Action() and AddCommand(). Value: 33 | `export.lgc` |
| `act_move` | `33` | Game-script constant exported by the Locoland engine. Value: 33 | `obsolete.lgc` |
| `ACT_MOVE_TO` | `34` | Action opcode used with Action() and AddCommand(). Value: 34 | `export.lgc` |
| `ACT_NEXT_COMMAND` | `130` | Action opcode used with Action() and AddCommand(). Value: 130 | `export.lgc` |
| `ACT_NEXT_ENGINE` | `156` | Action opcode used with Action() and AddCommand(). Value: 156 | `export.lgc` |
| `act_nextengine` | `156` | Game-script constant exported by the Locoland engine. Value: 156 | `obsolete.lgc` |
| `ACT_NONE` | `255` | Action opcode used with Action() and AddCommand(). Value: 255 | `export.lgc` |
| `act_open` | `6` | Game-script constant exported by the Locoland engine. Value: 6 | `obsolete.lgc` |
| `ACT_PATH_BLOCK` | `50` | Action opcode used with Action() and AddCommand(). Value: 50 | `export.lgc` |
| `ACT_PATH_GROUND` | `51` | Action opcode used with Action() and AddCommand(). Value: 51 | `export.lgc` |
| `ACT_PATH_LIMIT` | `52` | Action opcode used with Action() and AddCommand(). Value: 52 | `export.lgc` |
| `ACT_PATROL` | `36` | Action opcode used with Action() and AddCommand(). Value: 36 | `export.lgc` |
| `ACT_PAUSE` | `40` | Action opcode used with Action() and AddCommand(). Value: 40 | `export.lgc` |
| `ACT_PLAY_SFX` | `135` | Action opcode used with Action() and AddCommand(). Value: 135 | `export.lgc` |
| `ACT_RANDOM` | `38` | Action opcode used with Action() and AddCommand(). Value: 38 | `export.lgc` |
| `ACT_REPAIR` | `86` | Action opcode used with Action() and AddCommand(). Value: 86 | `export.lgc` |
| `act_repair` | `86` | Game-script constant exported by the Locoland engine. Value: 86 | `obsolete.lgc` |
| `ACT_RESTORE` | `81` | Action opcode used with Action() and AddCommand(). Value: 81 | `export.lgc` |
| `act_restore` | `200` | Game-script constant exported by the Locoland engine. Value: 200 | `obsolete.lgc` |
| `ACT_ROTATE` | `41` | Action opcode used with Action() and AddCommand(). Value: 41 | `export.lgc` |
| `act_salut` | `9` | Game-script constant exported by the Locoland engine. Value: 9 | `obsolete.lgc` |
| `ACT_SAVE` | `80` | Action opcode used with Action() and AddCommand(). Value: 80 | `export.lgc` |
| `ACT_SET_ARMY` | `97` | Action opcode used with Action() and AddCommand(). Value: 97 | `export.lgc` |
| `ACT_SET_BEHAVE` | `95` | Action opcode used with Action() and AddCommand(). Value: 95 | `export.lgc` |
| `ACT_SET_DEATH_TIMER` | `112` | Action opcode used with Action() and AddCommand(). Value: 112 | `export.lgc` |
| `ACT_SET_FILE` | `123` | Action opcode used with Action() and AddCommand(). Value: 123 | `export.lgc` |
| `ACT_SET_HP` | `88` | Action opcode used with Action() and AddCommand(). Value: 88 | `export.lgc` |
| `ACT_SET_INVISIBLE` | `98` | Action opcode used with Action() and AddCommand(). Value: 98 | `export.lgc` |
| `ACT_SET_LINK` | `102` | Action opcode used with Action() and AddCommand(). Value: 102 | `export.lgc` |
| `ACT_SET_SPEED` | `110` | Action opcode used with Action() and AddCommand(). Value: 110 | `export.lgc` |
| `ACT_SET_TEXT` | `120` | Action opcode used with Action() and AddCommand(). Value: 120 | `export.lgc` |
| `ACT_SET_TEXT_COUNT` | `122` | Action opcode used with Action() and AddCommand(). Value: 122 | `export.lgc` |
| `ACT_SET_TIMER` | `106` | Action opcode used with Action() and AddCommand(). Value: 106 | `export.lgc` |
| `ACT_SET_UPLINK` | `104` | Action opcode used with Action() and AddCommand(). Value: 104 | `export.lgc` |
| `ACT_SET_ZSPEED` | `108` | Action opcode used with Action() and AddCommand(). Value: 108 | `export.lgc` |
| `act_setarmy` | `97` | Game-script constant exported by the Locoland engine. Value: 97 | `obsolete.lgc` |
| `act_setbehave` | `95` | Game-script constant exported by the Locoland engine. Value: 95 | `obsolete.lgc` |
| `act_setstate` | `255` | Game-script constant exported by the Locoland engine. Value: 255 | `obsolete.lgc` |
| `act_stand` | `0` | Game-script constant exported by the Locoland engine. Value: 0 | `obsolete.lgc` |
| `act_stand_open` | `10` | Game-script constant exported by the Locoland engine. Value: 10 | `obsolete.lgc` |
| `ACT_STOP` | `39` | Action opcode used with Action() and AddCommand(). Value: 39 | `export.lgc` |
| `act_stop` | `39` | Game-script constant exported by the Locoland engine. Value: 39 | `obsolete.lgc` |
| `ACT_STOP_STACK` | `73` | Action opcode used with Action() and AddCommand(). Value: 73 | `export.lgc` |
| `ACT_TRAIN_BEHAVE` | `153` | Action opcode used with Action() and AddCommand(). Value: 153 | `export.lgc` |
| `act_train_behave` | `153` | Game-script constant exported by the Locoland engine. Value: 153 | `obsolete.lgc` |
| `ACT_UNDO_INSERT` | `133` | Action opcode used with Action() and AddCommand(). Value: 133 | `export.lgc` |
| `ACT_UNDO_REMOVE` | `132` | Action opcode used with Action() and AddCommand(). Value: 132 | `export.lgc` |

## Animation identifiers

| Name | Value | Description | Source |
|---|---:|---|---|
| `ANI_BIRTH` | `14` | Animation identifier. Value: 14 | `export.lgc` |
| `ANI_BUILD` | `1` | Animation identifier. Value: 1 | `export.lgc` |
| `ANI_CLASH` | `12` | Animation identifier. Value: 12 | `export.lgc` |
| `ANI_CLOSE` | `7` | Animation identifier. Value: 7 | `export.lgc` |
| `ANI_DEATH` | `15` | Animation identifier. Value: 15 | `export.lgc` |
| `ANI_DEATH2` | `16` | Animation identifier. Value: 16 | `export.lgc` |
| `ANI_FIGHT` | `8` | Animation identifier. Value: 8 | `export.lgc` |
| `ANI_FONT_NEXT_CHAR` | `1` | Animation identifier. Value: 1 | `export.lgc` |
| `ANI_FONT_NEXT_LINE` | `2` | Animation identifier. Value: 2 | `export.lgc` |
| `ANI_FONT_NORMAL` | `0` | Animation identifier. Value: 0 | `export.lgc` |
| `ANI_GO` | `2` | Animation identifier. Value: 2 | `export.lgc` |
| `ANI_HIT` | `7` | Animation identifier. Value: 7 | `export.lgc` |
| `ANI_L_ROTATE` | `4` | Animation identifier. Value: 4 | `export.lgc` |
| `ANI_LAZY` | `12` | Animation identifier. Value: 12 | `export.lgc` |
| `ANI_LINK` | `11` | Animation identifier. Value: 11 | `export.lgc` |
| `ANI_LOAD` | `11` | Animation identifier. Value: 11 | `export.lgc` |
| `ANI_MENUDISABLE` | `6` | Animation identifier. Value: 6 | `export.lgc` |
| `ANI_MENUDISABLEDOWN` | `6` | Animation identifier. Value: 6 | `export.lgc` |
| `ANI_MENUDISABLEUP` | `7` | Animation identifier. Value: 7 | `export.lgc` |
| `ANI_MENUPRESSDOWN` | `4` | Animation identifier. Value: 4 | `export.lgc` |
| `ANI_MENUPRESSUP` | `5` | Animation identifier. Value: 5 | `export.lgc` |
| `ANI_MENUSELECTDOWN` | `2` | Animation identifier. Value: 2 | `export.lgc` |
| `ANI_MENUSELECTUP` | `3` | Animation identifier. Value: 3 | `export.lgc` |
| `ANI_MENUSTANDDOWN` | `0` | Animation identifier. Value: 0 | `export.lgc` |
| `ANI_MENUSTANDUP` | `1` | Animation identifier. Value: 1 | `export.lgc` |
| `ANI_OPEN` | `6` | Animation identifier. Value: 6 | `export.lgc` |
| `ANI_R_ROTATE` | `5` | Animation identifier. Value: 5 | `export.lgc` |
| `ANI_SALUT` | `9` | Animation identifier. Value: 9 | `export.lgc` |
| `ANI_STAND` | `0` | Animation identifier. Value: 0 | `export.lgc` |
| `ANI_STAND_OPEN` | `10` | Animation identifier. Value: 10 | `export.lgc` |
| `ANI_START_MOVE` | `3` | Animation identifier. Value: 3 | `export.lgc` |
| `ANI_STOP_MOVE` | `1` | Animation identifier. Value: 1 | `export.lgc` |
| `ANI_UNLOAD` | `12` | Animation identifier. Value: 12 | `export.lgc` |
| `ANI_WOUND` | `13` | Animation identifier. Value: 13 | `export.lgc` |

## Behavior flags

| Name | Value | Description | Source |
|---|---:|---|---|
| `BEH_ACTIVE` | `2` | Unit, train or text behavior flag. Value: 2 | `export.lgc` |
| `beh_active` | `2` | Game-script constant exported by the Locoland engine. Value: 2 | `obsolete.lgc` |
| `BEH_AGGRESSIVE` | `1` | Unit, train or text behavior flag. Value: 1 | `export.lgc` |
| `beh_aggressive` | `1` | Game-script constant exported by the Locoland engine. Value: 1 | `obsolete.lgc` |
| `BEH_BIGFIRE` | `16` | Unit, train or text behavior flag. Value: 16 | `export.lgc` |
| `BEH_BOTTOM` | `4` | Unit, train or text behavior flag. Value: 4 | `export.lgc` |
| `BEH_CAREFUL` | `4` | Unit, train or text behavior flag. Value: 4 | `export.lgc` |
| `BEH_CENTER` | `(BEH_CENTER_X+BEH_CENTER_Y)` | Unit, train or text behavior flag. Value: (BEH_CENTER_X+BEH_CENTER_Y) | `export.lgc` |
| `BEH_CENTER_X` | `1` | Unit, train or text behavior flag. Value: 1 | `export.lgc` |
| `BEH_CENTER_Y` | `8` | Unit, train or text behavior flag. Value: 8 | `export.lgc` |
| `BEH_FILE` | `(2*16)` | Unit, train or text behavior flag. Value: (2*16) | `export.lgc` |
| `BEH_HAUNT` | `8` | Unit, train or text behavior flag. Value: 8 | `export.lgc` |
| `BEH_LEFT` | `0` | Unit, train or text behavior flag. Value: 0 | `export.lgc` |
| `BEH_LOAD_FROM` | `(16+32+64)` | Unit, train or text behavior flag. Value: (16+32+64) | `export.lgc` |
| `BEH_NOT_LOAD` | `(0*16)` | Unit, train or text behavior flag. Value: (0*16) | `export.lgc` |
| `BEH_RIGHT` | `2` | Unit, train or text behavior flag. Value: 2 | `export.lgc` |
| `BEH_SCRIPT_FILE` | `(4*16)` | Unit, train or text behavior flag. Value: (4*16) | `export.lgc` |
| `BEH_SCRIPT_STRINGS` | `(5*16)` | Unit, train or text behavior flag. Value: (5*16) | `export.lgc` |
| `BEH_SCRIPT_UPDATED` | `(6*16)` | Unit, train or text behavior flag. Value: (6*16) | `export.lgc` |
| `BEH_SCRIPT_VARIABLE` | `(3*16)` | Unit, train or text behavior flag. Value: (3*16) | `export.lgc` |
| `BEH_STRINGS_INI` | `(1*16)` | Unit, train or text behavior flag. Value: (1*16) | `export.lgc` |
| `BEH_TOP` | `0` | Unit, train or text behavior flag. Value: 0 | `export.lgc` |

## Command types

| Name | Value | Description | Source |
|---|---:|---|---|
| `COM_ATTACK` | `3` | Sprite command identifier. Value: 3 | `export.lgc` |
| `COM_BUILD` | `16` | Sprite command identifier. Value: 16 | `export.lgc` |
| `COM_DISTATTACK` | `5` | Sprite command identifier. Value: 5 | `export.lgc` |
| `COM_ENGINE_ATTACK` | `28` | Sprite command identifier. Value: 28 | `export.lgc` |
| `COM_ENGINE_CLASH` | `27` | Sprite command identifier. Value: 27 | `export.lgc` |
| `COM_ENGINE_LINK` | `26` | Sprite command identifier. Value: 26 | `export.lgc` |
| `COM_ENGINE_MINE` | `24` | Sprite command identifier. Value: 24 | `export.lgc` |
| `COM_ENGINE_MOVE` | `23` | Sprite command identifier. Value: 23 | `export.lgc` |
| `COM_ENGINE_ONEATTACK` | `29` | Sprite command identifier. Value: 29 | `export.lgc` |
| `COM_ENGINE_PATROL` | `25` | Sprite command identifier. Value: 25 | `export.lgc` |
| `COM_MOVE` | `1` | Sprite command identifier. Value: 1 | `export.lgc` |
| `COM_MOVE3D` | `2` | Sprite command identifier. Value: 2 | `export.lgc` |
| `COM_NEARATTACK` | `6` | Sprite command identifier. Value: 6 | `export.lgc` |
| `COM_NONE` | `0` | Sprite command identifier. Value: 0 | `export.lgc` |
| `COM_ONEATTACK` | `4` | Sprite command identifier. Value: 4 | `export.lgc` |
| `COM_OTHER` | `31` | Sprite command identifier. Value: 31 | `export.lgc` |
| `COM_PASSIVE` | `17` | Sprite command identifier. Value: 17 | `export.lgc` |
| `COM_PATROL` | `7` | Sprite command identifier. Value: 7 | `export.lgc` |
| `COM_PAUSE` | `18` | Sprite command identifier. Value: 18 | `export.lgc` |
| `COM_ROTATE` | `19` | Sprite command identifier. Value: 19 | `export.lgc` |
| `COM_TARAN` | `8` | Sprite command identifier. Value: 8 | `export.lgc` |

## Cursor modes

| Name | Value | Description | Source |
|---|---:|---|---|
| `CURSOR_ATTACK` | `5` | Game cursor mode identifier. Value: 5 | `export.lgc` |
| `CURSOR_CLASH` | `3` | Game cursor mode identifier. Value: 3 | `export.lgc` |
| `CURSOR_CYCLE` | `9` | Game cursor mode identifier. Value: 9 | `export.lgc` |
| `CURSOR_DELETE` | `15` | Game cursor mode identifier. Value: 15 | `export.lgc` |
| `CURSOR_FIGHT` | `5` | Game cursor mode identifier. Value: 5 | `export.lgc` |
| `CURSOR_FIGHT2` | `6` | Game cursor mode identifier. Value: 6 | `export.lgc` |
| `CURSOR_LINK` | `10` | Game cursor mode identifier. Value: 10 | `export.lgc` |
| `CURSOR_MOVE` | `2` | Game cursor mode identifier. Value: 2 | `export.lgc` |
| `CURSOR_NORMAL` | `0` | Game cursor mode identifier. Value: 0 | `export.lgc` |
| `CURSOR_NOTMOVE` | `8` | Game cursor mode identifier. Value: 8 | `export.lgc` |
| `CURSOR_OFF` | `-1` | Game cursor mode identifier. Value: -1 | `export.lgc` |
| `CURSOR_SELECT` | `7` | Game cursor mode identifier. Value: 7 | `export.lgc` |
| `CURSOR_UNLINK` | `11` | Game cursor mode identifier. Value: 11 | `export.lgc` |

## Environment and weather effects

| Name | Value | Description | Source |
|---|---:|---|---|
| `ENV_BORN_RAIN` | `0x0800` | Environment effect flag used with SetEnvironment(). Value: 0x0800 | `export.lgc` |
| `ENV_BORN_SNOW` | `0x8000` | Environment effect flag used with SetEnvironment(). Value: 0x8000 | `export.lgc` |
| `ENV_EARTHQUAKE` | `4` | Environment effect flag used with SetEnvironment(). Value: 4 | `export.lgc` |
| `ENV_FOG` | `32` | Environment effect flag used with SetEnvironment(). Value: 32 | `export.lgc` |
| `ENV_FOGAPPEAR` | `0x0200` | Environment effect flag used with SetEnvironment(). Value: 0x0200 | `export.lgc` |
| `ENV_FOGINV` | `0x0100` | Environment effect flag used with SetEnvironment(). Value: 0x0100 | `export.lgc` |
| `ENV_GROUND_SNOW` | `64` | Environment effect flag used with SetEnvironment(). Value: 64 | `export.lgc` |
| `ENV_LONGSHADOW` | `2` | Environment effect flag used with SetEnvironment(). Value: 2 | `export.lgc` |
| `ENV_MASK_RAIN` | `0x0C00` | Environment effect flag used with SetEnvironment(). Value: 0x0C00 | `export.lgc` |
| `ENV_MASK_SNOW` | `0xC000` | Environment effect flag used with SetEnvironment(). Value: 0xC000 | `export.lgc` |
| `ENV_RAIN` | `0x0C00` | Environment effect flag used with SetEnvironment(). Value: 0x0C00 | `export.lgc` |
| `ENV_SHADOW` | `1` | Environment effect flag used with SetEnvironment(). Value: 1 | `export.lgc` |
| `ENV_SNOW` | `0xC000` | Environment effect flag used with SetEnvironment(). Value: 0xC000 | `export.lgc` |
| `ENV_SQUALL` | `128` | Environment effect flag used with SetEnvironment(). Value: 128 | `export.lgc` |
| `ENV_STOP` | `0x80000000` | Environment effect flag used with SetEnvironment(). Value: 0x80000000 | `export.lgc` |
| `ENV_STOP_RAIN` | `0x0400` | Environment effect flag used with SetEnvironment(). Value: 0x0400 | `export.lgc` |
| `ENV_STOP_SNOW` | `0x4000` | Environment effect flag used with SetEnvironment(). Value: 0x4000 | `export.lgc` |
| `ENV_STOPALL` | `0xFFFFFFFF` | Environment effect flag used with SetEnvironment(). Value: 0xFFFFFFFF | `export.lgc` |

## Game status and statistics identifiers

| Name | Value | Description | Source |
|---|---:|---|---|
| `STAT_ACTIVE_FORT_GUN` | `13` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 13 | `export.lgc` |
| `STAT_AGRESSIVE_TRAIN` | `7` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 7 | `export.lgc` |
| `STAT_ALL_GUN_POWER` | `20` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 20 | `export.lgc` |
| `STAT_ANTI_AVIA` | `5` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 5 | `export.lgc` |
| `STAT_ANTIAVIA_GUN_POWER` | `18` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 18 | `export.lgc` |
| `STAT_AVIA` | `3` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 3 | `export.lgc` |
| `STAT_AVIA_GUN_POWER` | `17` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 17 | `export.lgc` |
| `STAT_BATTLE_TRAIN` | `6` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 6 | `export.lgc` |
| `STAT_DAMAGED_FORT_GUN` | `14` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 14 | `export.lgc` |
| `STAT_DAMAGED_UNITS` | `21` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 21 | `export.lgc` |
| `STAT_ENGINE_GUN_POWER` | `16` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 16 | `export.lgc` |
| `STAT_FREE_DEPO` | `12` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 12 | `export.lgc` |
| `STAT_GROUND_GUN_POWER` | `19` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 19 | `export.lgc` |
| `STAT_LIFE` | `15` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 15 | `export.lgc` |
| `STAT_MOBILE_TRAIN` | `2` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 2 | `export.lgc` |
| `STAT_PASSIVE_TRAIN` | `10` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 10 | `export.lgc` |
| `STAT_PATROL_TRAIN` | `9` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 9 | `export.lgc` |
| `STAT_SUPER_WEAPON` | `4` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 4 | `export.lgc` |
| `STAT_TRAIN` | `1` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 1 | `export.lgc` |
| `STAT_VERYDANGER_TRAIN` | `8` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 8 | `export.lgc` |
| `STAT_WORKING_DEPO` | `11` | Statistic selector used with GetStatistics() and CalcStatistics(). Value: 11 | `export.lgc` |

## Input-state flags

| Name | Value | Description | Source |
|---|---:|---|---|
| `INPUT_CTRL` | `32` | Input-state bit flag. Value: 32 | `export.lgc` |
| `INPUT_DOWN` | `512` | Input-state bit flag. Value: 512 | `export.lgc` |
| `INPUT_FIRST` | `1024` | Input-state bit flag. Value: 1024 | `export.lgc` |
| `INPUT_LCLICK` | `1` | Input-state bit flag. Value: 1 | `export.lgc` |
| `INPUT_LDOWN` | `4` | Input-state bit flag. Value: 4 | `export.lgc` |
| `INPUT_LEFT` | `64` | Input-state bit flag. Value: 64 | `export.lgc` |
| `INPUT_RCLICK` | `2` | Input-state bit flag. Value: 2 | `export.lgc` |
| `INPUT_RDOWN` | `8` | Input-state bit flag. Value: 8 | `export.lgc` |
| `INPUT_RIGHT` | `128` | Input-state bit flag. Value: 128 | `export.lgc` |
| `INPUT_SECOND` | `2048` | Input-state bit flag. Value: 2048 | `export.lgc` |
| `INPUT_SHIFT` | `16` | Input-state bit flag. Value: 16 | `export.lgc` |
| `INPUT_UP` | `256` | Input-state bit flag. Value: 256 | `export.lgc` |

## Legacy aliases and script helpers

| Name | Value | Description | Source |
|---|---:|---|---|
| `GetVid` | `GetVidData` | Game-script constant exported by the Locoland engine. Value: GetVidData | `obsolete.lgc` |
| `SetVid` | `SetVidData` | Game-script constant exported by the Locoland engine. Value: SetVidData | `obsolete.lgc` |
| `sprintf` | `Printf` | Game-script constant exported by the Locoland engine. Value: Printf | `obsolete.lgc` |

## Map scrolling modes

| Name | Value | Description | Source |
|---|---:|---|---|
| `SCROLL_FLAGMAN_IN_CENTER` | `16` | Map viewport scrolling mode flag. Value: 16 | `export.lgc` |
| `SCROLL_FROM_BORDER` | `1` | Map viewport scrolling mode flag. Value: 1 | `export.lgc` |
| `SCROLL_NONE` | `0` | Map viewport scrolling mode flag. Value: 0 | `export.lgc` |
| `SCROLL_TO_FLAGMAN` | `4` | Map viewport scrolling mode flag. Value: 4 | `export.lgc` |
| `SCROLL_TO_FLAGMAN_WITH_DIRECTION` | `8` | Map viewport scrolling mode flag. Value: 8 | `export.lgc` |
| `SCROLL_WITH_ARROWS` | `32` | Map viewport scrolling mode flag. Value: 32 | `export.lgc` |
| `SCROLL_WITH_MOUSE` | `2` | Map viewport scrolling mode flag. Value: 2 | `export.lgc` |

## Networking commands

| Name | Value | Description | Source |
|---|---:|---|---|
| `NET_CLEARKILL` | `9` | Network information selector used with GetNetInfo(). Value: 9 | `export.lgc` |
| `NET_KILLPLAYER` | `10` | Network information selector used with GetNetInfo(). Value: 10 | `export.lgc` |
| `NET_NAMEPLAYER` | `2` | Network information selector used with GetNetInfo(). Value: 2 | `export.lgc` |
| `NET_NOPLAYER` | `6` | Network information selector used with GetNetInfo(). Value: 6 | `export.lgc` |
| `NET_NUMPLAYER` | `1` | Network information selector used with GetNetInfo(). Value: 1 | `export.lgc` |

## Object property identifiers

| Name | Value | Description | Source |
|---|---:|---|---|
| `PROP_ACCELERATE` | `6` | Train property selector used with TrainProperty(). Value: 6 | `export.lgc` |
| `PROP_AMMO` | `5` | Train property selector used with TrainProperty(). Value: 5 | `export.lgc` |
| `PROP_AMMO_MAX` | `11` | Train property selector used with TrainProperty(). Value: 11 | `export.lgc` |
| `PROP_AMMO_NO` | `10` | Train property selector used with TrainProperty(). Value: 10 | `export.lgc` |
| `PROP_BUILD_TIME` | `7` | Train property selector used with TrainProperty(). Value: 7 | `export.lgc` |
| `PROP_FREE` | `9` | Train property selector used with TrainProperty(). Value: 9 | `export.lgc` |
| `PROP_HP` | `4` | Train property selector used with TrainProperty(). Value: 4 | `export.lgc` |
| `PROP_LIFE` | `3` | Train property selector used with TrainProperty(). Value: 3 | `export.lgc` |
| `PROP_SPEED` | `1` | Train property selector used with TrainProperty(). Value: 1 | `export.lgc` |
| `PROP_WEAPON` | `2` | Train property selector used with TrainProperty(). Value: 2 | `export.lgc` |

## Sprite class identifiers

| Name | Value | Description | Source |
|---|---:|---|---|
| `B_AVIA` | `4` | Sprite class identifier. Value: 4 | `export.lgc` |
| `B_BALLOON` | `26` | Sprite class identifier. Value: 26 | `export.lgc` |
| `B_BUILDING` | `3` | Sprite class identifier. Value: 3 | `export.lgc` |
| `B_CANNON` | `5` | Sprite class identifier. Value: 5 | `export.lgc` |
| `B_CIV_ROBOT` | `20` | Sprite class identifier. Value: 20 | `export.lgc` |
| `B_CREATURE` | `25` | Sprite class identifier. Value: 25 | `export.lgc` |
| `B_DEPO` | `24` | Sprite class identifier. Value: 24 | `export.lgc` |
| `B_ENGINE` | `21` | Sprite class identifier. Value: 21 | `export.lgc` |
| `b_engine` | `21` | Game-script constant exported by the Locoland engine. Value: 21 | `obsolete.lgc` |
| `B_FRAME` | `10` | Sprite class identifier. Value: 10 | `export.lgc` |
| `B_LINKER` | `12` | Sprite class identifier. Value: 12 | `export.lgc` |
| `B_MISSILE` | `27` | Sprite class identifier. Value: 27 | `export.lgc` |
| `B_OBJECT` | `1` | Sprite class identifier. Value: 1 | `export.lgc` |
| `B_PRIMITIVE` | `6` | Sprite class identifier. Value: 6 | `export.lgc` |
| `B_RAIL` | `22` | Sprite class identifier. Value: 22 | `export.lgc` |
| `B_REGION` | `23` | Sprite class identifier. Value: 23 | `export.lgc` |
| `B_SPRITE` | `9` | Sprite class identifier. Value: 9 | `export.lgc` |
| `B_TERRAIN` | `0` | Sprite class identifier. Value: 0 | `export.lgc` |
| `B_TEXT` | `19` | Sprite class identifier. Value: 19 | `export.lgc` |
| `B_UNIT` | `2` | Sprite class identifier. Value: 2 | `export.lgc` |

## Sprite lookup filters

| Name | Value | Description | Source |
|---|---:|---|---|
| `GETSPRITE_ARMY0` | `0x10000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x10000 | `export.lgc` |
| `GETSPRITE_ARMY1` | `0x20000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x20000 | `export.lgc` |
| `GETSPRITE_ARMY2` | `0x40000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x40000 | `export.lgc` |
| `GETSPRITE_ARMY3` | `0x80000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x80000 | `export.lgc` |
| `GETSPRITE_AVIA` | `0x800000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x800000 | `export.lgc` |
| `GETSPRITE_CANNON` | `0x20000000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x20000000 | `export.lgc` |
| `GETSPRITE_CLASS` | `0x1000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x1000 | `export.lgc` |
| `GETSPRITE_FREE` | `0x80000000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x80000000 | `export.lgc` |
| `GETSPRITE_HASH` | `0x8000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x8000 | `export.lgc` |
| `GETSPRITE_MENU` | `0x1000000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x1000000 | `export.lgc` |
| `GETSPRITE_OBJECT` | `0x200000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x200000 | `export.lgc` |
| `GETSPRITE_RAILWAY` | `0x2000000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x2000000 | `export.lgc` |
| `GETSPRITE_REGION` | `0x4000000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x4000000 | `export.lgc` |
| `GETSPRITE_SPRITE` | `0x40000000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x40000000 | `export.lgc` |
| `GETSPRITE_TERRAIN` | `0x100000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x100000 | `export.lgc` |
| `GETSPRITE_UNIT` | `0x400000` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x400000 | `export.lgc` |
| `GETSPRITE_VID` | `0x800` | Sprite lookup filter flag used with GetSprite() and FindNearestSprite(). Value: 0x800 | `export.lgc` |

## Sprite type flags

| Name | Value | Description | Source |
|---|---:|---|---|
| `U_AVIA` | `8` | Sprite type bit flag. Value: 8 | `export.lgc` |
| `u_avia` | `8` | Game-script constant exported by the Locoland engine. Value: 8 | `obsolete.lgc` |
| `U_CANNON` | `512` | Sprite type bit flag. Value: 512 | `export.lgc` |
| `U_MENU` | `16` | Sprite type bit flag. Value: 16 | `export.lgc` |
| `u_monster` | `4` | Game-script constant exported by the Locoland engine. Value: 4 | `obsolete.lgc` |
| `U_OBJECT` | `2` | Sprite type bit flag. Value: 2 | `export.lgc` |
| `U_RAILWAY` | `32` | Sprite type bit flag. Value: 32 | `export.lgc` |
| `U_REGION` | `64` | Sprite type bit flag. Value: 64 | `export.lgc` |
| `U_SPRITE` | `1024` | Sprite type bit flag. Value: 1024 | `export.lgc` |
| `U_TACTIC` | `128` | Sprite type bit flag. Value: 128 | `export.lgc` |
| `U_TERRAIN` | `1` | Sprite type bit flag. Value: 1 | `export.lgc` |
| `U_UNIT` | `4` | Sprite type bit flag. Value: 4 | `export.lgc` |

## VID property identifiers

| Name | Value | Description | Source |
|---|---:|---|---|
| `VID_AMMO` | `26` | Game object property identifier used with GetVidData() and SetVidData(). Value: 26 | `export.lgc` |
| `VID_BATTLERANGE` | `23` | Game object property identifier used with GetVidData() and SetVidData(). Value: 23 | `export.lgc` |
| `VID_BEHAVE` | `47` | Game object property identifier used with GetVidData() and SetVidData(). Value: 47 | `obsolete.lgc` |
| `VID_BUILDTIME` | `55` | Game object property identifier used with GetVidData() and SetVidData(). Value: 55 | `export.lgc` |
| `VID_CHILD` | `60` | Game object property identifier used with GetVidData() and SetVidData(). Value: 60 | `export.lgc` |
| `VID_CLASS` | `47` | Game object property identifier used with GetVidData() and SetVidData(). Value: 47 | `export.lgc` |
| `VID_COUNT` | `28` | Game object property identifier used with GetVidData() and SetVidData(). Value: 28 | `export.lgc` |
| `VID_COUNT0` | `34` | Game object property identifier used with GetVidData() and SetVidData(). Value: 34 | `export.lgc` |
| `VID_COUNT1` | `35` | Game object property identifier used with GetVidData() and SetVidData(). Value: 35 | `export.lgc` |
| `VID_COUNT2` | `36` | Game object property identifier used with GetVidData() and SetVidData(). Value: 36 | `export.lgc` |
| `VID_COUNT3` | `37` | Game object property identifier used with GetVidData() and SetVidData(). Value: 37 | `export.lgc` |
| `VID_DAMAGE` | `124` | Game object property identifier used with GetVidData() and SetVidData(). Value: 124 | `export.lgc` |
| `VID_DETECTRANGE` | `50` | Game object property identifier used with GetVidData() and SetVidData(). Value: 50 | `export.lgc` |
| `VID_EXCHANGEVID` | `52` | Game object property identifier used with GetVidData() and SetVidData(). Value: 52 | `export.lgc` |
| `VID_FRAME_SPEED` | `58` | Game object property identifier used with GetVidData() and SetVidData(). Value: 58 | `export.lgc` |
| `VID_GAMMA` | `18` | Game object property identifier used with GetVidData() and SetVidData(). Value: 18 | `export.lgc` |
| `VID_HIDE` | `56` | Game object property identifier used with GetVidData() and SetVidData(). Value: 56 | `export.lgc` |
| `VID_HP_COEFF0` | `42` | Game object property identifier used with GetVidData() and SetVidData(). Value: 42 | `export.lgc` |
| `VID_HP_COEFF1` | `43` | Game object property identifier used with GetVidData() and SetVidData(). Value: 43 | `export.lgc` |
| `VID_HP_COEFF2` | `44` | Game object property identifier used with GetVidData() and SetVidData(). Value: 44 | `export.lgc` |
| `VID_HP_COEFF3` | `45` | Game object property identifier used with GetVidData() and SetVidData(). Value: 45 | `export.lgc` |
| `VID_KILLEDUNIT` | `29` | Game object property identifier used with GetVidData() and SetVidData(). Value: 29 | `export.lgc` |
| `VID_KILLEDUNIT0` | `30` | Game object property identifier used with GetVidData() and SetVidData(). Value: 30 | `export.lgc` |
| `VID_KILLEDUNIT1` | `31` | Game object property identifier used with GetVidData() and SetVidData(). Value: 31 | `export.lgc` |
| `VID_KILLEDUNIT2` | `32` | Game object property identifier used with GetVidData() and SetVidData(). Value: 32 | `export.lgc` |
| `VID_KILLEDUNIT3` | `33` | Game object property identifier used with GetVidData() and SetVidData(). Value: 33 | `export.lgc` |
| `VID_LIFETIME` | `49` | Game object property identifier used with GetVidData() and SetVidData(). Value: 49 | `export.lgc` |
| `VID_LINK` | `59` | Game object property identifier used with GetVidData() and SetVidData(). Value: 59 | `export.lgc` |
| `VID_MAXHP` | `1` | Game object property identifier used with GetVidData() and SetVidData(). Value: 1 | `export.lgc` |
| `VID_MAXHP0` | `38` | Game object property identifier used with GetVidData() and SetVidData(). Value: 38 | `export.lgc` |
| `VID_MAXHP1` | `39` | Game object property identifier used with GetVidData() and SetVidData(). Value: 39 | `export.lgc` |
| `VID_MAXHP2` | `40` | Game object property identifier used with GetVidData() and SetVidData(). Value: 40 | `export.lgc` |
| `VID_MAXHP3` | `41` | Game object property identifier used with GetVidData() and SetVidData(). Value: 41 | `export.lgc` |
| `VID_MAXUNIT` | `25` | Game object property identifier used with GetVidData() and SetVidData(). Value: 25 | `export.lgc` |
| `VID_MOVE_MASK` | `54` | Game object property identifier used with GetVidData() and SetVidData(). Value: 54 | `export.lgc` |
| `VID_NAME` | `27` | Game object property identifier used with GetVidData() and SetVidData(). Value: 27 | `export.lgc` |
| `VID_NO_CHILD` | `92` | Game object property identifier used with GetVidData() and SetVidData(). Value: 92 | `export.lgc` |
| `VID_NO_DIR` | `53` | Game object property identifier used with GetVidData() and SetVidData(). Value: 53 | `export.lgc` |
| `VID_NOT_CREATE_AS_CHILD` | `57` | Game object property identifier used with GetVidData() and SetVidData(). Value: 57 | `export.lgc` |
| `VID_PROPERTY` | `22` | Game object property identifier used with GetVidData() and SetVidData(). Value: 22 | `export.lgc` |
| `VID_RECOLORUNIT` | `125` | Game object property identifier used with GetVidData() and SetVidData(). Value: 125 | `export.lgc` |
| `VID_RECOLORUNIT0` | `126` | Game object property identifier used with GetVidData() and SetVidData(). Value: 126 | `export.lgc` |
| `VID_RECOLORUNIT1` | `127` | Game object property identifier used with GetVidData() and SetVidData(). Value: 127 | `export.lgc` |
| `VID_RECOLORUNIT2` | `128` | Game object property identifier used with GetVidData() and SetVidData(). Value: 128 | `export.lgc` |
| `VID_RECOLORUNIT3` | `129` | Game object property identifier used with GetVidData() and SetVidData(). Value: 129 | `export.lgc` |
| `VID_SPEED` | `48` | Game object property identifier used with GetVidData() and SetVidData(). Value: 48 | `export.lgc` |
| `VID_SPRITETYPE` | `46` | Game object property identifier used with GetVidData() and SetVidData(). Value: 46 | `export.lgc` |
| `VID_TYPEUNIT` | `46` | Game object property identifier used with GetVidData() and SetVidData(). Value: 46 | `obsolete.lgc` |
| `VID_WEAPONAIM` | `51` | Game object property identifier used with GetVidData() and SetVidData(). Value: 51 | `export.lgc` |

## Virtual-key codes

| Name | Value | Description | Source |
|---|---:|---|---|
| `VK_ADD` | `0x6B00` | Virtual key or mouse-button code. Value: 0x6B00 | `export.lgc` |
| `VK_BACK` | `0x08` | Virtual key or mouse-button code. Value: 0x08 | `export.lgc` |
| `VK_CANCEL` | `0x03` | Virtual key or mouse-button code. Value: 0x03 | `export.lgc` |
| `VK_CLEAR` | `0x0C` | Virtual key or mouse-button code. Value: 0x0C | `export.lgc` |
| `VK_DECIMAL` | `0x6E00` | Virtual key or mouse-button code. Value: 0x6E00 | `export.lgc` |
| `VK_DELETE` | `0x2E00` | Virtual key or mouse-button code. Value: 0x2E00 | `export.lgc` |
| `VK_DIVIDE` | `0x6F00` | Virtual key or mouse-button code. Value: 0x6F00 | `export.lgc` |
| `VK_DOWN` | `0x2800` | Virtual key or mouse-button code. Value: 0x2800 | `export.lgc` |
| `VK_END` | `0x2300` | Virtual key or mouse-button code. Value: 0x2300 | `export.lgc` |
| `VK_ESCAPE` | `0x1B` | Virtual key or mouse-button code. Value: 0x1B | `export.lgc` |
| `VK_EXECUTE` | `0x2B00` | Virtual key or mouse-button code. Value: 0x2B00 | `export.lgc` |
| `VK_F1` | `0x7000` | Virtual key or mouse-button code. Value: 0x7000 | `export.lgc` |
| `VK_F10` | `0x7900` | Virtual key or mouse-button code. Value: 0x7900 | `export.lgc` |
| `VK_F11` | `0x7A00` | Virtual key or mouse-button code. Value: 0x7A00 | `export.lgc` |
| `VK_F12` | `0x7B00` | Virtual key or mouse-button code. Value: 0x7B00 | `export.lgc` |
| `VK_F13` | `0x7C00` | Virtual key or mouse-button code. Value: 0x7C00 | `export.lgc` |
| `VK_F14` | `0x7D00` | Virtual key or mouse-button code. Value: 0x7D00 | `export.lgc` |
| `VK_F15` | `0x7E00` | Virtual key or mouse-button code. Value: 0x7E00 | `export.lgc` |
| `VK_F16` | `0x7F00` | Virtual key or mouse-button code. Value: 0x7F00 | `export.lgc` |
| `VK_F17` | `0x8000` | Virtual key or mouse-button code. Value: 0x8000 | `export.lgc` |
| `VK_F18` | `0x8100` | Virtual key or mouse-button code. Value: 0x8100 | `export.lgc` |
| `VK_F19` | `0x8200` | Virtual key or mouse-button code. Value: 0x8200 | `export.lgc` |
| `VK_F2` | `0x7100` | Virtual key or mouse-button code. Value: 0x7100 | `export.lgc` |
| `VK_F20` | `0x8300` | Virtual key or mouse-button code. Value: 0x8300 | `export.lgc` |
| `VK_F21` | `0x8400` | Virtual key or mouse-button code. Value: 0x8400 | `export.lgc` |
| `VK_F22` | `0x8500` | Virtual key or mouse-button code. Value: 0x8500 | `export.lgc` |
| `VK_F23` | `0x8600` | Virtual key or mouse-button code. Value: 0x8600 | `export.lgc` |
| `VK_F24` | `0x8700` | Virtual key or mouse-button code. Value: 0x8700 | `export.lgc` |
| `VK_F3` | `0x7200` | Virtual key or mouse-button code. Value: 0x7200 | `export.lgc` |
| `VK_F4` | `0x7300` | Virtual key or mouse-button code. Value: 0x7300 | `export.lgc` |
| `VK_F5` | `0x7400` | Virtual key or mouse-button code. Value: 0x7400 | `export.lgc` |
| `VK_F6` | `0x7500` | Virtual key or mouse-button code. Value: 0x7500 | `export.lgc` |
| `VK_F7` | `0x7600` | Virtual key or mouse-button code. Value: 0x7600 | `export.lgc` |
| `VK_F8` | `0x7700` | Virtual key or mouse-button code. Value: 0x7700 | `export.lgc` |
| `VK_F9` | `0x7800` | Virtual key or mouse-button code. Value: 0x7800 | `export.lgc` |
| `VK_HELP` | `0x2F00` | Virtual key or mouse-button code. Value: 0x2F00 | `export.lgc` |
| `VK_HOME` | `0x2400` | Virtual key or mouse-button code. Value: 0x2400 | `export.lgc` |
| `VK_INSERT` | `0x2D00` | Virtual key or mouse-button code. Value: 0x2D00 | `export.lgc` |
| `VK_LBUTTON` | `0x01` | Virtual key or mouse-button code. Value: 0x01 | `export.lgc` |
| `VK_LEFT` | `0x2500` | Virtual key or mouse-button code. Value: 0x2500 | `export.lgc` |
| `VK_MBUTTON` | `0x04` | Virtual key or mouse-button code. Value: 0x04 | `export.lgc` |
| `VK_MULTIPLY` | `0x6A00` | Virtual key or mouse-button code. Value: 0x6A00 | `export.lgc` |
| `VK_NEXT` | `0x2200` | Virtual key or mouse-button code. Value: 0x2200 | `export.lgc` |
| `VK_NUMLOCK` | `0x90` | Virtual key or mouse-button code. Value: 0x90 | `export.lgc` |
| `VK_NUMPAD0` | `0x6000` | Virtual key or mouse-button code. Value: 0x6000 | `export.lgc` |
| `VK_NUMPAD1` | `0x6100` | Virtual key or mouse-button code. Value: 0x6100 | `export.lgc` |
| `VK_NUMPAD2` | `0x6200` | Virtual key or mouse-button code. Value: 0x6200 | `export.lgc` |
| `VK_NUMPAD3` | `0x6300` | Virtual key or mouse-button code. Value: 0x6300 | `export.lgc` |
| `VK_NUMPAD4` | `0x6400` | Virtual key or mouse-button code. Value: 0x6400 | `export.lgc` |
| `VK_NUMPAD5` | `0x6500` | Virtual key or mouse-button code. Value: 0x6500 | `export.lgc` |
| `VK_NUMPAD6` | `0x6600` | Virtual key or mouse-button code. Value: 0x6600 | `export.lgc` |
| `VK_NUMPAD7` | `0x6700` | Virtual key or mouse-button code. Value: 0x6700 | `export.lgc` |
| `VK_NUMPAD8` | `0x6800` | Virtual key or mouse-button code. Value: 0x6800 | `export.lgc` |
| `VK_NUMPAD9` | `0x6900` | Virtual key or mouse-button code. Value: 0x6900 | `export.lgc` |
| `VK_PRINT` | `0x2A00` | Virtual key or mouse-button code. Value: 0x2A00 | `export.lgc` |
| `VK_PRIOR` | `0x2100` | Virtual key or mouse-button code. Value: 0x2100 | `export.lgc` |
| `VK_RBUTTON` | `0x02` | Virtual key or mouse-button code. Value: 0x02 | `export.lgc` |
| `VK_RETURN` | `0x0D` | Virtual key or mouse-button code. Value: 0x0D | `export.lgc` |
| `VK_RIGHT` | `0x2700` | Virtual key or mouse-button code. Value: 0x2700 | `export.lgc` |
| `VK_SCROLL` | `0x91` | Virtual key or mouse-button code. Value: 0x91 | `export.lgc` |
| `VK_SELECT` | `0x2900` | Virtual key or mouse-button code. Value: 0x2900 | `export.lgc` |
| `VK_SEPARATOR` | `0x6C00` | Virtual key or mouse-button code. Value: 0x6C00 | `export.lgc` |
| `VK_SNAPSHOT` | `0x2C00` | Virtual key or mouse-button code. Value: 0x2C00 | `export.lgc` |
| `VK_SPACE` | `0x20` | Virtual key or mouse-button code. Value: 0x20 | `export.lgc` |
| `VK_SUBTRACT` | `0x6D00` | Virtual key or mouse-button code. Value: 0x6D00 | `export.lgc` |
| `VK_TAB` | `0x09` | Virtual key or mouse-button code. Value: 0x09 | `export.lgc` |
| `VK_UP` | `0x2600` | Virtual key or mouse-button code. Value: 0x2600 | `export.lgc` |

## Visual effects and transitions

| Name | Value | Description | Source |
|---|---:|---|---|
| `EFF_ALPHAAPPEAR` | `5` | Visual effect identifier used with Effect(). Value: 5 | `export.lgc` |
| `eff_alphaappear` | `5` | Game-script constant exported by the Locoland engine. Value: 5 | `obsolete.lgc` |
| `EFF_FADE` | `3` | Visual effect identifier used with Effect(). Value: 3 | `export.lgc` |
| `eff_fade` | `3` | Game-script constant exported by the Locoland engine. Value: 3 | `obsolete.lgc` |
| `EFF_FADE_IN` | `9` | Visual effect identifier used with Effect(). Value: 9 | `export.lgc` |
| `EFF_FADE_OUT` | `10` | Visual effect identifier used with Effect(). Value: 10 | `export.lgc` |
| `EFF_LINESHIFT` | `7` | Visual effect identifier used with Effect(). Value: 7 | `export.lgc` |
| `eff_lineshift` | `7` | Game-script constant exported by the Locoland engine. Value: 7 | `obsolete.lgc` |
| `EFF_NONE` | `0` | Visual effect identifier used with Effect(). Value: 0 | `export.lgc` |
| `eff_none` | `0` | Game-script constant exported by the Locoland engine. Value: 0 | `obsolete.lgc` |
| `EFF_NUKE` | `1` | Visual effect identifier used with Effect(). Value: 1 | `export.lgc` |
| `eff_nuke` | `1` | Game-script constant exported by the Locoland engine. Value: 1 | `obsolete.lgc` |
| `EFF_OPEN_WINDOW` | `4` | Visual effect identifier used with Effect(). Value: 4 | `export.lgc` |
| `eff_openwindow` | `4` | Game-script constant exported by the Locoland engine. Value: 4 | `obsolete.lgc` |
| `EFF_PIXELAPPEAR` | `6` | Visual effect identifier used with Effect(). Value: 6 | `export.lgc` |
| `eff_pixelappear` | `6` | Game-script constant exported by the Locoland engine. Value: 6 | `obsolete.lgc` |
| `EFF_SCALE_WINDOW` | `8` | Visual effect identifier used with Effect(). Value: 8 | `export.lgc` |
| `EFF_SCROLL` | `2` | Visual effect identifier used with Effect(). Value: 2 | `export.lgc` |
| `eff_scroll` | `2` | Game-script constant exported by the Locoland engine. Value: 2 | `obsolete.lgc` |
