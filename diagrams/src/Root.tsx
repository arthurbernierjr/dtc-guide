import { CurriculumDiagram } from "./CurriculumDiagram";
import React from "react";
import { Composition, Folder } from "remotion";
import { CoverCorrection, COVER_SIZE, CoverFormat } from "./brand/CoverCorrection";
import { Favicon, FaviconSize } from "./brand/Favicon";
import { RespawnMark } from "./brand/RespawnMark";
import { PathMap, pathMapSize } from "./path/PathMap";
import { OoHandCopied } from "./session-3-4/OoHandCopied";
import { OoBlueprint } from "./session-3-4/OoBlueprint";
import { OoPrototypeChain } from "./session-3-4/OoPrototypeChain";
import { OoThisRules } from "./session-3-4/OoThisRules";
import { ManaContainers } from "./session-3-1/ManaContainers";
import { SevenPrimitives } from "./session-3-1/SevenPrimitives";
import { HoistingTwoPasses } from "./session-3-1/HoistingTwoPasses";
import { BranchingRoad } from "./session-3-1/BranchingRoad";
import { TwoEqualsSigns } from "./session-3-1/TwoEqualsSigns";
import { FunctionsThreeWays } from "./session-3-2/FunctionsThreeWays";
import { ScopeRings } from "./session-3-2/ScopeRings";
import { ClosureBackpack } from "./session-3-2/ClosureBackpack";
import { ComboChain } from "./session-3-2/ComboChain";
import { MissingReturn } from "./session-3-2/MissingReturn";
import { DomTree } from "./session-3-5/DomTree";
import { ThreeSelectors } from "./session-3-5/ThreeSelectors";
import { FourDials } from "./session-3-5/FourDials";
import { EventBubbles } from "./session-3-5/EventBubbles";
import { NullAndReload } from "./session-3-5/NullAndReload";
import { GameLoop } from "./session-3-6/GameLoop";
import { SingleSourceOfTruth } from "./session-3-6/SingleSourceOfTruth";
import { FileSkeleton } from "./session-3-6/FileSkeleton";
import { FourArenas } from "./session-3-6/FourArenas";
import { TimerLeak } from "./session-3-6/TimerLeak";
import { TerminalShellConsole } from "./session-1-1/TerminalShellConsole";
import { CommandAnatomy } from "./session-1-1/CommandAnatomy";
import { CampTree } from "./session-1-1/CampTree";
import { Redirects } from "./session-1-1/Redirects";
import { KeyboardMap } from "./session-1-1/KeyboardMap";
import { FilesystemTree } from "./session-1-2/FilesystemTree";
import { DungeonMoves } from "./session-1-2/DungeonMoves";
import { ReadingLsLa } from "./session-1-2/ReadingLsLa";
import { PipesAndRedirects } from "./session-1-2/PipesAndRedirects";
import { Permissions } from "./session-1-2/Permissions";
import { ThreeStates } from "./session-1-3/ThreeStates";
import { CommitChain } from "./session-1-3/CommitChain";
import { BranchTimelines } from "./session-1-3/BranchTimelines";
import { TwoMerges } from "./session-1-3/TwoMerges";
import { ConflictMarkers } from "./session-1-3/ConflictMarkers";
import { LocalAndRemote } from "./session-1-4/LocalAndRemote";
import { SshHandshake } from "./session-1-4/SshHandshake";
import { PushPullCycle } from "./session-1-4/PushPullCycle";
import { PullRequestFlow } from "./session-1-4/PullRequestFlow";
import { DotfilesAnatomy } from "./session-1-4/DotfilesAnatomy";
import { RequestCycle } from "./session-2-1/RequestCycle";
import { DocumentAnatomy } from "./session-2-1/DocumentAnatomy";
import { SemanticSkeleton } from "./session-2-1/SemanticSkeleton";
import { ElementShapes } from "./session-2-1/ElementShapes";
import { FormWiring } from "./session-2-1/FormWiring";
import { RuleHomes } from "./session-2-2/RuleHomes";
import { SpecificityLadder } from "./session-2-2/SpecificityLadder";
import { BoxModel } from "./session-2-2/BoxModel";
import { SelectorMap } from "./session-2-2/SelectorMap";
import { CustomProperties } from "./session-2-2/CustomProperties";
import { FlexAxes } from "./session-2-3/FlexAxes";
import { GridAreas } from "./session-2-3/GridAreas";
import { AutoFit } from "./session-2-3/AutoFit";
import { MobileFirst } from "./session-2-3/MobileFirst";
import { GridAndFlex } from "./session-2-3/GridAndFlex";
import { TransitionTimeline } from "./session-2-4/TransitionTimeline";
import { TransformBox } from "./session-2-4/TransformBox";
import { KeyframeStops } from "./session-2-4/KeyframeStops";
import { BemCard } from "./session-2-4/BemCard";
import { ImageFrame } from "./session-2-4/ImageFrame";
import { Layout, SIZE } from "./tokens";

const wideProps = { layout: "wide" as Layout };

const still = { durationInFrames: 1, fps: 1 };
const byLayout = ({ props }: { props: { layout: Layout } }) => ({ ...SIZE[props.layout] });

