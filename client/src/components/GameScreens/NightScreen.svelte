<script>
    import { player, gameProps } from "../../lib/stores";
    import { Roles, showRolePretty } from "../../utils";
    import CupidScreen from "./RoleScreens/CupidScreen.svelte";
    import LoversMeet from "./RoleScreens/LoversMeetScreen.svelte";
    import VidentScreen from "./RoleScreens/VidentScreen.svelte";
    import WitchScreen from "./RoleScreens/WitchScreen.svelte";
    import WolfScreen from "./RoleScreens/WolfScreen.svelte";
    export let socket;
</script>

{#if $player.role === $gameProps.turn}
    {#if $player.role === Roles.CUPIDO}
        <CupidScreen {socket} />
    {:else if $player.role === Roles.VIDENTE}
        <VidentScreen {socket} />
    {:else if $player.role === Roles.BRUJA}
        <WitchScreen {socket} />
    {:else if $player.role === Roles.LOBO}
        <WolfScreen {socket} />
    {/if}
{:else if $gameProps.turn === Roles.ENAMORADOS}
    <LoversMeet {socket} />
{:else}
    <p>Es el turno de {showRolePretty($gameProps.turn)}</p>
{/if}

<style>
</style>
