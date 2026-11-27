# LGC Functions Reference

Functions declared by the engine API and implemented in the transitive standard `header.lgc` include tree.

**Entries:** 452. Parameter names and types, optionality, signatures, return types and English descriptions are recorded explicitly. `unknown` is retained only when supplied declarations and implementations do not establish a reliable type.

## `ai_default_event.lgc`

99 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `AddDengu` | `void` | `AddDengu()` | Adds one unit of money to player army 0; the standard AI event script calls it from several event hooks. |
| `bear` | `void` | `bear(int unit)` | Handles the white bear that emerges from the water. |
| `BuildingCapture` | `void` | `BuildingCapture(int building)` | Default building-capture event hook; forwards the captured building to `dBuildingCapture`. |
| `DepoAttacked` | `void` | `DepoAttacked(int unit, int enemy)` | Default depot-attacked event hook; forwards the depot and attacking unit to `dDepoAttacked`. |
| `engine_death` | `void` | `engine_death(int unit)` | Handles the death of an engine unit in the standard AI event system. |
| `F005_15` | `void` | `F005_15(int unit)` | Standard game event handler `F005_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F013_14` | `void` | `F013_14(int unit)` | Default event handler for the beginning of the burning-unit sequence. |
| `F020_15` | `void` | `F020_15(int unit)` | Standard game event handler `F020_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F025_15` | `void` | `F025_15(int unit)` | Standard game event handler `F025_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F030_15` | `void` | `F030_15(int unit)` | Standard game event handler `F030_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F035_15` | `void` | `F035_15(int unit)` | Standard game event handler `F035_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F050_15` | `void` | `F050_15(int unit)` | Standard game event handler `F050_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F055_15` | `void` | `F055_15(int unit)` | Standard game event handler `F055_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F057_14` | `void` | `F057_14(int unit)` | Standard game event handler `F057_14` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F060_15` | `void` | `F060_15(int unit)` | Standard game event handler `F060_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F062_15` | `void` | `F062_15(int unit)` | Standard game event handler `F062_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F070_0` | `void` | `F070_0(int unit)` | Handles the behaviour of the military robot unit. |
| `F070_2` | `void` | `F070_2(int unit)` | Handles movement of the military robot unit. |
| `F075_15` | `void` | `F075_15(int unit)` | Standard game event handler `F075_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F080_15` | `void` | `F080_15(int unit)` | Standard game event handler `F080_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F082_15` | `void` | `F082_15(int unit)` | Standard game event handler `F082_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F084_15` | `void` | `F084_15(int unit)` | Handles the explosion of a projectile carrying a parachuting robot. |
| `F084_3` | `void` | `F084_3(int unit)` | Handles the launch of a projectile carrying a parachuting robot. |
| `F085_15` | `void` | `F085_15(int unit)` | Standard game event handler `F085_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F086_0` | `void` | `F086_0(int unit)` | Handles the active behaviour of a mine. |
| `F086_14` | `void` | `F086_14(int unit)` | Handles mine creation. |
| `F086_15` | `void` | `F086_15(int unit)` | Handles the detonation of a player mine. |
| `F086_DESTROY` | `void` | `F086_DESTROY(int unit)` | Handles mine destruction. |
| `F090_15` | `void` | `F090_15(int unit)` | Standard game event handler `F090_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F094_14` | `void` | `F094_14(int unit)` | Standard game event handler `F094_14` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F095_15` | `void` | `F095_15(int unit)` | Standard game event handler `F095_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F102_14` | `void` | `F102_14(int unit)` | Handles depot creation. |
| `F102_15` | `void` | `F102_15(int unit)` | Handles depot destruction. |
| `F104_14` | `void` | `F104_14(int unit)` | Handles workshop creation. |
| `F104_15` | `void` | `F104_15(int unit)` | Handles workshop destruction. |
| `F157_9` | `void` | `F157_9(int fonar)` | Handles the lantern ignition and extinguishing sequence. |
| `F158_9` | `void` | `F158_9(int fonar)` | Standard game event handler `F158_9` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F162_0` | `void` | `F162_0(int building)` | Handles capture behaviour for forts and factories. |
| `F165_0` | `void` | `F165_0(int building)` | Standard game event handler `F165_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F165_1` | `void` | `F165_1(int building)` | Standard game event handler `F165_1` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F169_8` | `void` | `F169_8(int unit)` | Standard game event handler `F169_8` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F201_15` | `void` | `F201_15(int unit)` | Standard game event handler `F201_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F202_15` | `void` | `F202_15(int unit)` | Standard game event handler `F202_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F203_15` | `void` | `F203_15(int unit)` | Standard game event handler `F203_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F256_15` | `void` | `F256_15(int unit)` | Standard game event handler `F256_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F262_15` | `void` | `F262_15(int unit)` | Standard game event handler `F262_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F263_15` | `void` | `F263_15(int unit)` | Standard game event handler `F263_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F268_9` | `void` | `F268_9(int unit)` | Standard game event handler `F268_9` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F273_14` | `void` | `F273_14(int unit)` | Standard game event handler `F273_14` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F290_0` | `void` | `F290_0(int vulcan)` | Standard game event handler `F290_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F290_14` | `void` | `F290_14(int vulcan)` | Standard game event handler `F290_14` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F340_0` | `void` | `F340_0(int unit)` | Handles the first phase of the large rocket sequence. |
| `F342_15` | `void` | `F342_15(int unit)` | Standard game event handler `F342_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F345_15` | `void` | `F345_15(int unit)` | Standard game event handler `F345_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F409_15` | `void` | `F409_15(int unit)` | Handles the Golem explosion event. |
| `F409_7` | `void` | `F409_7(int unit)` | Handles the Golem attack-damage event. |
| `F416_9` | `void` | `F416_9(int unit)` | Standard game event handler `F416_9` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F422_9` | `void` | `F422_9(int unit)` | Standard game event handler `F422_9` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F431_15` | `void` | `F431_15(int unit)` | Standard game event handler `F431_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F505_0` | `void` | `F505_0(int unit)` | Handles the white-bear generator that creates bears emerging from water. |
| `F506_14` | `void` | `F506_14(int unit)` | Handles the ending sequence for burning units and the firefly generator. |
| `F507_0` | `void` | `F507_0(int unit)` | Standard game event handler `F507_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F507_2` | `void` | `F507_2(int unit)` | Standard game event handler `F507_2` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F511_0` | `void` | `F511_0(int unit)` | Standard game event handler `F511_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F511_9` | `void` | `F511_9(int unit)` | Standard game event handler `F511_9` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F512_0` | `void` | `F512_0(int unit)` | Standard game event handler `F512_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F512_9` | `void` | `F512_9(int unit)` | Standard game event handler `F512_9` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F513_0` | `void` | `F513_0(int unit)` | Standard game event handler `F513_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F513_9` | `void` | `F513_9(int unit)` | Standard game event handler `F513_9` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F514_0` | `void` | `F514_0(int unit)` | Standard game event handler `F514_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F514_9` | `void` | `F514_9(int unit)` | Standard game event handler `F514_9` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F517_2` | `void` | `F517_2(int unit)` | Standard game event handler `F517_2` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F518_0` | `void` | `F518_0(int unit)` | Standard game event handler `F518_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F518_2` | `void` | `F518_2(int unit)` | Standard game event handler `F518_2` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F518_9` | `void` | `F518_9(int unit)` | Standard game event handler `F518_9` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F519_0` | `void` | `F519_0(int unit)` | Standard game event handler `F519_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F519_2` | `void` | `F519_2(int unit)` | Standard game event handler `F519_2` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F519_9` | `void` | `F519_9(int unit)` | Standard game event handler `F519_9` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F521_0` | `void` | `F521_0(int unit)` | Standard game event handler `F521_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F523_0` | `void` | `F523_0(int unit)` | Standard game event handler `F523_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F533_0` | `void` | `F533_0(int unit)` | Standard game event handler `F533_0` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F545_14` | `void` | `F545_14(int unit)` | Standard game event handler `F545_14` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F545_15` | `void` | `F545_15(int unit)` | Standard game event handler `F545_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F545_7` | `void` | `F545_7(int unit)` | Standard game event handler `F545_7` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F546_15` | `void` | `F546_15(int unit)` | Standard game event handler `F546_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F548_15` | `void` | `F548_15(int unit)` | Standard game event handler `F548_15` from `ai_default_event.lgc`. The event-specific behaviour is implemented in the script body. |
| `F832_9` | `void` | `F832_9(int unit)` | Handles opening the gear pedestal and its celebration effect. |
| `F833_9` | `void` | `F833_9(int unit)` | Handles closing the gear pedestal and its celebration effect. |
| `MasterDestroy` | `void` | `MasterDestroy(int master)` | Standard game event callback invoked when a workshop is destroyed. |
| `MineBlast` | `void` | `MineBlast(int mine)` | Standard game event callback invoked when a mine detonates. |
| `MineRemove` | `void` | `MineRemove(int mine)` | Standard game event callback invoked when a mine is removed. |
| `TrainArrive` | `void` | `TrainArrive(int train)` | Default train-arrival event hook; reserves the arriving train so it remains available for later AI dispatch. |
| `TrainAttacked` | `void` | `TrainAttacked(int train, int enemy)` | Default train-attacked event hook; forwards the train and attacking unit to the inherited handler. |
| `TrainDamage` | `void` | `TrainDamage(int train)` | Default train-damage event hook forwarded to the inherited damage handler. |
| `TrainDestroyPower` | `void` | `TrainDestroyPower(int train)` | Default train event hook forwarded when a train loses power. |
| `TrainNotAmmo` | `void` | `TrainNotAmmo(int train)` | Default train event hook invoked when ammunition is depleted or critically low. |
| `TrainNotPower` | `void` | `TrainNotPower(int train)` | Default train event hook invoked when the train has no power. |
| `TrainSplit` | `void` | `TrainSplit(int train1, int train2)` | Default train-split event hook invoked when a train separates into two trains. |
| `weels_death` | `void` | `weels_death(int unit)` | Handles the death event for the corresponding wheel unit. |

## `ai_default_event_inherit.lgc`

20 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `dBuildingCapture` | `void` | `dBuildingCapture(int building)` | Default building-capture handler for a captured building. |
| `dDepoAttacked` | `void` | `dDepoAttacked(int depo, int enemy)` | Default depot event callback invoked when a depot is attacked. |
| `dDepoBirth` | `void` | `dDepoBirth(int depo)` | Default depot event callback invoked when a depot is created or restored. |
| `dDepoDestroy` | `void` | `dDepoDestroy(int depo)` | Default depot event callback invoked when a depot is destroyed. |
| `dDepoFree` | `void` | `dDepoFree(int depo)` | Default depot event callback invoked when a depot becomes idle. |
| `dEnemyLinked` | `void` | `dEnemyLinked(int train)` | Default event handler invoked when an enemy train becomes linked. |
| `dMasterDestroy` | `void` | `dMasterDestroy(int master)` | Default workshop event callback invoked when a workshop is destroyed. |
| `dMineBlast` | `void` | `dMineBlast(int mine)` | Default mine event callback invoked when a mine detonates. |
| `dMineRemove` | `void` | `dMineRemove(int mine)` | Default mine event callback invoked when a mine is disarmed or removed. |
| `dTrainArrive` | `void` | `dTrainArrive(int train)` | Default train event callback invoked when a train reaches its destination. |
| `dTrainAttacked` | `void` | `dTrainAttacked(int train, int enemy)` | Default train event callback invoked when a train is attacked. |
| `dTrainCreated` | `void` | `dTrainCreated(int train)` | Default train event callback invoked immediately after a train is created. |
| `dTrainDamage` | `void` | `dTrainDamage(int train)` | Default train event callback invoked when the train is critically damaged. |
| `dTrainDestroy` | `void` | `dTrainDestroy(int train)` | Default train event callback invoked when a train is completely destroyed. |
| `dTrainDestroyPower` | `void` | `dTrainDestroyPower(int train)` | Default train event handler invoked when the train loses its power source. |
| `dTrainNotAmmo` | `void` | `dTrainNotAmmo(int train)` | Default train event callback invoked when the train has less than ten percent ammunition remaining. |
| `dTrainNotPower` | `void` | `dTrainNotPower(int train)` | Default train event handler invoked when the train has no power. |
| `dTrainSplit` | `void` | `dTrainSplit(int train1, int train2)` | Default train event callback invoked when a train is split into separate parts. |
| `dUnitCreated` | `void` | `dUnitCreated(int unit)` | Default event handler invoked when a unit is created. |
| `dUnitDestroy` | `void` | `dUnitDestroy(int unit)` | Default event handler invoked when a unit is destroyed. |

## `ai_events.lgc`

9 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `DepoBirth` | `void` | `DepoBirth(int depo)` | Standard game event callback invoked when a depot is created. |
| `DepoDestroy` | `void` | `DepoDestroy(int depo)` | Standard game event callback invoked when a depot is destroyed. |
| `DepoFree` | `void` | `DepoFree(int depo)` | Standard game event callback invoked when a depot becomes idle. |
| `EnemyLinked` | `void` | `EnemyLinked(int train)` | Standard game event callback invoked when an enemy train is linked. |
| `TrainClash` | `void` | `TrainClash(int train1, int train2)` | Train-collision event callback invoked when two trains collide. |
| `TrainCreated` | `void` | `TrainCreated(int train)` | Standard game event callback invoked when a train is created. |
| `TrainDestroy` | `void` | `TrainDestroy(int train)` | Standard game event callback invoked when a train is destroyed. |
| `UnitCreated` | `void` | `UnitCreated(int unit)` | Standard game event callback invoked when a unit is created. |
| `UnitDestroy` | `void` | `UnitDestroy(int unit)` | Standard game event callback invoked when a unit is destroyed. |

## `ai_functions.lgc`

21 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `ArmyWeightCenter` | `void` | `ArmyWeightCenter(int army)` | Calculates the army centre of mass and stores its X/Y coordinates in the shared `WeightX` and `WeightY` variables. |
| `BuildTrain` | `void` | `BuildTrain(int depo, unknown train)` | Builds a train at a depot from the selected train-formation definition. |
| `CountArmyUnit` | `unknown` | `CountArmyUnit(int army)` | Counts units owned by the specified army. |
| `DeactiveTrain` | `void` | `DeactiveTrain(int train)` | Marks the specified train as inactive in AI train management. |
| `FortCaptured` | `unknown` | `FortCaptured(int army)` | Int FortCaptured_unit=0; |
| `GetLongestTrain` | `int` | `GetLongestTrain(int army)` | Returns the longest train belonging to the specified army. |
| `IsTrainAtWeaponRadius` | `int` | `IsTrainAtWeaponRadius(int train)` | Checks whether the train is within the weapon radius used by the AI combat logic. |
| `IsTrainAtWeaponRadiusEx` | `int` | `IsTrainAtWeaponRadiusEx(int train)` | Checks the train against the extended weapon-radius rules and the extended train state. |
| `MoveTrain` | `void` | `MoveTrain(int train, int x, int y, int behave)` | Moves a train using the selected behaviour mode. Use `TRAINBEHAVE_*` to select whether it avoids combat, fights, or pursues enemies. |
| `MyPatrolTrain` | `void` | `MyPatrolTrain(int train, int x, int y, int beh_patrol)` | Orders a train to patrol the specified point using the requested patrol behaviour mode. |
| `NearFort` | `unknown` | `NearFort(int train, int army)` | Finds or checks a nearby fort associated with the specified army. |
| `NearTrain` | `int` | `NearTrain(int train, int NearTrain_army)` | Finds a train near the supplied train for the selected army. |
| `PatrolTrain` | `void` | `PatrolTrain(int train, int x, int y, int beh_move, int beh_patrol)` | Orders a train to patrol a point using separate movement and patrol behaviour modes. |
| `RandomTrain` | `unknown` | `RandomTrain(int RandomTrain_army)` | Selects a random train belonging to the specified army. |
| `SetPositionCenter` | `void` | `SetPositionCenter(int x, int y)` | Sets the map position used as the centre point for the supplied coordinates. |
| `SizeBetween` | `int` | `SizeBetween(int unit1, int unit2)` | Returns the distance between two units. |
| `TrainHasUnitVid` | `unknown` | `TrainHasUnitVid(int train, int type)` | Returns whether the specified train contains a unit matching the requested type/VID selector. |
| `TrainHasWoundedRepair` | `unknown` | `TrainHasWoundedRepair(int train)` | Checks whether the train contains a wounded unit that requires a repair wagon. |
| `TrainHasWoundedUnit` | `unknown` | `TrainHasWoundedUnit(int train)` | Checks whether the train contains a wounded unit. |
| `UnitCountInTrain` | `unknown` | `UnitCountInTrain(int train)` | Returns the number of units/engines in the supplied train. |
| `UnitInTrain` | `int` | `UnitInTrain(int unit, int train)` | Checks whether the specified unit belongs to the supplied train. |

## `basefunctions.lgc`

25 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `CreateFly` | `void` | `CreateFly(int nvid, int army, int z)` | Creates a fly with the specified NVID and army at the given Z coordinate. |
| `FReadText` | `string` | `FReadText(int f)` | Reads a text value from the supplied open file handle. |
| `GetDifficulty` | `unknown` | `GetDifficulty()` | Returns the current game difficulty setting. |
| `GetHoursByMSec` | `int` | `GetHoursByMSec(int msec)` | Converts a millisecond duration to whole hours. |
| `GetMinutesByMSec` | `unknown` | `GetMinutesByMSec(int msec)` | Converts a millisecond duration to whole minutes. |
| `GetRegDefaultPlayer` | `string` | `GetRegDefaultPlayer()` | Reads the default player selection from the registry. |
| `GetRegStateBar` | `unknown` | `GetRegStateBar()` | Reads the saved state-bar setting from the registry. |
| `GetSecondsByMSec` | `unknown` | `GetSecondsByMSec(int msec)` | Converts a millisecond duration to whole seconds. |
| `MoveZ` | `void` | `MoveZ(int unit, int x, int y)` | Moves the specified unit to the given map X/Y coordinates while accounting for ground height. |
| `NoArmyUnits` | `unknown` | `NoArmyUnits(int army)` | Returns the number of units belonging to the specified army. |
| `OneTimeIn5Second` | `int` | `OneTimeIn5Second()` | Returns a periodic event approximately once every five seconds. |
| `OneTimeInHalfSecond` | `int` | `OneTimeInHalfSecond()` | Returns a periodic event approximately twice per second. |
| `OneTimeInNSecond1` | `int` | `OneTimeInNSecond1(int N)` | Returns a one-shot timer event at approximately one occurrence per N seconds. This is the first of three independent per-map timer instances. |
| `OneTimeInNSecond2` | `int` | `OneTimeInNSecond2(int N)` | Returns a one-shot timer event at approximately one occurrence per N seconds. This is the second of three independent per-map timer instances. |
| `OneTimeInNSecond3` | `int` | `OneTimeInNSecond3(int N)` | Returns a one-shot timer event at approximately one occurrence per N seconds. This is the third of three independent per-map timer instances. |
| `OneTimeInQuarterSecond` | `int` | `OneTimeInQuarterSecond()` | Returns a periodic event approximately four times per second. |
| `OneTimeInSecond` | `int` | `OneTimeInSecond()` | Returns 1 approximately once per second. Repeated calls during the same game tick return the same result as the first call in that tick. |
| `PatrolEngineZ` | `void` | `PatrolEngineZ(int unit, int x, int y)` | Orders the specified unit to patrol the map point using ground-aware Z positioning. |
| `PrintObjectives` | `void` | `PrintObjectives()` | Displays the current level objectives. |
| `PrintTextAtCenter` | `int` | `PrintTextAtCenter(int x, int y, int z, string s, int font)` | Draws the supplied text centred at the specified map coordinates. |
| `PrintTextAtCenter5x5` | `int` | `PrintTextAtCenter5x5(int x, int y, int z, string s, int font)` | Draws the supplied text centred using the compact 5x5 text layout. |
| `SetRegStateBar` | `void` | `SetRegStateBar(int state)` | Stores the current state-bar setting in the registry. |
| `SizeToZ` | `int` | `SizeToZ(int unit, int x, int y)` | Returns the ground-aware distance from a unit to the specified map point. |
| `Time1In100` | `int` | `Time1In100()` | Returns the periodic timing pulse used by the day/night cycle at the 1-in-100 interval. |
| `Time1In50` | `int` | `Time1In50()` | Returns the periodic timing pulse used by the day/night cycle at the 1-in-50 interval. |

## `Captures.lgc`

2 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `LDepoCapture` | `void` | `LDepoCapture(int capture_x, int capture_y, int size_tocapture, int army_tocapture)` | Runs depot-capture logic for the target army around the supplied map position and capture radius. |
| `LMasterCapture` | `void` | `LMasterCapture(int capture_x, int capture_y, int size_tocapture, int army_tocapture)` | Runs workshop-capture logic for the target army around the supplied map position and capture radius. |

## `civil.lgc`

5 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `CivilPatrol` | `void` | `CivilPatrol()` | Updates the civilian train patrol system. |
| `Muxi` | `void` | `Muxi(int nvid, int count)` | Spawns a fly of the specified NVID while fewer than the requested count are present on the map. |
| `ResendCivilPatrolEngine` | `void` | `ResendCivilPatrolEngine()` | Re-adds the current civilian patrol engine to the patrol-management list. |
| `SendCivilPatrolEngine` | `void` | `SendCivilPatrolEngine()` | Adds or sends a civilian patrol engine into the patrol-management system. |
| `Tornado` | `void` | `Tornado()` | Updates or spawns the standard tornado effect. |

## `daynight.lgc`

8 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `ChangeFonarState` | `void` | `ChangeFonarState()` | Changes the current lantern/firefly lighting state. |
| `GammaIntensive_print` | `void` | `GammaIntensive_print()` | Draws the current intensive-gamma status text. |
| `GetGammaIntensive` | `unknown` | `GetGammaIntensive(int gamma)` | Returns the configured intensive-gamma value for the supplied gamma mode. |
| `Rain` | `void` | `Rain()` | Updates the standard rain and day/night environment state. |
| `SetArmyVid` | `void` | `SetArmyVid(int nvid, int army)` | Changes the army assignment of objects with the specified NVID. |
| `SetDayNightGamma` | `void` | `SetDayNightGamma()` | Updates gamma according to the current day/night phase. |
| `StartRain` | `void` | `StartRain()` | Starts the rain effect. |
| `StopRain` | `void` | `StopRain()` | Stops the rain effect. |

## `debug_functions.lgc`

1 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `PrintTime` | `void` | `PrintTime()` | Prints a formatted representation of the current game time for debugging. |

## `dokeys.lgc`

2 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `DoKeys` | `void` | `DoKeys()` | Processes configured keyboard shortcuts and related debug controls. |
| `PrintDebug` | `void` | `PrintDebug(string s)` | Displays the supplied debug string in the developer/debug overlay. |

## `environmenttact.lgc`

6 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `Clouds` | `void` | `Clouds()` | Updates or spawns the standard cloud environment objects. |
| `EndQuake` | `void` | `EndQuake()` | Stops the current earthquake effect and resets its state. |
| `EnvironmentTact` | `void` | `EnvironmentTact()` | Updates environmental effects such as weather, wind and quakes. |
| `Meteorites` | `void` | `Meteorites()` | Spawns meteorites across the map at recurring intervals. |
| `Quake` | `void` | `Quake(int time, int sound)` | Starts a screen/map earthquake for the specified duration in milliseconds, with the selected sound setting. |
| `SetWindEx` | `void` | `SetWindEx(int w_speed, int w_dir)` | Sets wind speed and direction using the extended environment helper. |

## `explode.lgc`

1 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `Explode` | `void` | `Explode()` | Creates the scripted explosion effect. |

## `export.lgc`

136 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `Action` | `int` | `Action(int unit, int act, int var1 = 0, int var2 = 0, int var3 = 0)` | Executes an action on a unit. Optional parameters provide action-specific values. |
| `AddCommand` | `unknown` | `AddCommand(int unit, int act, int var1 = 0, int var2 = 0, int var3 = 0)` | Queues an action for a unit. Optional arguments carry action-specific values consumed by the selected action opcode. |
| `AddUnitLimit` | `unknown` | `AddUnitLimit(int army, int engine_nvid, int value)` | Adds, updates or removes a per-army unit creation limit. The source comments document 255 as a wildcard for all armies or all unit types, and -1 as removal of a matching limit. |
| `AskPlace` | `int` | `AskPlace(int vid, int x, int y, int z)` | Checks whether a unit with the requested VID can be placed at the specified map coordinates. Returns the unit that blocks placement when placement is not possible. |
| `BreakTrain` | `unknown` | `BreakTrain(int unit, int x, int y)` | Splits a train at the specified map position, using the supplied unit as the train reference. |
| `CalcStatistics` | `int` | `CalcStatistics(int begx, int begy, int endx, int endy, int stat)` | Calculates the selected army statistic for units inside the rectangle bounded by the supplied map coordinates. |
| `CanAttackEngine` | `int` | `CanAttackEngine(int engine, int enemy)` | Checks whether an engine can reach a position from which it can attack the specified enemy unit. |
| `CanMoveEngineTo` | `int` | `CanMoveEngineTo(int engine, int x, int y)` | Checks whether the specified engine can travel to the target map coordinates. |
| `ChangeZUnit` | `unknown` | `ChangeZUnit(int vid, int z)` | Changes the Z coordinate for objects with the specified VID. |
| `charat` | `char` | `charat(string str, int index)` | Returns the character at the requested string index. |
| `Cos` | `int` | `Cos(int angle)` | Returns the scaled cosine of an angle (angle range 0–256). |
| `CountGamma` | `int` | `CountGamma(int g1, int g2, int time)` | Calculates an intermediate gamma value between two endpoint values over the supplied time interval. |
| `CreateSprite` | `int` | `CreateSprite(int nvid, int x, int y, int z, int dir = 0, int parent = 0)` | Creates a sprite and returns its unique object identifier. |
| `CreateText` | `int` | `CreateText(int font_vid, int x, int y, int z, string text, int behave = 0)` | Creates a text sprite. The font VID must identify a sprite in the `B_TEXT` class. |
| `CreateTextFromFile` | `int` | `CreateTextFromFile(int font_vid, int x, int y, int z, string filename, int behave = 0)` | Creates a text sprite and loads its contents from a file. The font VID must identify a `B_TEXT` sprite; `ESCnn` markers in the file switch fonts. |
| `DelReg` | `unknown` | `DelReg(string path, string name)` | Deletes the named value from the specified registry path. |
| `Destroy` | `unknown` | `Destroy(int unit)` | Destroys the specified unit. |
| `DirectionTo` | `int` | `DirectionTo(int unit, int x, int y)` | Calculates the direction from a unit to the specified world point. |
| `Effect` | `unknown` | `Effect(int effect, int var1, int var2 = 0, int duration = 0)` | Starts an engine effect. Use the `EFF_*` constants to select the effect kind and its effect-specific parameters. |
| `Exec` | `unknown` | `Exec(string command)` | Launches an executable or command in Windows. |
| `Exit` | `unknown` | `Exit(string next_program = "")` | Exits the game to Windows and optionally starts the supplied next program. |
| `FClose` | `unknown` | `FClose(int file)` | Closes an open file handle. |
| `FCreate` | `int` | `FCreate(string filename)` | Creates a file and returns its unique file handle. |
| `FEof` | `int` | `FEof(int file)` | Returns whether the current file position has reached the end of the file. |
| `FindNearestSprite` | `int` | `FindNearestSprite(int type, int x, int y, int radius)` | Finds the nearest matching sprite within the specified world-coordinate radius. |
| `FirstInBox` | `int` | `FirstInBox(int left, int top, int right, int bottom)` | Starts iterating objects inside the specified world-coordinate rectangle. |
| `FirstSprite` | `int` | `FirstSprite()` | Starts iterating all sprites. This operation can be slow on large maps. |
| `FirstTrain` | `int` | `FirstTrain(int army)` | Returns the first train associated with the specified army for train iteration. |
| `FirstUnit` | `int` | `FirstUnit(int typeunit)` | Returns the first unit matching the specified unit type. |
| `Flagman` | `int` | `Flagman(int army)` | Returns the unit currently controlled by the player. |
| `FOpen` | `int` | `FOpen(string filename)` | Opens a file and returns its unique file handle. |
| `FRead` | `unknown` | `FRead(int file)` | Reads a value from the specified file handle. |
| `FWrite` | `unknown` | `FWrite(int file, int variable)` | Appends a value to the specified file handle. |
| `Genocide` | `unknown` | `Genocide(int nvid)` | Destroys every object with the specified NVID on the map. |
| `GetAnimation` | `int` | `GetAnimation(int unit)` | Returns the unit's current animation identifier. |
| `GetCommands` | `string` | `GetCommands(int unit)` | Returns the command string assigned to a unit. |
| `GetDefaultRegPath` | `string` | `GetDefaultRegPath()` | Returns the registry path configured for the game. |
| `GetDirection` | `int` | `GetDirection(int unit)` | Returns the unit's current direction. |
| `GetEffectState` | `int` | `GetEffectState(int eff)` | Returns the current effect-state value for the requested effect. |
| `GetGamma` | `int` | `GetGamma()` | InterpolateGamma(int g1, int g2, int time) |
| `GetGroundZ` | `int` | `GetGroundZ(int x, int y)` | Returns the ground height (Z coordinate) at the requested map position. |
| `GetInputState` | `int` | `GetInputState()` | Returns the current mouse/input state. |
| `GetInputX` | `int` | `GetInputX()` | Returns the current input cursor X coordinate. |
| `GetInputY` | `int` | `GetInputY()` | Returns the current input cursor Y coordinate. |
| `GetKey` | `int` | `GetKey()` | Returns the code of the currently pressed key. |
| `GetMoney` | `int` | `GetMoney(int army)` | Returns the current money balance of the specified army. |
| `GetNetInfo` | `int` | `GetNetInfo(int type)` | Returns a network-game value selected by a `NET_*` type, such as the player count, a player name, the connected-player count, or a kill-counter operation. |
| `GetNetInputState` | `int` | `GetNetInputState(int nplayer)` | Returns the network input state for the requested player or control. |
| `GetNetKey` | `int` | `GetNetKey(int nplayer)` | Returns the state of the requested network key. |
| `GetReg` | `string` | `GetReg(string path, string name, string def_value)` | Reads a string value from the Windows registry. |
| `GetScreenInputX` | `int` | `GetScreenInputX()` | Returns the input cursor X coordinate in screen space. |
| `GetScreenInputY` | `int` | `GetScreenInputY()` | Returns the input cursor Y coordinate in screen space. |
| `GetScrollType` | `int` | `GetScrollType()` | Returns the current screen-scrolling mode bit mask. Combine the value with `SCROLL_*` flags to inspect enabled scrolling behavior. |
| `GetSprite` | `int` | `GetSprite(int type, int x, int y)` | Finds a sprite at the specified world coordinates using a sprite filter. |
| `GETSPRITE_ARMY` | `int` | `GETSPRITE_ARMY(int army)` | Returns the sprite-search filter mask for the specified army. |
| `GETSPRITE_TYPE` | `int` | `GETSPRITE_TYPE(int type)` | Finds sprites whose sprite type matches the supplied type mask. |
| `GetSpriteScr` | `int` | `GetSpriteScr(int type, int scr_x, int scr_y)` | Finds a sprite at the specified screen coordinates using a sprite filter. |
| `GetStatistics` | `int` | `GetStatistics(int narmy, int stat)` | Returns the statistics value from the game engine. |
| `GetString` | `string` | `GetString(string section, string keyword)` | Reads a localized string from the specified section and key in strings.ini. |
| `GetTime` | `int` | `GetTime()` | Returns the current game time in milliseconds. |
| `GetUnitVid` | `int` | `GetUnitVid(int unit)` | Returns the visual identifier (VID) of the specified unit. |
| `GetVidData` | `int` | `GetVidData(int nvid, int type)` | Returns the selected VID property for the object identified by `nvid`. |
| `GetX` | `int` | `GetX(int unit)` | Returns the unit's world X coordinate. |
| `GetY` | `int` | `GetY(int unit)` | Returns the unit's world Y coordinate. |
| `GetZ` | `int` | `GetZ(int unit)` | Returns the unit's height (Z coordinate). |
| `IsPlayMovie` | `int` | `IsPlayMovie()` | Returns whether a movie is currently playing. |
| `IsPlayMusic` | `int` | `IsPlayMusic()` | Returns whether music is currently playing. |
| `itoa` | `string` | `itoa(int val)` | Converts an integer value to a string. |
| `Load` | `unknown` | `Load(string filename)` | Loads the specified map. |
| `Log` | `unknown` | `Log(string str)` | Writes the supplied string to the game script log. |
| `MapSizeX` | `int` | `MapSizeX()` | Returns the map width in map-coordinate units. |
| `MapSizeY` | `int` | `MapSizeY()` | Returns the map height in map-coordinate units. |
| `MenuAction` | `unknown` | `MenuAction(int nvid, int ndir, int action, int var1 = 0, int var2 = 0, int var3 = 0)` | Applies an action to matching menu objects. An `ndir` value of `999999` matches any direction. |
| `MenuCreate` | `int` | `MenuCreate(int nvid, int ndir, int x, int y, int z)` | Creates a menu object and returns its unique object identifier. |
| `MenuFind` | `int` | `MenuFind(int nvid, int ndir)` | Finds a menu object by NVID and direction. An `ndir` value of `999999` matches any direction. |
| `MenuLClick` | `int` | `MenuLClick()` | Reports a left-click over a menu object. |
| `MenuLoad` | `unknown` | `MenuLoad(string filename)` | Loads menu objects from the specified file. |
| `MenuNDirUnderCursor` | `int` | `MenuNDirUnderCursor()` | Returns the direction value of the menu button under the cursor. |
| `MenuNVidUnderCursor` | `int` | `MenuNVidUnderCursor()` | Returns the NVID of the menu button under the cursor. |
| `MenuRClick` | `int` | `MenuRClick()` | Reports a right-click over a menu object. |
| `MenuRelease` | `unknown` | `MenuRelease()` | Removes all currently loaded menu objects. |
| `MessageText` | `unknown` | `MessageText(string text, int x, int y)` | Displays a text message in the in-game message/state-bar area. |
| `NextInBox` | `int` | `NextInBox()` | Returns the next object in the current rectangle iteration. |
| `NextSprite` | `int` | `NextSprite()` | Returns the next sprite in the global sprite iteration. |
| `NextTrain` | `int` | `NextTrain()` | Returns the next train in the train-iteration sequence after the preceding `FirstTrain`/`NextTrain` call. |
| `NextUnit` | `int` | `NextUnit()` | Returns the next unit in the current unit iteration. |
| `PatrolEngine` | `unknown` | `PatrolEngine(int train, int x, int y)` | Orders a train to patrol between its current position and the specified map point. |
| `PatrolEngineToPoints` | `unknown` | `PatrolEngineToPoints(int train, int x, int y, int x2, int y2)` | Orders a train to patrol between the two specified map points. |
| `Pause` | `unknown` | `Pause(int flag)` | Pauses or resumes game processing according to the supplied flag. |
| `PlayMovie` | `unknown` | `PlayMovie(string filename)` | Starts playback of the specified movie file. |
| `PlayMusicFile` | `unknown` | `PlayMusicFile(string file, int loop = 1)` | Plays the specified music file. A non-zero loop argument enables looping. |
| `PlaySFX` | `unknown` | `PlaySFX(int nsfx)` | Plays the sound effect identified by the supplied SFX number. |
| `PlaySFXFromCoor` | `unknown` | `PlaySFXFromCoor(int nsfx, int x, int y)` | Plays a sound effect at the specified map coordinates (not screen coordinates). |
| `Printf` | `unknown` | `Printf(string format, int int_or_string)` | Formats text using a single substitution value. The source describes this as a one-parameter variant of `sprintf`. |
| `Random` | `int` | `Random(int max)` | Random 0-max |
| `ReCalcGridZ` | `unknown` | `ReCalcGridZ(int unit)` | Recalculates the Z grid using the size of the supplied unit. |
| `Receive` | `int` | `Receive()` | Receives an integer data value from the network interface. |
| `ReloadVid` | `unknown` | `ReloadVid()` | Reloads the properties associated with the specified VID. |
| `ReplaceUnit` | `unknown` | `ReplaceUnit(int nvid1, int nvid2)` | Replaces every object with the first NVID on the map with an object using the second NVID. |
| `Save` | `unknown` | `Save(string filename)` | Save map |
| `SaveDemo` | `unknown` | `SaveDemo(string filename)` | Sets the filename for the next file loaded to be recorded as a demo. |
| `ScreenX` | `int` | `ScreenX()` | Returns the width of the game window. |
| `ScreenY` | `int` | `ScreenY()` | Returns the height of the game window. |
| `Send` | `unknown` | `Send(int data)` | Sends an integer data value through the network interface. |
| `SetAutoReBirth` | `unknown` | `SetAutoReBirth(int newval)` | Configures automatic rebirth behavior. |
| `SetCleverEnemyAttack` | `unknown` | `SetCleverEnemyAttack(int newval)` | Configures the intelligent enemy-attack behavior. |
| `SetCommands` | `unknown` | `SetCommands(int unit, string com)` | Replaces the command string assigned to a unit. |
| `SetCursor` | `unknown` | `SetCursor(int type)` | Sets the cursor value in the game engine. |
| `SetEnemyCanAttackNeutralTrains` | `unknown` | `SetEnemyCanAttackNeutralTrains(int newval)` | Controls whether enemies may attack neutral trains. |
| `SetEnvironment` | `unknown` | `SetEnvironment(int env)` | Sets the environment value in the game engine. |
| `SetFlagman` | `unknown` | `SetFlagman(int narmy, int unit)` | Sets the flagman value in the game engine. |
| `SetGamma` | `unknown` | `SetGamma(int gammaindex)` | Sets the gamma value in the game engine. |
| `SetGraphDetail` | `unknown` | `SetGraphDetail(int detail)` | 0-low,1-high |
| `SetMoney` | `unknown` | `SetMoney(int army, int money)` | Sets the money balance of the specified army. |
| `SetMouseClick` | `unknown` | `SetMouseClick(int firstOrsecond, int vk_button)` | Sets the mouse-click state used by the input system. |
| `SetMusicVolume` | `unknown` | `SetMusicVolume(int volume)` | Volume=0-100 |
| `SetNet` | `unknown` | `SetNet(int flag)` | Sets the net value in the game engine. |
| `SetPosition` | `unknown` | `SetPosition(int x, int y)` | Sets the position value in the game engine. |
| `SetPushLine` | `unknown` | `SetPushLine(int begin_x, int begin_y, int end_x, int end_y, int push_flag)` | Sets the push-line property used by the game interface. |
| `SetReg` | `unknown` | `SetReg(string path, string name, string value)` | Sets the reg value in the game engine. |
| `SetScrollType` | `unknown` | `SetScrollType(int type)` | Sets the screen-scrolling mode bit mask. Use `SCROLL_*` flags to select border scrolling, arrow scrolling and other supported modes. |
| `SetSelectUnit` | `unknown` | `SetSelectUnit(int flag)` | Sets the unit-selection state for the interface. |
| `SetSemaphore` | `unknown` | `SetSemaphore(int x, int y, int newsemaphore, int army)` | Sets the semaphore state at the specified rail coordinates for the selected army. The state controls whether trains may pass in both directions, only one direction, or neither direction. |
| `SetSoundVolume` | `unknown` | `SetSoundVolume(int volume)` | Sets the sound volume for the requested channel or group. |
| `SetStateBar` | `unknown` | `SetStateBar(int flag)` | Updates the state/progress bar displayed by the interface. |
| `SetVidData` | `unknown` | `SetVidData(int nvid, int type, int var)` | Sets the selected VID property for the object identified by `nvid`. |
| `SetWind` | `unknown` | `SetWind(int wind, int direct)` | Sets the wind value in the game engine. |
| `Sin` | `int` | `Sin(int angle)` | Returns the scaled sine of an angle (angle range 0–256). |
| `SizeTo` | `int` | `SizeTo(int unit, int x, int y)` | Returns the distance from a unit to the specified map point. |
| `StopMovie` | `unknown` | `StopMovie()` | Stops movie playback. |
| `StopMusic` | `unknown` | `StopMusic()` | Stops music playback. |
| `StopSFX` | `unknown` | `StopSFX(int nsfx)` | If nsfx==-1 then stop all sfx |
| `strlen` | `int` | `strlen(string str)` | Returns the length of a string. |
| `ToScreenX` | `int` | `ToScreenX(int x)` | Converts a map X coordinate to a screen X coordinate. |
| `ToScreenY` | `int` | `ToScreenY(int y, int z = 0)` | Converts map Y and Z coordinates to a screen Y coordinate. |
| `TrainProperty` | `int` | `TrainProperty(int train, int property)` | Returns a selected train property such as speed, weapon power, remaining life, hit points, ammunition, acceleration, build time or availability. Use `PROP_*` to select the property. |

## `fly.lgc`

2 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `FlyTact` | `void` | `FlyTact()` | Updates the standard fly behaviour and spawn system. |
| `GetFlyCountLast` | `unknown` | `GetFlyCountLast()` | Returns the previous fly-count state recorded by the standard fly system. |

## `gametact.lgc`

1 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `GameTact` | `void` | `GameTact()` | Runs the main game-tactics update routine. |

## `initdefault.lgc`

1 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `InitDefault` | `unknown` | `InitDefault()` | Initializes standard game state and default script variables. |

## `menuend.lgc`

18 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `DisableButtonsEnd` | `void` | `DisableButtonsEnd()` | Disables the buttons in the end-of-level menu. |
| `EnableButtonsEnd` | `void` | `EnableButtonsEnd(int i)` | Enables the end-of-level menu buttons according to the supplied state. |
| `ImmediateWin` | `void` | `ImmediateWin()` | Completes the current match immediately and updates the victory record. |
| `InstantWin` | `void` | `InstantWin()` | Completes the current match immediately and updates the level progression. |
| `IsNoDepo` | `int` | `IsNoDepo()` | Returns whether production is unavailable because there is no depot, the army lacks enough money, or the depot is not working. |
| `Loose` | `void` | `Loose()` | Marks the current match as lost and starts the defeat sequence. |
| `MenuEnd` | `int` | `MenuEnd()` | Updates and displays the end-of-match menu. |
| `MenuLoadingEnd` | `void` | `MenuLoadingEnd()` | Runs the end-of-loading menu transition handler. |
| `MenuWorkingEnd` | `void` | `MenuWorkingEnd()` | Runs the transition from the active menu to the end-menu state. |
| `ReadScores` | `void` | `ReadScores()` | Loads the level score table. |
| `ReadScoresEnd` | `void` | `ReadScoresEnd()` | Loads the end-of-level score table. |
| `SetBackEnd` | `void` | `SetBackEnd()` | Creates or restores the end-menu background. |
| `SetMenuStateEnd` | `void` | `SetMenuStateEnd(int num)` | Changes the active end-menu state. |
| `ShiftScores` | `void` | `ShiftScores(int SSscore, string SSname, int SSlevel, int SSrank)` | Updates the main high-score table by inserting or shifting a score entry. |
| `ShiftScoresEnd` | `void` | `ShiftScoresEnd(int SSscore, string SSname)` | Updates the end-of-level score table by inserting or shifting a score entry. |
| `StoreScores` | `void` | `StoreScores()` | Stores the current high-score table. |
| `StoreScoresEnd` | `void` | `StoreScoresEnd()` | Stores the end-of-level score table. |
| `Win` | `void` | `Win()` | Marks the current match as won and starts the victory sequence. |

## `menutact.lgc`

34 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `CreateCreditsMenu` | `void` | `CreateCreditsMenu()` | Creates the credits menu. |
| `CreateExitMenu` | `void` | `CreateExitMenu()` | Creates the exit confirmation menu. |
| `CreateHelpMenu` | `void` | `CreateHelpMenu()` | Creates the help menu. |
| `CreateLevelMenu` | `void` | `CreateLevelMenu()` | Creates the level-selection menu. |
| `CreateOptionsMenu` | `void` | `CreateOptionsMenu()` | Creates the options menu. |
| `DeletePlayer` | `void` | `DeletePlayer(int num)` | Deletes the player entry selected by its player-list index. |
| `DisableButtons` | `void` | `DisableButtons()` | Disables the standard menu buttons. |
| `DownDiffPlayer` | `void` | `DownDiffPlayer(int num)` | Decreases the selected player difficulty setting. |
| `EditorRowClicked` | `unknown` | `EditorRowClicked()` | A click on the row (the lamp or its text) |
| `EditorRowCreate` | `void` | `EditorRowCreate(int x, int y, string back)` | The row with the lamp at x,y from the page's middle (X, Y set) |
| `EditorRowLines` | `unknown` | `EditorRowLines(string page)` | The lines a page of the briefing takes: the file's lines, a long one as more |
| `EditorRowOnBriefing` | `void` | `EditorRowOnBriefing(string page, string head)` | The briefing's row: under a short page's text; else beside a title that leaves room; else at the bottom |
| `EditorRowText` | `string` | `EditorRowText()` | Creates or updates the text content of the current editor briefing row. |
| `EnableButtons` | `void` | `EnableButtons(int i)` | Enables the standard menu buttons according to the supplied menu state. |
| `GetCountFromList` | `unknown` | `GetCountFromList(string filename)` | Returns the number of entries in the specified menu/list file. |
| `GetFileFromList` | `string` | `GetFileFromList(string filename)` | Returns a file entry selected from the specified menu/list file. |
| `GetPlayerScores` | `unknown` | `GetPlayerScores(int pl)` | Returns the stored score for the selected player. |
| `GetRCX` | `void` | `GetRCX(int xxx)` | Returns the X coordinate used to position the briefing/editor row. |
| `GetRCY` | `void` | `GetRCY(int yyy)` | Returns the Y coordinate used to position the briefing/editor row. |
| `KillCreditsMenu` | `void` | `KillCreditsMenu()` | Removes the credits menu objects. |
| `KillEditorRow` | `void` | `KillEditorRow()` | Removes the current briefing/editor row objects. |
| `KillExitMenu` | `void` | `KillExitMenu()` | Removes the exit confirmation menu objects. |
| `KillHelpMenu` | `void` | `KillHelpMenu()` | Removes the help menu objects. |
| `KillLevelMenu` | `void` | `KillLevelMenu()` | Removes the level-selection menu objects. |
| `KillOptionsMenu` | `void` | `KillOptionsMenu()` | Removes the options menu objects. |
| `MenuLoading` | `void` | `MenuLoading()` | Runs the loading-menu state handler. |
| `MenuLoadingF1` | `void` | `MenuLoadingF1()` | Runs the F1 loading/help screen handler. |
| `MenuTact` | `int` | `MenuTact()` | Runs the main menu task and returns 1 while the menu captures input control. |
| `MenuUnloading` | `void` | `MenuUnloading()` | Runs the menu-unloading state handler. |
| `MenuWorking` | `void` | `MenuWorking()` | Runs the active main-menu state handler. |
| `PrintCurrPlayer` | `void` | `PrintCurrPlayer()` | Draws the currently selected player name or player marker in the menu. |
| `SetBack` | `void` | `SetBack()` | Creates or restores the main-menu background. |
| `SetMenuState` | `void` | `SetMenuState(int num)` | Changes the active main-menu state. |
| `UpDiffPlayer` | `void` | `UpDiffPlayer(int num)` | Increases the selected player difficulty setting. |

## `obsolete.lgc`

18 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `Create` | `int` | `Create(int nvid, int x, int y, int z)` | #define GetUnitVid GetVid |
| `CreateEx` | `int` | `CreateEx(int nvid, int x, int y, int z, int dir)` | Legacy five-argument wrapper for creating a unit at the specified position and direction. |
| `GetDir` | `int` | `GetDir(int unit)` | Returns the current direction of the specified unit. |
| `GetVid` | `int` | `GetVid(int nvid, int type)` | Compatibility function alias for `GetVidData()` provided by `#define GetVid GetVidData` in `obsolete.lgc`. |
| `MenuDir` | `int` | `MenuDir()` | Returns the direction value of the menu button that was pressed. |
| `MenuSelectVid` | `int` | `MenuSelectVid()` | Returns the NVID of the button currently under the mouse cursor. |
| `MenuVid` | `int` | `MenuVid()` | Returns the NVID associated with the menu button currently selected by the mouse. |
| `Message` | `void` | `Message(string text, int x, int y)` | Displays a text message at the supplied screen/map coordinates using the legacy message helper. |
| `PlayWAV` | `void` | `PlayWAV(string filename)` | Plays the specified WAV audio file. |
| `PrintFile` | `int` | `PrintFile(int x, int y, int z, string filename, int font)` | Creates a text sprite and loads the contents of the specified file using the supplied font. |
| `PrintText` | `int` | `PrintText(int x, int y, int z, string text, int font, int behave = 0)` | Creates a text sprite using the supplied font and behaviour flags. |
| `ScrollLock` | `void` | `ScrollLock(int flag)` | Enables or disables the legacy scroll-lock behaviour according to the flag. |
| `SetAutoScroll` | `void` | `SetAutoScroll(int flag)` | Enables or disables automatic screen scrolling according to the flag. |
| `SetHpCoeff` | `void` | `SetHpCoeff(int nvid, int narmy, int hp_percent)` | Sets the hit-point coefficient for a specified NVID and army. |
| `SetMusic` | `void` | `SetMusic(int volume)` | Sets the legacy music volume level. |
| `SetSound` | `void` | `SetSound(int volume)` | Sets the legacy sound volume level. |
| `SetVid` | `unknown` | `SetVid(int nvid, int type, int var)` | Compatibility function alias for `SetVidData()` provided by `#define SetVid SetVidData` in `obsolete.lgc`. |
| `sprintf` | `unknown` | `sprintf(string format, int int_or_string)` | Compatibility function alias for `Printf()` provided by `#define sprintf Printf` in `obsolete.lgc`. |

