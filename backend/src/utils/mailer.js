const nodemailer = require('nodemailer');

class MailerService {
    constructor() {
        this.transporter = null;
        this.init();
    }

    async init() {
        // Generar una cuenta de prueba en Ethereal
        try {
            const testAccount = await nodemailer.createTestAccount();
            this.transporter = nodemailer.createTransport({
                host: testAccount.smtp.host,
                port: testAccount.smtp.port,
                secure: testAccount.smtp.secure,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log('Servicio de correo inicializado (Ethereal Email)');
        } catch (error) {
            console.error('Error inicializando el servicio de correo:', error);
        }
    }

    async sendApprovalEmail(toEmail, userName, birdName, newlyUnlocked = []) {
        if (!this.transporter) return;

        try {
            let achievementsText = '';
            let achievementsHtml = '';

            if (newlyUnlocked && newlyUnlocked.length > 0) {
                const badgeNames = newlyUnlocked.map(a => `${a.icon} ${a.name}`).join(', ');
                achievementsText = `\n\n¡FELICIDADES ADICIONALES! Has desbloqueado la(s) siguiente(s) medalla(s): ${badgeNames}`;
                achievementsHtml = `
                    <div style="margin-top: 15px; background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <h4 style="margin: 0 0 5px 0; color: #b45309;">🏆 ¡Nuevas Medallas Desbloqueadas!</h4>
                        <p style="margin: 0; color: #78350f; font-size: 15px;">${badgeNames}</p>
                    </div>
                `;
            }

            const info = await this.transporter.sendMail({
                from: '"Avistar NE" <no-reply@avistarne.com>',
                to: toEmail,
                subject: '¡Tu avistamiento ha sido aprobado! 🎉',
                text: `Hola ${userName},\n\n¡Felicidades! Tu avistamiento de "${birdName}" ha sido aprobado por el administrador y ahora es visible en el mapa público interactivo.${achievementsText}\n\nSigue explorando y reportando especies para ganar más medallas.\n\nAtentamente,\nEl equipo de Avistar NE.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 10px;">
                        <h2 style="color: #10b981;">¡Tu avistamiento ha sido aprobado! 🎉</h2>
                        <p style="color: #334155; font-size: 16px;">Hola <strong>${userName}</strong>,</p>
                        <p style="color: #334155; font-size: 16px;">¡Felicidades! Tu avistamiento de <strong>"${birdName}"</strong> ha sido revisado y aprobado por el equipo de moderación.</p>
                        <p style="color: #334155; font-size: 16px;">Ahora tu reporte es visible para todos en el <strong>Mapa Público Interactivo</strong> de Avistar NE.</p>
                        ${achievementsHtml}
                        <br/>
                        <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <p style="margin: 0; color: #0369a1;">Sigue explorando y enviando reportes de calidad para subir de rango y ganar nuevas <strong>Medallas</strong> en tu perfil.</p>
                        </div>
                        <br/>
                        <p style="color: #64748b; font-size: 14px;">Atentamente,<br/>El equipo de Avistar NE.</p>
                    </div>
                `
            });

            console.log('----------------------------------------------------');
            console.log(`CORREO ENVIADO a ${toEmail}`);
            console.log(`URL de vista previa: ${nodemailer.getTestMessageUrl(info)}`);
            console.log('----------------------------------------------------');
        } catch (error) {
            console.error('Error enviando correo:', error);
        }
    }
}

module.exports = new MailerService();
