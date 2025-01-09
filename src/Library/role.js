export default function getRole(level) {
    if (level == 0) {
        return 'Unranked';
    } else if (level < 5) {
        return 'Recruit 🔰';
    } else if (level < 10) {
        return 'Private 🔒';
    } else if (level < 15) {
        return 'Specialist ⚙️';
    } else if (level < 20) {
        return 'Corporal ⚔️';
    } else if (level < 25) {
        return 'Sergeant 🛡️';
    } else if (level < 30) {
        return 'Staff Sergeant 🌟';
    } else if (level < 35) {
        return 'Warrant Officer 🏵️';
    } else if (level < 40) {
        return 'Second Lieutenant ⭐';
    } else if (level < 45) {
        return 'First Lieutenant ⭐⭐';
    } else if (level < 50) {
        return 'Captain 🎖️';
    } else if (level < 55) {
        return 'Major 💎';
    } else if (level < 60) {
        return 'Lieutenant Colonel 💠';
    } else if (level < 65) {
        return 'Colonel 🥇';
    } else if (level < 70) {
        return 'Brigadier 🥈';
    } else if (level < 75) {
        return 'Major General 🥉';
    } else if (level < 80) {
        return 'Lieutenant General ⚜️';
    } else if (level < 85) {
        return 'General 🏆';
    } else if (level < 90) {
        return 'Field Marshal 🌍';
    } else if (level < 100) {
        return 'Supreme Commander 👑';
    } else if (level < 100000) {
        return 'Commander in Chief 🏴‍☠';
    }
}