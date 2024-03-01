import { z } from "zod";

export const MpcScalar = z
  .object({
    curve: z.string(),
    scalar: z.string(),
  })
  .passthrough();

export type MpcScalar = z.infer<typeof MpcScalar>;

export const MpcPoint = z
  .object({
    curve: z.string(),
    point: z.string(),
  })
  .passthrough();

export type MpcPoint = z.infer<typeof MpcPoint>;

export const MpcPreSign = z
  .object({
    k_i: MpcScalar,
    R: MpcPoint,
    sigma_i: MpcScalar,
    pubkey: MpcPoint,
  })
  .passthrough();

export type MpcPreSign = z.infer<typeof MpcPreSign>;

export const MpcShare = z
  .object({
    i: z.number(),
    local_key: z
      .object({
        y_sum_s: MpcPoint,
      })
      .passthrough(),
    sign_keys: z
      .object({
        k_i: MpcScalar,
      })
      .passthrough(),
    R: MpcPoint,
    sigma_i: MpcScalar,
    t_vec: z.array(MpcPoint),
  })
  .passthrough();

export type MpcShare = z.infer<typeof MpcShare>;

export const EasyShare = z.object({
  preSignForNetworkShare: MpcPreSign,
  preSignForBackupShare: MpcPreSign,
});

export type EasyShare = z.infer<typeof EasyShare>;

export const NetworkShare = MpcShare;
export type NetworkShare = MpcShare;

export const BackupShare = MpcShare;
export type BackupShare = MpcShare;
