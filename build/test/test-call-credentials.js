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
const call_credentials_1 = require("../src/call-credentials");
const metadata_1 = require("../src/metadata");
// Metadata generators
function makeAfterMsElapsedGenerator(ms) {
    return (options, cb) => {
        const metadata = new metadata_1.Metadata();
        metadata.add('msElapsed', `${ms}`);
        setTimeout(() => cb(null, metadata), ms);
    };
}
const generateFromServiceURL = (options, cb) => {
    const metadata = new metadata_1.Metadata();
    metadata.add('service_url', options.service_url);
    cb(null, metadata);
};
const generateWithError = (options, cb) => cb(new Error());
// Tests
describe('CallCredentials', () => {
    describe('createFromMetadataGenerator', () => {
        it('should accept a metadata generator', () => {
            assert.doesNotThrow(() => call_credentials_1.CallCredentials.createFromMetadataGenerator(generateFromServiceURL));
        });
    });
    describe('compose', () => {
        it('should accept a CallCredentials object and return a new object', () => {
            const callCredentials1 = call_credentials_1.CallCredentials.createFromMetadataGenerator(generateFromServiceURL);
            const callCredentials2 = call_credentials_1.CallCredentials.createFromMetadataGenerator(generateFromServiceURL);
            const combinedCredentials = callCredentials1.compose(callCredentials2);
            assert.notStrictEqual(combinedCredentials, callCredentials1);
            assert.notStrictEqual(combinedCredentials, callCredentials2);
        });
        it('should be chainable', () => {
            const callCredentials1 = call_credentials_1.CallCredentials.createFromMetadataGenerator(generateFromServiceURL);
            const callCredentials2 = call_credentials_1.CallCredentials.createFromMetadataGenerator(generateFromServiceURL);
            assert.doesNotThrow(() => {
                callCredentials1
                    .compose(callCredentials2)
                    .compose(callCredentials2)
                    .compose(callCredentials2);
            });
        });
    });
    describe('generateMetadata', () => {
        it('should call the function passed to createFromMetadataGenerator', async () => {
            const callCredentials = call_credentials_1.CallCredentials.createFromMetadataGenerator(generateFromServiceURL);
            let metadata;
            try {
                metadata = await callCredentials.generateMetadata({
                    service_url: 'foo',
                });
            }
            catch (err) {
                throw err;
            }
            assert.deepStrictEqual(metadata.get('service_url'), ['foo']);
        });
        it('should emit an error if the associated metadataGenerator does', async () => {
            const callCredentials = call_credentials_1.CallCredentials.createFromMetadataGenerator(generateWithError);
            let metadata = null;
            try {
                metadata = await callCredentials.generateMetadata({ service_url: '' });
            }
            catch (err) {
                assert.ok(err instanceof Error);
            }
            assert.strictEqual(metadata, null);
        });
        it('should combine metadata from multiple generators', async () => {
            const [callCreds1, callCreds2, callCreds3, callCreds4] = [
                50,
                100,
                150,
                200,
            ].map(ms => {
                const generator = makeAfterMsElapsedGenerator(ms);
                return call_credentials_1.CallCredentials.createFromMetadataGenerator(generator);
            });
            const testCases = [
                {
                    credentials: callCreds1
                        .compose(callCreds2)
                        .compose(callCreds3)
                        .compose(callCreds4),
                    expected: ['50', '100', '150', '200'],
                },
                {
                    credentials: callCreds4.compose(callCreds3.compose(callCreds2.compose(callCreds1))),
                    expected: ['200', '150', '100', '50'],
                },
                {
                    credentials: callCreds3.compose(callCreds4.compose(callCreds1).compose(callCreds2)),
                    expected: ['150', '200', '50', '100'],
                },
            ];
            // Try each test case and make sure the msElapsed field is as expected
            await Promise.all(testCases.map(async (testCase) => {
                const { credentials, expected } = testCase;
                let metadata;
                try {
                    metadata = await credentials.generateMetadata({ service_url: '' });
                }
                catch (err) {
                    throw err;
                }
                assert.deepStrictEqual(metadata.get('msElapsed'), expected);
            }));
        });
    });
});
//# sourceMappingURL=test-call-credentials.js.map