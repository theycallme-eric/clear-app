import type { SectionType } from '@/types/workout';

/**
 * Maps frontend section type names to their database enum values.
 */
export const SECTION_TO_DB: Record<string, string> = {
  warmup: 'warmup',
  mobility: 'mobility',
  primary: 'primary_lift',
  accessory: 'accessory',
  skill: 'skill_power',
  carries: 'carries',
  core: 'core',
  stability: 'stability_balance',
  conditioning: 'conditioning',
  cooldown: 'cooldown',
};

/**
 * Maps database section type enum values back to frontend names.
 */
export const DB_TO_SECTION: Record<string, SectionType> = {
  warmup: 'warmup',
  mobility: 'mobility',
  primary_lift: 'primary',
  accessory: 'accessory',
  skill_power: 'skill',
  carries: 'carries',
  core: 'core',
  stability_balance: 'stability',
  conditioning: 'conditioning',
  cooldown: 'cooldown',
};
