
export const namespace = "https://github.com/sobamail/responder/model/v1";

import "soba://computer/R1";

export class Seen {
    static KEY = `{${namespace}}${this.name}`;
    constructor({sender, ts} = {}) {
        this.sender = sender;
        this.ts = ts;
    }
}
