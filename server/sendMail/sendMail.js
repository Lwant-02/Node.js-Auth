import { MailtrapClient } from "mailtrap";

const TOKEN = "6f51f57a3cbc48edb22cab80581be021";

export const mailTrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "Mailtrap Test",
};
