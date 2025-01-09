import { join } from 'path';
import { writeFileSync } from 'fs';
import { createCanvas, loadImage, registerFont } from 'canvas';

// Register fonts
registerFont('./assets/fonts/Poppins-Medium.ttf', { family: 'Poppins-Medium' });
registerFont('./assets/fonts/Poppins-Bold.ttf', { family: 'Poppins-Bold' });
registerFont('./assets/fonts/Prompt-Regular.ttf', { family: 'Prompt' });
registerFont('./assets/fonts/Prompt-Medium.ttf', { family: 'Prompt-Medium' });
registerFont('./assets/fonts/Prompt-Bold.ttf', { family: 'Prompt-Bold' });

async function generateCustomRankCard(user) {
    const canvasWidth = 1000;
    const canvasHeight = 300;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    const theme = user.theme || '#FCE7A8'

    // Set a solid background color
    ctx.fillStyle = user.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Rounded rectangle function
    function drawRoundedRect(x, y, width, height, radius, color) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    function drawRoundedRect2(x, y, width, height, radius, color, roundTopLeft, roundTopRight, roundBottomLeft, roundBottomRight) {
        ctx.beginPath();
        ctx.moveTo(x + (roundTopLeft ? radius : 0), y);
        ctx.lineTo(x + width - (roundTopRight ? radius : 0), y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + (roundTopRight ? radius : 0));
        ctx.lineTo(x + width, y + height - (roundBottomRight ? radius : 0));
        ctx.quadraticCurveTo(x + width, y + height, x + width - (roundBottomRight ? radius : 0), y + height);
        ctx.lineTo(x + (roundBottomLeft ? radius : 0), y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - (roundBottomLeft ? radius : 0));
        ctx.lineTo(x, y + (roundTopLeft ? radius : 0));
        ctx.quadraticCurveTo(x, y, x + (roundTopLeft ? radius : 0), y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    function truncateUsername(username, maxLength) {
        if (username.length > maxLength) {
            return username.slice(0, maxLength - 3) + '...';
        }
        return username;
    }

    const maxUsernameLength = 14;
    const truncatedUsername = truncateUsername(user.username, maxUsernameLength);

    // Draw the rank card elements
    drawRoundedRect(12, 10, 700, 280, 20, '#212227');
    const avatarSize = 147;
    const avatar = await loadImage(user.avatarURL);
    ctx.save();
    ctx.beginPath();
    ctx.arc(100 + avatarSize / 2 - 40, 82 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 100 - 40, 82, avatarSize, avatarSize);
    ctx.restore();

    // Draw username and discriminator
    ctx.font = 'bold 45px Prompt-Bold';
    ctx.fillStyle = theme;
    ctx.fillText(truncatedUsername, 245, 95);

    // Server Rank, Weekly Rank, and Weekly XP
    ctx.font = 'medium 25px Prompt-Medium';
    ctx.fillStyle = '#6C6E71';
    ctx.fillText('SERVER\n  RANK', 250, 155);

    //SERVER RANK DRAW
    ctx.font = 'medium 40px Prompt-Medium';
    ctx.fillStyle = theme;
    ctx.textAlign = 'center';
    const text = user.serverRank.toString()
    ctx.fillText(text, 290, 245);

    ctx.font = 'medium 25px Prompt-Medium';
    ctx.fillStyle = '#6C6E71';
    ctx.fillText('WEEKLY\n  RANK', 440, 155);

    //WEEKLY RANK DRAW
    ctx.font = 'medium 40px Prompt-Medium';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    const textwr = user.weeklyRank.toString()
    ctx.fillText(textwr, 435, 245);

    //WEEKLY EXP TEXT
    ctx.font = 'medium 25px Prompt-Medium';
    ctx.fillStyle = '#6C6E71';
    ctx.fillText('WEEKLY\n   EXP', 590, 155);

    //WEEKLY EXP DRAW
    ctx.font = 'medium 40px Prompt-Medium';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    const textwxp = user.weeklyXP.toString()
    ctx.fillText(textwxp, 585, 245);

    // Level
    drawRoundedRect(723, 10, 265, 135, 20, '#212227');
    const levelBoxX = 725; // X position of the box
    const levelBoxWidth = 265; // Width of the box

    // Measure text widths
    ctx.font = '18px Prompt-Bold'; // Font size for 'LEVEL'
    const levelLabelWidth = ctx.measureText('LEVEL').width;

    ctx.font = '22px Prompt-Bold'; // Larger font size for user.level
    const userLevelWidth = ctx.measureText(user.level.toString()).width;

    // Calculate positions for centering
    const levelLabelX = levelBoxX + (levelBoxWidth - levelLabelWidth) / 2;
    const userLevelX = levelBoxX + (levelBoxWidth - userLevelWidth) / 2;

    // Draw 'LEVEL' label centered
    drawRoundedRect(741, 83, 230, 40, 5, '#181b1d');
    ctx.font = '25px Prompt-Bold';
    ctx.fillStyle = '#6C6E71';
    ctx.fillText('LEVEL', 855, 60);

    // Draw user.level value centered
    ctx.font = '30px Prompt-Bold';
    ctx.fillStyle = theme;
    ctx.textAlign = 'center';
    const leveltext = user.level
    ctx.fillText(leveltext, 858, 114);

    // EXP
    drawRoundedRect(723, 157, 265, 130, 20, '#212227');
    ctx.font = '25px Prompt-Bold';
    ctx.fillStyle = '#6C6E71';
    ctx.fillText('EXP', 855, 205);

    const boxX = 722; // X position of the box
    const boxWidth = 265; // Width of the box

    const crt = `${user.currentXP}`;
    const need = `/ ${user.requiredXP}`;

    ctx.font = '24px Prompt-Bold'; // Bigger font size for currentXP
    const crtWidth = ctx.measureText(crt).width;

    ctx.font = '18px Prompt-Bold'; // Normal font size for / ${need}
    const needWidth = ctx.measureText(need).width;

    const totalTextWidth = crtWidth + needWidth + 5; // 5px spacing between crt and need

    const startX = boxX + (boxWidth - totalTextWidth) / 2; // Center-align the combined text

    drawRoundedRect(741, 225, 230, 40, 5, '#181b1d');
    ctx.font = '24px Prompt-Bold';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(crt, startX, 253); // Position `crt` dynamically

    ctx.font = '20px Prompt-Bold';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6C6E71';
    ctx.fillText(need, startX + crtWidth + 5, 252); // Adjust X position for `/ ${need}`
    
    // XP Progress Bar
    const progressBarWidth = 693;
    const progressBarHeight = 7;
    const progressBarX = 15;
    const progressBarY = 282;

    ctx.fillStyle = '#1A1C1E';
    drawRoundedRect2(progressBarX, progressBarY, progressBarWidth, progressBarHeight, 10, '#1A1C1E', false, false, true, true);

    const progressRatio = Math.min(Math.max(user.currentXP / user.requiredXP, 0), 1);
    const progressWidth = progressRatio * progressBarWidth;
    drawRoundedRect2(progressBarX, progressBarY, progressWidth, progressBarHeight, 10, theme, false, false, true, false);


    // Save rank card as a file
    const tmpDir = './tmp';
    const filePath = join(tmpDir, 'rank-card.png');

    try {
        writeFileSync(filePath, canvas.toBuffer('image/png'));
        return filePath;
    } catch (error) {
        console.error('Error writing rank card file:', error);
        throw error;
    }
}

export default generateCustomRankCard;