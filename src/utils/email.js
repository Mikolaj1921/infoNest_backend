const nodemailer = require('nodemailer');
const config = require('../config/index');

// ua: Клас для відправки імейлів (Welcome, Password Reset ітд)
module.exports = class Email {
  constructor(user, url = '') {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `InfoNest <${config.EMAIL_FROM}>`;
  }

  // ua: Створення транспорту для відправки
  newTransport() {
    return nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });
  }

  // ua: Основний метод відправки
  async send(subject, message) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: message,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  // ua: метод для вітального листа
  async sendWelcome() {
    await this.send(
      'Welcome to InfoNest!',
      `Hi ${this.firstName},\nWelcome to InfoNest! We are glad to have you. Your personal workspace is ready.`,
    );
  }
};
