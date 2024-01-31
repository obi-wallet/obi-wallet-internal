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

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_signer_free: (a: number) => void;
  readonly signer_new: (a: number, b: number, c: number, d: number) => void;
  readonly signer_handleIncoming: (a: number, b: number, c: number) => void;
  readonly signer_proceed: (a: number, b: number) => void;
  readonly signer_completedOfflineStage: (a: number, b: number) => void;
  readonly signer_partial: (a: number, b: number, c: number) => void;
  readonly signer_add: (a: number, b: number, c: number) => void;
  readonly signer_create: (a: number, b: number, c: number) => void;
  readonly keyRefreshSimulated: (a: number, b: number, c: number) => void;
  readonly __wbg_keygenerator_free: (a: number) => void;
  readonly keygenerator_new: (a: number, b: number, c: number) => void;
  readonly keygenerator_handleIncoming: (a: number, b: number, c: number) => void;
  readonly keygenerator_proceed: (a: number, b: number) => void;
  readonly keygenerator_create: (a: number, b: number) => void;
  readonly start: () => void;
  readonly keygen: (a: number, b: number, c: number) => void;
  readonly sign: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly generateKeypair: (a: number, b: number, c: number) => void;
  readonly createMeeting: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly joinMeeting: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly keygenSimulated: (a: number, b: number) => void;
  readonly __wbg_simulationsigner_free: (a: number) => void;
  readonly simulationsigner_new: (a: number, b: number) => void;
  readonly simulationsigner_completedOfflineStage: (a: number, b: number) => void;
  readonly simulationsigner_partial: (a: number, b: number, c: number) => void;
  readonly simulationsigner_add: (a: number, b: number, c: number) => void;
  readonly simulationsigner_create: (a: number, b: number, c: number) => void;
  readonly signingOfflineStageSimulated: (a: number, b: number) => void;
  readonly createSigners: (a: number, b: number) => void;
  readonly __wbg_keyrefresh_free: (a: number) => void;
  readonly keyrefresh_new: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly keyrefresh_handleIncoming: (a: number, b: number, c: number) => void;
  readonly keyrefresh_proceed: (a: number, b: number) => void;
  readonly keyrefresh_create: (a: number, b: number) => void;
  readonly rustsecp256k1_v0_4_1_context_create: (a: number) => number;
  readonly rustsecp256k1_v0_4_1_context_destroy: (a: number) => void;
  readonly rustsecp256k1_v0_4_1_default_illegal_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1_v0_4_1_default_error_callback_fn: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly wasm_bindgen__convert__closures__invoke0_mut__he6ba9d45428c4847: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures__invoke1_mut__h82ff6324a435aa73: (a: number, b: number, c: number) => void;
  readonly wasm_bindgen__convert__closures__invoke1_mut__hc072ccd0c523f415: (a: number, b: number, c: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h81dcc53682c1bd6e: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
