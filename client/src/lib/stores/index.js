import { writable } from 'svelte/store';

export const activeComponent = writable('start');
export const players = writable([]);
export const player = writable({name: '', id: '', ready : false, alive : true, role : '', loversWith : null});
export const gameProps = writable(
    {
        id: '', 
        name: '', 
        round: 1, 
        voteTime: 10, 
        creator: ' ', 
        status: 'open', 
        turn: '', 
        selectedToDie: [], 
        witchPotionsUsed: {kill: false, revive: false},
        winner: null
    }
);

export function useTime(duration, whatToDoNext){
    const timeLeft = writable(duration);
    let interval;

    function start(){
        stop();
        timeLeft.set(duration);

        interval = setInterval(() =>{
            timeLeft.update(n => {
                if(n <= 0){
                    
                    clearInterval(interval);
                    whatToDoNext();
                    return 0;
                }
                return n - 1;
            });
        }, 1000);
    }

    function stop(){
        clearInterval(interval);
    }

    return {
        timeLeft,
        start,
        stop
    };
}