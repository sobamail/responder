
/*
 * This is a Sobamail application.
 * See https://sobamail.com for more info
 */

import "soba://computer/R1";

import {
    DeleteRow,
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
        // TODO: Implement the app logic
    }
}


