/** Replaces only the registered /raid command. The other nineteen come from the verified guild readback. */
import {
  normalizeCommands219 as normalize, digestCommands219 as digest, VERIFY_APP219 as APP, ASMON_GUILD219 as GUILD,
} from './guild-command-plan219.mjs';

const schema = 'olympus-guild-command-plan228/v1';
const key = command => (command.type ?? 1) + ':' + command.name;
const raidKey = '1:raid';
const expected = [
  'branches','council','event','forever','guide','launch','olympus','olympus-admin','olympus-intros',
  'olympus-lookup','olympus-privacy','olympus-status','olympus-unlink','raid','stockades','treasury',
  'verify','verify-status','workshop',
].map(name => '1:' + name).concat('2:Olympus linked characters').sort();
const directNames = ['schedule','create','list','roster','rsvp','remind','attendance'];

function scoped(rows) {
  if (!Array.isArray(rows) || rows.some(row => row?.application_id !== APP || row?.guild_id !== GUILD)) {
    throw Error('guild_registration_destination_mismatch');
  }
  return normalize(rows);
}

function raidMatches(before, replacement) {
  const old = before.find(command => key(command) === raidKey);
  const direct = before.find(command => key(command) === '1:event')?.options;
  if (!old || !replacement || key(replacement) !== raidKey ||
      direct?.length !== directNames.length ||
      !direct.every((command, index) => command.type === 1 && command.name === directNames[index])) return false;
  const { options: oldOptions, description: oldDescription, ...oldScope } = old;
  const { options, description, ...scope } = replacement;
  const find = oldOptions?.[0], hub = options?.[0];
  return oldOptions?.length === 1 && find?.type === 3 && find.name === 'find' && find.autocomplete === true &&
    find.min_length === 1 && find.max_length === 80 && !find.required && !find.choices &&
    typeof oldDescription === 'string' && typeof description === 'string' && description.length > 0 && description.length <= 100 &&
    digest(scope) === digest(oldScope) && hub?.type === 1 && hub.name === 'hub' &&
    typeof hub.description === 'string' && hub.description.length > 0 && hub.description.length <= 100 &&
    Object.keys(hub).length === 4 && Array.isArray(hub.options) && digest(hub.options) === digest(oldOptions) &&
    options.length === direct.length + 1 && digest(options.slice(1)) === digest(direct);
}

export function prepareGuildCommandPlan228(existing, raid, { head, tree, definitionSHA256, expectedExistingSHA256 }) {
  if (![head, tree].every(value => /^[a-f0-9]{40}$/.test(value)) ||
      ![definitionSHA256, expectedExistingSHA256].every(value => /^[a-f0-9]{64}$/.test(value))) {
    throw Error('command_source_custody');
  }
  const before = scoped(existing);
  if (digest(before.map(key)) !== digest(expected) || digest(before) !== expectedExistingSHA256) {
    throw Error('existing_verify_command_inventory_changed');
  }
  if (!raid || ['contexts','integration_types','dm_permission'].some(field => Object.hasOwn(raid, field))) {
    throw Error('guild_registration_scope');
  }
  const [replacement] = normalize([raid]);
  if (!raidMatches(before, replacement)) throw Error('raid_calendar_definition_changed');
  const commands = before.map(command => key(command) === raidKey ? replacement : command);
  const plan = {
    schema, applicationId: APP, guildId: GUILD, head, tree, definitionSHA256,
    existingSHA256: expectedExistingSHA256, payloadSHA256: digest(commands),
    existing: before, commands, expectedCount: 20, changedCommands: [raidKey], publicMessagesCreated: 0,
  };
  verifyGuildCommandReadback228(plan, commands.map(command => ({ ...command, application_id: APP, guild_id: GUILD })));
  return plan;
}

export function verifyGuildCommandReadback228(plan, readback) {
  if (plan?.schema !== schema || plan.applicationId !== APP || plan.guildId !== GUILD || plan.expectedCount !== 20 ||
      ![plan.head, plan.tree].every(value => /^[a-f0-9]{40}$/.test(value)) ||
      !/^[a-f0-9]{64}$/.test(plan.definitionSHA256) || digest(plan.changedCommands ?? []) !== digest([raidKey]) ||
      !Array.isArray(plan.existing) || !Array.isArray(plan.commands) ||
      digest(plan.existing) !== plan.existingSHA256 || digest(plan.commands) !== plan.payloadSHA256 ||
      digest(plan.existing.map(key)) !== digest(expected) ||
      !raidMatches(plan.existing, plan.commands.find(command => key(command) === raidKey))) {
    throw Error('guild_registration_plan_changed');
  }
  const rows = scoped(readback);
  if (rows.length !== 20 || digest(rows) !== plan.payloadSHA256) throw Error('guild_registration_readback_mismatch');
  for (const [index, prior] of plan.existing.entries()) {
    if (key(prior) !== raidKey && digest(rows[index]) !== digest(prior)) throw Error('existing_command_changed');
  }
  return { count:20, payloadSHA256:plan.payloadSHA256, names:rows.map(key), nineteenOtherCommandsPreserved:true, publicMessagesCreated:0, globalCommandsChanged:false };
}
