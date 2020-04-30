"use strict";
/*
 * Copyright 2019 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const grpc = require("../src");
const src_1 = require("../src");
const src_2 = require("../src");
const channel_1 = require("../src/channel");
const clientInsecureCreds = grpc.credentials.createInsecure();
const serverInsecureCreds = src_1.ServerCredentials.createInsecure();
describe('Client', () => {
    let server;
    let client;
    before(done => {
        server = new src_1.Server();
        server.bindAsync('localhost:0', serverInsecureCreds, (err, port) => {
            assert.ifError(err);
            client = new src_2.Client(`localhost:${port}`, clientInsecureCreds);
            server.start();
            done();
        });
    });
    after(done => {
        client.close();
        server.tryShutdown(done);
    });
    it('should call the waitForReady callback only once, when channel connectivity state is READY', done => {
        const deadline = Date.now() + 100;
        let calledTimes = 0;
        client.waitForReady(deadline, err => {
            assert.ifError(err);
            assert.equal(client.getChannel().getConnectivityState(true), channel_1.ConnectivityState.READY);
            calledTimes += 1;
        });
        setTimeout(() => {
            assert.equal(calledTimes, 1);
            done();
        }, deadline - Date.now());
    });
});
//# sourceMappingURL=test-client.js.map