/** Every composition in the ledger (DESIGN-REFERENCE-RESPAWN.md §R10, §R12). */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="CurriculumDiagram" component={CurriculumDiagram} {...still} width={1600} height={900} defaultProps={{layout: "wide" as Layout, session: "4.1", title: "The working model", mode: "flow", nodes: [["Request", "Validate the boundary."], ["Operation", "Apply the rule."], ["Response", "Verify the result."]], artifact: "A complete lesson artifact"}} calculateMetadata={byLayout} />
    <Folder name="brand">
      <Composition
        id="CoverCorrection"
        component={CoverCorrection}
        {...still}
        width={1200}
        height={630}
        defaultProps={{ format: "og" as CoverFormat }}
        calculateMetadata={({ props }) => ({ ...COVER_SIZE[props.format] })}
      />
      <Composition
        id="Favicon"
        component={Favicon}
        {...still}
        width={32}
        height={32}
        defaultProps={{ size: 32 as FaviconSize }}
        calculateMetadata={({ props }) => ({ width: props.size, height: props.size })}
      />
      <Composition id="RespawnMark" component={RespawnMark} {...still} width={600} height={240} />
    </Folder>
    <Folder name="path">
      <Composition id="PathMap" component={PathMap} {...still} width={1600} height={900} defaultProps={{ layout: "wide" as Layout, written: [] }} calculateMetadata={({ props }) => pathMapSize(props.layout)} />
    </Folder>
    <Folder name="session-3-1">
      <Composition id="ManaContainers" component={ManaContainers} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="SevenPrimitives" component={SevenPrimitives} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="HoistingTwoPasses" component={HoistingTwoPasses} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="BranchingRoad" component={BranchingRoad} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="TwoEqualsSigns" component={TwoEqualsSigns} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-3-2">
      <Composition id="FunctionsThreeWays" component={FunctionsThreeWays} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="ScopeRings" component={ScopeRings} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="ClosureBackpack" component={ClosureBackpack} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="ComboChain" component={ComboChain} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="MissingReturn" component={MissingReturn} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-3-4">
      <Composition id="OoHandCopied" component={OoHandCopied} {...still} width={1600} height={900} defaultProps={{ layout: "wide" as Layout }} calculateMetadata={byLayout} />
      <Composition id="OoBlueprint" component={OoBlueprint} {...still} width={1600} height={900} defaultProps={{ layout: "wide" as Layout }} calculateMetadata={byLayout} />
      <Composition id="OoPrototypeChain" component={OoPrototypeChain} {...still} width={1600} height={900} defaultProps={{ layout: "wide" as Layout }} calculateMetadata={byLayout} />
      <Composition id="OoThisRules" component={OoThisRules} {...still} width={1600} height={900} defaultProps={{ layout: "wide" as Layout }} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-3-5">
      <Composition id="DomTree" component={DomTree} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="ThreeSelectors" component={ThreeSelectors} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="FourDials" component={FourDials} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="EventBubbles" component={EventBubbles} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="NullAndReload" component={NullAndReload} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-3-6">
      <Composition id="GameLoop" component={GameLoop} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="SingleSourceOfTruth" component={SingleSourceOfTruth} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="FileSkeleton" component={FileSkeleton} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="FourArenas" component={FourArenas} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="TimerLeak" component={TimerLeak} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-1-1">
      <Composition id="TerminalShellConsole" component={TerminalShellConsole} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="CommandAnatomy" component={CommandAnatomy} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="CampTree" component={CampTree} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="Redirects" component={Redirects} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="KeyboardMap" component={KeyboardMap} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-1-2">
      <Composition id="FilesystemTree" component={FilesystemTree} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="DungeonMoves" component={DungeonMoves} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="ReadingLsLa" component={ReadingLsLa} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="PipesAndRedirects" component={PipesAndRedirects} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="Permissions" component={Permissions} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-1-3">
      <Composition id="ThreeStates" component={ThreeStates} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="CommitChain" component={CommitChain} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="BranchTimelines" component={BranchTimelines} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="TwoMerges" component={TwoMerges} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="ConflictMarkers" component={ConflictMarkers} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-1-4">
      <Composition id="LocalAndRemote" component={LocalAndRemote} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="SshHandshake" component={SshHandshake} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="PushPullCycle" component={PushPullCycle} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="PullRequestFlow" component={PullRequestFlow} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="DotfilesAnatomy" component={DotfilesAnatomy} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-2-1">
      <Composition id="RequestCycle" component={RequestCycle} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="DocumentAnatomy" component={DocumentAnatomy} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="SemanticSkeleton" component={SemanticSkeleton} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="ElementShapes" component={ElementShapes} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="FormWiring" component={FormWiring} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-2-2">
      <Composition id="RuleHomes" component={RuleHomes} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="SpecificityLadder" component={SpecificityLadder} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="BoxModel" component={BoxModel} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="SelectorMap" component={SelectorMap} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="CustomProperties" component={CustomProperties} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-2-3">
      <Composition id="FlexAxes" component={FlexAxes} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="GridAreas" component={GridAreas} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="AutoFit" component={AutoFit} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="MobileFirst" component={MobileFirst} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="GridAndFlex" component={GridAndFlex} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
    <Folder name="session-2-4">
      <Composition id="TransitionTimeline" component={TransitionTimeline} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="TransformBox" component={TransformBox} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="KeyframeStops" component={KeyframeStops} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="BemCard" component={BemCard} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
      <Composition id="ImageFrame" component={ImageFrame} {...still} width={1600} height={900} defaultProps={wideProps} calculateMetadata={byLayout} />
    </Folder>
  </>
);
