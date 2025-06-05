<script>
    import TimerWait from "$components/TimerWait.svelte";
    import { player, players, gameProps, useTime } from "$lib/stores";
    import { playRoleAudio, Roles, showRolePretty } from "$src/utils";
    import NightScreen from "./NightScreen.svelte";
    import DayScreen from "./DayScreen.svelte";
    import WinScreen from "./RoleScreens/WinScreen.svelte";

    export let socket;

    getPlayerRole();
    console.log($gameProps)
    let mostrarRol = true;

    function getPlayerRole() {
        const match = $players.find((p) => p.id === $player.id);
        if (match) {
            player.update((pl) => ({ ...pl, role: match.role }));
        }
    }

    function prepareTimeEnd() {
        gameProps.update((props) => {
            return { ...props, status: "night" };
        });

        playRoleAudio($gameProps.turn);
    }

    const { timeLeft, start } = useTime(10, prepareTimeEnd);
    start();

    socket.on("continue", (gameInfo) => {
        players.set(gameInfo.players);
        gameProps.set(gameInfo);

        const match = $players.find((p) => p.id === $player.id);
        player.set(match);

        if($gameProps.winner === null){
            playRoleAudio($gameProps.turn);
        }
        else{
            playRoleAudio(Roles.ALDEANO);
        }
        
    });
</script>

<div class="game-container">
    <div class="topbar">
        <div>
            {#if mostrarRol}
                ROL: {showRolePretty($player.role)}
            {:else}
                ROL: #####
            {/if}
        </div>

        <div>
            Mostrar Rol
            <input
                name="terms"
                type="checkbox"
                role="switch"
                bind:checked={mostrarRol}
            />
        </div>
    </div>

    <div class="game">
        {#if $gameProps.winner === null}
            {#if $player.alive}
                {#if $gameProps.status === "started"}
                    <h1>Fase de Preparación</h1>
                    <TimerWait {timeLeft} />
                {:else if $gameProps.status === "night"}
                    <h1>Fase de Noche</h1>
                    <NightScreen {socket} />
                {:else if $gameProps.status === "day"}
                    <h1>Fase de Día</h1>
                    <DayScreen {socket} />
                {/if}
            {:else}
                <h1>Estás muerto</h1>
                <div class="dead-skull">💀</div>
            {/if}
        {:else}
            <WinScreen winnerRole={$gameProps.winner} />
        {/if}
    </div>
</div>

<style>
    .dead-skull {
        font-size: 10rem;
        line-height: 1;
    }
    .game-container {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: flex-start;
        height: 100vh;
        width: 100vw;
        padding: 20px;
        box-sizing: border-box;
    }
    .topbar {
        width: 100%;
        max-width: 800px;
        height: 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0 auto; /* <-- Esto centra horizontalmente */
    }
    .game {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 500px;
        min-width: 320px;
        margin: 0 auto;
    }
</style>
