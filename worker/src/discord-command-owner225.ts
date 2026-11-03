/** Owner-approved Discord command access only; never a character, role or game proof. */
import type { Env } from './env';
export const DISCORD_BOT_OWNER_225 = '472099715253796864';
export function discordCommandOwner225(env: Env, id: string, guild: string): boolean {
  return id === DISCORD_BOT_OWNER_225 && guild === '236932545793490944'
    && env.GUILD_ID === guild && env.DISCORD_APP_ID === '1550176895671341076'
    && (env.SITE_ADMINS ?? '').split(',').map(value => value.trim()).includes(id);
}
