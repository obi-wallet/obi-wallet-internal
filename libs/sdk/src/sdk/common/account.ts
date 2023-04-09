/**
 * Describes possible account validation results.
 */
export enum AccountValidationResult {
  /**
   * The address is invalid.
   */
  INVALID_ADDRESS,
  /**
   * The account is not ready for signing transactions.
   */
  ACCOUNT_NOT_READY,
  /**
   * The account has no associated public key.
   */
  PUBLIC_KEY_NOT_READY,
  /**
   * The account is ready for signing and has a public key.
   */
  READY,
}
