
/*
 * This is a Sobamail application.
 * See https://sobamail.com for more info
 */

import "soba://computer/R1";

import {
    DeleteRow,
    Message,
} from "https://sobamail.com/module/base/v1?sha224=LbrFSXuQxm2gn4-FaglNXRQbcv7kAz9Zew-p1A";

export default class Responder {
    static id = "responder.test.user.app.sobamail.com";
    static name = "Vacation Responder";
    static version = "1.0.0.0";
    static objects = new Map([
        [ DeleteRow.KEY, false ],
        [ Message.KEY, false ],
    ]);

    constructor() {
        // TODO: Create the database schema
        // TODO: Perform any sanity checks
    }

    process(message, metadata) {
        // If you prefer
        soba.log.info("Hello World!");

        // FYI: Show incoming data
        soba.log.info(`metadata: ${JSON.stringify(metadata, null, 2)}`);
        soba.log.info(` message: ${JSON.stringify(message, null, 2)}`);

        let reply = new Message();

        reply.from = [ {address : soba.app.account()} ];
        reply.to = [ {name : message.fromName, address : message.fromAddress} ];
        reply.subject = "Hello World! I'm on Vacation!";

        reply.bodyText = "I am on vacation and will not be able to respond to" +
                " your message in a timely manner." +
                "\nPlease contact me some other time.";

        reply.bodyHtml = "<p>" +
                "I am on vacation and will not be able to respond to" +
                " your message in a timely manner.<br>" +
                "\nPlease contact me some other time." +
                "</p>";

        soba.log.info(`Sent vacation response to "${reply.to[0].name} <${reply.to[0].address}>"`);

        soba.mail.send(reply);
    }
}
