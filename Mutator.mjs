
/*
 * This is a Sobamail application.
 * See https://sobamail.com for more info
 */

import "soba://computer/R1";

import {
    DeleteRow,
    Message,
} from "https://sobamail.com/module/base/v1?sha224=LbrFSXuQxm2gn4-FaglNXRQbcv7kAz9Zew-p1A";

import {
    Seen
} from "https://github.com/sobamail/responder/model/v1?sha224=13RD4IICOF24DLDDHMJGQ0S36JCVDL7AKINCE2AHVUS5U"

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
            name : "resp",
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
                    name : "timestamp",
                    checks : [
                        {op : "!=", value : null},
                        {op : "typeof", value : "integer"},
                    ]
                },
            ],
        });
    }

    process(message, metadata) {
        // FYI: Show incoming data
        soba.log.info(`metadata: ${JSON.stringify(metadata)}`);
        soba.log.info(` message: ${JSON.stringify(message, null, 2)}`);

        if (metadata.type == "task" || metadata.type == "task-replay") {
            let key = `{${message.namespace}}${message.name}`;
            if (key === Seen.KEY) {
                return soba.data.insert(message.content);
            }
            throw new Error(`Unexpected objkey ${key}`);
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

        soba.log.info(`Sent vacation response to "${reply.to[0].name} <${reply.to[0].address}>"`);

        soba.mail.send(reply);
        soba.data.insert(
                "resp", {sender : message.fromAddress, timestamp : soba.clock.physical.msecs()})
    }
}
