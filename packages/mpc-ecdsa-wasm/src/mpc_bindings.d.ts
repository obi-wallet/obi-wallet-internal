/* tslint:disable */
/* eslint-disable */
/**
* @param {any} parameters
* @param {any} key_refresh_items
* @returns {any}
*/
export function keyRefreshSimulated(parameters: any, key_refresh_items: any): any;
/**
* Initialize the panic hook and logging.
*/
export function start(): void;
/**
* Distributed key generation.
* @param {any} options
* @param {any} participants
* @returns {any}
*/
export function keygen(options: any, participants: any): any;
/**
* Sign a message.
* @param {any} options
* @param {any} participants
* @param {any} signing_key
* @param {any} message
* @returns {any}
*/
export function sign(options: any, participants: any, signing_key: any, message: any): any;
/**
* Generate a PEM-encoded keypair.
*
* Uses the default noise protocol parameters
* if no pattern is given.
* @param {string | undefined} [pattern]
* @returns {any}
*/
export function generateKeypair(pattern?: string): any;
/**
* Create a meeting point used to exchange public keys.
* @param {any} options
* @param {any} identifiers
* @param {string} initiator
* @param {any} data
* @returns {any}
*/
export function createMeeting(options: any, identifiers: any, initiator: string, data: any): any;
/**
* Join a meeting point used to exchange public keys.
* @param {any} options
* @param {string} meeting_id
* @param {any} user_id
* @returns {any}
*/
export function joinMeeting(options: any, meeting_id: string, user_id: any): any;
/**
* Bindings to simulation based key generation bindings
* @param {any} parameters
* @returns {any}
*/
export function keygenSimulated(parameters: any): any;
/**
* @param {any} local_keys
* @returns {Array<any>}
*/
export function signingOfflineStageSimulated(local_keys: any): Array<any>;
/**
* @param {any} completed_offline_stages
* @returns {Array<any>}
*/
export function createSigners(completed_offline_stages: any): Array<any>;
/**
*/
export class KeyGenerator {
  free(): void;
/**
* Create a key generator.
* @param {any} parameters
* @param {any} party_signup
*/
  constructor(parameters: any, party_signup: any);
/**
* Handle an incoming message.
* @param {any} message
*/
  handleIncoming(message: any): void;
/**
* Proceed to the next round.
* @returns {any}
*/
  proceed(): any;
/**
* Create the key share.
* @returns {any}
*/
  create(): any;
}
/**
*/
export class KeyRefresh {
  free(): void;
/**
* @param {any} parameters
* @param {any} local_key
* @param {any} new_party_index
* @param {any} old_to_new
* @param {any} current_t
*/
  constructor(parameters: any, local_key: any, new_party_index: any, old_to_new: any, current_t: any);
/**
* Handle an incoming message.
* @param {any} message
*/
  handleIncoming(message: any): void;
/**
* Proceed to the next round.
* @returns {any}
*/
  proceed(): any;
/**
* Get the key share.
* @returns {any}
*/
  create(): any;
}
/**
* Round-based signing protocol.
*/
export class Signer {
  free(): void;
/**
* Create a signer.
* @param {any} index
* @param {any} participants
* @param {any} local_key
*/
  constructor(index: any, participants: any, local_key: any);
/**
* Handle an incoming message.
* @param {any} message
*/
  handleIncoming(message: any): void;
/**
* Proceed to the next round.
* @returns {any}
*/
  proceed(): any;
/**
* Returns the completed offline stage if available.
* @returns {any}
*/
  completedOfflineStage(): any;
/**
* Generate the completed offline stage and store the result
* internally to be used when `create()` is called.
*
* Return a partial signature that must be sent to the other
* signing participants.
* @param {any} message
* @returns {any}
*/
  partial(message: any): any;
/**
* Add partial signatures without validating them. Allows multiple partial signatures
* to be combined into a single partial signature before sending it to the other participants.
* @param {any} partials
* @returns {any}
*/
  add(partials: any): any;
/**
* Create and verify the signature.
* @param {any} partials
* @returns {any}
*/
  create(partials: any): any;
}
/**
* Simulation Round-based signing protocol.
*/
export class SimulationSigner {
  free(): void;
/**
* Create a signer.
* @param {any} completed_offline_stage
*/
  constructor(completed_offline_stage: any);
/**
* Returns the completed offline stage if available.
* @returns {any}
*/
  completedOfflineStage(): any;
/**
* Generate the completed offline stage and store the result
* internally to be used when `create()` is called.
*
* Return a partial signature that must be sent to the other
* signing participants.
* @param {any} message
* @returns {any}
*/
  partial(message: any): any;
/**
* Add partial signatures without validating them. Allows multiple partial signatures
* to be combined into a single partial signature before sending it to the other participants.
* @param {any} partials
* @returns {any}
*/
  add(partials: any): any;
/**
* Create and verify the signature.
* @param {any} partials
* @returns {any}
*/
  create(partials: any): any;
}
