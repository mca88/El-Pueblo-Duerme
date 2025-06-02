<script>
    export let timeLeft;
    export let text = "Cierra los ojos y espera al siguiente rol";
</script>

<div class="next-role-section">
    <p class="next-role-text">{text}</p>
    <div class="countdown-container">
        <span class="countdown">{$timeLeft}</span>
    </div>
</div>

<style>
    .next-role-section {
        margin-top: 1.5rem;
        text-align: center;
    }

    .next-role-text {
        font-size: 1.1rem;
        font-weight: 500;
        margin-bottom: 1.5rem;
        font-style: italic;
    }

    .countdown-container {
        margin-top: 1rem;
    }

    .countdown {
        font-size: 2.5rem;
        font-weight: bold;
        color: var(--primary, #1095c1);
        display: inline-block;
        text-align: center;
    }
</style>
