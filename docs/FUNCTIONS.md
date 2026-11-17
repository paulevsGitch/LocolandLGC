# Functions Reference

## Contents

- [AI and railway](#ai-and-railway) (18)
  - [`AddUnitLimit`](#addunitlimit)
  - [`BreakTrain`](#breaktrain)
  - [`CalcStatistics`](#calcstatistics)
  - [`CanAttackEngine`](#canattackengine)
  - [`CanMoveEngineTo`](#canmoveengineto)
  - [`FirstTrain`](#firsttrain)
  - [`GetMoney`](#getmoney)
  - [`GetStatistics`](#getstatistics)
  - [`NextTrain`](#nexttrain)
  - [`PatrolEngine`](#patrolengine)
  - [`PatrolEngineToPoints`](#patrolenginetopoints)
  - [`SetAutoReBirth`](#setautorebirth)
  - [`SetCleverEnemyAttack`](#setcleverenemyattack)
  - [`SetEnemyCanAttackNeutralTrains`](#setenemycanattackneutraltrains)
  - [`SetMoney`](#setmoney)
  - [`SetPushLine`](#setpushline)
  - [`SetSemaphore`](#setsemaphore)
  - [`TrainProperty`](#trainproperty)
- [Audio, video and effects](#audio-video-and-effects) (19)
  - [`CountGamma`](#countgamma)
  - [`Effect`](#effect)
  - [`GetEffectState`](#geteffectstate)
  - [`GetGamma`](#getgamma)
  - [`IsPlayMovie`](#isplaymovie)
  - [`IsPlayMusic`](#isplaymusic)
  - [`PlayMovie`](#playmovie)
  - [`PlayMusicFile`](#playmusicfile)
  - [`PlaySFX`](#playsfx)
  - [`PlaySFXFromCoor`](#playsfxfromcoor)
  - [`SetEnvironment`](#setenvironment)
  - [`SetGamma`](#setgamma)
  - [`SetGraphDetail`](#setgraphdetail)
  - [`SetMusicVolume`](#setmusicvolume)
  - [`SetSoundVolume`](#setsoundvolume)
  - [`SetWind`](#setwind)
  - [`StopMovie`](#stopmovie)
  - [`StopMusic`](#stopmusic)
  - [`StopSFX`](#stopsfx)
- [Compatibility and text helpers](#compatibility-and-text-helpers) (17)
  - [`Create`](#create)
  - [`CreateEx`](#createex)
  - [`CreateText`](#createtext)
  - [`CreateTextFromFile`](#createtextfromfile)
  - [`GetDir`](#getdir)
  - [`MenuDir`](#menudir)
  - [`MenuSelectVid`](#menuselectvid)
  - [`MenuVid`](#menuvid)
  - [`Message`](#message)
  - [`PlayWAV`](#playwav)
  - [`PrintFile`](#printfile)
  - [`PrintText`](#printtext)
  - [`ScrollLock`](#scrolllock)
  - [`SetAutoScroll`](#setautoscroll)
  - [`SetHpCoeff`](#sethpcoeff)
  - [`SetMusic`](#setmusic)
  - [`SetSound`](#setsound)
- [Engine API](#engine-api) (31)
  - [`AskPlace`](#askplace)
  - [`ChangeZUnit`](#changezunit)
  - [`charat`](#charat)
  - [`Cos`](#cos)
  - [`CreateSprite`](#createsprite)
  - [`Destroy`](#destroy)
  - [`Exit`](#exit)
  - [`Flagman`](#flagman)
  - [`Genocide`](#genocide)
  - [`GetGroundZ`](#getgroundz)
  - [`GetScreenInputX`](#getscreeninputx)
  - [`GetScreenInputY`](#getscreeninputy)
  - [`GetString`](#getstring)
  - [`GetTime`](#gettime)
  - [`GetVidData`](#getviddata)
  - [`itoa`](#itoa)
  - [`Load`](#load)
  - [`MapSizeX`](#mapsizex)
  - [`MapSizeY`](#mapsizey)
  - [`MessageText`](#messagetext)
  - [`Pause`](#pause)
  - [`Printf`](#printf)
  - [`Random`](#random)
  - [`ReloadVid`](#reloadvid)
  - [`ReplaceUnit`](#replaceunit)
  - [`Save`](#save)
  - [`SaveDemo`](#savedemo)
  - [`SetFlagman`](#setflagman)
  - [`SetVidData`](#setviddata)
  - [`Sin`](#sin)
  - [`strlen`](#strlen)
- [Files, registry and logging](#files-registry-and-logging) (12)
  - [`DelReg`](#delreg)
  - [`Exec`](#exec)
  - [`FClose`](#fclose)
  - [`FCreate`](#fcreate)
  - [`FEof`](#feof)
  - [`FOpen`](#fopen)
  - [`FRead`](#fread)
  - [`FWrite`](#fwrite)
  - [`GetDefaultRegPath`](#getdefaultregpath)
  - [`GetReg`](#getreg)
  - [`Log`](#log)
  - [`SetReg`](#setreg)
- [Legacy aliases and helper macros](#legacy-aliases-and-helper-macros) (5)
  - [`GETSPRITE_ARMY`](#getspritearmy)
  - [`GETSPRITE_TYPE`](#getspritetype)
  - [`GetVid`](#getvid)
  - [`SetVid`](#setvid)
  - [`sprintf`](#sprintf)
- [Networking](#networking) (6)
  - [`GetNetInfo`](#getnetinfo)
  - [`GetNetInputState`](#getnetinputstate)
  - [`GetNetKey`](#getnetkey)
  - [`Receive`](#receive)
  - [`Send`](#send)
  - [`SetNet`](#setnet)
- [Script library helper](#script-library-helper) (69)
  - [`AddReinforcement`](#addreinforcement)
  - [`ArmyWeightCenter`](#armyweightcenter)
  - [`BuildTrain`](#buildtrain)
  - [`ChangeFonarState`](#changefonarstate)
  - [`CivilPatrol`](#civilpatrol)
  - [`Clouds`](#clouds)
  - [`CountArmyUnit`](#countarmyunit)
  - [`CreateFly`](#createfly)
  - [`DeactiveTrain`](#deactivetrain)
  - [`EndQuake`](#endquake)
  - [`EnvironmentTact`](#environmenttact)
  - [`FortCaptured`](#fortcaptured)
  - [`FReadText`](#freadtext)
  - [`GammaIntensive_print`](#gammaintensiveprint)
  - [`GetDifficulty`](#getdifficulty)
  - [`GetGammaIntensive`](#getgammaintensive)
  - [`GetHoursByMSec`](#gethoursbymsec)
  - [`GetLongestTrain`](#getlongesttrain)
  - [`GetMinutesByMSec`](#getminutesbymsec)
  - [`GetRegDefaultPlayer`](#getregdefaultplayer)
  - [`GetRegStateBar`](#getregstatebar)
  - [`GetSecondsByMSec`](#getsecondsbymsec)
  - [`IsTrainAtWeaponRadius`](#istrainatweaponradius)
  - [`IsTrainAtWeaponRadiusEx`](#istrainatweaponradiusex)
  - [`LDepoCapture`](#ldepocapture)
  - [`LMasterCapture`](#lmastercapture)
  - [`Meteorites`](#meteorites)
  - [`MoveTrain`](#movetrain)
  - [`MoveZ`](#movez)
  - [`Muxi`](#muxi)
  - [`MyPatrolTrain`](#mypatroltrain)
  - [`NearTrain`](#neartrain)
  - [`NoArmyUnits`](#noarmyunits)
  - [`OneTimeIn5Second`](#onetimein5second)
  - [`OneTimeInHalfSecond`](#onetimeinhalfsecond)
  - [`OneTimeInNSecond1`](#onetimeinnsecond1)
  - [`OneTimeInNSecond2`](#onetimeinnsecond2)
  - [`OneTimeInNSecond3`](#onetimeinnsecond3)
  - [`OneTimeInQuarterSecond`](#onetimeinquartersecond)
  - [`OneTimeInSecond`](#onetimeinsecond)
  - [`PatrolEngineZ`](#patrolenginez)
  - [`PatrolTrain`](#patroltrain)
  - [`PrintObjectives`](#printobjectives)
  - [`PrintTextAtCenter`](#printtextatcenter)
  - [`PrintTextAtCenter5x5`](#printtextatcenter5x5)
  - [`Quake`](#quake)
  - [`Rain`](#rain)
  - [`RandomTrain`](#randomtrain)
  - [`ReinforcementInit`](#reinforcementinit)
  - [`ResendCivilPatrolEngine`](#resendcivilpatrolengine)
  - [`SendCivilPatrolEngine`](#sendcivilpatrolengine)
  - [`SetArmyGamma`](#setarmygamma)
  - [`SetArmyVid`](#setarmyvid)
  - [`SetDayNightGamma`](#setdaynightgamma)
  - [`SetPositionCenter`](#setpositioncenter)
  - [`SetRegStateBar`](#setregstatebar)
  - [`SetWindEx`](#setwindex)
  - [`SizeBetween`](#sizebetween)
  - [`SizeToZ`](#sizetoz)
  - [`StartRain`](#startrain)
  - [`StopRain`](#stoprain)
  - [`Time1In100`](#time1in100)
  - [`Time1In50`](#time1in50)
  - [`Tornado`](#tornado)
  - [`TrainHasUnitVid`](#trainhasunitvid)
  - [`TrainHasWoundedRepair`](#trainhaswoundedrepair)
  - [`TrainHasWoundedUnit`](#trainhaswoundedunit)
  - [`UnitCountInTrain`](#unitcountintrain)
  - [`UnitInTrain`](#unitintrain)
- [Sprite iteration and lookup](#sprite-iteration-and-lookup) (9)
  - [`FindNearestSprite`](#findnearestsprite)
  - [`FirstInBox`](#firstinbox)
  - [`FirstSprite`](#firstsprite)
  - [`FirstUnit`](#firstunit)
  - [`GetSprite`](#getsprite)
  - [`GetSpriteScr`](#getspritescr)
  - [`NextInBox`](#nextinbox)
  - [`NextSprite`](#nextsprite)
  - [`NextUnit`](#nextunit)
- [UI and input](#ui-and-input) (24)
  - [`GetInputState`](#getinputstate)
  - [`GetInputX`](#getinputx)
  - [`GetInputY`](#getinputy)
  - [`GetKey`](#getkey)
  - [`GetScrollType`](#getscrolltype)
  - [`MenuAction`](#menuaction)
  - [`MenuCreate`](#menucreate)
  - [`MenuFind`](#menufind)
  - [`MenuLClick`](#menulclick)
  - [`MenuLoad`](#menuload)
  - [`MenuNDirUnderCursor`](#menundirundercursor)
  - [`MenuNVidUnderCursor`](#menunvidundercursor)
  - [`MenuRClick`](#menurclick)
  - [`MenuRelease`](#menurelease)
  - [`ScreenX`](#screenx)
  - [`ScreenY`](#screeny)
  - [`SetCursor`](#setcursor)
  - [`SetMouseClick`](#setmouseclick)
  - [`SetPosition`](#setposition)
  - [`SetScrollType`](#setscrolltype)
  - [`SetSelectUnit`](#setselectunit)
  - [`SetStateBar`](#setstatebar)
  - [`ToScreenX`](#toscreenx)
  - [`ToScreenY`](#toscreeny)
- [Unit and action API](#unit-and-action-api) (13)
  - [`Action`](#action)
  - [`AddCommand`](#addcommand)
  - [`DirectionTo`](#directionto)
  - [`GetAnimation`](#getanimation)
  - [`GetCommands`](#getcommands)
  - [`GetDirection`](#getdirection)
  - [`GetUnitVid`](#getunitvid)
  - [`GetX`](#getx)
  - [`GetY`](#gety)
  - [`GetZ`](#getz)
  - [`ReCalcGridZ`](#recalcgridz)
  - [`SetCommands`](#setcommands)
  - [`SizeTo`](#sizeto)

## AI and railway

### AddUnitLimit

**Signature:** `AddUnitLimit(int army, int engine_nvid, int value)`  
**Return type:** `void`  
**Description:** Adds a unit limit for an army and VID. Use 255 as a wildcard; pass -1 as value to remove a matching limit.  
**Source:** `export.lgc` · **ID:** `249`

### BreakTrain

**Signature:** `BreakTrain(int unit, int x, int y)`  
**Return type:** `void`  
**Description:** Splits a train at the supplied map coordinates, using the given unit as the reference.  
**Source:** `export.lgc` · **ID:** `239`

### CalcStatistics

**Signature:** `CalcStatistics(int begx, int begy, int endx, int endy, int stat)`  
**Return type:** `int`  
**Description:** Calculates a statistic for the rectangular map region. The statistic is selected by a STAT_* constant.  
**Source:** `export.lgc` · **ID:** `211`

### CanAttackEngine

**Signature:** `CanAttackEngine(int engine, int enemy)`  
**Return type:** `int`  
**Description:** Checks whether a locomotive can reach a position from which it can attack the specified enemy.  
**Source:** `export.lgc` · **ID:** `254`

### CanMoveEngineTo

**Signature:** `CanMoveEngineTo(int engine, int x, int y)`  
**Return type:** `int`  
**Description:** Checks whether a locomotive can reach the supplied world-coordinate point.  
**Source:** `export.lgc` · **ID:** `253`

### FirstTrain

**Signature:** `FirstTrain(int army)`  
**Return type:** `int`  
**Description:** Starts iteration over trains belonging to the specified army. Pair with NextTrain().  
**Source:** `export.lgc` · **ID:** `240`

### GetMoney

**Signature:** `GetMoney(int army)`  
**Return type:** `int`  
**Description:** Returns the current money balance of the selected army.  
**Source:** `export.lgc` · **ID:** `252`

### GetStatistics

**Signature:** `GetStatistics(int narmy, int stat)`  
**Return type:** `int`  
**Description:** Returns an AI/game statistic for the selected army. See STAT_* constants.  
**Source:** `export.lgc` · **ID:** `210`

### NextTrain

**Signature:** `NextTrain()`  
**Return type:** `int`  
**Description:** Advances the active train iterator and returns the next train handle.  
**Source:** `export.lgc` · **ID:** `241`

### PatrolEngine

**Signature:** `PatrolEngine(int train, int x, int y)`  
**Return type:** `void`  
**Description:** Orders a train to patrol toward the supplied world-coordinate point.  
**Source:** `export.lgc` · **ID:** `242`

### PatrolEngineToPoints

**Signature:** `PatrolEngineToPoints(int train, int x, int y, int x2, int y2)`  
**Return type:** `unknown`  
**Description:** Orders a train to patrol between two world-coordinate points.  
**Source:** `export.lgc` · **ID:** `248`

### SetAutoReBirth

**Signature:** `SetAutoReBirth(int newval)`  
**Return type:** `void`  
**Description:** Enables or disables automatic rebuilding of destroyed buildings.  
**Source:** `export.lgc` · **ID:** `247`

### SetCleverEnemyAttack

**Signature:** `SetCleverEnemyAttack(int newval)`  
**Return type:** `void`  
**Description:** Enables or disables the enemy's smarter attack behavior.  
**Source:** `export.lgc` · **ID:** `246`

### SetEnemyCanAttackNeutralTrains

**Signature:** `SetEnemyCanAttackNeutralTrains(int newval)`  
**Return type:** `void`  
**Description:** Controls whether enemy units may attack neutral trains on the map.  
**Source:** `export.lgc` · **ID:** `250`

### SetMoney

**Signature:** `SetMoney(int army, int money)`  
**Return type:** `void`  
**Description:** Sets the money balance of the selected army.  
**Source:** `export.lgc` · **ID:** `251`

### SetPushLine

**Signature:** `SetPushLine(int begin_x, int begin_y, int end_x, int end_y, int push_flag)`  
**Return type:** `void`  
**Description:** Defines a one-way train route between two screen-coordinate points. The original export file places a legacy comment about IsMovingToRepair beside this declaration.  
**Source:** `export.lgc` · **ID:** `243`

### SetSemaphore

**Signature:** `SetSemaphore(int x, int y, int newsemaphore, int army)`  
**Return type:** `void`  
**Description:** Changes the semaphore on a rail tile for the specified army. The semaphore value controls permitted travel directions.  
**Source:** `export.lgc` · **ID:** `231`

### TrainProperty

**Signature:** `TrainProperty(int train, int property)`  
**Return type:** `int`  
**Description:** Returns a train property selected by a PROP_* constant.  
**Source:** `export.lgc` · **ID:** `212`

## Audio, video and effects

### CountGamma

**Signature:** `CountGamma(int g1, int g2, int time)`  
**Return type:** `unknown`  
**Description:** Interpolates between two gamma values using a time value from 0 to 255.  
**Source:** `export.lgc` · **ID:** `146`

### Effect

**Signature:** `Effect(int effect, int var1, int var2 = 0, int duration = 0)`  
**Return type:** `void`  
**Description:** Starts a screen or palette effect. The effect identifier and parameters are defined by EFF_* constants.  
**Source:** `export.lgc` · **ID:** `137`

### GetEffectState

**Signature:** `GetEffectState(int eff)`  
**Return type:** `int`  
**Description:** Returns effect progress as a percentage (0-100), or -1 when the effect is not running.  
**Source:** `export.lgc` · **ID:** `148`

### GetGamma

**Signature:** `GetGamma()`  
**Return type:** `int`  
**Description:** Returns the currently selected gamma value.  
**Source:** `export.lgc` · **ID:** `147`

### IsPlayMovie

**Signature:** `IsPlayMovie()`  
**Return type:** `int`  
**Description:** Returns non-zero while a movie is playing.  
**Source:** `export.lgc` · **ID:** `143`

### IsPlayMusic

**Signature:** `IsPlayMusic()`  
**Return type:** `int`  
**Description:** Returns non-zero while music playback is active.  
**Source:** `export.lgc` · **ID:** `145`

### PlayMovie

**Signature:** `PlayMovie(string filename)`  
**Return type:** `void`  
**Description:** Starts playback of a movie file.  
**Source:** `export.lgc` · **ID:** `142`

### PlayMusicFile

**Signature:** `PlayMusicFile(string file, int loop = 1)`  
**Return type:** `void`  
**Description:** Plays a music file. The optional loop flag defaults to one (looping enabled).  
**Source:** `export.lgc` · **ID:** `136`

### PlaySFX

**Signature:** `PlaySFX(int nsfx)`  
**Return type:** `void`  
**Description:** Plays a sound effect by its sound-effect index.  
**Source:** `export.lgc` · **ID:** `132`

### PlaySFXFromCoor

**Signature:** `PlaySFXFromCoor(int nsfx, int x, int y)`  
**Return type:** `void`  
**Description:** Plays a sound effect at world coordinates so that its position is spatialized.  
**Source:** `export.lgc` · **ID:** `135`

### SetEnvironment

**Signature:** `SetEnvironment(int env)`  
**Return type:** `void`  
**Description:** Sets environment effects using ENV_* flags.  
**Source:** `export.lgc` · **ID:** `138`

### SetGamma

**Signature:** `SetGamma(int gammaindex)`  
**Return type:** `void`  
**Description:** Selects a game palette/gamma table.  
**Source:** `export.lgc` · **ID:** `140`

### SetGraphDetail

**Signature:** `SetGraphDetail(int detail)`  
**Return type:** `void`  
**Description:** Sets graphics detail: zero for low detail, one for high detail.  
**Source:** `export.lgc` · **ID:** `139`

### SetMusicVolume

**Signature:** `SetMusicVolume(int volume)`  
**Return type:** `void`  
**Description:** Sets the music volume (0-100).  
**Source:** `export.lgc` · **ID:** `131`

### SetSoundVolume

**Signature:** `SetSoundVolume(int volume)`  
**Return type:** `void`  
**Description:** Sets the sound-effects volume (0-100).  
**Source:** `export.lgc` · **ID:** `130`

### SetWind

**Signature:** `SetWind(int wind, int direct)`  
**Return type:** `void`  
**Description:** Sets wind strength and direction.  
**Source:** `export.lgc` · **ID:** `141`

### StopMovie

**Signature:** `StopMovie()`  
**Return type:** `void`  
**Description:** Stops movie playback.  
**Source:** `export.lgc` · **ID:** `144`

### StopMusic

**Signature:** `StopMusic()`  
**Return type:** `void`  
**Description:** Stops currently playing music.  
**Source:** `export.lgc` · **ID:** `134`

### StopSFX

**Signature:** `StopSFX(int nsfx)`  
**Return type:** `void`  
**Description:** Stops the selected sound effect. Pass -1 to stop all sound effects.  
**Source:** `export.lgc` · **ID:** `133`

## Compatibility and text helpers

### Create

**Signature:** `Create(int nvid, int x, int y, int z)`  
**Return type:** `int`  
**Description:** Legacy alias for CreateSprite(nvid, x, y, z).  
**Source:** `obsolete.lgc`

### CreateEx

**Signature:** `CreateEx(int nvid, int x, int y, int z, int dir)`  
**Return type:** `int`  
**Description:** Legacy alias for CreateSprite with an explicit direction.  
**Source:** `obsolete.lgc`

### CreateText

**Signature:** `CreateText(int font_vid, int x, int y, int z, string text, int behave = 0)`  
**Return type:** `int`  
**Description:** Creates a B_TEXT sprite and assigns it the supplied text. The optional behavior flags control alignment and text loading.  
**Source:** `export.lgc`

### CreateTextFromFile

**Signature:** `CreateTextFromFile(int font_vid, int x, int y, int z, string filename, int behave = 0)`  
**Return type:** `int`  
**Description:** Creates a B_TEXT sprite and loads its text from a file. The font VID must use the B_TEXT sprite class.  
**Source:** `export.lgc`

### GetDir

**Signature:** `GetDir(int unit)`  
**Return type:** `int`  
**Description:** Legacy alias for GetDirection(unit).  
**Source:** `obsolete.lgc`

### MenuDir

**Signature:** `MenuDir()`  
**Return type:** `int`  
**Description:** Returns the direction value of the menu item under the cursor.  
**Source:** `obsolete.lgc`

### MenuSelectVid

**Signature:** `MenuSelectVid()`  
**Return type:** `int`  
**Description:** Returns the VID of the menu item currently under the cursor.  
**Source:** `obsolete.lgc`

### MenuVid

**Signature:** `MenuVid()`  
**Return type:** `int`  
**Description:** Returns the VID of the menu item clicked with the left mouse button, or zero when no menu item was clicked.  
**Source:** `obsolete.lgc`

### Message

**Signature:** `Message(string text, int x, int y)`  
**Return type:** `void`  
**Description:** Displays a localized message by combining its MessagePrefixes and Messages strings.ini entries.  
**Source:** `obsolete.lgc`

### PlayWAV

**Signature:** `PlayWAV(string filename)`  
**Return type:** `void`  
**Description:** Legacy helper that plays a music/audio file through PlayMusicFile().  
**Source:** `obsolete.lgc`

### PrintFile

**Signature:** `PrintFile(int x, int y, int z, string filename, int font)`  
**Return type:** `int`  
**Description:** Creates a text sprite whose content is read from a file and returns its sprite handle.  
**Source:** `obsolete.lgc`

### PrintText

**Signature:** `PrintText(int x, int y, int z, string text, int font, int behave = 0)`  
**Return type:** `int`  
**Description:** Creates a text sprite at the supplied world coordinates and returns its sprite handle. The optional behavior flags control text alignment and loading mode.  
**Source:** `obsolete.lgc`

### ScrollLock

**Signature:** `ScrollLock(int flag)`  
**Return type:** `void`  
**Description:** Legacy helper that disables or enables edge and arrow-key scrolling while preserving other scroll flags.  
**Source:** `obsolete.lgc`

### SetAutoScroll

**Signature:** `SetAutoScroll(int flag)`  
**Return type:** `void`  
**Description:** Enables or disables automatic scrolling toward the flagman while preserving other scroll flags.  
**Source:** `obsolete.lgc`

### SetHpCoeff

**Signature:** `SetHpCoeff(int nvid, int narmy, int hp_percent)`  
**Return type:** `void`  
**Description:** Sets a per-army hit-point coefficient for a VID by writing the matching VID_HP_COEFF* property.  
**Source:** `obsolete.lgc`

### SetMusic

**Signature:** `SetMusic(int volume)`  
**Return type:** `void`  
**Description:** Legacy alias for SetMusicVolume(volume).  
**Source:** `obsolete.lgc`

### SetSound

**Signature:** `SetSound(int volume)`  
**Return type:** `void`  
**Description:** Legacy alias for SetSoundVolume(volume).  
**Source:** `obsolete.lgc`

## Engine API

### AskPlace

**Signature:** `AskPlace(int vid, int x, int y, int z)`  
**Return type:** `int`  
**Description:** Checks whether an object with the supplied VID can be placed at the coordinates. Returns the blocking unit handle, or zero when placement is possible.  
**Source:** `export.lgc` · **ID:** `161`

### ChangeZUnit

**Signature:** `ChangeZUnit(int vid, int z)`  
**Return type:** `void`  
**Description:** Changes the Z coordinate for all instances of the supplied VID.  
**Source:** `export.lgc` · **ID:** `156`

### charat

**Signature:** `charat(string str, int index)`  
**Return type:** `string`  
**Description:** Returns the character at the requested zero-based string index.  
**Source:** `export.lgc` · **ID:** `153`

### Cos

**Signature:** `Cos(int angle)`  
**Return type:** `int`  
**Description:** Returns cosine(angle) multiplied by 1024. The angle uses the game's 0-255 direction scale.  
**Source:** `export.lgc` · **ID:** `166`

### CreateSprite

**Signature:** `CreateSprite(int nvid, int x, int y, int z, int dir = 0, int parent = 0)`  
**Return type:** `int`  
**Description:** Creates a sprite instance from a game object VID at world coordinates. Returns the new sprite handle. Optional direction and parent handle default to zero.  
**Source:** `export.lgc` · **ID:** `65`

### Destroy

**Signature:** `Destroy(int unit)`  
**Return type:** `void`  
**Description:** Destroys the sprite identified by its handle.  
**Source:** `export.lgc` · **ID:** `84`

### Exit

**Signature:** `Exit(string next_program = "")`  
**Return type:** `void`  
**Description:** Exits to Windows. An optional program name can be supplied to launch another program after the game closes.  
**Source:** `export.lgc` · **ID:** `124`

### Flagman

**Signature:** `Flagman(int army)`  
**Return type:** `int`  
**Description:** Returns the currently controlled unit for the requested army.  
**Source:** `export.lgc` · **ID:** `66`

### Genocide

**Signature:** `Genocide(int nvid)`  
**Return type:** `void`  
**Description:** Destroys every instance of the supplied VID on the map.  
**Source:** `export.lgc` · **ID:** `169`

### GetGroundZ

**Signature:** `GetGroundZ(int x, int y)`  
**Return type:** `int`  
**Description:** Returns the ground height at the supplied world coordinates.  
**Source:** `export.lgc` · **ID:** `158`

### GetScreenInputX

**Signature:** `GetScreenInputX()`  
**Return type:** `unknown`  
**Description:** Returns the mouse X coordinate in screen coordinates.  
**Source:** `export.lgc` · **ID:** `244`

### GetScreenInputY

**Signature:** `GetScreenInputY()`  
**Return type:** `unknown`  
**Description:** Returns the mouse Y coordinate in screen coordinates.  
**Source:** `export.lgc` · **ID:** `245`

### GetString

**Signature:** `GetString(string section, string keyword)`  
**Return type:** `string`  
**Description:** Reads a localized string from the [strings] section of strings.ini.  
**Source:** `export.lgc` · **ID:** `123`

### GetTime

**Signature:** `GetTime()`  
**Return type:** `int`  
**Description:** Returns the current game timer in milliseconds.  
**Source:** `export.lgc` · **ID:** `157`

### GetVidData

**Signature:** `GetVidData(int nvid, int type)`  
**Return type:** `int`  
**Description:** Reads a property of a game object definition. The property selector is a VID_* constant.  
**Source:** `export.lgc` · **ID:** `162`

### itoa

**Signature:** `itoa(int val)`  
**Return type:** `string`  
**Description:** Converts an integer to its decimal string representation.  
**Source:** `export.lgc` · **ID:** `164`

### Load

**Signature:** `Load(string filename)`  
**Return type:** `void`  
**Description:** Loads a map from the supplied file name.  
**Source:** `export.lgc` · **ID:** `98`

### MapSizeX

**Signature:** `MapSizeX()`  
**Return type:** `int`  
**Description:** Returns the map width in world units.  
**Source:** `export.lgc` · **ID:** `167`

### MapSizeY

**Signature:** `MapSizeY()`  
**Return type:** `int`  
**Description:** Returns the map height in world units.  
**Source:** `export.lgc` · **ID:** `168`

### MessageText

**Signature:** `MessageText(string text, int x, int y)`  
**Return type:** `void`  
**Description:** Displays a message in the game's message/state bar at the supplied coordinates.  
**Source:** `export.lgc` · **ID:** `114`

### Pause

**Signature:** `Pause(int flag)`  
**Return type:** `void`  
**Description:** Pauses or resumes the game according to the supplied flag.  
**Source:** `export.lgc` · **ID:** `112`

### Printf

**Signature:** `Printf(string format, unknown int_or_string)`  
**Return type:** `unknown`  
**Description:** Formats a string using a format template and one integer-or-string argument.  
**Source:** `export.lgc` · **ID:** `172`

### Random

**Signature:** `Random(int max)`  
**Return type:** `int`  
**Description:** Returns a pseudo-random integer from zero through the supplied maximum.  
**Source:** `export.lgc` · **ID:** `155`

### ReloadVid

**Signature:** `ReloadVid()`  
**Return type:** `void`  
**Description:** Reloads the game object's VID parameters.  
**Source:** `export.lgc` · **ID:** `173`

### ReplaceUnit

**Signature:** `ReplaceUnit(int nvid1, int nvid2)`  
**Return type:** `void`  
**Description:** Replaces every instance of one VID on the map with another VID.  
**Source:** `export.lgc` · **ID:** `170`

### Save

**Signature:** `Save(string filename)`  
**Return type:** `void`  
**Description:** Saves the current map to the supplied file name.  
**Source:** `export.lgc` · **ID:** `99`

### SaveDemo

**Signature:** `SaveDemo(string filename)`  
**Return type:** `void`  
**Description:** Records the next loaded file as a demo under the supplied file name.  
**Source:** `export.lgc` · **ID:** `100`

### SetFlagman

**Signature:** `SetFlagman(int narmy, int unit)`  
**Return type:** `void`  
**Description:** Sets a unit as the flagman (controlled unit) for the specified army.  
**Source:** `export.lgc` · **ID:** `160`

### SetVidData

**Signature:** `SetVidData(int nvid, int type, int var)`  
**Return type:** `void`  
**Description:** Changes a property of a game object definition. The property selector is a VID_* constant.  
**Source:** `export.lgc` · **ID:** `163`

### Sin

**Signature:** `Sin(int angle)`  
**Return type:** `int`  
**Description:** Returns sine(angle) multiplied by 1024. The angle uses the game's 0-255 direction scale.  
**Source:** `export.lgc` · **ID:** `165`

### strlen

**Signature:** `strlen(string str)`  
**Return type:** `int`  
**Description:** Returns the number of characters in a string.  
**Source:** `export.lgc` · **ID:** `159`

## Files, registry and logging

### DelReg

**Signature:** `DelReg(string path, string name)`  
**Return type:** `void`  
**Description:** Deletes a named value from the Windows registry.  
**Source:** `export.lgc` · **ID:** `184`

### Exec

**Signature:** `Exec(string command)`  
**Return type:** `void`  
**Description:** Starts an external Windows executable or command.  
**Source:** `export.lgc` · **ID:** `152`

### FClose

**Signature:** `FClose(int file)`  
**Return type:** `void`  
**Description:** Closes an opened script file handle.  
**Source:** `export.lgc` · **ID:** `177`

### FCreate

**Signature:** `FCreate(string filename)`  
**Return type:** `int`  
**Description:** Creates a file for script I/O and returns its file handle.  
**Source:** `export.lgc` · **ID:** `178`

### FEof

**Signature:** `FEof(int file)`  
**Return type:** `int`  
**Description:** Returns non-zero when the file handle has reached end-of-file.  
**Source:** `export.lgc` · **ID:** `179`

### FOpen

**Signature:** `FOpen(string filename)`  
**Return type:** `int`  
**Description:** Opens a file for script I/O and returns its file handle.  
**Source:** `export.lgc` · **ID:** `176`

### FRead

**Signature:** `FRead(int file)`  
**Return type:** `unknown`  
**Description:** Reads the next variable value from an opened game script file.  
**Source:** `export.lgc` · **ID:** `175`

### FWrite

**Signature:** `FWrite(int file, unknown variable)`  
**Return type:** `void`  
**Description:** Writes a variable value to an opened game script file.  
**Source:** `export.lgc` · **ID:** `174`

### GetDefaultRegPath

**Signature:** `GetDefaultRegPath()`  
**Return type:** `string`  
**Description:** Returns the registry path configured in game.cfg.  
**Source:** `export.lgc` · **ID:** `185`

### GetReg

**Signature:** `GetReg(string path, string name, unknown def_value)`  
**Return type:** `unknown`  
**Description:** Reads a string value from the Windows registry, returning the supplied default when the value is absent.  
**Source:** `export.lgc` · **ID:** `182`

### Log

**Signature:** `Log(string str)`  
**Return type:** `void`  
**Description:** Writes a message to the game's logic log.  
**Source:** `export.lgc` · **ID:** `154`

### SetReg

**Signature:** `SetReg(string path, string name, unknown value)`  
**Return type:** `void`  
**Description:** Writes a string value to the Windows registry.  
**Source:** `export.lgc` · **ID:** `183`

## Legacy aliases and helper macros

### GETSPRITE_ARMY

**Signature:** `GETSPRITE_ARMY(int army)`  
**Return type:** `int`  
**Description:** Builds the GETSPRITE_ARMY* bit mask for the supplied army index.  
**Source:** `export.lgc`

### GETSPRITE_TYPE

**Signature:** `GETSPRITE_TYPE(int type)`  
**Return type:** `int`  
**Description:** Builds a sprite-type filter mask for GetSprite() and FindNearestSprite().  
**Source:** `export.lgc`

### GetVid

**Signature:** `GetVid(int nvid, int type)`  
**Return type:** `int`  
**Description:** Legacy macro alias for GetVidData(nvid, type).  
**Source:** `obsolete.lgc`

### SetVid

**Signature:** `SetVid(int nvid, int type, int var)`  
**Return type:** `void`  
**Description:** Legacy macro alias for SetVidData(nvid, type, var).  
**Source:** `obsolete.lgc`

### sprintf

**Signature:** `sprintf(string format, unknown int_or_string)`  
**Return type:** `int`  
**Description:** Legacy macro alias for Printf(format, int_or_string). The format accepts one value argument.  
**Source:** `obsolete.lgc`

## Networking

### GetNetInfo

**Signature:** `GetNetInfo(int type)`  
**Return type:** `int`  
**Description:** Returns a network-game property selected by a NET_* constant.  
**Source:** `export.lgc` · **ID:** `192`

### GetNetInputState

**Signature:** `GetNetInputState(int nplayer)`  
**Return type:** `int`  
**Description:** Returns the input-state bit mask reported by the specified network player.  
**Source:** `export.lgc` · **ID:** `197`

### GetNetKey

**Signature:** `GetNetKey(int nplayer)`  
**Return type:** `int`  
**Description:** Returns the key code reported by the specified network player.  
**Source:** `export.lgc` · **ID:** `196`

### Receive

**Signature:** `Receive()`  
**Return type:** `int`  
**Description:** Receives the next integer data value from the network peer.  
**Source:** `export.lgc` · **ID:** `194`

### Send

**Signature:** `Send(int data)`  
**Return type:** `void`  
**Description:** Sends an integer data value to the network peer.  
**Source:** `export.lgc` · **ID:** `193`

### SetNet

**Signature:** `SetNet(int flag)`  
**Return type:** `void`  
**Description:** Enables or disables network-game mode.  
**Source:** `export.lgc` · **ID:** `195`

## Script library helper

### AddReinforcement

**Signature:** `AddReinforcement()`  
**Return type:** `unknown`  
**Description:** Adds a reinforcement wave according to the configured player/AI schedule.  
**Source:** `reinforcement.lgc`

### ArmyWeightCenter

**Signature:** `ArmyWeightCenter(int army)`  
**Return type:** `unknown`  
**Description:** Calculates the hit-point-weighted center of an army and stores the result in WeightX and WeightY.  
**Source:** `ai_functions.lgc`

### BuildTrain

**Signature:** `BuildTrain(int depo, int *train)`  
**Return type:** `unknown`  
**Description:** Queues the unit VIDs from an integer array as build commands for a depot. The helper may swap the first two entries before building.  
**Source:** `ai_functions.lgc`

### ChangeFonarState

**Signature:** `ChangeFonarState()`  
**Return type:** `unknown`  
**Description:** Changes the state of a light/lantern effect for the day/night cycle.  
**Source:** `daynight.lgc`

### CivilPatrol

**Signature:** `CivilPatrol()`  
**Return type:** `unknown`  
**Description:** Updates civilian patrol behavior for the current logic tick.  
**Source:** `civil.lgc`

### Clouds

**Signature:** `Clouds()`  
**Return type:** `unknown`  
**Description:** Updates the cloud layer and its movement for the environment logic.  
**Source:** `environmenttact.lgc`

### CountArmyUnit

**Signature:** `CountArmyUnit(int army)`  
**Return type:** `unknown`  
**Description:** Counts all units belonging to the supplied army.  
**Source:** `ai_functions.lgc`

### CreateFly

**Signature:** `CreateFly(int nvid, int army, int z)`  
**Return type:** `unknown`  
**Description:** Creates a flying unit outside the map boundary, chooses a random edge position, then assigns it to the requested army.  
**Source:** `basefunctions.lgc`

### DeactiveTrain

**Signature:** `DeactiveTrain(int train)`  
**Return type:** `unknown`  
**Description:** Sets every engine in a train to passive behavior.  
**Source:** `ai_functions.lgc`

### EndQuake

**Signature:** `EndQuake()`  
**Return type:** `unknown`  
**Description:** Stops the earthquake state and restores the affected environment values.  
**Source:** `environmenttact.lgc`

### EnvironmentTact

**Signature:** `EnvironmentTact()`  
**Return type:** `unknown`  
**Description:** Main per-tick update routine for the environment effects.  
**Source:** `environmenttact.lgc`

### FortCaptured

**Signature:** `FortCaptured(int army)`  
**Return type:** `unknown`  
**Description:** Returns the total count of captured fort structures for the selected army.  
**Source:** `ai_functions.lgc`

### FReadText

**Signature:** `FReadText(int f)`  
**Return type:** `unknown`  
**Description:** Reads the remaining contents of an opened file into a string, appending a line break after each read item.  
**Source:** `basefunctions.lgc`

### GammaIntensive_print

**Signature:** `GammaIntensive_print()`  
**Return type:** `unknown`  
**Description:** Debug helper that prints the current gamma/intensity values.  
**Source:** `daynight.lgc`

### GetDifficulty

**Signature:** `GetDifficulty()`  
**Return type:** `unknown`  
**Description:** Reads the current player's difficulty setting from the Locoland registry keys.  
**Source:** `basefunctions.lgc`

### GetGammaIntensive

**Signature:** `GetGammaIntensive(int gamma)`  
**Return type:** `unknown`  
**Description:** Calculates a gamma/intensity value used by the day/night script.  
**Source:** `daynight.lgc`

### GetHoursByMSec

**Signature:** `GetHoursByMSec(int msec)`  
**Return type:** `unknown`  
**Description:** Converts a millisecond duration to whole hours.  
**Source:** `basefunctions.lgc`

### GetLongestTrain

**Signature:** `GetLongestTrain(int army)`  
**Return type:** `unknown`  
**Description:** Finds the longest train for an army; the selected train handle is stored in GetLongestTrain_unit and the function returns the engine count.  
**Source:** `ai_functions.lgc`

### GetMinutesByMSec

**Signature:** `GetMinutesByMSec(int msec)`  
**Return type:** `unknown`  
**Description:** Returns the minute component of a millisecond duration after removing whole hours.  
**Source:** `basefunctions.lgc`

### GetRegDefaultPlayer

**Signature:** `GetRegDefaultPlayer()`  
**Return type:** `unknown`  
**Description:** Reads the selected/default player index from the Locoland player registry settings.  
**Source:** `basefunctions.lgc`

### GetRegStateBar

**Signature:** `GetRegStateBar()`  
**Return type:** `unknown`  
**Description:** Reads the saved state-bar preference for the currently selected player; returns a fallback when no player is selected.  
**Source:** `basefunctions.lgc`

### GetSecondsByMSec

**Signature:** `GetSecondsByMSec(int msec)`  
**Return type:** `unknown`  
**Description:** Returns the seconds component of a millisecond duration after removing whole hours and minutes.  
**Source:** `basefunctions.lgc`

### IsTrainAtWeaponRadius

**Signature:** `IsTrainAtWeaponRadius(int train)`  
**Return type:** `unknown`  
**Description:** Checks whether a train is inside the weapon range of enemy units and returns a TRADIUS_* state.  
**Source:** `ai_functions.lgc`

### IsTrainAtWeaponRadiusEx

**Signature:** `IsTrainAtWeaponRadiusEx(int train)`  
**Return type:** `unknown`  
**Description:** Extended weapon-radius check using action-based weapon range values. Stores the last matching enemy unit in IsTrainAtWeaponRadiusEx_unit.  
**Source:** `ai_functions.lgc`

### LDepoCapture

**Signature:** `LDepoCapture(int capture_x, int capture_y, int size_tocapture, int army_tocapture)`  
**Return type:** `unknown`  
**Description:** Capture-script helper for assigning a depot to the requested army; see the implementation for the exact capture checks.  
**Source:** `Captures.lgc`

### LMasterCapture

**Signature:** `LMasterCapture(int capture_x, int capture_y, int size_tocapture, int army_tocapture)`  
**Return type:** `unknown`  
**Description:** Capture-script helper for assigning a master structure to the requested army.  
**Source:** `Captures.lgc`

### Meteorites

**Signature:** `Meteorites()`  
**Return type:** `unknown`  
**Description:** Spawns and updates meteorite events when enabled by the environment logic.  
**Source:** `environmenttact.lgc`

### MoveTrain

**Signature:** `MoveTrain(int train, int x, int y, int behave)`  
**Return type:** `unknown`  
**Description:** Sets a train's behavior and then issues a move order to the supplied world coordinates.  
**Source:** `ai_functions.lgc`

### MoveZ

**Signature:** `MoveZ(int unit, int x, int y)`  
**Return type:** `unknown`  
**Description:** Issues a move action after adding terrain height and the configured rail height offset to the destination Z coordinate.  
**Source:** `basefunctions.lgc`

### Muxi

**Signature:** `Muxi(int nvid, int count)`  
**Return type:** `unknown`  
**Description:** Maintains the flying insect unit population on a map by spawning units when the count falls below the configured target.  
**Source:** `civil.lgc`

### MyPatrolTrain

**Signature:** `MyPatrolTrain(int train, int x, int y, int beh_patrol)`  
**Return type:** `unknown`  
**Description:** Queues a train to move to its current position and then to the supplied point using the selected behavior.  
**Source:** `ai_functions.lgc`

### NearTrain

**Signature:** `NearTrain(int train, int NearTrain_army)`  
**Return type:** `unknown`  
**Description:** Finds the nearest engine belonging to army zero from the supplied train.  
**Source:** `ai_functions.lgc`

### NoArmyUnits

**Signature:** `NoArmyUnits(int army)`  
**Return type:** `unknown`  
**Description:** Counts units for an army using the NVID lists defined by the game scripts.  
**Source:** `basefunctions.lgc`

### OneTimeIn5Second

**Signature:** `OneTimeIn5Second()`  
**Return type:** `unknown`  
**Description:** Returns one approximately once every five seconds.  
**Source:** `basefunctions.lgc`

### OneTimeInHalfSecond

**Signature:** `OneTimeInHalfSecond()`  
**Return type:** `unknown`  
**Description:** Returns one approximately once every half-second, using the game timer.  
**Source:** `basefunctions.lgc`

### OneTimeInNSecond1

**Signature:** `OneTimeInNSecond1(int N)`  
**Return type:** `unknown`  
**Description:** Returns one once per N seconds. This is one of three independent timer slots available in the helper library.  
**Source:** `basefunctions.lgc`

### OneTimeInNSecond2

**Signature:** `OneTimeInNSecond2(int N)`  
**Return type:** `unknown`  
**Description:** Returns one once per N seconds using the second independent timer slot.  
**Source:** `basefunctions.lgc`

### OneTimeInNSecond3

**Signature:** `OneTimeInNSecond3(int N)`  
**Return type:** `unknown`  
**Description:** Returns one once per N seconds using the third independent timer slot.  
**Source:** `basefunctions.lgc`

### OneTimeInQuarterSecond

**Signature:** `OneTimeInQuarterSecond()`  
**Return type:** `unknown`  
**Description:** Returns one approximately once every quarter-second, using the game timer.  
**Source:** `basefunctions.lgc`

### OneTimeInSecond

**Signature:** `OneTimeInSecond()`  
**Return type:** `unknown`  
**Description:** Returns one on the first call in a game tick after approximately one second has elapsed; repeated calls in that tick return the same result.  
**Source:** `basefunctions.lgc`

### PatrolEngineZ

**Signature:** `PatrolEngineZ(int unit, int x, int y)`  
**Return type:** `unknown`  
**Description:** Orders a train to patrol at the supplied point with the configured rail height offset applied.  
**Source:** `basefunctions.lgc`

### PatrolTrain

**Signature:** `PatrolTrain(int train, int x, int y, int beh_move, int beh_patrol)`  
**Return type:** `unknown`  
**Description:** Sets the patrol behavior and sends a train toward a patrol point.  
**Source:** `ai_functions.lgc`

### PrintObjectives

**Signature:** `PrintObjectives()`  
**Return type:** `unknown`  
**Description:** Loads and displays the current level's objectives text when the LEVEL build symbol is enabled.  
**Source:** `basefunctions.lgc`

### PrintTextAtCenter

**Signature:** `PrintTextAtCenter(int x, int y, int z, string s, int font)`  
**Return type:** `unknown`  
**Description:** Creates a text sprite centered around the supplied coordinates using the standard text dimensions.  
**Source:** `basefunctions.lgc`

### PrintTextAtCenter5x5

**Signature:** `PrintTextAtCenter5x5(int x, int y, int z, string s, int font)`  
**Return type:** `unknown`  
**Description:** Creates a text sprite centered around the supplied coordinates using the compact 5x5-style text height.  
**Source:** `basefunctions.lgc`

### Quake

**Signature:** `Quake(int time, int sound)`  
**Return type:** `unknown`  
**Description:** Starts or updates the earthquake effect using the environment script's timing constants.  
**Source:** `environmenttact.lgc`

### Rain

**Signature:** `Rain()`  
**Return type:** `unknown`  
**Description:** Updates rain timing and state for the environment logic.  
**Source:** `daynight.lgc`

### RandomTrain

**Signature:** `RandomTrain(int RandomTrain_army)`  
**Return type:** `unknown`  
**Description:** Returns a pseudo-random train from the selected army, with a fallback to the player's captured depot where applicable.  
**Source:** `ai_functions.lgc`

### ReinforcementInit

**Signature:** `ReinforcementInit()`  
**Return type:** `unknown`  
**Description:** Initializes the reinforcement counters and state for player and AI armies.  
**Source:** `reinforcement.lgc`

### ResendCivilPatrolEngine

**Signature:** `ResendCivilPatrolEngine()`  
**Return type:** `unknown`  
**Description:** Restarts or redirects a civilian patrol train after its previous route is completed.  
**Source:** `civil.lgc`

### SendCivilPatrolEngine

**Signature:** `SendCivilPatrolEngine()`  
**Return type:** `unknown`  
**Description:** Sends a neutral/civilian patrol train using the helper's configured patrol path.  
**Source:** `civil.lgc`

### SetArmyGamma

**Signature:** `SetArmyGamma()`  
**Return type:** `unknown`  
**Description:** Applies the palette gamma settings for all configured armies.  
**Source:** `setarmygamma.lgc`

### SetArmyVid

**Signature:** `SetArmyVid(int nvid, int army)`  
**Return type:** `unknown`  
**Description:** Applies the configured VID-related values for the selected army.  
**Source:** `daynight.lgc`

### SetDayNightGamma

**Signature:** `SetDayNightGamma()`  
**Return type:** `unknown`  
**Description:** Updates the game palette according to the current day/night state.  
**Source:** `daynight.lgc`

### SetPositionCenter

**Signature:** `SetPositionCenter(int x, int y)`  
**Return type:** `unknown`  
**Description:** Moves the map viewport so the supplied point is centered where possible, clamping to map boundaries.  
**Source:** `ai_functions.lgc`

### SetRegStateBar

**Signature:** `SetRegStateBar(int state)`  
**Return type:** `unknown`  
**Description:** Saves the state-bar preference for the currently selected player when a player index is available.  
**Source:** `basefunctions.lgc`

### SetWindEx

**Signature:** `SetWindEx(int w_speed, int w_dir)`  
**Return type:** `unknown`  
**Description:** Sets wind using the extended environment-script parameters.  
**Source:** `environmenttact.lgc`

### SizeBetween

**Signature:** `SizeBetween(int unit1, int unit2)`  
**Return type:** `unknown`  
**Description:** Returns the distance between two units using the first unit and the second unit's world coordinates.  
**Source:** `ai_functions.lgc`

### SizeToZ

**Signature:** `SizeToZ(int unit, int x, int y)`  
**Return type:** `unknown`  
**Description:** Calculates the size/distance to a point after adding the unit's current Z coordinate and the configured rail height offset.  
**Source:** `basefunctions.lgc`

### StartRain

**Signature:** `StartRain()`  
**Return type:** `unknown`  
**Description:** Starts the rain environment effect.  
**Source:** `daynight.lgc`

### StopRain

**Signature:** `StopRain()`  
**Return type:** `unknown`  
**Description:** Stops the rain environment effect.  
**Source:** `daynight.lgc`

### Time1In100

**Signature:** `Time1In100()`  
**Return type:** `unknown`  
**Description:** Returns one at a throttled cadence of roughly one call per 128 milliseconds.  
**Source:** `basefunctions.lgc`

### Time1In50

**Signature:** `Time1In50()`  
**Return type:** `unknown`  
**Description:** Returns one at a throttled cadence of roughly one call per 64 milliseconds.  
**Source:** `basefunctions.lgc`

### Tornado

**Signature:** `Tornado()`  
**Return type:** `unknown`  
**Description:** Creates and updates a tornado-like environmental unit.  
**Source:** `civil.lgc`

### TrainHasUnitVid

**Signature:** `TrainHasUnitVid(int train, int type)`  
**Return type:** `unknown`  
**Description:** Checks whether a train contains an engine of the requested VID and stores the matching unit handle in TrainHasUnitVid_unit.  
**Source:** `ai_functions.lgc`

### TrainHasWoundedRepair

**Signature:** `TrainHasWoundedRepair(int train)`  
**Return type:** `unknown`  
**Description:** Returns the handle of a repair unit in the train when its hit points are below 50 percent, or zero when none is found.  
**Source:** `ai_functions.lgc`

### TrainHasWoundedUnit

**Signature:** `TrainHasWoundedUnit(int train)`  
**Return type:** `unknown`  
**Description:** Counts train engines whose remaining hit points are below 50 percent.  
**Source:** `ai_functions.lgc`

### UnitCountInTrain

**Signature:** `UnitCountInTrain(int train)`  
**Return type:** `unknown`  
**Description:** Counts the engines in a train. Factory VID 102 is treated as having no train units.  
**Source:** `ai_functions.lgc`

### UnitInTrain

**Signature:** `UnitInTrain(int unit, int train)`  
**Return type:** `unknown`  
**Description:** Checks whether a unit belongs to a train. The helper special-cases factory VID 102.  
**Source:** `ai_functions.lgc`

## Sprite iteration and lookup

### FindNearestSprite

**Signature:** `FindNearestSprite(int type, int x, int y, int radius)`  
**Return type:** `int`  
**Description:** Finds the nearest sprite matching a GETSPRITE_* filter within the given world-space radius. Returns zero when none is found.  
**Source:** `export.lgc` · **ID:** `72`

### FirstInBox

**Signature:** `FirstInBox(int left, int top, int right, int bottom)`  
**Return type:** `int`  
**Description:** Starts iteration over map objects inside a world-coordinate rectangle. Pair with NextInBox().  
**Source:** `export.lgc` · **ID:** `74`

### FirstSprite

**Signature:** `FirstSprite()`  
**Return type:** `int`  
**Description:** Starts a full-map sprite iteration. This can be very slow on busy maps; prefer FirstUnit() or FirstInBox() when possible.  
**Source:** `export.lgc` · **ID:** `76`

### FirstUnit

**Signature:** `FirstUnit(int typeunit)`  
**Return type:** `int`  
**Description:** Starts iteration over units matching the supplied sprite-type mask. Pair with NextUnit().  
**Source:** `export.lgc` · **ID:** `68`

### GetSprite

**Signature:** `GetSprite(int type, int x, int y)`  
**Return type:** `int`  
**Description:** Finds a sprite intersecting the supplied world coordinates and matching a GETSPRITE_* filter.  
**Source:** `export.lgc` · **ID:** `70`

### GetSpriteScr

**Signature:** `GetSpriteScr(int type, int scr_x, int scr_y)`  
**Return type:** `int`  
**Description:** Finds a sprite intersecting screen coordinates and matching a GETSPRITE_* filter.  
**Source:** `export.lgc` · **ID:** `71`

### NextInBox

**Signature:** `NextInBox()`  
**Return type:** `int`  
**Description:** Advances the rectangle iterator and returns the next matching object handle.  
**Source:** `export.lgc` · **ID:** `75`

### NextSprite

**Signature:** `NextSprite()`  
**Return type:** `int`  
**Description:** Advances the full-map sprite iterator started by FirstSprite().  
**Source:** `export.lgc` · **ID:** `77`

### NextUnit

**Signature:** `NextUnit()`  
**Return type:** `int`  
**Description:** Advances the active unit iterator and returns the next matching unit handle, or zero when iteration ends.  
**Source:** `export.lgc` · **ID:** `69`

## UI and input

### GetInputState

**Signature:** `GetInputState()`  
**Return type:** `int`  
**Description:** Returns the current input-state bit mask. See INPUT_* constants.  
**Source:** `export.lgc` · **ID:** `115`

### GetInputX

**Signature:** `GetInputX()`  
**Return type:** `int`  
**Description:** Returns the mouse X coordinate in world/map coordinates.  
**Source:** `export.lgc` · **ID:** `109`

### GetInputY

**Signature:** `GetInputY()`  
**Return type:** `int`  
**Description:** Returns the mouse Y coordinate in world/map coordinates.  
**Source:** `export.lgc` · **ID:** `110`

### GetKey

**Signature:** `GetKey()`  
**Return type:** `int`  
**Description:** Returns the code of the currently pressed key. See the VK_* constants.  
**Source:** `export.lgc` · **ID:** `111`

### GetScrollType

**Signature:** `GetScrollType()`  
**Return type:** `int`  
**Description:** Returns the active map scrolling mode.  
**Source:** `export.lgc` · **ID:** `118`

### MenuAction

**Signature:** `MenuAction(int nvid, int ndir, int action, int var1 = 0, int var2 = 0, int var3 = 0)`  
**Return type:** `void`  
**Description:** Executes an action for menu items matching the supplied VID and direction. Direction 999999 matches any direction.  
**Source:** `export.lgc` · **ID:** `106`

### MenuCreate

**Signature:** `MenuCreate(int nvid, int ndir, int x, int y, int z)`  
**Return type:** `int`  
**Description:** Creates a menu sprite at the supplied coordinates and returns its sprite handle.  
**Source:** `export.lgc` · **ID:** `107`

### MenuFind

**Signature:** `MenuFind(int nvid, int ndir)`  
**Return type:** `int`  
**Description:** Finds a menu item by VID and direction. A direction of 999999 matches any direction.  
**Source:** `export.lgc` · **ID:** `101`

### MenuLClick

**Signature:** `MenuLClick()`  
**Return type:** `int`  
**Description:** Reports whether the left mouse button was pressed over a menu item.  
**Source:** `export.lgc` · **ID:** `108`

### MenuLoad

**Signature:** `MenuLoad(string filename)`  
**Return type:** `void`  
**Description:** Loads menu definitions from a file.  
**Source:** `export.lgc` · **ID:** `102`

### MenuNDirUnderCursor

**Signature:** `MenuNDirUnderCursor()`  
**Return type:** `int`  
**Description:** Returns the direction value of the menu item currently under the cursor.  
**Source:** `export.lgc` · **ID:** `105`

### MenuNVidUnderCursor

**Signature:** `MenuNVidUnderCursor()`  
**Return type:** `int`  
**Description:** Returns the VID of the menu item currently under the cursor.  
**Source:** `export.lgc` · **ID:** `104`

### MenuRClick

**Signature:** `MenuRClick()`  
**Return type:** `int`  
**Description:** Reports whether the right mouse button was pressed over a menu item.  
**Source:** `export.lgc` · **ID:** `127`

### MenuRelease

**Signature:** `MenuRelease()`  
**Return type:** `void`  
**Description:** Removes all currently loaded menu items.  
**Source:** `export.lgc` · **ID:** `103`

### ScreenX

**Signature:** `ScreenX()`  
**Return type:** `int`  
**Description:** Returns the width of the game viewport in pixels.  
**Source:** `export.lgc` · **ID:** `119`

### ScreenY

**Signature:** `ScreenY()`  
**Return type:** `int`  
**Description:** Returns the height of the game viewport in pixels.  
**Source:** `export.lgc` · **ID:** `120`

### SetCursor

**Signature:** `SetCursor(int type)`  
**Return type:** `void`  
**Description:** Changes the game cursor. See CURSOR_* constants.  
**Source:** `export.lgc` · **ID:** `113`

### SetMouseClick

**Signature:** `SetMouseClick(int firstOrsecond, int vk_button)`  
**Return type:** `void`  
**Description:** Assigns a virtual mouse button to the first or second game mouse input slot. Commonly used with INPUT_FIRST, INPUT_SECOND and VK_* constants.  
**Source:** `export.lgc` · **ID:** `128`

### SetPosition

**Signature:** `SetPosition(int x, int y)`  
**Return type:** `void`  
**Description:** Moves the map viewport to the supplied world coordinates.  
**Source:** `export.lgc` · **ID:** `116`

### SetScrollType

**Signature:** `SetScrollType(int type)`  
**Return type:** `void`  
**Description:** Sets the map scrolling mode using SCROLL_* flags.  
**Source:** `export.lgc` · **ID:** `117`

### SetSelectUnit

**Signature:** `SetSelectUnit(int flag)`  
**Return type:** `void`  
**Description:** Enables or disables selecting units for direct control. Pass zero to disable selecting new units.  
**Source:** `export.lgc` · **ID:** `121`

### SetStateBar

**Signature:** `SetStateBar(int flag)`  
**Return type:** `void`  
**Description:** Shows or hides the game's state bar.  
**Source:** `export.lgc` · **ID:** `122`

### ToScreenX

**Signature:** `ToScreenX(int x)`  
**Return type:** `unknown`  
**Description:** Converts a world X coordinate to a screen X coordinate.  
**Source:** `export.lgc` · **ID:** `125`

### ToScreenY

**Signature:** `ToScreenY(int y, int z = 0)`  
**Return type:** `unknown`  
**Description:** Converts world Y and optional Z coordinates to a screen Y coordinate.  
**Source:** `export.lgc` · **ID:** `126`

## Unit and action API

### Action

**Signature:** `Action(int unit, int act, int var1 = 0, int var2 = 0, int var3 = 0)`  
**Return type:** `int`  
**Description:** Executes an ACT_* operation on a unit. The meaning of var1, var2 and var3 depends on the selected action. Returns the action-specific result.  
**Source:** `export.lgc` · **ID:** `79`

### AddCommand

**Signature:** `AddCommand(int unit, int act, int var1 = 0, int var2 = 0, int var3 = 0)`  
**Return type:** `void`  
**Description:** Appends an action to a unit's command queue. Arguments are interpreted according to the selected ACT_* operation.  
**Source:** `export.lgc` · **ID:** `82`

### DirectionTo

**Signature:** `DirectionTo(int unit, int x, int y)`  
**Return type:** `int`  
**Description:** Returns the direction from a unit to a world-coordinate point.  
**Source:** `export.lgc` · **ID:** `90`

### GetAnimation

**Signature:** `GetAnimation(int unit)`  
**Return type:** `int`  
**Description:** Returns the animation index currently played by the unit.  
**Source:** `export.lgc` · **ID:** `89`

### GetCommands

**Signature:** `GetCommands(int unit)`  
**Return type:** `string`  
**Description:** Returns the serialized command string of a vehicle.  
**Source:** `export.lgc` · **ID:** `96`

### GetDirection

**Signature:** `GetDirection(int unit)`  
**Return type:** `int`  
**Description:** Returns a unit's current direction index.  
**Source:** `export.lgc` · **ID:** `88`

### GetUnitVid

**Signature:** `GetUnitVid(int unit)`  
**Return type:** `int`  
**Description:** Returns the game object VID associated with a sprite handle.  
**Source:** `export.lgc` · **ID:** `83`

### GetX

**Signature:** `GetX(int unit)`  
**Return type:** `int`  
**Description:** Returns a unit's world X coordinate.  
**Source:** `export.lgc` · **ID:** `85`

### GetY

**Signature:** `GetY(int unit)`  
**Return type:** `int`  
**Description:** Returns a unit's world Y coordinate.  
**Source:** `export.lgc` · **ID:** `86`

### GetZ

**Signature:** `GetZ(int unit)`  
**Return type:** `int`  
**Description:** Returns a unit's world Z coordinate.  
**Source:** `export.lgc` · **ID:** `87`

### ReCalcGridZ

**Signature:** `ReCalcGridZ(int unit)`  
**Return type:** `void`  
**Description:** Recalculates the unit's Z grid using its current dimensions.  
**Source:** `export.lgc` · **ID:** `81`

### SetCommands

**Signature:** `SetCommands(int unit, string com)`  
**Return type:** `void`  
**Description:** Replaces a vehicle's command list from a serialized command string.  
**Source:** `export.lgc` · **ID:** `97`

### SizeTo

**Signature:** `SizeTo(int unit, int x, int y)`  
**Return type:** `int`  
**Description:** Returns the distance from a unit to a world-coordinate point.  
**Source:** `export.lgc` · **ID:** `80`