## `optfields.lgc`

11 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `OptEditorValue` | `void` | `OptEditorValue()` | Destroys and recreates the text object that displays the selected editor option value in the options menu. It uses the current editor selection, maximum value and menu layout globals. |
| `OptFieldsClick` | `void` | `OptFieldsClick(int clicked)` | The menu item clicked (MenuVid()) while the page is open. |
| `OptFieldsCreate` | `void` | `OptFieldsCreate(int at_x, int at_y, int depth, int text_depth)` | After the page's own rows: X, Y as CreateOptionsMenu has them (GetRCX/GetRCY), the depth of its arrows and of its texts (the main menu: 20 and 300, the Esc menu: 2220 and 2300). The names of the parameters and globals here are used by no other script: a script that includes this file does not compile when one of them is a global there (mvid of menutact.lgc did that). |
| `OptFieldsKill` | `void` | `OptFieldsKill()` | Removes the options-field UI objects. |
| `OptInterfaceSizeText` | `unknown` | `OptInterfaceSizeText(int size, int max)` | The size shown: the chosen one as far as the window takes it (the game uses no more). |
| `OptInterfaceValue` | `void` | `OptInterfaceValue()` | Returns the current interface-size option value. |
| `OptInterfaceY` | `unknown` | `OptInterfaceY(int editor)` | The rows' Y: the interface's (editor 0) and the editor's interface's (1). |
| `OptMinimapSizeText` | `unknown` | `OptMinimapSizeText()` | Returns the display text for the minimap-size option. |
| `OptMinimapValue` | `void` | `OptMinimapValue()` | Returns the current minimap-size option value. |
| `OptRowY` | `unknown` | `OptRowY(int n)` | Returns the Y coordinate of the specified options row. |
| `OptString` | `unknown` | `OptString(string key, string english)` | A text of the pack's strings.ini, or `english` when it has none: the game's own strings.ini (an edition's language without a pack of ours, Portuguese) lacks our keys - as menu.lgc's custom maps header falls back to CUSTOM MAPS. |

## `reinforcement.lgc`

3 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `AddReinforcement` | `void` | `AddReinforcement()` | Creates and sends the next configured player or AI reinforcement, using the shared reinforcement coordinates and command list. |
| `PirateEngineKept` | `int` | `PirateEngineKept(int i)` | Checks or maintains the pirate-engine state for the specified engine. |
| `ReinforcementInit` | `void` | `ReinforcementInit()` | Initializes the reinforcement system; the standard scripts call this from `InitDefault`. |

## `setarmygamma.lgc`

1 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `SetArmyGamma` | `void` | `SetArmyGamma()` | Applies the configured gamma settings for an army. |

## `trainstact.lgc`

4 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `BehaveBattleRadius` | `void` | `BehaveBattleRadius(int i, int enemy_train)` | Applies battle-radius behaviour to the selected train relative to the specified enemy train. |
| `ConnectExistsTrain` | `void` | `ConnectExistsTrain(int train)` | Attempts to connect an existing train to the selected AI train-tactics entry. |
| `SetMine` | `void` | `SetMine(int unit, int x, int y)` | Places or configures a mine at the supplied unit and coordinates. |
| `TrainsTact` | `void` | `TrainsTact()` | Runs the train-tactics update routine. |

## `trainstactfunctions.lgc`

24 function(s).

| Function | Return type | Signature | Description |
|---|---|---|---|
| `ai_change_task` | `void` | `ai_change_task(int train, int new_task, int options)` | Changes the recorded task of an AI train and resets its task timers, behaviour state and target according to the supplied task-change option flags. |
| `ai_train_check` | `void` | `ai_train_check()` | Runs the standard AI train-maintenance checks and updates the train task state. |
| `ai_train_check_type` | `int` | `ai_train_check_type(int num)` | Checks the train formation against the requested train type code. |
| `ai_train_create_help` | `void` | `ai_train_create_help()` | Creates a helper AI train when the standard AI logic detects that its current force needs reinforcement. |
| `ai_train_need_help` | `unknown` | `ai_train_need_help()` | Returns whether the AI train system has reached the configured point at which it needs additional support. |
| `arr_cpp` | `void` | `arr_cpp(unknown a1, unknown a2)` | Copies the train composition values from one integer array into another. |
| `arr_gettype` | `void` | `arr_gettype(unknown train, int traintype)` | Expands a train formation type code into its unit-NVID composition array. |
| `BuildLinker` | `int` | `BuildLinker(int depo, int i, int k, int type)` | Builds a linker unit used to connect or extend a train formation. |
| `BuildRebuldTrain` | `void` | `BuildRebuldTrain(int depo, int i)` | Builds a replacement train used to restore or complete an existing formation. |
| `BuildThisTrain` | `void` | `BuildThisTrain(int depo, int traintype)` | Builds the requested train formation at the specified depot using the formation definition table. |
| `CheckEnemyInTrain` | `int` | `CheckEnemyInTrain(int train)` | Checks the army ownership of engines in a train and returns the result used by the AI train logic. |
| `CountNVidInTrain` | `unknown` | `CountNVidInTrain(int train, int nvid)` | Returns the number of engines with the specified NVID in the train. |
| `DepoPrint` | `void` | `DepoPrint()` | Prints debug information about the depot and train-tactics state. |
| `find_num` | `unknown` | `find_num()` | Finds an available free index for train-tactics bookkeeping. |
| `FindTrain` | `int` | `FindTrain(int unit)` | Returns the AI train-array index of the train that contains the supplied unit; returns -1 when it is not found. |
| `FindTrain2` | `int` | `FindTrain2(int unit)` | Returns the AI train-array index whose train handle exactly matches the supplied unit handle; returns -1 when it is not found. |
| `GetFreeFlyers` | `unknown` | `GetFreeFlyers(int army, int flyer_vid)` | Returns the number of free flyer units of the requested VID available to the specified army. |
| `GetFreeFlyerWagonInTrain` | `unknown` | `GetFreeFlyerWagonInTrain(int train, int flyer_wagon_vid)` | Finds a free flyer wagon in the supplied train and returns its unit handle. |
| `initArrays` | `void` | `initArrays()` | ---------------------------------------------------------------------------- |
| `MoveAway` | `void` | `MoveAway(int train, int enemy, int range)` | Orders a train to move away from an enemy by the requested separation range. |
| `StartCreateTrain` | `unknown` | `StartCreateTrain(unknown train, int x, int y, int army)` | Creates a train from an integer NVID array at the given position and assigns it to the selected army. |
| `train_print` | `void` | `train_print(int train)` | Prints debug information about the supplied train and its composition. |
| `TrainWeaponRadius` | `int` | `TrainWeaponRadius(int train)` | Returns the maximum weapon battle radius among engines in the train. |
| `UniqueNum` | `void` | `UniqueNum(unknown arr)` | Scans a zero-terminated NVID array and writes each distinct unit NVID (the standard implementation scans values 5 through 97) to `UniqueNum_arr`; the matching occurrence count is written to `UniqueNum_arr_count`. Both output arrays have 30 slots. |
