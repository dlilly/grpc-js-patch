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

import * as semver from 'semver';

import {
  ClientDuplexStream,
  ClientReadableStream,
  ClientUnaryCall,
  ClientWritableStream,
  ServiceError,
} from './call';
import { CallCredentials, OAuth2Client } from './call-credentials';
import { Deadline, StatusObject } from './call-stream';
import { Channel, ConnectivityState, ChannelImplementation } from './channel';
import { ChannelCredentials } from './channel-credentials';
import {
  CallOptions,
  Client,
  CallInvocationTransformer,
  CallProperties,
  UnaryCallback,
} from './client';
import { LogVerbosity, Status } from './constants';
import * as logging from './logging';
import {
  Deserialize,
  loadPackageDefinition,
  makeClientConstructor,
  MethodDefinition,
  Serialize,
  ServiceDefinition,
} from './make-client';
import { Metadata, MetadataValue } from './metadata';
import {
  Server,
  UntypedHandleCall,
  UntypedServiceImplementation,
} from './server';
import { KeyCertPair, ServerCredentials } from './server-credentials';
import { StatusBuilder } from './status-builder';
import {
  handleBidiStreamingCall,
  handleServerStreamingCall,
  handleUnaryCall,
  sendUnaryData,
  ServerUnaryCall,
  ServerReadableStream,
  ServerWritableStream,
  ServerDuplexStream,
} from './server-call';

const supportedNodeVersions = require('../../package.json').engines.node;
if (!semver.satisfies(process.version, supportedNodeVersions)) {
  throw new Error(`@grpc/grpc-js only works on Node ${supportedNodeVersions}`);
}

interface IndexedObject {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  [key: number]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

function mixin(...sources: IndexedObject[]) {
  const result: { [key: string]: Function } = {};
  for (const source of sources) {
    for (const propName of Object.getOwnPropertyNames(source)) {
      const property: any = source[propName]; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (typeof property === 'function') {
        result[propName] = property;
      }
    }
  }
  return result;
}

export { OAuth2Client };

/**** Client Credentials ****/

// Using assign only copies enumerable properties, which is what we want
export const credentials = mixin(
  {
    /**
     * Combine a ChannelCredentials with any number of CallCredentials into a
     * single ChannelCredentials object.
     * @param channelCredentials The ChannelCredentials object.
     * @param callCredentials Any number of CallCredentials objects.
     * @return The resulting ChannelCredentials object.
     */
    combineChannelCredentials: (
      channelCredentials: ChannelCredentials,
      ...callCredentials: CallCredentials[]
    ): ChannelCredentials => {
      return callCredentials.reduce(
        (acc, other) => acc.compose(other),
        channelCredentials
      );
    },

    /**
     * Combine any number of CallCredentials into a single CallCredentials
     * object.
     * @param first The first CallCredentials object.
     * @param additional Any number of additional CallCredentials objects.
     * @return The resulting CallCredentials object.
     */
    combineCallCredentials: (
      first: CallCredentials,
      ...additional: CallCredentials[]
    ): CallCredentials => {
      return additional.reduce((acc, other) => acc.compose(other), first);
    },
  },
  ChannelCredentials,
  CallCredentials
);

/**** Metadata ****/

export { Metadata, MetadataValue };

/**** Constants ****/

export {
  LogVerbosity as logVerbosity,
  Status as status,
  ConnectivityState as connectivityState,
  // TODO: Other constants as well
};

/**** Client ****/

export {
  Client,
  loadPackageDefinition,
  makeClientConstructor,
  makeClientConstructor as makeGenericClientConstructor,
  CallProperties,
  CallInvocationTransformer,
  ChannelImplementation as Channel,
  Channel as ChannelInterface,
  UnaryCallback as requestCallback,
};

/**
 * Close a Client object.
 * @param client The client to close.
 */
export const closeClient = (client: Client) => client.close();

export const waitForClientReady = (
  client: Client,
  deadline: Date | number,
  callback: (error?: Error) => void
) => client.waitForReady(deadline, callback);

/* Interfaces */

export {
  sendUnaryData,
  ChannelCredentials,
  CallCredentials,
  Deadline,
  Serialize as serialize,
  Deserialize as deserialize,
  ClientUnaryCall,
  ClientReadableStream,
  ClientWritableStream,
  ClientDuplexStream,
  CallOptions,
  MethodDefinition,
  StatusObject,
  ServiceError,
  ServerUnaryCall,
  ServerReadableStream,
  ServerWritableStream,
  ServerDuplexStream,
  ServiceDefinition,
  UntypedHandleCall,
  UntypedServiceImplementation,
};

/**** Server ****/

export { handleBidiStreamingCall, handleServerStreamingCall, handleUnaryCall };

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Call =
  | ClientUnaryCall
  | ClientReadableStream<any>
  | ClientWritableStream<any>
  | ClientDuplexStream<any, any>;
/* eslint-enable @typescript-eslint/no-explicit-any */

/**** Unimplemented function stubs ****/

/* eslint-disable @typescript-eslint/no-explicit-any */

export const loadObject = (value: any, options: any) => {
  throw new Error(
    'Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead'
  );
};

export const load = (filename: any, format: any, options: any) => {
  throw new Error(
    'Not available in this library. Use @grpc/proto-loader and loadPackageDefinition instead'
  );
};

export const setLogger = (logger: Partial<Console>): void => {
  logging.setLogger(logger);
};

export const setLogVerbosity = (verbosity: LogVerbosity): void => {
  logging.setLoggerVerbosity(verbosity);
};

export { Server };
export { ServerCredentials };
export { KeyCertPair };

export const getClientChannel = (client: Client) => {
  return Client.prototype.getChannel.call(client);
};

export { StatusBuilder };

export { Listener } from './call-stream';

export {
  Requester,
  ListenerBuilder,
  RequesterBuilder,
  Interceptor,
  InterceptorOptions,
  InterceptorProvider,
  InterceptingCall,
  InterceptorConfigurationError,
} from './client-interceptors';

export { GrpcObject } from './make-client';

import * as resolver from './resolver';
import * as load_balancer from './load-balancer';

(() => {
  resolver.registerAll();
  load_balancer.registerAll();
})();