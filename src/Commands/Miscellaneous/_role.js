global.rpg = {
    role(level) {
      level = parseInt(level);
      if (isNaN(level)) return { name: "", level: "" };

      const role = [
        { name: "Recruit 🔰", level: 0 },
        { name: "Private 🔒", level: 5 },
        { name: "Corporal ⚔️", level: 10 },
        { name: "Sergeant 🛡️", level: 15 },
        { name: "Lieutenant 🎖️", level: 20 },
        { name: "Captain 👨‍✈️", level: 25 },
        { name: "Major 🎯", level: 30 },
        { name: "Colonel 🌟", level: 35 },
        { name: "Brigadier 🎖️🎖️", level: 40 },
        { name: "General ⚔️⚔️", level: 45 },
        { name: "Field Marshal 💂‍♂️", level: 50 },
        { name: "Commander 👑🌟", level: 55 },
        { name: "Commander-in-Chief 🎖️🌟👑⚔️", level: 60 },
        { name: "Supreme Commander 🎖️🌟👑⚔️", level: 65 },
        { name: "Champion of Honor 🎖️🌟👑⚔️💫", level: 70 },
        { name: "Guardian of Valor 🎖️🌟👑⚔️💫", level: 75 },
        { name: "Warrior of Sovereignty 🎖️🌟👑⚔️💫", level: 80 },
        { name: "Sentinel of Liberty 🎖️🌟👑⚔️💫", level: 85 },
        { name: "Defender of Freedom 🎖️🌟👑⚔️💫", level: 90 },
        { name: "Gladiator of Justice 🎖️🌟👑⚔️💫", level: 95 },
        { name: "Supreme Protector 🎖️🌟👑⚔️💫", level: 100 },
      ];
  
      return role.reverse().find((role) => level >= role.level);
    },
  };