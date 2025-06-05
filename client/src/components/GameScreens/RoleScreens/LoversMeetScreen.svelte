<script>
    import { player, players, useTime, gameProps } from "$lib/stores";
    import { Roles } from "$src/utils";
    import PlayerReveal from "$components/GameScreens/PlayerReveal.svelte";
    import TimerWait from "$components/TimerWait.svelte";
    export let socket;

    function loversMeetEnd() {
        if ($player.role === Roles.CUPIDO) {
            socket.emit("continue-action", $gameProps.id);
        }
    }

    let lover = $players.find((p) => p.id === $player.loversWith);

    const { timeLeft, start } = useTime(15, loversMeetEnd);
    start();
</script>

<div class="role-status">
    <div class="lovers-section">
        {#if lover !== undefined}
            <p>
                <strong>Tu amante es:</strong>
                <PlayerReveal name={lover.name} role={lover.role} />
            </p>
        {:else}
            <p class="no-lover">No tienes amante</p>
        {/if}
    </div>

    <TimerWait {timeLeft} />
</div>

<style>
    .role-status {
        margin: 1rem auto;
        text-align: center;
    }

    .lovers-section {
        margin-bottom: 1rem;
    }

    .no-lover {
        font-style: italic;
        opacity: 0.8;
    }
</style>
