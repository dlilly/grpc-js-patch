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
// Allow `any` data type for testing runtime type checking.
// tslint:disable no-any
const assert = require("assert");
const resolverManager = require("../src/resolver");
const subchannel_1 = require("../src/subchannel");
const uri_parser_1 = require("../src/uri-parser");
describe('Name Resolver', () => {
    describe('DNS Names', function () {
        // For some reason DNS queries sometimes take a long time on Windows
        this.timeout(4000);
        before(() => {
            resolverManager.registerAll();
        });
        it('Should resolve localhost properly', done => {
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('localhost:50051'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.some(addr => subchannel_1.isTcpSubchannelAddress(addr) &&
                        addr.host === '127.0.0.1' &&
                        addr.port === 50051));
                    assert(addressList.some(addr => subchannel_1.isTcpSubchannelAddress(addr) &&
                        addr.host === '::1' &&
                        addr.port === 50051));
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
        it('Should default to port 443', done => {
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('localhost'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.some(addr => subchannel_1.isTcpSubchannelAddress(addr) &&
                        addr.host === '127.0.0.1' &&
                        addr.port === 443));
                    assert(addressList.some(addr => subchannel_1.isTcpSubchannelAddress(addr) &&
                        addr.host === '::1' &&
                        addr.port === 443));
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
        it('Should correctly represent an ipv4 address', done => {
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('1.2.3.4'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.some(addr => subchannel_1.isTcpSubchannelAddress(addr) &&
                        addr.host === '1.2.3.4' &&
                        addr.port === 443));
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
        it('Should correctly represent an ipv6 address', done => {
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('::1'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.some(addr => subchannel_1.isTcpSubchannelAddress(addr) &&
                        addr.host === '::1' &&
                        addr.port === 443));
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
        it('Should correctly represent a bracketed ipv6 address', done => {
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('[::1]:50051'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.some(addr => subchannel_1.isTcpSubchannelAddress(addr) &&
                        addr.host === '::1' &&
                        addr.port === 50051));
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
        it('Should resolve a public address', done => {
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('example.com'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.length > 0);
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
        it('Should resolve a name with multiple dots', done => {
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('loopback4.unittest.grpc.io'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.some(addr => subchannel_1.isTcpSubchannelAddress(addr) &&
                        addr.host === '127.0.0.1' &&
                        addr.port === 443));
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
        /* TODO(murgatroid99): re-enable this test, once we can get the IPv6 result
         * consistently */
        it.skip('Should resolve a DNS name to an IPv6 address', done => {
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('loopback6.unittest.grpc.io'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.some(addr => subchannel_1.isTcpSubchannelAddress(addr) &&
                        addr.host === '::1' &&
                        addr.port === 443));
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
        it('Should resolve a DNS name to IPv4 and IPv6 addresses', done => {
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('loopback46.unittest.grpc.io'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.some(addr => subchannel_1.isTcpSubchannelAddress(addr) &&
                        addr.host === '127.0.0.1' &&
                        addr.port === 443));
                    /* TODO(murgatroid99): check for IPv6 result, once we can get that
                     * consistently */
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
        it('Should resolve a name with a hyphen', done => {
            /* TODO(murgatroid99): Find or create a better domain name to test this with.
             * This is just the first one I found with a hyphen. */
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('network-tools.com'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.length > 0);
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
        it('Should resolve gRPC interop servers', done => {
            let completeCount = 0;
            const target1 = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('grpc-test.sandbox.googleapis.com'));
            const target2 = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('grpc-test4.sandbox.googleapis.com'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    assert(addressList.length > 0);
                    completeCount += 1;
                    if (completeCount === 2) {
                        // Only handle the first resolution result
                        listener.onSuccessfulResolution = () => { };
                        done();
                    }
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver1 = resolverManager.createResolver(target1, listener);
            resolver1.updateResolution();
            const resolver2 = resolverManager.createResolver(target2, listener);
            resolver2.updateResolution();
        });
    });
    describe('UDS Names', () => {
        it('Should handle a relative Unix Domain Socket name', done => {
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('unix:socket'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.some(addr => !subchannel_1.isTcpSubchannelAddress(addr) && addr.path === 'socket'));
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
        it('Should handle an absolute Unix Domain Socket name', done => {
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('unix:///tmp/socket'));
            const listener = {
                onSuccessfulResolution: (addressList, serviceConfig, serviceConfigError) => {
                    // Only handle the first resolution result
                    listener.onSuccessfulResolution = () => { };
                    assert(addressList.some(addr => !subchannel_1.isTcpSubchannelAddress(addr) && addr.path === '/tmp/socket'));
                    done();
                },
                onError: (error) => {
                    done(new Error(`Failed with status ${error.details}`));
                },
            };
            const resolver = resolverManager.createResolver(target, listener);
            resolver.updateResolution();
        });
    });
    describe('getDefaultAuthority', () => {
        class OtherResolver {
            updateResolution() {
                return [];
            }
            static getDefaultAuthority(target) {
                return 'other';
            }
        }
        it('Should return the correct authority if a different resolver has been registered', () => {
            resolverManager.registerResolver('other', OtherResolver);
            const target = resolverManager.mapUriDefaultScheme(uri_parser_1.parseUri('other:name'));
            console.log(target);
            const authority = resolverManager.getDefaultAuthority(target);
            assert.equal(authority, 'other');
        });
    });
});
//# sourceMappingURL=test-resolver.js.map