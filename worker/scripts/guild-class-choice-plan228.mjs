/** Offline definition comparison only. Supply the exact candidate definitions and
 * independently approved custody from a fresh whole-guild readback. The retained
 * registry can reproduce evidence but cannot authorize a future registration.
 * Command IDs and server/channel permission overrides require separate readbacks. */
import {
  normalizeCommands219 as normalize, digestCommands219 as digest, VERIFY_APP219 as APP, ASMON_GUILD219 as GUILD,
} from './guild-command-plan219.mjs';

const schema = 'olympus-guild-class-choice-plan228/v1';
const targets = [['forever', 'guide'], ['guide', 'class']];
const changedCommands = targets.map(([name]) => '1:' + name);
const identities = [
  'branches', 'council', 'event', 'forever', 'guide', 'launch', 'olympus', 'olympus-admin', 'olympus-intros',
  'olympus-lookup', 'olympus-privacy', 'olympus-status', 'olympus-unlink', 'raid', 'stockades', 'treasury',
  'verify', 'verify-status', 'workshop',
].map(name => '1:' + name).concat('2:Olympus linked characters').sort();

// The shared normalizer intentionally drops fields outside the command payload.
// Accept only recognized definition fields and explicit provider metadata here.
const commandFields = new Set('type name name_localizations description description_localizations options default_member_permissions default_permission nsfw id application_id guild_id version'.split(' '));
const optionFields = new Set('type name name_localizations description description_localizations required choices options channel_types min_value max_value min_length max_length autocomplete file_types'.split(' '));
const choiceFields = new Set(['name', 'value', 'name_localizations']);
const classFields = new Set(['name', 'value']);
const knownFields = (row, fields) => row && typeof row === 'object' && !Array.isArray(row)
  && Object.keys(row).every(key => fields.has(key));
const knownArray = (rows, check) => Array.isArray(rows) && rows.length <= 25 && rows.every(check);
const knownOption = (row, depth = 0) => depth <= 2 && knownFields(row, optionFields)
  && (row.options == null || knownArray(row.options, option => knownOption(option, depth + 1)))
  && (row.choices == null || knownArray(row.choices, choice => knownFields(choice, choiceFields)));
const hex = (value, length) => typeof value === 'string' && value.length === length && /^[a-f0-9]+$/.test(value);
const scope = rows => rows.map(row => ({ ...row, application_id: APP, guild_id: GUILD }));

function classOptions(rows) {
  function one(options, name, type) {
    const matches = options?.filter(option => option?.name === name);
    if (matches?.length !== 1 || matches[0].type !== type) throw Error('class_choice_path');
    return matches[0];
  }
  return targets.map(([name, subcommand]) => {
    const command = one(rows, name, 1);
    const option = one(one(command.options, subcommand, 1).options, 'class', 3);
    if (option.autocomplete === true || !knownArray(option.choices, choice =>
      knownFields(choice, classFields) && typeof choice.name === 'string'
      && typeof choice.value === 'string' && /^[a-z]+$/.test(choice.value))
      || option.choices.length !== 9 || new Set(option.choices.map(choice => choice.value)).size !== 9) {
      throw Error('class_choice_shape');
    }
    return option;
  });
}

function scoped(rows) {
  if (!Array.isArray(rows) || rows.length !== identities.length || !rows.every(row =>
    knownFields(row, commandFields) && row.application_id === APP && row.guild_id === GUILD
    && (row.options == null || knownArray(row.options, option => knownOption(option))))) {
    throw Error('class_choice_inventory_scope');
  }
  classOptions(rows);
  const normalized = normalize(rows);
  if (digest(normalized.map(row => row.type + ':' + row.name)) !== digest(identities)) {
    throw Error('class_choice_inventory_identity');
  }
  return normalized;
}

export function prepareGuildClassChoicePlan228(existing, definitions, custody) {
  const { head, tree, definitionSHA256, expectedExistingSHA256 } = custody;
  if (!hex(head, 40) || !hex(tree, 40) || !hex(definitionSHA256, 64) || !hex(expectedExistingSHA256, 64)) {
    throw Error('class_choice_source_custody');
  }
  const before = scoped(existing);
  if (digest(before) !== expectedExistingSHA256) throw Error('class_choice_inventory_changed');

  const commands = structuredClone(before);
  const options = classOptions(commands);
  const proposed = classOptions(definitions).map(option => option.choices);
  if (digest(proposed[0]) !== digest(proposed[1])) throw Error('class_choice_candidate_changed');
  if (options.every((option, index) => digest(option.choices) === digest(proposed[index]))) {
    throw Error('class_choices_already_current');
  }
  for (const [index, option] of options.entries()) {
    const expected = option.choices.map(({ name, value }) => {
      if (name !== value) throw Error('class_choice_predecessor_changed');
      return { name: value[0].toUpperCase() + value.slice(1), value };
    }).sort((a, b) => a.name.localeCompare(b.name, 'en'));
    if (digest(proposed[index]) !== digest(expected)) throw Error('class_choice_candidate_changed');
    option.choices = expected;
  }
  return {
    schema, applicationId: APP, guildId: GUILD, head, tree, definitionSHA256,
    expectedCount: identities.length, changedCommands: [...changedCommands], existingSHA256: expectedExistingSHA256,
    existing: before, commands, payloadSHA256: digest(commands),
  };
}

export function verifyGuildClassChoiceReadback228(plan, readback, definitions, custody) {
  if (!Array.isArray(plan?.existing)) throw Error('class_choice_plan_changed');
  const expected = prepareGuildClassChoicePlan228(scope(plan.existing), definitions, custody);
  if (digest(plan) !== digest(expected)) throw Error('class_choice_plan_changed');
  if (digest(scoped(readback)) !== expected.payloadSHA256) throw Error('class_choice_readback_changed');
  return {
    count: expected.expectedCount, changedCommands: expected.changedCommands, payloadSHA256: expected.payloadSHA256,
    providerIDsAndPermissionOverridesVerified: false,
  };
}
