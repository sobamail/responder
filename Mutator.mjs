
/*
 * This is a Sobamail application.
 * See https://sobamail.com for more info
 */

import "soba://computer/R1";

import {
    Seen,
} from "https://github.com/sobamail/responder/model/v1?sha224=13RD4IICOF24DLDDHMJGQ0S36JCVDL7AKINCE2AHVUS5U"
import {
    DeleteRow,
    Message,
} from "https://sobamail.com/module/base/v1?sha224=lHPRerLbiqHkAShgnv6sjCjr_ReFSXlDJTe6Ew";

const DAY_MSECS = 86400 * 1000;

export default class Responder {
    static id = "responder.test.user.app.sobamail.com";
    static name = "Vacation Responder";
    static version = "1.0.0.0";
    static objects = new Map([
        [ DeleteRow.KEY, false ],
        [ Message.KEY, false ],
        [ Seen.KEY, false ],
    ]);

    constructor() {
        soba.schema.table({
            name : "response",
            insertEvent : Seen,
            deleteEvent : DeleteRow,
            columns : [
                {
                    name : "sender",
                    checks : [
                        {op : "!=", value : null},
                        {op : "!=", value : ""},
                        {op : "typeof", value : "text"},
                        {op : "regexp", value : soba.type.address.pattern},
                    ]
                },
                {
                    name : "message",
                    checks : [
                        {op : "!=", value : null},
                        {op : "lww", value : true},
                        {op : "regexp", value : soba.type.uuid.pattern},
                        {op : "typeof", value : "text"},
                    ]
                },
            ],
        });
    }

    process(message, metadata) {
        // FYI: Show incoming data
        soba.log.info(`metadata: ${JSON.stringify(metadata)}`);
        soba.log.info(` message: ${JSON.stringify(message, null, 2)}`);

        // Parse replication tasks before doing anything else
        if (metadata.type == "task" || metadata.type == "task-replay") {
            let key = `{${message.namespace}}${message.name}`;
            if (key === Seen.KEY) {
                return soba.data.insert(message.content);
            }
            throw new Error(`Unexpected objkey ${key}`);
        }

        // Get date from message
        let date = message.dateMsec;

        // Bail out if we could not get the date
        if (! date) {
            soba.log.error(`Skipping message ${message.uuid}: Unable to determine date`);
            return;
        }

        // Bail out if the incoming message is too old
        const now = soba.clock.physical.msecs();
        if (now - date > DAY_MSECS) {
            soba.log.error(`Skipping message ${message.uuid}: Message received too long ago`);
            return;
        }

        let ret =
                soba.data.insert("response", {sender : message.fromAddress, message : message.uuid})
        if (! ret.inserted) {
            soba.log.error(`Skipping message ${message.uuid}: Already responded`);
            return;
        }

        let reply = new Message();

        reply.from = [ {address : soba.app.account()} ];
        reply.to = [ {name : message.fromName, address : message.fromAddress} ];
        reply.subject = `Re: ${message.subject}`;

        reply.bodyText = "I am on vacation and will not be able to respond to" +
                " your message in a timely manner." +
                "\nPlease contact me some other time.";

        reply.bodyHtml = "<p>" +
                "I am on vacation and will not be able to respond to" +
                " your message in a timely manner.<br>" +
                "\nPlease contact me some other time." +
                "</p>";

        soba.mail.send(reply);
        soba.log.info(`Sent vacation response to "${reply.to[0].name} <${reply.to[0].address}>"`);
    }
}
